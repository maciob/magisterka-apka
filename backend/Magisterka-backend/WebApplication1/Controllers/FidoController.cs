using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Cors;

using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System.Net.Http;

using System.Net.Http.Json;
using WebApplication1.Models;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;

namespace WebApplication1.Controllers
{
    [EnableCors("CorsApi")]
    [ApiController]
    [Route("api/[controller]")]

    public class FidoController : Controller
    {
        private HttpClient _httpClient;
        private readonly UserContext userContext;
        private readonly SessionContext sessionContext;
        private readonly UserSessionContext userSessionContext;
        private readonly GoogleTOTP tp;
        private readonly Mailing mail;
        private readonly ISecretsManagerService _secretsManagerService;
        private IConfiguration MyConfig;
        private string API_SECRET;


        public FidoController(HttpClient httpClient, UserContext context, SessionContext context2, UserSessionContext context3, ISecretsManagerService secretsManagerService)
        {
            MyConfig = new ConfigurationBuilder().AddJsonFile("appsettings.json").Build();
            API_SECRET = MyConfig.GetValue<string>("FIDO_API_SECRET").Replace("[CONNECTION_STRING_PLACEHOLDER]", Environment.GetEnvironmentVariable("MyApp_FIDO_API_SECRET"));

            _httpClient = httpClient;
            _httpClient.BaseAddress = new Uri("https://v4.passwordless.dev/");
            _httpClient.DefaultRequestHeaders.Add("ApiSecret", API_SECRET);
            userContext = context;
            sessionContext = context2;
            userSessionContext = context3;
            tp = new GoogleTOTP();
            mail = new Mailing();
            _secretsManagerService = secretsManagerService;
        }

        [HttpPost("create-token")]
        public async Task<IActionResult> GetRegisterToken([FromBody] FidoRegisterModel model)
        {

            try
            {
                var checklogin = await userContext.User_data.FirstOrDefaultAsync(u => u.Login == model.username);
                if (checklogin != null)
                {
                    return BadRequest("Such a user already exists.");
                }

                string url = "";
                string privateKey = "";
                string code = "";

                if (model.twoFA == true)
                {
                    if (model.twoFAtype == "Google Authenticator")
                    {
                        var randomString = Transcoder.Base32Encode(tp.randomBytes);
                        var provisionUrl = tp.UrlEncode($"otpauth://totp/PasswordManager ({model.username})?secret={randomString}");
                        url = $"https://chart.apis.google.com/chart?cht=qr&chs=200x200&chl={provisionUrl}";
                        privateKey = tp.getPrivateKey(tp.randomBytes);
                        code = string.Join(" ", tp.randomBytes);
                    }
                    else if (model.twoFAtype == "Email")
                    {
                        code = PasswordGenerator.GeneratePassword(6, false, false, true, false);
                    }
                }

                var IV = Cryptography.GenerateRandomIV();
                var Salt = Cryptography.GenerateRandomSalt();
                var passphrase = PasswordGenerator.GeneratePassword(30, true, true, true, false);
                var ID_user = Guid.NewGuid();

                await _secretsManagerService.CreateSecret("user/" + ID_user, passphrase);

                var user = new User
                {
                    ID_user = ID_user,
                    Login = model.username,
                    Fido = true,
                    TwoFA = model.twoFA,
                    Type_of_2FA = model.twoFAtype,
                    E_mail = Cryptography.Encrypt(model.email, passphrase, Salt, IV),
                    TwoFA_code = Cryptography.Encrypt(code, passphrase, Salt, IV),
                    Salt = Salt,
                    IV = IV,
                    Activated = false
                };
                var payload = new
                {
                    userId = user.ID_user.ToString(),
                    username = model.username,
                    Aliases = new[] { model.username }
                };

                var request = await _httpClient.PostAsJsonAsync("register/token", payload);

                if (request.IsSuccessStatusCode)
                {
                    var token = await request.Content.ReadFromJsonAsync<FidoTokenResponse>();
                    var session = new Session
                    {
                        Session_ID = Guid.NewGuid(),
                        Data = DateTime.Now,
                        Active = !model.twoFA
                    };

                    var usersession = new UserSession
                    {
                        Session_ID = session.Session_ID,
                        ID_user = user.ID_user
                    };

                    var response = new
                    {
                        sessionID = session.Session_ID,
                        twoFA = model.twoFA,
                        type = model.twoFAtype,
                        token = token,
                        hash = passphrase,
                        url = url,
                        privateKey = privateKey
                    };

                    await mail.SendActivate(model.email, session.Session_ID.ToString());
                    await userContext.User_data.AddAsync(user);
                    await sessionContext.Session.AddAsync(session);
                    await userSessionContext.User_session.AddAsync(usersession);

                    await userContext.SaveChangesAsync();
                    await sessionContext.SaveChangesAsync();
                    await userSessionContext.SaveChangesAsync();

                    return Ok(response);
                }

                // Handle or log any API error
                var error = await request.Content.ReadFromJsonAsync<ProblemDetails>();
                return new JsonResult(error)
                {
                    StatusCode = (int)request.StatusCode
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }

        [HttpPost]
        [Route("verify-signin")]
        public async Task<IActionResult> VerifySignInToken([FromQuery] string token)
        {
            try
            {
                var payload = new
                {
                    token
                };

                var request = await _httpClient.PostAsJsonAsync("signin/verify", payload);

                if (request.IsSuccessStatusCode)
                {
                    var signin = await request.Content.ReadFromJsonAsync<FidoSigninResponse>();
                    if (signin.Success)
                    {
                        Guid guid = Guid.Parse(signin.UserId);

                        var user = await userContext.User_data.FirstOrDefaultAsync(u => u.ID_user == guid);
                        if (user == null)
                        {
                            return NotFound();
                        }
                        if (user.Fido == false)
                        {
                            return StatusCode(403, "Wrong authentication method.");
                        }
                        var passphrase = await _secretsManagerService.GetSecret("user/" + signin.UserId);
                        if (user.Activated == false)
                        {
                            return StatusCode(401, "Account not activated.");
                        }

                        var session = new Session
                        {
                            Session_ID = Guid.NewGuid(),
                            Data = DateTime.Now
                        };

                        if (user.TwoFA == true)
                        {
                            session.Active = false;
                        }
                        else
                        {
                            session.Active = true;
                        }
                        if (user.Type_of_2FA == "Email")
                        {
                            var generatedCode = PasswordGenerator.GeneratePassword(6, false, false, true, false);
                            user.TwoFA_code = Cryptography.Encrypt(generatedCode, passphrase, user.Salt, user.IV);

                            await mail.SendOTP(Cryptography.Decrypt(user.E_mail, passphrase, user.Salt, user.IV), generatedCode);
                            await userContext.SaveChangesAsync();
                        }
                        var usersession = new UserSession
                        {
                            Session_ID = session.Session_ID,
                            ID_user = user.ID_user
                        };

                        await sessionContext.Session.AddAsync(session);
                        await userSessionContext.User_session.AddAsync(usersession);

                        await sessionContext.SaveChangesAsync();
                        await userSessionContext.SaveChangesAsync();

                        if (user.TwoFA == true)
                        {
                            var data = new { sessionID = session.Session_ID, hash = passphrase, otp = true, type = user.Type_of_2FA };
                            return StatusCode(200, data);
                        }
                        else
                        {
                            var data = new { sessionID = session.Session_ID, hash = passphrase, otp = false };
                            return StatusCode(200, data);
                        }
                    }
                    return Ok(signin);
                }

                // Handle or log any API error
                var error = await request.Content.ReadFromJsonAsync<ProblemDetails>();
                return new JsonResult(error)
                {
                    StatusCode = (int)request.StatusCode
                };
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }
    }
}