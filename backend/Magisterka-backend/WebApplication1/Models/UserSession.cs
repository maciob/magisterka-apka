using Microsoft.EntityFrameworkCore;
using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
namespace WebApplication1.Models
{
    public class UserSession
    {
        [Key]
        public long UserSessionID { get; set; }

        [ForeignKey("User")]
        public System.Guid ID_user { get; set; }

        [ForeignKey("Session")]
        public System.Guid Session_ID { get; set; }
    }
}
