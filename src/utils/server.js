import express from "express";
import fetch from "node-fetch";
const app = express();
const port = 3001;

app.use(express.json());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Referrer-Policy, Authorization, Baggage, Priority, Sec-Fetch-Dest, Sec-Fetch-Mode, Sec-Fetch-Site, Sentry-Trace, Cookie, Referer"
  );
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  next();
});

app.get("/proxy", async (req, res) => {
  const { url } = req.query;
  console.log(`Fetching data from: ${url}`);

  const headers = req.headers;
  console.log("Headers:", headers);

  try {
    const response = await fetch(url, {
      headers: {
        accept: headers["accept"],
        "accept-language": headers["accept-language"],
        baggage: headers["baggage"],
        priority: headers["priority"],
        "sec-ch-ua": headers["sec-ch-ua"],
        "sec-ch-ua-mobile": headers["sec-ch-ua-mobile"],
        "sec-ch-ua-platform": headers["sec-ch-ua-platform"],
        "sec-fetch-dest": headers["sec-fetch-dest"],
        "sec-fetch-mode": headers["sec-fetch-mode"],
        "sec-fetch-site": headers["sec-fetch-site"],
        "sentry-trace": headers["sentry-trace"],
        cookie: headers["cookie"],
        Referer: headers["Referer"],
        "Referrer-Policy": headers["referrer-policy"],
      },
    });

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
