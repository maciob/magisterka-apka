using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;


namespace WebApplication1.Models
{
    public class User
    {
        [Key]
        public System.Guid ID_user { get; set; }

        [Required]
        [Column(TypeName = "nvarchar(50)")]
        public string Login { get; set; }

        [Required]
        [Column(TypeName = "nvarchar(50)")]
        public string Password { get; set; }

        [Required]
        [Column(TypeName = "bit")]
        public bool TwoFA { get; set; }

        [Column(TypeName = "bit")]
        public bool? Type_of_2FA { get; set; }

        [Required]
        [Column(TypeName = "nvarchar(50)")]
        public string E_mail { get; set; }

        [Column(TypeName = "nvarchar(50)")]
        public int? TwoFA_code { get; set; }

        [Required]
        [Column(TypeName = "bit")]
        public bool Activated { get; set; }

    }
}