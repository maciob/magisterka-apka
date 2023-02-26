using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApplication1.Models
{
    public class Session
    {
        [Key]
        public System.Guid Session_ID { get; set; }

        [Required]
        [Column(TypeName = "DATETIME")]
        public DateTime Data { get; set; }

        [Required]
        [Column(TypeName = "bit")]
        public bool Active { get; set; }

    }
}
