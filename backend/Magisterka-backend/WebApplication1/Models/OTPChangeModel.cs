namespace WebApplication1.Models
{
    public class OTPChangeModel
    {
        public string sessionID { get; set; }
        public bool twoFA { get; set; }
        public string twoFAtype { get; set; }
        public string confirmedPassword { get; set; }

    }
}
