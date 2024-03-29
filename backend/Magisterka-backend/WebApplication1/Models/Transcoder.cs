﻿using System.Text;

namespace WebApplication1.Models
{
    public class Transcoder
    {
		private const int IN_BYTE_SIZE = 8;
		private const int OUT_BYTE_SIZE = 5;
		private static char[] alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567".ToCharArray();

		public static string Base32Encode(byte[] data)
		{
			int i = 0, index = 0, digit = 0;
			int current_byte, next_byte;
			StringBuilder result = new StringBuilder((data.Length + 7) * IN_BYTE_SIZE / OUT_BYTE_SIZE);

			while (i < data.Length)
			{
				current_byte = (data[i] >= 0) ? data[i] : (data[i] + 256);

				if (index > (IN_BYTE_SIZE - OUT_BYTE_SIZE))
				{
					if ((i + 1) < data.Length)
						next_byte = (data[i + 1] >= 0) ? data[i + 1] : (data[i + 1] + 256);
					else
						next_byte = 0;

					digit = current_byte & (0xFF >> index);
					index = (index + OUT_BYTE_SIZE) % IN_BYTE_SIZE;
					digit <<= index;
					digit |= next_byte >> (IN_BYTE_SIZE - index);
					i++;
				}
				else
				{
					digit = (current_byte >> (IN_BYTE_SIZE - (index + OUT_BYTE_SIZE))) & 0x1F;
					index = (index + OUT_BYTE_SIZE) % IN_BYTE_SIZE;
					if (index == 0)
						i++;
				}
				result.Append(alphabet[digit]);
			}

			return result.ToString();
		}
	}
}
