using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WebApplication1.Models;

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

        public UserController(UserContext context,SessionContext context2,UserSessionContext context3,WebsiteContext context4)
        {
            userContext = context;
            sessionContext = context2;
            userSessionContext = context3;
            websiteContext = context4;
            tp = new GoogleTOTP();
        }

        // curl -v -X POST -H "Content-Type: application/json" -d "{\'Username\':\'testuser\',\'Password\':\'testpass\',\'Email\':\'teste@xample.com\',\'TwoFA\':\'TRUE\',\'TwoFAtype\':\'TRUE\'}" https://localhost:5001/api/User/register
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
                        string randomString = Transcoder.Base32Encode(tp.randomBytes);
                        string ProvisionUrl = tp.UrlEncode(String.Format("otpauth://totp/{0} ({1})?secret={2}", "PasswordManager", model.username , randomString));
                        url = String.Format("http://chart.apis.google.com/chart?cht=qr&chs={0}x{1}&chl={2}", 200, 200, ProvisionUrl);
                        privateKey = tp.getPrivateKey(tp.randomBytes);
                        code = "";
                        foreach (byte b in tp.randomBytes)
                        {
                            code = code + b + " ";
                        }
                    }
                    else if (model.twoFAtype == "Email")
                    {
                        //EMAIL TO DO
                    }
                }

                var user = new User
                {
                    ID_user = Guid.NewGuid(),
                    Login = model.username,
                    Password = AES.Encrypt(model.password,AES.Hash(model.password),"PasswordManager"),
                    TwoFA = model.twoFA,
                    Type_of_2FA = model.twoFAtype,
                    E_mail = AES.Encrypt(model.email, AES.Hash(model.password), "PasswordManager"),
                    TwoFA_code = AES.Encrypt(code, AES.Hash(model.password), "PasswordManager"),
                    Activated = false
                };

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
                    privateKey = privateKey
                };

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
                    return NotFound("user");
                }

                byte[] b = new byte[10];
                string[] subs = user.TwoFA_code.Split(' ');
                int i = 0;

                foreach (var sub in subs)
                {
                    if (i == 10) break;
                    b[i] = Convert.ToByte(Convert.ToInt32(sub));
                    i++;
                }

                if (tp.generateResponseCode(tp.getCurrentInterval(), b) == model.code)
                {
                    session.Active = true;
                    await sessionContext.SaveChangesAsync();
                    var data = new { sessionID = session.Session_ID, hash = "asd" };
                    return StatusCode(200, data);
                }
                else
                {
                    return BadRequest("Invalid code.");
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }


        //curl -v -X PUT https://localhost:5001/api/User/activate/f368faf0-daa0-4628-9541-67bdf8b2cd56 -H "Content-Length: 0"
        [HttpPut("activate/{sessionID}")]
        public async Task<ActionResult<User>> Acivate(string sessionID)
        {
            try
            {
                var session = await sessionContext.Session.FindAsync(new Guid(sessionID));
                if (session == null)
                {
                    return NotFound();
                }

                if (session.Active == false)
                {
                    return Unauthorized("Your session has expired or is invalid.");
                }

                var userSession = await userSessionContext.User_session.FirstOrDefaultAsync(us => us.Session_ID == new Guid(sessionID));
                if (userSession == null)
                {
                    return NotFound();
                }

                var user = await userContext.User_data.FindAsync(userSession.ID_user);
                if (user == null)
                {
                    return NotFound();
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

        //curl -v -X POST -H "Content-Type: application/json" -d "{\'Username\':\'testuser\',\'Password\':\'testpass\'}" https://localhost:5001/api/User/login
        [HttpPost("login")]
        public async Task<ActionResult<User>> Login([FromBody]LoginModel model)
        {
            try
            {
                var user = await userContext.User_data.FirstOrDefaultAsync(u => u.Login == model.username && u.Password == model.password);
                if (user == null)
                {
                    return NotFound();
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
                    var data = new { sessionID = session.Session_ID, hash = "asd", otp = true, type = user.Type_of_2FA };
                    return StatusCode(200, data);
                }
                else 
                {
                    var data = new { sessionID = session.Session_ID, hash = "asd", otp = false };
                    return StatusCode(200, data);
                }
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }

        [HttpDelete("delete/{sessionID}")]
        public async Task<ActionResult<User>> DeleteUser(string sessionID)
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

                var user = await userContext.User_data.FirstOrDefaultAsync(us => us.ID_user == userSession.ID_user);
                if (user == null)
                {
                    return NotFound("Empty");
                }

                var websites = await websiteContext.Website.Where(w => w.ID_user == user.ID_user).ToListAsync();
                if (websites != null)
                {
                    foreach (var website in websites) 
                    {
                        websiteContext.Website.Remove(website);
                    }
                }

                // var Sessions = await sessionContext.Session.Where()

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


        [HttpGet("check")]
        public async Task<ActionResult<User>> Check()
        {
            return Ok();
        }

        //OTP API z typem

    }
}
