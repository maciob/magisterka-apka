using MimeKit;
using MailKit.Net.Smtp;
using Microsoft.Extensions.Configuration;
using System.Threading.Tasks;
using System;

namespace WebApplication1.Models
{
    public class Mailing
    {
        public async Task SendOTP(string receipment, string otp)
        {
            var MyConfig = new ConfigurationBuilder().AddJsonFile("appsettings.json").Build();
            var Login = MyConfig.GetValue<string>("Mailing:Login").Replace("[CONNECTION_STRING_PLACEHOLDER]", Environment.GetEnvironmentVariable("MyApp_Login")); 
            var Password = MyConfig.GetValue<string>("Mailing:Password").Replace("[CONNECTION_STRING_PLACEHOLDER]", Environment.GetEnvironmentVariable("MyApp_Password"));

            var message = new MimeMessage();
            message.From.Add(new MailboxAddress("PasswordManager", Login));
            message.To.Add(MailboxAddress.Parse(receipment));
            message.Subject = "PasswordManager OTP";
            message.Body = new TextPart("plain")
            {
                Text = @"Your OTP for password manager is: " + otp
            };

            using (var client = new SmtpClient())
            {
                client.Connect("smtp.gmail.com", 587);
                client.Authenticate(Login, Password);
                await client.SendAsync(message);
                client.Disconnect(true);
            }
        }
        public async Task SendActivate(string receipment, string sessionID)
        {
            var MyConfig = new ConfigurationBuilder().AddJsonFile("appsettings.json").Build();
            var Login = MyConfig.GetValue<string>("Mailing:Login").Replace("[CONNECTION_STRING_PLACEHOLDER]", Environment.GetEnvironmentVariable("MyApp_Login"));
            var Password = MyConfig.GetValue<string>("Mailing:Password").Replace("[CONNECTION_STRING_PLACEHOLDER]", Environment.GetEnvironmentVariable("MyApp_Password"));
            var address = MyConfig.GetValue<string>("ConnectionStrings:FrontURL").Replace("[CONNECTION_STRING_PLACEHOLDER]", Environment.GetEnvironmentVariable("MyApp_FrontURL"));

            var message = new MimeMessage();

            message.From.Add(new MailboxAddress("PasswordManager", Login));
            message.To.Add(MailboxAddress.Parse(receipment));
            message.Subject = "PasswordManager account activation";
            message.Body = new TextPart("plain")
            {
                Text = @"Link to activate your account: " + address + "/activate?sessionID=" + sessionID
            };

            using (var client = new SmtpClient())
            {
                client.Connect("smtp.gmail.com", 587);
                client.Authenticate(Login, Password);
                await client.SendAsync(message);
                client.Disconnect(true);
            }
        }
    }
}
