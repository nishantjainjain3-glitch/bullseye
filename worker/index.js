const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// Simple in-memory rate limiter — 20 AI calls per IP per hour
const _rl = new Map();
function checkRateLimit(ip) {
  const bucket = `${ip}:${Math.floor(Date.now() / 3600000)}`;
  const n = (_rl.get(bucket) || 0) + 1;
  _rl.set(bucket, n);
  if (_rl.size > 5000) {
    const cur = Math.floor(Date.now() / 3600000);
    for (const k of _rl.keys()) if (!k.endsWith(`:${cur}`)) _rl.delete(k);
  }
  return n <= 20;
}

const MACRO_SYMBOLS = "^NSEI,^BSESN,^IXIC,^GSPC,USDINR=X,^INDIAVIX,GC=F";

const NSE_SYMBOLS = [
  "RELIANCE.NS","HDFCBANK.NS","TCS.NS","INFY.NS","ICICIBANK.NS",
  "HINDUNILVR.NS","BAJFINANCE.NS","SBIN.NS","WIPRO.NS","LTIM.NS",
  "AXISBANK.NS","MARUTI.NS","SUNPHARMA.NS","TATAMOTORS.NS","HCLTECH.NS",
  "KOTAKBANK.NS","TITAN.NS","ADANIENT.NS","ONGC.NS","POWERGRID.NS",
  "PERSISTENT.NS","POLYCAB.NS","DIXON.NS","TATAPOWER.NS","IDFCFIRSTB.NS",
].join(",");

const BSE_SYMBOLS = [
  "GODREJCP.BO","ASIANPAINT.BO","NESTLEIND.BO","MPHASIS.BO","PIIND.BO",
  "RELIANCE.BO","HDFCBANK.BO","TCS.BO","INFY.BO","ICICIBANK.BO",
].join(",");

function json(data, ttl = 30) {
  return new Response(JSON.stringify(data), {
    headers: {
      ...CORS,
      "Content-Type": "application/json",
      "Cache-Control": `public, max-age=${ttl}`,
    },
  });
}

function err(msg, status = 500) {
  return new Response(JSON.stringify({ error: msg }), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  });
}

async function fetchYahoo(symbols) {
  const url = `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${symbols}&fields=regularMarketPrice,regularMarketChangePercent,regularMarketVolume,marketCap`;
  const res = await fetch(url, {
    headers: {
      "User-Agent": "Mozilla/5.0 (compatible; BullseyeBot/1.0)",
      "Accept": "application/json",
    },
  });
  if (!res.ok) throw new Error(`Yahoo ${res.status}`);
  return res.json();
}

async function handleQuotes(url) {
  const symbols = url.searchParams.get("symbols") || NSE_SYMBOLS;
  try {
    const data = await fetchYahoo(symbols);
    return json(data, 30);
  } catch (e) {
    return err(e.message);
  }
}

async function handleNSE() {
  try {
    const data = await fetchYahoo(NSE_SYMBOLS);
    const quotes = data?.quoteResponse?.result || [];
    const out = {};
    for (const q of quotes) {
      const sym = q.symbol.replace(".NS", "");
      out[sym] = {
        price: q.regularMarketPrice,
        change: q.regularMarketChangePercent,
        volume: q.regularMarketVolume,
        marketCap: q.marketCap,
      };
    }
    return json(out, 30);
  } catch (e) {
    return err(e.message);
  }
}

async function handleBSE() {
  try {
    const data = await fetchYahoo(BSE_SYMBOLS);
    const quotes = data?.quoteResponse?.result || [];
    const out = {};
    for (const q of quotes) {
      const sym = q.symbol.replace(".BO", "");
      out[sym] = {
        price: q.regularMarketPrice,
        change: q.regularMarketChangePercent,
        volume: q.regularMarketVolume,
        marketCap: q.marketCap,
      };
    }
    return json(out, 30);
  } catch (e) {
    return err(e.message);
  }
}

async function handleMacro() {
  try {
    const data = await fetchYahoo(MACRO_SYMBOLS);
    const quotes = data?.quoteResponse?.result || [];
    const out = {};
    for (const q of quotes) {
      out[q.symbol] = {
        price: q.regularMarketPrice,
        change: q.regularMarketChangePercent,
      };
    }
    return json(out, 30);
  } catch (e) {
    return err(e.message);
  }
}

async function handleCrypto() {
  try {
    const url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h,7d";
    const res = await fetch(url, {
      headers: { "Accept": "application/json" },
    });
    if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
    const data = await res.json();
    return json(data, 60);
  } catch (e) {
    return err(e.message);
  }
}

async function handleChart(path) {
  const symbol = path.replace("/api/chart/", "");
  if (!symbol) return err("Missing symbol", 400);
  try {
    const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=3mo&includePrePost=false`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; BullseyeBot/1.0)" },
    });
    if (!res.ok) throw new Error(`Yahoo chart ${res.status}`);
    const data = await res.json();
    return json(data, 300); // cache 5 min for historical data
  } catch (e) {
    return err(e.message);
  }
}

async function handleMovers(type) {
  const scrId = type === "gainers" ? "day_gainers" : "day_losers";
  try {
    const url = `https://query2.finance.yahoo.com/v1/finance/screener/predefined/saved?formatted=true&scrIds=${scrId}&count=10&region=IN&lang=en-IN`;
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; BullseyeBot/1.0)" },
    });
    if (!res.ok) throw new Error(`Yahoo screener ${res.status}`);
    const data = await res.json();
    return json(data, 60);
  } catch (e) {
    return err(e.message);
  }
}

async function handleAI(request, env) {
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  if (!checkRateLimit(ip)) {
    return new Response(JSON.stringify({ error: "Rate limit: 20 AI requests/hour" }), {
      status: 429, headers: { ...CORS, "Content-Type": "application/json" }
    });
  }
  let body;
  try { body = await request.json(); } catch { return err("Invalid JSON", 400); }
  const prompt = body?.prompt;
  if (!prompt) return err("Missing prompt", 400);

  const key = env?.GEMINI_KEY;
  if (!key) return err("AI not configured on server", 503);

  try {
    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${key}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: { temperature: 0.7, maxOutputTokens: 1024 }
        })
      }
    );
    if (!res.ok) {
      const txt = await res.text();
      if (res.status === 429) return err("Gemini rate limited — try again shortly", 429);
      throw new Error(`Gemini ${res.status}: ${txt.slice(0, 200)}`);
    }
    const data = await res.json();
    return json(data, 0);
  } catch (e) {
    return err(e.message);
  }
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: CORS });
    }

    if (request.method !== "GET") {
      return err("Method not allowed", 405);
    }

    if (path === "/api/nse")             return handleNSE();
    if (path === "/api/bse")             return handleBSE();
    if (path === "/api/macro")           return handleMacro();
    if (path === "/api/crypto")          return handleCrypto();
    if (path === "/api/quotes")          return handleQuotes(url);
    if (path === "/api/gainers")         return handleMovers("gainers");
    if (path === "/api/losers")          return handleMovers("losers");
    if (path.startsWith("/api/chart/"))  return handleChart(path);
    if (path === "/api/ai")              return handleAI(request, env);
    if (path === "/")                    return new Response("Bullseye API — OK", { headers: CORS });

    return err("Not found", 404);
  },
};
