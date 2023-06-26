using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.EntityFrameworkCore;
using WebApplication1.Models;
using WebApplication1.Controllers;
using System;
namespace WebApplication1
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        public void ConfigureServices(IServiceCollection services)
        {
            services.AddCors(options =>
            {
                options.AddPolicy("CorsApi",
                    builder => builder.WithOrigins(Configuration.GetValue<string>("ConnectionStrings:FrontURL").Replace("[CONNECTION_STRING_PLACEHOLDER]", Environment.GetEnvironmentVariable("MyApp_FrontURL")))
                        .AllowAnyHeader()
                        .AllowAnyMethod());
            });

            services.AddDbContext<UserContext>(options =>
                options.UseSqlServer(Configuration.GetValue<string>("ConnectionStrings:MyAppDatabase").Replace("[CONNECTION_STRING_PLACEHOLDER]", Environment.GetEnvironmentVariable("MyAppDatabase_ConnectionString"))));
            services.AddDbContext<SessionContext>(options =>
                options.UseSqlServer(Configuration.GetValue<string>("ConnectionStrings:MyAppDatabase").Replace("[CONNECTION_STRING_PLACEHOLDER]", Environment.GetEnvironmentVariable("MyAppDatabase_ConnectionString"))));
            services.AddDbContext<WebsiteContext>(options =>
                options.UseSqlServer(Configuration.GetValue<string>("ConnectionStrings:MyAppDatabase").Replace("[CONNECTION_STRING_PLACEHOLDER]", Environment.GetEnvironmentVariable("MyAppDatabase_ConnectionString"))));
            services.AddDbContext<UserSessionContext>(options =>
                options.UseSqlServer(Configuration.GetValue<string>("ConnectionStrings:MyAppDatabase").Replace("[CONNECTION_STRING_PLACEHOLDER]", Environment.GetEnvironmentVariable("MyAppDatabase_ConnectionString"))));
            
            services.AddTransient<ISecretsManagerService, SecretsManagerService>();

            services.AddScoped<TimerService>();
            services.AddHostedService<TimerService>();
            services.AddHttpClient();

            services.AddControllers();
        }

        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseHttpsRedirection();

            app.UseRouting();

            app.UseCors("CorsApi");

            app.UseAuthorization();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapControllers();
            });
        }
    }
}
