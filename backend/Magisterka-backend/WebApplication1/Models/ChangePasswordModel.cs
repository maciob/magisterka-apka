namespace WebApplication1.Models
{
    public class ChangePasswordModel
    {
        public string sessionID { get; set; }
        public string oldPassword { get; set; }
        public string newPassword { get; set; }

    }
}
