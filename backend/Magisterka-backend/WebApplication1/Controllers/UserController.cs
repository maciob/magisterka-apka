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
    [ApiController]
    [Route("api/[controller]")]
    public class UserController : ControllerBase
    {
        private readonly UserContext userContext;
        private readonly SessionContext sessionContext;
        private readonly UserSessionContext userSessionContext;

        public UserController(UserContext context,SessionContext context2,UserSessionContext context3)
        {
            userContext = context;
            sessionContext = context2;
            userSessionContext = context3;
        }

        // curl -v -X POST -H "Content-Type: application/json" -d "{\'Username\':\'testuser\',\'Password\':\'testpass\',\'Email\':\'teste@xample.com\',\'TwoFA\':\'TRUE\',\'TwoFAtype\':\'TRUE\'}" https://localhost:5001/api/User/register
        [HttpPost("register")]
        public async Task<ActionResult<User>> Register(string username, string password, string email, bool twoFA,bool? twoFAtype)
        {
            //need to check if such a user exists

            var user = new User
            {
                ID_user = Guid.NewGuid(),
                Login = "asd",
                Password = "asd",
                TwoFA = true,
                Type_of_2FA = true,
                E_mail = "asd",
                TwoFA_code = 1,
                Activated = false
            };

            var session = new Session
            {
                Session_ID = Guid.NewGuid(),
                Data = DateTime.Now,
                Active = true
            };

            var usersession = new UserSession
            {
                Session_ID = session.Session_ID,
                ID_user = user.ID_user
            };

            await userContext.User_data.AddAsync(user);
            await sessionContext.Session.AddAsync(session);
            await userSessionContext.User_session.AddAsync(usersession);

            await userContext.SaveChangesAsync();
            await sessionContext.SaveChangesAsync();
            await userSessionContext.SaveChangesAsync();

            return Ok(session.Session_ID);
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

                return Ok(user);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }

        }

        //curl -v -X POST -H "Content-Type: application/json" -d "{\'Username\':\'testuser\',\'Password\':\'testpass\'}" https://localhost:5001/api/User/login
        [HttpPost("login/{username}/{password}")]
        public async Task<ActionResult<User>> Login(string username, string password)
        {
            try
            {
                var user = await userContext.User_data.FirstOrDefaultAsync(u => u.Login == username && u.Password == password);
                if (user == null)
                {
                    return NotFound();
                }
       
                var session = new Session
                {
                    Session_ID = Guid.NewGuid(),
                    Data = DateTime.Now,
                    Active = true
                };

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
                    var data = new { sessionID = session.Session_ID, otp = true, type = user.Type_of_2FA };
                    return StatusCode(200, data);
                }
                
                return Ok(session.Session_ID);

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

                var user = await userContext.User_data.FindAsync(userSession.ID_user);
                if (user == null)
                {
                    return NotFound("Empty");
                }

                userContext.User_data.Remove(user);
                await userContext.SaveChangesAsync();

                return Ok(user);

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

        //Delete bo tego jeszcze brakuje

        //Edit bo tego jeszcze brakuje

        //OTP API z typem
    }
}
