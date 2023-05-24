using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApplication1.Models
{
    public class Website
    {
        [Key]
        public long ID_website { get; set; }

        [ForeignKey("User")]
        public System.Guid ID_user { get; set; }

        [Required]
        [Column(TypeName = "nvarchar(128)")]
        public string website_name { get; set; }

        [Required]
        [Column(TypeName = "nvarchar(128)")]
        public string website_adress { get; set; }

        [Required]
        [Column(TypeName = "nvarchar(128)")]
        public string Login { get; set; }

        [Required]
        [Column(TypeName = "nvarchar(128)")]
        public string Password { get; set; }

        [Required]
        [Column(TypeName = "DATETIME")]
        public DateTime Data { get; set; }

        [Required]
        [Column(TypeName = "varbinary(64)")]
        public byte[] Salt { get; set; }

        [Required]
        [Column(TypeName = "varbinary(16)")]
        public byte[] IV { get; set; }

        [Column(TypeName = "nvarchar(128)")]
        public string Icon { get; set; }

    }
}
