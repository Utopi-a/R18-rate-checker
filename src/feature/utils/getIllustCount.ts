export const getIllustCount = async ({ queries, genre }: { queries: string[]; genre: string }) => {
  const encodedQueries = queries.map((query) => ({
    [query]: {
      all: encodeURIComponent(genre === "" ? query : query + " " + genre),
      R18: encodeURIComponent(genre === "" ? query + " R-18" : query + " " + genre + " R-18"),
    },
  }));

  const fetchTotalCount = async (encodedKeyword: string) => {
    try {
      const response = await fetch(
        `http://localhost:3001/proxy?url=${encodeURIComponent(
          `https://www.pixiv.net/ajax/search/illustrations/${encodedKeyword}?word=${encodedKeyword}&order=date_d&mode=&p=1&csw=0&s_mode=s_tag&type=illust_and_ugoira&lang=ja`
        )}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const json = (await response.json()) as { body: { illust: { total: number } } };

      const totalCount = json?.body?.illust?.total ?? 0;

      return totalCount;
    } catch (error) {
      console.error("Fetch error: ", error);
      throw error;
    }
  };

  //   const fetchTotalCount = async (encodedKeyword: string) => {
  //     try {
  //       const response = await fetch(
  //         `https://www.pixiv.net/ajax/search/illustrations/${encodedKeyword}?word=${encodedKeyword}&order=date_d&mode=&p=1&csw=0&s_mode=s_tag&type=illust_and_ugoira&lang=ja`,
  //         {
  //           headers: {
  //             accept: "application/json",
  //             "accept-language": "ja-JP,ja;q=0.9,en-US;q=0.8,en;q=0.7",
  //             baggage:
  //               "sentry-environment=production,sentry-release=d235c599ff057a99ced97357cf0a2d9db817c558,sentry-public_key=7b15ebdd9cf64efb88cfab93783df02a,sentry-trace_id=d25a78f4cbdb467b80fee0d7c53c3520,sentry-sample_rate=0.0001",
  //             priority: "u=1, i",
  //             "sec-ch-ua": '"Not/A)Brand";v="8", "Chromium";v="126", "Google Chrome";v="126"',
  //             "sec-ch-ua-mobile": "?0",
  //             "sec-ch-ua-platform": '"Windows"',
  //             "sec-fetch-dest": "empty",
  //             "sec-fetch-mode": "cors",
  //             "sec-fetch-site": "same-origin",
  //             "sentry-trace": "d25a78f4cbdb467b80fee0d7c53c3520-93e80916b198bb73-0",
  //             cookie:
  //               "p_ab_d_id=1549339903; privacy_policy_notification=0; a_type=0; b_type=1; c_type=104; yuid_b=QoRjlzM; p_ab_id=3; p_ab_id_2=0; privacy_policy_agreement=6; PHPSESSID=15216347_RAsBi2rKH8IhEwvFX7ZhU8lsIh2mGw9n; privacy_policy_agreement=6; __cf_bm=Af6Qh81ER1N9C8CWfi5RA4ILNkPoKxs5cdXCalkARQE-1722262574-1.0.1.1-0OaG368Qzfm37YrZZm9K34io6jneFyFjsWQEgld6Ddo9WrqluOahNPdqFfYKesAkPCgVGCodnYLVxcsudL7JZ6dB3xbkpgJRwkn.qGabBrI; cf_clearance=ZReZgf3sFSNRe1cq8em3bgujt8CNNariZEIOsiYP_AA-1722262574-1.0.1.1-mPW5AkAU4xzatXzuDPEe5C5X5KFlWctCjGZv7PyEMZ4MSk0NlX2Ycg6U4d6EckaNEBZtZCY_ExWxMsT9mBIpbw",
  //             Referer: `https://www.pixiv.net/tags/${encodedKeyword}/illustrations?s_mode=s_tag`,
  //             "Referrer-Policy": "strict-origin-when-cross-origin",
  //           },
  //           body: null,
  //           method: "GET",
  //         }
  //       );
  //       if (!response.ok) {
  //         throw new Error(`HTTP error! status: ${response.status}`);
  //       }
  //       const json = (await response.json()) as { body: { illust: { total: number } } };

  //       const totalCount = json?.body?.illust?.total ?? 0;

  //       return totalCount;
  //     } catch (error) {
  //       console.error("Fetch error: ", error);
  //       throw error;
  //     }
  //   };

  const totalCounts = await Promise.all(
    encodedQueries.map(async (encodedQuery, index) => {
      await new Promise((resolve) => setTimeout(resolve, index * 500));

      const allCount = await fetchTotalCount(Object.values(encodedQuery)[0]?.all ?? "");
      console.log("allCount: ", allCount);
      const r18Count = await fetchTotalCount(Object.values(encodedQuery)[0]?.R18 ?? "");
      console.log("r18Count: ", r18Count);

      return { [queries[index] ?? "No Keyword"]: { all: allCount, R18: r18Count } };
    })
  );

  console.log("totalCounts: ", totalCounts);

  return totalCounts;
};
