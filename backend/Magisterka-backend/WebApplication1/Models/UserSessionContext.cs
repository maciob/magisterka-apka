using Microsoft.EntityFrameworkCore;

namespace WebApplication1.Models
{
    public class UserSessionContext : DbContext
    {
        public UserSessionContext(DbContextOptions<UserSessionContext> options) : base(options)
        {
        }

        public DbSet<UserSession> User_session { get; set; }

    }
}
