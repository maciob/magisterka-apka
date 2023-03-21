namespace WebApplication1.Models
{
    public class RegisterResponse
    {
        public System.Guid sessionID { get; set; }
        public bool twoFA { get; set; }
        public string type { get; set; }
        public string url { get; set; }
        public string privateKey { get; set; }

    }
}
