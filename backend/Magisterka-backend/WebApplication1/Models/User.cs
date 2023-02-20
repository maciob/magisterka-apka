using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace WebApplication1.Models
{
    public class User
    {
        [Key]
        public int ID_user { get; set; }

        [Required]
        [Column(TypeName = "nvarchar(20)")]
        public string Login { get; set; }

        [Required]
        [Column(TypeName = "nvarchar(30)")]
        public string Password { get; set; }

        [Required]
        [Column(TypeName = "bit")]
        public bool TwoFA { get; set; }

        [Column(TypeName = "bit")]
        public bool? TypeTwoFA { get; set; }

        [Required]
        [Column(TypeName = "nvarchar(100)")]
        public string Email { get; set; }

        
        [Column(TypeName = "nvarchar(30)")]
        public string? TwoFASecret { get; set; }

        [Column(TypeName = "bit")]
        [Required]
        public bool Activated { get; set; }

    }
}