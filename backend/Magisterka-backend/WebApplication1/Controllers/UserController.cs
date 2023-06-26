using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WebApplication1.Models;
using System.Text;
using Microsoft.Extensions.Configuration;

namespace WebApplication1.Controllers
{
    [EnableCors("CorsApi")]
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly UserContext userContext;
        private readonly SessionContext sessionContext;
        private readonly UserSessionContext userSessionContext;
        private readonly WebsiteContext websiteContext;
        private readonly GoogleTOTP tp;
        private readonly Mailing mail;

        private readonly ISecretsManagerService _secretsManagerService;

        private IConfiguration MyConfig;
        private bool mode;

        public UserController(UserContext context,SessionContext context2,UserSessionContext context3,WebsiteContext context4, ISecretsManagerService secretsManagerService)
        {
            userContext = context;
            sessionContext = context2;
            userSessionContext = context3;
            websiteContext = context4;

            tp = new GoogleTOTP();
            mail = new Mailing();

            _secretsManagerService = secretsManagerService;

            MyConfig = new ConfigurationBuilder().AddJsonFile("appsettings.json").Build();
            mode = bool.Parse(MyConfig.GetValue<string>("Mode").Replace("[CONNECTION_STRING_PLACEHOLDER]", Environment.GetEnvironmentVariable("MyApp_Mode")));
        }

        [HttpPost("register")]
        public async Task<ActionResult<User>> Register([FromBody] RegisterModel model)
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
                var hash = Cryptography.GetHash(model.password);

                var user = new User
                {
                    ID_user = Guid.NewGuid(),
                    Login = model.username,
                    Fido = false,
                    TwoFA = model.twoFA,
                    Type_of_2FA = model.twoFAtype,
                    E_mail = Cryptography.Encrypt(model.email, hash, Salt, IV),
                    TwoFA_code = Cryptography.Encrypt(code, hash, Salt, IV),
                    Salt = Salt,
                    IV = IV,
                    Activated = false
                };
                if (mode)
                {
                    await _secretsManagerService.CreateSecret("user/" + user.ID_user, Cryptography.Encrypt(model.password, hash, Salt, IV));
                }
                else
                {
                    user.Password = Cryptography.Encrypt(model.password, hash, Salt, IV);
                }

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
                    url = url,
                    privateKey = privateKey,
                    hash = hash
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
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }

        [HttpPost("otp")]
        public async Task<ActionResult<User>> OTP([FromBody] OTPModel model)
        {
            try 
            {
           
                var session = await sessionContext.Session.FindAsync(Guid.Parse(model.sessionID));
                if (session == null)
                {
                    return NotFound("Your session is invalid.");
                }
                
                var userSession = await userSessionContext.User_session.FirstOrDefaultAsync(us => us.Session_ID == new Guid(model.sessionID));
                if (userSession == null)
                {
                    return NotFound("session/user");
                }
                var user = await userContext.User_data.FirstOrDefaultAsync(u => u.ID_user == userSession.ID_user);
                if (user == null)
                {
                    return NotFound("user");
                }

                if (Cryptography.Decrypt(user.E_mail, model.hash, user.Salt, user.IV) == "Wrong Password")
                {
                    return Unauthorized("Wrong password.");
                }

                if (model.twoFAtype == "Google Authenticator")
                {
                    byte[] b = new byte[10];
                    string[] subs = Cryptography.Decrypt(user.TwoFA_code, model.hash, user.Salt, user.IV).Split(' ');
                    var i = 0;
                    foreach (var sub in subs)
                    {
                        b[i] = Convert.ToByte(Convert.ToInt32(sub));
                        i++;
                    }
                    if (tp.generateResponseCode(tp.getCurrentInterval(), b) == model.code)
                    {
                        session.Active = true;
                        session.Data = DateTime.Now;
                        await sessionContext.SaveChangesAsync();
                        var data = new { sessionID = session.Session_ID, hash = model.hash };
                        return StatusCode(200, data);
                    }
                    else
                    {
                        return BadRequest("Invalid code.");
                    }
                }
                else
                {
                    if (Cryptography.Decrypt(user.TwoFA_code, model.hash, user.Salt, user.IV) == model.code)
                    {
                        session.Active = true;
                        session.Data = DateTime.Now;
                        await sessionContext.SaveChangesAsync();
                        var data = new { sessionID = session.Session_ID, hash = model.hash };
                        return StatusCode(200, data);
                    }
                    else 
                    {
                        return BadRequest("Invalid code.");
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }


        [HttpPut("otp")]
        public async Task<ActionResult<User>> OTPChange([FromBody] OTPChangeModel model)
        {
            try
            {
                var session = await sessionContext.Session.FindAsync(new Guid(model.sessionID));
                if (session == null)
                {
                    return NotFound("Your session is invalid.");
                }

                var userSession = await userSessionContext.User_session.FirstOrDefaultAsync(us => us.Session_ID == new Guid(model.sessionID));
                if (userSession == null)
                {
                    return NotFound("session/user");
                }
                var user = await userContext.User_data.FirstOrDefaultAsync(u => u.ID_user == userSession.ID_user);
                if (user == null)
                {
                    return NotFound();
                }

                var hash = Cryptography.GetHash(model.confirmedPassword);

                if (Cryptography.Decrypt(user.E_mail, hash, user.Salt, user.IV) == "Wrong Password")
                {
                    return Unauthorized("Wrong password.");
                }

                session.Data = DateTime.Now;
                await sessionContext.SaveChangesAsync();

                if ((model.twoFA == false && user.TwoFA == false) || (model.twoFA == true && user.TwoFA == true && model.twoFAtype == user.Type_of_2FA))
                {
                    return StatusCode(304);
                }
                else
                {
                    if (model.twoFAtype == "Google Authenticator")
                    {
                        var randomString = Transcoder.Base32Encode(tp.randomBytes);
                        var provisionUrl = tp.UrlEncode($"otpauth://totp/PasswordManager ({user.Login})?secret={randomString}");
                        var url = $"https://chart.apis.google.com/chart?cht=qr&chs=200x200&chl={provisionUrl}";
                        var privateKey = tp.getPrivateKey(tp.randomBytes);
                        var code = string.Join(" ", tp.randomBytes);

                        user.TwoFA = model.twoFA;
                        user.Type_of_2FA = model.twoFAtype;
                        user.TwoFA_code = Cryptography.Encrypt(code, hash, user.Salt, user.IV);

                        var response = new
                        {
                            twoFA = model.twoFA,
                            type = model.twoFAtype,
                            url = url,
                            privateKey = privateKey           
                        };

                        await userContext.SaveChangesAsync();

                        return Ok(response);
                    }
                    else if (model.twoFAtype == "Email")
                    {
                        user.TwoFA = model.twoFA;
                        user.Type_of_2FA = model.twoFAtype;
                        user.TwoFA_code = "";

                        await userContext.SaveChangesAsync();

                        var response = new
                        {
                            twoFA = model.twoFA,
                            type = model.twoFAtype,
                        };

                        return Ok(response);
                    }
                    else 
                    {
                        user.TwoFA = false;
                        user.Type_of_2FA = "";
                        user.TwoFA_code = "";

                        await userContext.SaveChangesAsync();

                        var response = new
                        {
                            twoFA = false,
                            type = "",
                        };

                        return Ok(response);
                    }
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }

        [HttpPut("activate")]
        public async Task<ActionResult<User>> Acivate([FromQuery]string sessionID)
        {
            try
            {
                var session = await sessionContext.Session.FindAsync(new Guid(sessionID));
                if (session == null)
                {
                    return NotFound("session");
                }

                /*if (session.Active == false)
                {
                    return Unauthorized("Your session has expired or is invalid.");
                }*/

                var userSession = await userSessionContext.User_session.FirstOrDefaultAsync(us => us.Session_ID == new Guid(sessionID));
                if (userSession == null)
                {
                    return NotFound("user/session");
                }

                var user = await userContext.User_data.FindAsync(userSession.ID_user);
                if (user == null)
                {
                    return NotFound("user");
                }

                if (user.Activated == true) 
                { 
                    return BadRequest("The account has been already activated.");
                }

                user.Activated = true;
                await userContext.SaveChangesAsync();

                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }

        }

        [HttpPost("login")]
        public async Task<ActionResult<User>> Login([FromBody]LoginModel model)
        {
            try
            {
                var user = await userContext.User_data.FirstOrDefaultAsync(u => u.Login == model.username);
                if (user == null)
                {
                    return NotFound();
                }
                if (user.Fido == true) 
                {
                    return StatusCode(403,"Wrong authentication method.");
                }
                var hash = Cryptography.GetHash(model.password);

                if (Cryptography.Decrypt(user.E_mail, hash, user.Salt, user.IV) == "Wrong Password")
                {
                    return NotFound("Wrong password.");
                }

                if (user.Activated == false) 
                {
                    return StatusCode(401,"Account not activated.");
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
                    user.TwoFA_code = Cryptography.Encrypt(generatedCode, hash, user.Salt, user.IV);

                    await mail.SendOTP(Cryptography.Decrypt(user.E_mail, hash, user.Salt, user.IV), generatedCode);
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
                    var data = new { sessionID = session.Session_ID, hash = hash, otp = true, type = user.Type_of_2FA };
                    return StatusCode(200, data);
                }
                else 
                {
                    var data = new { sessionID = session.Session_ID, hash = hash, otp = false };
                    return StatusCode(200, data);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }

        [HttpDelete("delete")]
        public async Task<ActionResult<User>> DeleteUser([FromBody] DeleteAccountModel model)
        {
            try
            {
                var session = await sessionContext.Session.FindAsync(new Guid(model.sessionID));
                if (session == null)
                {
                    return NotFound("Your session is invalid.");
                }

                if (session.Active == false)
                {
                    return Unauthorized("Your session has expired.");
                }

                var userSession = await userSessionContext.User_session.FirstOrDefaultAsync(us => us.Session_ID == new Guid(model.sessionID));
                if (userSession == null)
                {
                    return NotFound("session/user");
                }

                var user = await userContext.User_data.FirstOrDefaultAsync(u => u.ID_user == userSession.ID_user);
                if (user == null)
                {
                    return NotFound("User not found.");
                }

                var hash = Cryptography.GetHash(model.confirmedPassword);

                if (Cryptography.Decrypt(user.E_mail, hash, user.Salt, user.IV) == "Wrong Password")
                {
                    return Unauthorized("Wrong password.");
                }

                var websites = await websiteContext.Website.Where(w => w.ID_user == user.ID_user).ToListAsync();
                if (websites != null)
                {
                    foreach (var website in websites) 
                    {
                        if (mode)
                        {
                            await _secretsManagerService.DeleteSecret("website/" + website.ID_website);
                        }
                        websiteContext.Website.Remove(website);
                    }
                }

                var userSessions = await userSessionContext.User_session.Where(us => us.ID_user == userSession.ID_user).ToListAsync();
                if (userSessions != null)
                {
                    foreach (var entry in userSessions)
                    {
                        var session_entry = await sessionContext.Session.FirstOrDefaultAsync(s => s.Session_ID == userSession.Session_ID);
                        userSessionContext.User_session.Remove(entry);
                        sessionContext.Session.Remove(session_entry);
                    }
                }

                if (mode)
                {
                    await _secretsManagerService.DeleteSecret("user/" + user.ID_user);
                }

                userContext.User_data.Remove(user);

                await websiteContext.SaveChangesAsync();
                await userSessionContext.SaveChangesAsync();
                await sessionContext.SaveChangesAsync();
                await userContext.SaveChangesAsync();

                return Ok();

            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }

        [HttpPost("logout")]
        public async Task<ActionResult<User>> Logout([FromQuery]string sessionID)
        {
            try
            {
                var session = await sessionContext.Session.FindAsync(new Guid(sessionID));
                if (session == null)
                {
                    return NotFound("Your session is invalid.");
                }

                if (session.Active == false)
                {
                    return Unauthorized("Your session has already been expired.");
                }

                session.Active = false;

                await sessionContext.SaveChangesAsync();

                return Ok();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }

        [HttpPut("password")]
        public async Task<ActionResult<User>> ChangePassword([FromBody] ChangePasswordModel model)
        {
            try
            {

                var session = await sessionContext.Session.FindAsync(new Guid(model.sessionID));
                if (session == null)
                {
                    return NotFound("Your session is invalid.");
                }

                if (session.Active == false)
                {
                    return Unauthorized("Your session has expired.");
                }

                var userSession = await userSessionContext.User_session.FirstOrDefaultAsync(us => us.Session_ID == new Guid(model.sessionID));
                if (userSession == null)
                {
                    return NotFound("session/user");
                }

                var user = await userContext.User_data.FirstOrDefaultAsync(u => u.ID_user == userSession.ID_user);
                if (user == null)
                {
                    return NotFound("User not found.");
                }

                if (user.Fido == true) 
                {
                    return Unauthorized("Wrong account type");
                }

                var hash = Cryptography.GetHash(model.oldPassword);

                if (Cryptography.Decrypt(user.E_mail, hash, user.Salt, user.IV) == "Wrong Password")
                {
                    return Unauthorized("Wrong password.");
                }

                var newHash = Cryptography.GetHash(model.newPassword);
                string updatedEncryptedUserPassword = Cryptography.Encrypt(model.newPassword, newHash, user.Salt, user.IV);
                
                if (mode)
                {
                    await _secretsManagerService.UpdateSecret("user/" + user.ID_user, updatedEncryptedUserPassword);
                }
                else
                {
                    user.Password = updatedEncryptedUserPassword;
                }

                user.E_mail = Cryptography.Encrypt(Cryptography.Decrypt(user.E_mail, hash, user.Salt, user.IV), newHash, user.Salt, user.IV);
                user.TwoFA_code = Cryptography.Encrypt(Cryptography.Decrypt(user.TwoFA_code, hash, user.Salt, user.IV), newHash, user.Salt, user.IV);

                var websites = await websiteContext.Website.Where(w => w.ID_user == userSession.ID_user).ToListAsync();
                if (websites == null)
                {
                    return NotFound("Empty");
                }

                foreach (var website in websites)
                {
                    website.Login = Cryptography.Encrypt(Cryptography.Decrypt(website.Login, hash, website.Salt, website.IV), newHash, website.Salt, website.IV);
                    if (mode)
                    {
                        var oldWebsitePassowrd = await _secretsManagerService.GetSecret("website/" + website.ID_website);
                        var updatedWebsitePassword = Cryptography.Encrypt(Cryptography.Decrypt(oldWebsitePassowrd, hash, website.Salt, website.IV), newHash, website.Salt, website.IV);
                        await _secretsManagerService.UpdateSecret("website/" + website.ID_website, updatedWebsitePassword);
                    }
                    else 
                    {
                        website.Password = Cryptography.Encrypt(Cryptography.Decrypt(website.Password, hash, website.Salt, website.IV), newHash, website.Salt, website.IV);
                    }
                }

                session.Data = DateTime.Now;

                await sessionContext.SaveChangesAsync();
                await userContext.SaveChangesAsync();
                await websiteContext.SaveChangesAsync();

                var data = new { hash = newHash };

                return StatusCode(200, data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }

        [HttpGet("account")]
        public async Task<ActionResult<User>> GetAccount([FromQuery] string sessionID, [FromQuery] string hash)
        {
            try
            {
                var session = await sessionContext.Session.FindAsync(new Guid(sessionID));
                if (session == null)
                {
                    return NotFound("Your session is invalid.");
                }

                if (session.Active == false)
                {
                    return Unauthorized("Your session has expired.");
                }

                var userSession = await userSessionContext.User_session.FirstOrDefaultAsync(us => us.Session_ID == new Guid(sessionID));
                if (userSession == null)
                {
                    return NotFound("session/user");
                }

                var user = await userContext.User_data.FirstOrDefaultAsync(u => u.ID_user == userSession.ID_user);
                if (user == null)
                {
                    return NotFound();
                }

                if (Cryptography.Decrypt(user.E_mail, hash, user.Salt, user.IV) == "Wrong Password")
                {
                    return Unauthorized("Wrong password.");
                }

                session.Data = DateTime.Now;

                await sessionContext.SaveChangesAsync();

                var data = new { login = user.Login, email = Cryptography.Decrypt(user.E_mail, hash, user.Salt, user.IV), twoFa = user.TwoFA , twoFAtype = user.Type_of_2FA , type = user.Fido };

                return StatusCode(200, data);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }



        [HttpGet("check")]
        public async Task<ActionResult<User>> Check()
        {
            return Ok();
        }
    }
}
