import cors from "cors";
import express from "express";
import fetch from "node-fetch";
const app = express();
const port = 3001;

app.use(express.json());

app.use(cors());

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
        cookie:
          "p_ab_d_id=1549339903; privacy_policy_notification=0; a_type=0; b_type=1; c_type=104; yuid_b=QoRjlzM; p_ab_id=3; p_ab_id_2=0; privacy_policy_agreement=6; PHPSESSID=15216347_RAsBi2rKH8IhEwvFX7ZhU8lsIh2mGw9n; privacy_policy_agreement=6; cf_clearance=ZReZgf3sFSNRe1cq8em3bgujt8CNNariZEIOsiYP_AA-1722262574-1.0.1.1-mPW5AkAU4xzatXzuDPEe5C5X5KFlWctCjGZv7PyEMZ4MSk0NlX2Ycg6U4d6EckaNEBZtZCY_ExWxMsT9mBIpbw; _im_vid=01J3ZEPKJB35VZAQ0GVV14M3FH; cto_optout=1; default_service_is_touch=no; __cf_bm=kMU.myUXj443AkPWaaYpBOz3r.WQ1pKTLFSwK0LhVzs-1722341349-1.0.1.1-tYG2yA5CfTGCJDHpTpmvasvCeVOVS2cWcF.9fSdHqL1R4IOKZ_2fGuE0oRO3K_YmyZ5Q0fPWIQNVyqp2jInmRHKoXBct3rfKvtFy_rfJJP8",
        baggage:
          "sentry-environment=production,sentry-release=d235c599ff057a99ced97357cf0a2d9db817c558,sentry-public_key=7b15ebdd9cf64efb88cfab93783df02a,sentry-trace_id=d25a78f4cbdb467b80fee0d7c53c3520,sentry-sample_rate=0.0001",
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
