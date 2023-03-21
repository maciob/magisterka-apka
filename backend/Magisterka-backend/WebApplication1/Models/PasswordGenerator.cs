using System;
using System.Linq;
using System.Security.Cryptography;

namespace WebApplication1.Models
{
    public class PasswordGenerator
    {
        public string password { get; set; }
        public static string GeneratePassword(int length = 16, bool useLower = true, bool useUpper = true, bool useDigits = true, bool useSpecial = true)
        {
            // Define the character sets to choose from based on the settings
            string lowercase = useLower ? "abcdefghijklmnopqrstuvwxyz" : "";
            string uppercase = useUpper ? "ABCDEFGHIJKLMNOPQRSTUVWXYZ" : "";
            string digits = useDigits ? "0123456789" : "";
            string special = useSpecial ? "!@#$%^&*()?/<>,.:\";'{[]}|\\" : "";

            string allChars = lowercase + uppercase + digits + special;

            if (length <= 0 || allChars.Length == 0)
            {
                return "";
            }

            var result = new char[length];
            var random = new Random();
            using var rng = new RNGCryptoServiceProvider();
            var bytes = new byte[4];
            int index = 0;
            while (index < length)
            {
                rng.GetBytes(bytes);
                uint num = BitConverter.ToUInt32(bytes, 0);
                for (int j = 0; j < 4 && index < length; j++)
                {
                    int rand = (int)(num % (uint)allChars.Length);
                    num >>= 8;
                    result[index++] = allChars[rand];
                }
            }

            return new string(result);
        }
    }

}
