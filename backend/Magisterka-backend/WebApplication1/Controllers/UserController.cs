using Microsoft.AspNetCore.Mvc;
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
        private readonly UserContext _context;

        public UserController(UserContext context)
        {
            _context = context;
        }

        [HttpPost("register")]
        public async Task<ActionResult<User>> Register(string username, string password, string email, bool twoFA,bool? twoFAtype)
        {
            if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password) || string.IsNullOrEmpty(email))
            {
                return BadRequest("Username and password are required");
            }

            var user = new User
            {
                Login = username,
                Password = password,
                TwoFA = twoFA,
                Email = email,
                Activated = false
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(user);
        }

        [HttpPost("login")]
        public async Task<ActionResult<User>> Login(string username, string password)
        {
            if (string.IsNullOrEmpty(username) || string.IsNullOrEmpty(password))
            {
                return BadRequest("Username and password are required");
            }

            //var user = await _context.Users.FirstOrDefaultAsync(u => u.Login == username && u.Password == password);

            //if (user == null)
            //{
            //    return Unauthorized("Invalid username or password");
            //}

            return Ok();
        }
        [HttpGet("check")]
        public async Task<ActionResult<User>> Check()
        {
            return Ok();
        }

    }
}
