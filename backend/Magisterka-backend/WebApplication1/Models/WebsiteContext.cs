using Microsoft.EntityFrameworkCore;

namespace WebApplication1.Models
{
    public class WebsiteContext : DbContext
    {
        public WebsiteContext(DbContextOptions<WebsiteContext> options) : base(options)
        {
        }

        public DbSet<Website> Website { get; set; }
    }
}
