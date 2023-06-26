using System.Security.Cryptography;
using System.IO;
using System.Text;
using System;

namespace WebApplication1.Models
{
    public class Cryptography
    {
        public static byte[] GenerateRandomSalt(int saltSize = 32)
        {
            byte[] saltBytes = new byte[saltSize];
            using (RNGCryptoServiceProvider rng = new RNGCryptoServiceProvider())
            {
                rng.GetBytes(saltBytes);
            }
            return saltBytes;
        }

        public static byte[] GenerateRandomIV()
        {
            using (Aes aes = Aes.Create())
            {
                aes.GenerateIV();
                return aes.IV;
            }
        }

        public static string GetHash(string PlainText)
        {
            using (SHA256 sha256Hash = SHA256.Create())
            {
                byte[] data = sha256Hash.ComputeHash(Encoding.UTF8.GetBytes(PlainText));
                StringBuilder builder = new StringBuilder();
                for (int i = 0; i < data.Length; i++)
                {
                    builder.Append(data[i].ToString("x2"));
                }
                return builder.ToString();
            }
        }
        public static string Encrypt(string PlainText, string Password, byte[] SaltValueBytes, byte[] InitialVectorBytes, string HashAlgorithm = "SHA256", int PasswordIterations = 500, int KeySize = 256)
        {
            if (string.IsNullOrEmpty(PlainText))
                return "";
            byte[] PlainTextBytes = Encoding.UTF8.GetBytes(PlainText);

            PasswordDeriveBytes DerivedPassword = new PasswordDeriveBytes(Password, SaltValueBytes, HashAlgorithm, PasswordIterations);
            byte[] KeyBytes = DerivedPassword.GetBytes(KeySize / 8);
            RijndaelManaged SymmetricKey = new RijndaelManaged();
            SymmetricKey.Mode = CipherMode.CBC;
            SymmetricKey.Padding = PaddingMode.PKCS7;
            byte[] CipherTextBytes = null;
            using (ICryptoTransform Encryptor = SymmetricKey.CreateEncryptor(KeyBytes, InitialVectorBytes))
            {
                using (MemoryStream MemStream = new MemoryStream())
                {
                    using (CryptoStream CryptoStream = new CryptoStream(MemStream, Encryptor, CryptoStreamMode.Write))
                    {
                        CryptoStream.Write(PlainTextBytes, 0, PlainTextBytes.Length);
                        CryptoStream.FlushFinalBlock();
                        CipherTextBytes = MemStream.ToArray();
                        MemStream.Close();
                        CryptoStream.Close();
                    }
                }
            }
            SymmetricKey.Clear();
            return Convert.ToBase64String(CipherTextBytes);
        }
        public static string Decrypt(string CipherText, string Password, byte[] SaltValueBytes, byte[] InitialVectorBytes, string HashAlgorithm = "SHA256", int PasswordIterations = 500, int KeySize = 256)
        {
            if (string.IsNullOrEmpty(CipherText))
                return "";
            byte[] CipherTextBytes = Convert.FromBase64String(CipherText);
            PasswordDeriveBytes DerivedPassword = new PasswordDeriveBytes(Password, SaltValueBytes, HashAlgorithm, PasswordIterations);
            byte[] KeyBytes = DerivedPassword.GetBytes(KeySize / 8);
            RijndaelManaged SymmetricKey = new RijndaelManaged();
            SymmetricKey.Mode = CipherMode.CBC;
            SymmetricKey.Padding = PaddingMode.PKCS7; 
            byte[] buffer = new byte[1024];
            StringBuilder sb = new StringBuilder();
            try
            {
                using (ICryptoTransform Decryptor = SymmetricKey.CreateDecryptor(KeyBytes, InitialVectorBytes))
                {
                    using (MemoryStream MemStream = new MemoryStream(CipherTextBytes))
                    {
                        using (CryptoStream CryptoStream = new CryptoStream(MemStream, Decryptor, CryptoStreamMode.Read))
                        {
                            int bytesRead = 0;
                            do
                            {
                                bytesRead = CryptoStream.Read(buffer, 0, buffer.Length);
                                sb.Append(Encoding.UTF8.GetString(buffer, 0, bytesRead));
                            }
                            while (bytesRead > 0);
                            CryptoStream.Close();
                        }
                        MemStream.Close();
                    }
                }
            }
            catch (Exception)
            {
                return "Wrong Password";
            }
            SymmetricKey.Clear();
            return sb.ToString();
        }
    }
}