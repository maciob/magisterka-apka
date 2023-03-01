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

                return Ok(websites);

            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }

        }

        // curl -v -X GET https://localhost:5001/api/Website/entry/71443B16-D421-46D4-974C-16242C23B948/1 -H "Content-Length: 0"
        [HttpGet("entry/{sessionID}/{websiteID}")]
        public async Task<ActionResult<Website>> GetEntry(string sessionID, string websiteID)
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

                return Ok(website);

            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }

        }

        [HttpPost("entry/{sessionID}/{login}/{password}/{website_name}/{website_adress}")]
        public async Task<ActionResult<Website>> AddEntry(string sessionID, string login, string password, string website_name, string website_adress)
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


                var website = new Website
                {
                    ID_user = userSession.ID_user,
                    Login = login,
                    Password = password,
                    website_name = website_name,
                    website_adress = website_adress,
                    Data = DateTime.Now
                };

                await websiteContext.Website.AddAsync(website);

                await websiteContext.SaveChangesAsync();

                return Ok(website);

            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }

        }

        [HttpPut("entry/{sessionID}/{websiteID}/{login}/{password}/{website_name}/{website_adress}")]
        public async Task<ActionResult<Website>> EditEntry(string sessionID, string websiteID, string login, string password, string website_name, string website_adress)
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

                website.Login = login;
                website.Password = password;
                website.website_name = website_name;
                website.website_adress = website_adress;
                website.Data = DateTime.Now;

                await websiteContext.SaveChangesAsync();

                return Ok(website);

            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }

        }

        [HttpDelete("entry/{sessionID}/{websiteID}")]
        public async Task<ActionResult<Website>> DeleteEntry(string sessionID, string websiteID)
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
                await websiteContext.SaveChangesAsync();

                return Ok(website);

            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error: {ex.Message}");
            }
        }
    }
}