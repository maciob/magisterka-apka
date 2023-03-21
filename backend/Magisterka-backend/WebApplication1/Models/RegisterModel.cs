namespace WebApplication1.Models
{
    public class RegisterModel
    {
        public string username { get; set; }
        public string password { get; set; }
        public string email { get; set; }
        public bool twoFA { get; set; }
        public string? twoFAtype { get; set; }

    }
}
