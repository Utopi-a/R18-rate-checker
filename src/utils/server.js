import cors from "cors";
import express from "express";
import fetch from "node-fetch";
const app = express();
const port = 3001;

app.use(express.json());

app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);

app.options("*", cors());

// app.use((req, res, next) => {
//   // res.header("Access-Control-Allow-Origin", "*");
//   // res.header(
//   //   "Access-Control-Allow-Headers",
//   //   "Origin, X-Requested-With, Content-Type, Accept, Referrer-Policy, Authorization, Baggage, Priority, Sec-Fetch-Dest, Sec-Fetch-Mode, Sec-Fetch-Site, Sentry-Trace, Cookie, Referer"
//   // );
//   // res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
//   if (req.method === "OPTIONS") {
//     return res.status(200).end();
//   }
//   next();
// });

app.get("/proxy", async (req, res) => {
  const { url } = req.query;
  console.log(`Fetching data from: ${url}`);

  try {
    const response = await fetch(url, {
      headers: {
        accept:
          "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7",
        "cache-control": "max-age=0",
        priority: "u=0, i",
        "sec-ch-ua": '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": '"Windows"',
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "cross-site",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1",
        cookie: "PHPSESSID=15216347_RAsBi2rKH8IhEwvFX7ZhU8lsIh2mGw9n;",
        baggage:
          "sentry-environment=production,sentry-release=d235c599ff057a99ced97357cf0a2d9db817c558,sentry-public_key=7b15ebdd9cf64efb88cfab93783df02a,sentry-trace_id=d25a78f4cbdb467b80fee0d7c53c3520,sentry-sample_rate=0.0001",
        Referer: `https://www.pixiv.net/`,
        useragent:
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
      },
      body: null,
      method: "GET",
      credentials: "include",
    });

    console.log("Response status:", response.status);

    const data = await response.json();
    console.log("Data fetched successfully:", data);
    res.json(data);
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).send(error.toString());
  }
});

app.listen(port, () => {
  console.log(`Proxy server listening at http://localhost:${port}`);
});
