using System;
using System.Timers;
using WebApplication1.Models;
using System.Linq;
using Microsoft.Extensions.DependencyInjection;
using System.Threading.Tasks;
using Microsoft.EntityFrameworkCore;

namespace WebApplication1.Controllers
{
    public class TimerService : Microsoft.Extensions.Hosting.BackgroundService
    {
        private readonly Timer _timer;
        private readonly IServiceScopeFactory _scopeFactory;

        public TimerService(IServiceScopeFactory scopeFactory)
        {
            _scopeFactory = scopeFactory;
            _timer = new Timer(5 * 60 * 1000);
            _timer.Elapsed += OnTimerElapsed;
            _timer.AutoReset = true;
        }

        public override async Task StartAsync(System.Threading.CancellationToken cancellationToken)
        {
            _timer.Enabled = true;
            Console.WriteLine("Started at " + DateTime.Now.ToString());
            await base.StartAsync(cancellationToken);
        }

        protected override async Task ExecuteAsync(System.Threading.CancellationToken stoppingToken)
        {
            await Task.CompletedTask;
        }

        private async void OnTimerElapsed(object sender, ElapsedEventArgs e)
        {
            Console.WriteLine("Triggered at " + DateTime.Now.ToString());
            try
            {
                using (var scope = _scopeFactory.CreateScope())
                {
                    var sessionContext = scope.ServiceProvider.GetRequiredService<SessionContext>();
                    var sessions = await sessionContext.Session.Where(s => s.Active == true).ToListAsync();
                    if (sessions != null)
                    {
                        foreach (var session in sessions)
                        {
                            var now = DateTime.Now;
                            var date = session.Data;

                            if ((now - date).TotalMinutes >= 5)
                            {
                                Console.WriteLine("For {0} session 5 minutes have passed.", session.Session_ID);
                                session.Active = false;
                            }
                        }
                        await sessionContext.SaveChangesAsync();
                    }
                }
            }
            catch (Exception ex)
            {
                Console.WriteLine(ex);
            }
        }
    }
}
