using Microsoft.EntityFrameworkCore;

namespace WebApplication1.Models
{
    public class SessionContext : DbContext
    {
        public SessionContext(DbContextOptions<SessionContext> options) : base(options)
        {
        }

        public DbSet<Session> Session { get; set; }
    }
}
