using Microsoft.AspNetCore.Cors;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using WebApplication1.Models;
using System.Text.Json;


namespace WebApplication1.Controllers
{
    [EnableCors("CorsApi")]
    [ApiController]
    [Route("api/[controller]")]
    public class WebsiteController : ControllerBase
    {
        private readonly UserContext userContext;
        private readonly SessionContext sessionContext;
        private readonly UserSessionContext userSessionContext;
        private readonly WebsiteContext websiteContext;
        public WebsiteController(UserContext context, SessionContext context2, UserSessionContext context3, WebsiteContext context4)
        {
            userContext = context;
            sessionContext = context2;
            userSessionContext = context3;
            websiteContext = context4;
        }

        // curl -v -X GET http://backend:80/api/Website/list?sessionID=313efe30-7f4a-4d5f-87b1-1e38ed8a8531
        [HttpGet("list")]
        public async Task<ActionResult<Website>> List([FromQuery]string sessionID,[FromQuery]string hash)
        {
            try
            {
                if (sessionID == null || hash == null) 
                {
                    return BadRequest("Error.");
                }
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

                var websites = await websiteContext.Website.Where(w => w.ID_user == userSession.ID_user).ToListAsync();
                if (websites == null)
                {
                    return NotFound("Empty");
                }

                foreach (var website in websites) 
                {
                    website.ID_user = new Guid(sessionID);
                    website.Login = "";
                    website.Password = "";
                }

                session.Data = DateTime.Now;

                await sessionContext.SaveChangesAsync();

                return Ok(websites);

            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }

        }

        // curl -v -X GET https://localhost:5001/api/Website/entry/71443B16-D421-46D4-974C-16242C23B948/1 -H "Content-Length: 0"
        [HttpGet("entry")]
        public async Task<ActionResult<Website>> GetEntry([FromQuery] string sessionID, [FromQuery] string websiteID, [FromQuery] string hash)
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

                var website = await websiteContext.Website.FirstOrDefaultAsync(w => w.ID_user == userSession.ID_user && w.ID_website == long.Parse(websiteID));
                if (website == null)
                {
                    return NotFound("Empty");
                }

                website.Login = AES.Decrypt(website.Login, hash);
                website.Password = AES.Decrypt(website.Password, hash);

                session.Data = DateTime.Now;

                await sessionContext.SaveChangesAsync();

                return Ok(website);

            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }

        }

        [HttpPost("entry")]
        public async Task<ActionResult<Website>> AddEntry([FromBody] AddEntryModel model)
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


                var website = new Website
                {
                    ID_user = userSession.ID_user,
                    Login = AES.Encrypt(model.login,model.hash),
                    Password = AES.Encrypt(model.password, model.hash),
                    website_name = model.yourname,
                    website_adress = URL.GetFullUrl(model.url),
                    Data = DateTime.Now,
                    Icon = URL.CharStrip(model.url)
                };

                session.Data = DateTime.Now;

                await websiteContext.Website.AddAsync(website);

                await sessionContext.SaveChangesAsync();
                await websiteContext.SaveChangesAsync();

                return Ok();

            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }

        }

        [HttpPut("entry")]
        public async Task<ActionResult<Website>> EditEntry([FromBody] EditEntryModel model)
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

                var website = await websiteContext.Website.FirstOrDefaultAsync(w => w.ID_user == userSession.ID_user && w.ID_website == long.Parse(model.websiteID));
                if (website == null)
                {
                    return NotFound("Empty");
                }

                website.Login = AES.Encrypt(model.login, model.hash);
                website.Password = AES.Encrypt(model.password, model.hash);
                website.website_name = model.yourname;
                website.website_adress = URL.GetFullUrl(model.url);
                website.Data = DateTime.Now;
                website.Icon = URL.CharStrip(model.url);

                session.Data = DateTime.Now;

                await sessionContext.SaveChangesAsync();
                await websiteContext.SaveChangesAsync();

                return Ok();

            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }

        }

        [HttpDelete("entry")]
        public async Task<ActionResult<Website>> DeleteEntry([FromQuery] string sessionID, [FromQuery] string websiteID)
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

                var website = await websiteContext.Website.FirstOrDefaultAsync(w => w.ID_user == userSession.ID_user && w.ID_website == long.Parse(websiteID));
                if (website == null)
                {
                    return NotFound("Empty");
                }

                websiteContext.Website.Remove(website);

                session.Data = DateTime.Now;

                await sessionContext.SaveChangesAsync();
                await websiteContext.SaveChangesAsync();

                return Ok();

            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }

        [HttpGet("generator")]
        public async Task<ActionResult<PasswordGenerator>> GeneratePassword([FromQuery] int length, [FromQuery] bool useLower, [FromQuery] bool useUpper, [FromQuery] bool useDigits, [FromQuery] bool useSpecial)
        {
            try
            {
                var passwordGenerator = new
                {
                    password = PasswordGenerator.GeneratePassword(length, useLower, useUpper, useDigits, useSpecial)
                };
                return Ok(passwordGenerator);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }

        }
    }
}