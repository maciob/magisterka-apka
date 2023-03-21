using System.Text;
using System.Security.Cryptography;
using System;

namespace WebApplication1.Models
{
    public class GoogleTOTP
    {
		RNGCryptoServiceProvider rnd;
		public byte[] randomBytes = new byte[10];
		protected string unreservedChars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-_.~";

		private int intervalLength;
		private int pinCodeLength;
		private int pinModulo;

		public GoogleTOTP()
		{
			rnd = new RNGCryptoServiceProvider();

			pinCodeLength = 6;
			intervalLength = 30;
			pinModulo = (int)Math.Pow(10, pinCodeLength);

			rnd.GetBytes(randomBytes);
		}

		public string UrlEncode(string value)
		{
			StringBuilder result = new StringBuilder();

			foreach (char symbol in value)
			{
				if (unreservedChars.IndexOf(symbol) != -1)
				{
					result.Append(symbol);
				}
				else
				{
					result.Append('%' + String.Format("{0:X2}", (int)symbol));
				}
			}

			return result.ToString();
		}

		public String generateResponseCode(long challenge, byte[] randomBytes)
		{
			HMACSHA1 myHmac = new HMACSHA1(randomBytes);
			myHmac.Initialize();

			byte[] value = BitConverter.GetBytes(challenge);
			Array.Reverse(value);
			myHmac.ComputeHash(value);
			byte[] hash = myHmac.Hash;
			int offset = hash[hash.Length - 1] & 0xF;

			byte[] SelectedFourBytes = new byte[4];
			SelectedFourBytes[0] = hash[offset];
			SelectedFourBytes[1] = hash[offset + 1];
			SelectedFourBytes[2] = hash[offset + 2];
			SelectedFourBytes[3] = hash[offset + 3];
			Array.Reverse(SelectedFourBytes);
			int finalInt = BitConverter.ToInt32(SelectedFourBytes, 0);

			int truncatedHash = finalInt & 0x7FFFFFFF;
			int pinValue = truncatedHash % pinModulo;
			return padOutput(pinValue);
		}

		private String padOutput(int value)
		{
			String result = value.ToString();
			for (int i = result.Length; i < pinCodeLength; i++)
			{
				result = "0" + result;
			}
			return result;
		}

		public string getPrivateKey(byte[] data)
		{
			return Transcoder.Base32Encode(data);
		}

		public long getCurrentInterval()
		{
			TimeSpan TS = DateTime.UtcNow - new DateTime(1970, 1, 1, 0, 0, 0, DateTimeKind.Utc);
			long currentTimeSeconds = (long)Math.Floor(TS.TotalSeconds);
			long currentInterval = currentTimeSeconds / intervalLength; // 30 Seconds
			return currentInterval;
		}

		public string GeneratePin()
		{
			return generateResponseCode(getCurrentInterval(), randomBytes);
		}

	}
}
