using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace WebApplication1.Models
{
    public class LoginModel
    {
        public string username { get; set; }
        public string password { get; set; }
    }
}
