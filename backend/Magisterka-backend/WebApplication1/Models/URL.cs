using System;
using System.IO;


namespace WebApplication1.Models
{
    public class URL
    {
        public static string GetFullUrl(string URL)
        {
            if (!URL.StartsWith("http://") && !URL.StartsWith("https://"))
            {
                URL = "https://" + URL;
            }

            if (!URL.Contains("www."))
            {
                URL = URL.Insert(8, "www.");
            }

            return URL;
        }
        public static string CharStrip(string URL)
        {
            if (URL.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
            {
                URL = URL.Remove(0, 8);
            }
            if (URL.StartsWith("http://", StringComparison.OrdinalIgnoreCase))
            {
                URL = URL.Remove(0, 7);
            }
            if (URL.StartsWith("www.", StringComparison.OrdinalIgnoreCase))
            {
                URL = URL.Remove(0, 4);
            }
            if (URL.Contains("."))
            {
                URL = URL.Remove(URL.IndexOf("."), URL.Length - URL.IndexOf("."));
            }
            URL = URL + ".png";
            return URL;
        }
    }
}
