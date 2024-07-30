import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import fetch from "node-fetch";

const app = express();
const port = 3001;

app.use(express.json());

app.use(
  cors({
    credentials: true,
  })
);

app.options("*", cors());

interface ProxyQuery {
  url?: string;
}

app.get("/proxy", (req: Request<object, object, object, ProxyQuery>, res: Response, next: NextFunction) => {
  void (async () => {
    const { url } = req.query;

    if (!url) {
      return res.status(400).json({ error: "URL is required" });
    }

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
          Referer: "https://www.pixiv.net/",
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36",
        },
        method: "GET",
      });
      const data = await response.json();
      console.log("Data fetched successfully:", data);
      res.json(data);
    } catch (error) {
      console.error("Error fetching data:", error);
      res.status(500).send(error instanceof Error ? error.toString() : "An unknown error occurred");
    }
  })().catch(next);
});

app.listen(port, () => {
  console.log(`Proxy server listening at http://localhost:${port}`);
});
