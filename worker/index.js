const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type",
};

// ── Rate limiter (in-memory, 20 AI req/IP/hour) ─────────────────────────────
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

// ── Symbols ──────────────────────────────────────────────────────────────────
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

// Stocks to scan for morning AI picks — Nifty 100 + select mid-caps
const SCAN_SYMBOLS = [
  "RELIANCE.NS","HDFCBANK.NS","TCS.NS","BHARTIARTL.NS","ICICIBANK.NS",
  "INFY.NS","SBIN.NS","HINDUNILVR.NS","ITC.NS","BAJFINANCE.NS",
  "KOTAKBANK.NS","LT.NS","HCLTECH.NS","MARUTI.NS","SUNPHARMA.NS",
  "TITAN.NS","WIPRO.NS","ULTRACEMCO.NS","ONGC.NS","NTPC.NS",
  "POWERGRID.NS","TATAMOTORS.NS","NESTLEIND.NS","TATASTEEL.NS",
  "AXISBANK.NS","INDUSINDBK.NS","BAJAJFINSV.NS","TECHM.NS","DRREDDY.NS",
  "ADANIENT.NS","ADANIPORTS.NS","CIPLA.NS","JSWSTEEL.NS","DIVISLAB.NS",
  "COALINDIA.NS","ASIANPAINT.NS","GRASIM.NS","EICHERMOT.NS","BPCL.NS",
  "APOLLOHOSP.NS","HEROMOTOCO.NS","BRITANNIA.NS","BAJAJ-AUTO.NS","SBILIFE.NS",
  "HDFCLIFE.NS","HINDALCO.NS","M&M.NS","TATACONSUM.NS","UPL.NS",
  "PERSISTENT.NS","POLYCAB.NS","DIXON.NS","TATAPOWER.NS","IDFCFIRSTB.NS",
  "ZOMATO.NS","IRCTC.NS","LTIM.NS","MPHASIS.NS","PIIND.NS",
  "TRENT.NS","GODREJCP.NS","PIDILITIND.NS","BERGEPAINT.NS","JUBLFOOD.NS",
  "CHOLAFIN.NS","BANKBARODA.NS","PNB.NS","FEDERALBNK.NS","CANBK.NS",
  "TORNTPHARM.NS","AUROPHARMA.NS","ALKEM.NS","IRFC.NS","RVNL.NS",
  "SIEMENS.NS","ABB.NS","HAVELLS.NS","VOLTAS.NS",
  "SAIL.NS","NMDC.NS","HINDZINC.NS","VEDL.NS","JINDALSTEL.NS",
  "MARICO.NS","COLPAL.NS","DABUR.NS","EMAMILTD.NS","MCDOWELL-N.NS",
];

const SECTOR_MAP = {
  RELIANCE:"Energy",HDFCBANK:"Banking",TCS:"IT",BHARTIARTL:"Telecom",ICICIBANK:"Banking",
  INFY:"IT",SBIN:"Banking",HINDUNILVR:"FMCG",ITC:"FMCG",BAJFINANCE:"NBFC",
  KOTAKBANK:"Banking",LT:"Infra",HCLTECH:"IT",MARUTI:"Auto",SUNPHARMA:"Pharma",
  TITAN:"Retail",WIPRO:"IT",ULTRACEMCO:"Cement",ONGC:"Energy",NTPC:"Power",
  POWERGRID:"Power",TATAMOTORS:"Auto",NESTLEIND:"FMCG",TATASTEEL:"Steel",
  AXISBANK:"Banking",INDUSINDBK:"Banking",BAJAJFINSV:"NBFC",TECHM:"IT",DRREDDY:"Pharma",
  ADANIENT:"Infra",ADANIPORTS:"Logistics",CIPLA:"Pharma",JSWSTEEL:"Steel",
  DIVISLAB:"Pharma",COALINDIA:"Mining",ASIANPAINT:"Paints",GRASIM:"Cement",
  EICHERMOT:"Auto",BPCL:"Energy",APOLLOHOSP:"Healthcare",HEROMOTOCO:"Auto",
  BRITANNIA:"FMCG",BAJAJ_AUTO:"Auto",SBILIFE:"Insurance",HDFCLIFE:"Insurance",
  HINDALCO:"Metals",M_M:"Auto",TATACONSUM:"FMCG",UPL:"Agrochem",
  PERSISTENT:"IT",POLYCAB:"Cables",DIXON:"Electronics",TATAPOWER:"Power",
  IDFCFIRSTB:"Banking",ZOMATO:"Consumer Tech",IRCTC:"Travel",LTIM:"IT",
  MPHASIS:"IT",PIIND:"Agrochem",TRENT:"Retail",GODREJCP:"FMCG",
  PIDILITIND:"Chemicals",BERGEPAINT:"Paints",JUBLFOOD:"QSR",CHOLAFIN:"NBFC",
  BANKBARODA:"Banking",PNB:"Banking",FEDERALBNK:"Banking",CANBK:"Banking",
  TORNTPHARM:"Pharma",AUROPHARMA:"Pharma",ALKEM:"Pharma",IRFC:"Finance",
  RVNL:"Infra",SIEMENS:"Capital Goods",ABB:"Capital Goods",HAVELLS:"Electricals",
  VOLTAS:"Electricals",SAIL:"Steel",NMDC:"Mining",HINDZINC:"Metals",
  VEDL:"Metals",JINDALSTEL:"Steel",MARICO:"FMCG",COLPAL:"FMCG",
  DABUR:"FMCG",EMAMILTD:"FMCG",MCDOWELL_N:"Beverages",
};

// ── Helpers ──────────────────────────────────────────────────────────────────
function json(data, ttl = 30) {
  return new Response(JSON.stringify(data), {
    headers: { ...CORS, "Content-Type": "application/json", "Cache-Control": `public, max-age=${ttl}` },
  });
}
function err(msg, status = 500) {
  return new Response(JSON.stringify({ error: msg }), {
    status, headers: { ...CORS, "Content-Type": "application/json" },
  });
}
function sleep(ms) { return new Promise(r => setTimeout(r, ms)); }
function fmtCap(v) {
  if (!v) return "N/A";
  if (v >= 1e12) return `₹${(v / 1e12).toFixed(1)}L Cr`;
  if (v >= 1e9)  return `₹${(v / 1e9).toFixed(0)}K Cr`;
  return `₹${(v / 1e7).toFixed(0)} Cr`;
}

// ── Yahoo Finance fetch ───────────────────────────────────────────────────────
async function fetchYahoo(symbols) {
  const url = `https://query2.finance.yahoo.com/v7/finance/quote?symbols=${symbols}&fields=regularMarketPrice,regularMarketChangePercent,regularMarketVolume,averageDailyVolume10Day,fiftyTwoWeekHigh,fiftyTwoWeekLow,marketCap,shortName`;
  const res = await fetch(url, {
    headers: { "User-Agent": "Mozilla/5.0 (compatible; BullseyeBot/1.0)", "Accept": "application/json" },
  });
  if (!res.ok) throw new Error(`Yahoo ${res.status}`);
  return res.json();
}

// ── Standard API handlers ─────────────────────────────────────────────────────
async function handleNSE() {
  try {
    const data = await fetchYahoo(NSE_SYMBOLS);
    const out = {};
    for (const q of data?.quoteResponse?.result || []) {
      const sym = q.symbol.replace(".NS", "");
      out[sym] = { price: q.regularMarketPrice, change: q.regularMarketChangePercent, volume: q.regularMarketVolume, marketCap: q.marketCap };
    }
    return json(out, 30);
  } catch (e) { return err(e.message); }
}
async function handleBSE() {
  try {
    const data = await fetchYahoo(BSE_SYMBOLS);
    const out = {};
    for (const q of data?.quoteResponse?.result || []) {
      const sym = q.symbol.replace(".BO", "");
      out[sym] = { price: q.regularMarketPrice, change: q.regularMarketChangePercent };
    }
    return json(out, 30);
  } catch (e) { return err(e.message); }
}
async function handleMacro() {
  try {
    const data = await fetchYahoo(MACRO_SYMBOLS);
    const out = {};
    for (const q of data?.quoteResponse?.result || []) {
      out[q.symbol] = { price: q.regularMarketPrice, change: q.regularMarketChangePercent };
    }
    return json(out, 30);
  } catch (e) { return err(e.message); }
}
async function handleCrypto() {
  try {
    const url = "https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=50&page=1&sparkline=false&price_change_percentage=24h,7d";
    const res = await fetch(url, { headers: { "Accept": "application/json" } });
    if (!res.ok) throw new Error(`CoinGecko ${res.status}`);
    return json(await res.json(), 60);
  } catch (e) { return err(e.message); }
}
async function handleChart(path) {
  const symbol = path.replace("/api/chart/", "");
  if (!symbol) return err("Missing symbol", 400);
  try {
    const url = `https://query2.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(symbol)}?interval=1d&range=3mo&includePrePost=false`;
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; BullseyeBot/1.0)" } });
    if (!res.ok) throw new Error(`Yahoo chart ${res.status}`);
    return json(await res.json(), 300);
  } catch (e) { return err(e.message); }
}
async function handleMovers(type) {
  const scrId = type === "gainers" ? "day_gainers" : "day_losers";
  try {
    const url = `https://query2.finance.yahoo.com/v1/finance/screener/predefined/saved?formatted=true&scrIds=${scrId}&count=10&region=IN&lang=en-IN`;
    const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; BullseyeBot/1.0)" } });
    if (!res.ok) throw new Error(`Yahoo screener ${res.status}`);
    return json(await res.json(), 60);
  } catch (e) { return err(e.message); }
}
async function handleQuotes(url) {
  const symbols = url.searchParams.get("symbols") || NSE_SYMBOLS;
  try { return json(await fetchYahoo(symbols), 30); }
  catch (e) { return err(e.message); }
}

// ── AI endpoint ───────────────────────────────────────────────────────────────
async function handleAI(request, env) {
  const ip = request.headers.get("CF-Connecting-IP") || "unknown";
  if (!checkRateLimit(ip)) return new Response(JSON.stringify({ error: "Rate limit: 20 AI requests/hour" }), { status: 429, headers: { ...CORS, "Content-Type": "application/json" } });
  let body;
  try { body = await request.json(); } catch { return err("Invalid JSON", 400); }
  if (!body?.prompt) return err("Missing prompt", 400);
  if (!env?.GEMINI_KEY) return err("AI not configured", 503);
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${env.GEMINI_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: body.prompt }] }], generationConfig: { temperature: 0.7, maxOutputTokens: 1024 } })
    });
    if (!res.ok) {
      if (res.status === 429) return err("Gemini rate limited", 429);
      throw new Error(`Gemini ${res.status}`);
    }
    return json(await res.json(), 0);
  } catch (e) { return err(e.message); }
}

// ── NEWS: fetch + parse RSS ───────────────────────────────────────────────────
function parseRSS(xml, source) {
  const items = [];
  const re = /<item>([\s\S]*?)<\/item>/g;
  let m;
  while ((m = re.exec(xml)) !== null) {
    const c = m[1];
    const title = (c.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>/)?.[1] || c.match(/<title>(.*?)<\/title>/)?.[1] || "").trim();
    const link  = (c.match(/<link>(.*?)<\/link>/)?.[1] || "").trim();
    const pub   = (c.match(/<pubDate>(.*?)<\/pubDate>/)?.[1] || "").trim();
    if (title) items.push({ title, link, source, pubDate: pub, time: relTime(pub) });
  }
  return items;
}
function relTime(dateStr) {
  if (!dateStr) return "recently";
  const d = new Date(dateStr);
  if (isNaN(d)) return "recently";
  const mins = Math.floor((Date.now() - d) / 60000);
  if (mins < 1)  return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24)  return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}
function detectImpact(title) {
  const t = title.toLowerCase();
  const high = ["rbi","sebi","nifty","sensex","crash","rally","rate","gdp","inflation","earnings beat","miss","results","quarterly","ipo","fii","dii","rupee","crude"];
  const low  = ["opinion","analysis","blog","feature"];
  if (high.some(w => t.includes(w))) return "HIGH";
  if (low.some(w => t.includes(w)))  return "LOW";
  return "MEDIUM";
}
function detectCategory(title) {
  const t = title.toLowerCase();
  if (t.includes("crypto") || t.includes("bitcoin") || t.includes("ethereum")) return "Crypto";
  if (t.includes("bank") || t.includes("npa") || t.includes("nbfc"))           return "IN / Banking";
  if (t.includes("it ") || t.includes("tech") || t.includes("infosys"))        return "IN / IT";
  if (t.includes("auto") || t.includes("maruti") || t.includes("tata motor"))  return "IN / Auto";
  if (t.includes("pharma") || t.includes("drug"))                               return "IN / Pharma";
  if (t.includes("rbi") || t.includes("sebi") || t.includes("government"))     return "Macro / IN";
  return "IN / Market";
}

async function handleNews(env) {
  // Try KV cache first
  if (env?.STORE) {
    const cached = await env.STORE.get("news:latest", "json");
    if (cached && (Date.now() - new Date(cached.fetchedAt).getTime()) < 15 * 60 * 1000) {
      return json(cached, 0);
    }
  }
  const feeds = [
    { url: "https://www.moneycontrol.com/rss/latestnews.xml",         source: "Moneycontrol" },
    { url: "https://economictimes.indiatimes.com/markets/rss.cms",    source: "ET Markets"   },
    { url: "https://www.livemint.com/rss/markets",                     source: "Mint"         },
  ];
  const all = [];
  await Promise.allSettled(feeds.map(async ({ url, source }) => {
    try {
      const res = await fetch(url, { headers: { "User-Agent": "Mozilla/5.0 (compatible; BullseyeBot/1.0)" }, cf: { cacheTtl: 900 } });
      if (!res.ok) return;
      const xml = await res.text();
      all.push(...parseRSS(xml, source));
    } catch {}
  }));
  // Sort by date, take top 20, enrich
  const news = all
    .sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate))
    .slice(0, 20)
    .map(n => ({ ...n, impact: detectImpact(n.title), category: detectCategory(n.title) }));

  const result = { news, fetchedAt: new Date().toISOString() };
  if (env?.STORE && news.length > 0) {
    await env.STORE.put("news:latest", JSON.stringify(result), { expirationTtl: 1800 });
  }
  return json(result, 0);
}

// ── MORNING SCAN ENGINE ───────────────────────────────────────────────────────
function screenStocks(quotes) {
  return quotes
    .map(q => ({
      symbol:      q.symbol.replace(".NS", ""),
      name:        q.shortName || q.symbol.replace(".NS",""),
      price:       q.regularMarketPrice,
      change:      q.regularMarketChangePercent || 0,
      volume:      q.regularMarketVolume || 0,
      avgVolume:   q.averageDailyVolume10Day || 1,
      high52w:     q.fiftyTwoWeekHigh || 0,
      low52w:      q.fiftyTwoWeekLow || 0,
      marketCap:   q.marketCap || 0,
      volumeRatio: (q.regularMarketVolume || 0) / (q.averageDailyVolume10Day || 1),
      distFromHigh: q.fiftyTwoWeekHigh ? ((q.regularMarketPrice - q.fiftyTwoWeekHigh) / q.fiftyTwoWeekHigh) * 100 : -50,
      distFromLow:  q.fiftyTwoWeekLow  ? ((q.regularMarketPrice - q.fiftyTwoWeekLow)  / q.fiftyTwoWeekLow)  * 100 : 0,
    }))
    .filter(s => s.price > 10 && s.high52w > 0)
    .sort((a, b) => {
      const score = s => Math.abs(s.change) * 2 + (s.volumeRatio > 1.5 ? 3 : 0) + (s.distFromHigh > -5 ? 2 : 0) + (s.distFromLow < 10 ? -1 : 0);
      return score(b) - score(a);
    });
}

function buildPickPrompt(s, date) {
  const sector = SECTOR_MAP[s.symbol] || "NSE Stock";
  return `You are a professional NSE stock analyst doing the morning scan for ${date}.

REAL MARKET DATA:
Stock: ${s.name} (${s.symbol})
Sector: ${sector}
Price: ₹${s.price.toFixed(2)}
Today's Change: ${s.change >= 0 ? "+" : ""}${s.change.toFixed(2)}%
52-Week High: ₹${s.high52w.toFixed(2)} | Low: ₹${s.low52w.toFixed(2)}
Distance from 52W High: ${s.distFromHigh.toFixed(1)}%
Distance from 52W Low: +${s.distFromLow.toFixed(1)}%
Volume: ${s.volumeRatio.toFixed(1)}x average ${s.volumeRatio > 2 ? "(SURGE)" : s.volumeRatio > 1.3 ? "(elevated)" : "(normal)"}
Market Cap: ${fmtCap(s.marketCap)}

Based on this REAL data, generate a trading idea for this week. Return ONLY valid JSON, no markdown:
{
  "action": "BUY",
  "confidence": 7,
  "entry": ${s.price.toFixed(2)},
  "target1": 0,
  "target2": 0,
  "target3": 0,
  "stop_loss": 0,
  "rr": 2.5,
  "upside": 10.0,
  "risk": "MEDIUM",
  "horizon": "Short-term (1-4 weeks)",
  "rationale": "2-3 sentences using the real data above",
  "catalysts": ["data-driven catalyst 1", "catalyst 2"],
  "tags": ["${sector}", "tag2"],
  "rsi_estimate": 55
}
action must be BUY/SELL/HOLD. confidence 1-10. All price fields in INR.`;
}

async function generateOnePick(s, geminiKey, date) {
  const prompt = buildPickPrompt(s, date);
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${geminiKey}`,
    { method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig: { temperature: 0.6, maxOutputTokens: 600 } }) }
  );
  if (!res.ok) throw new Error(`Gemini ${res.status}`);
  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text || "{}";
  const raw = JSON.parse(text.match(/\{[\s\S]*\}/)[0]);
  const sector = SECTOR_MAP[s.symbol] || "NSE";
  return {
    id:         s.symbol.toLowerCase(),
    symbol:     s.symbol,
    name:       s.name,
    exchange:   "NSE",
    market:     "IN",
    currency:   "₹",
    price:      s.price,
    change:     s.change,
    action:     raw.action || "HOLD",
    confidence: Math.min(95, Math.max(40, (raw.confidence || 6) * 10)),
    risk:       raw.risk || "MEDIUM",
    horizon:    raw.horizon || "Short-term (1-4 weeks)",
    entry:      { low: +(raw.entry * 0.99).toFixed(2), high: +(raw.entry * 1.01).toFixed(2) },
    targets:    [raw.target1, raw.target2, raw.target3].filter(v => v && v > 0),
    stopLoss:   raw.stop_loss || +(s.price * 0.93).toFixed(2),
    rr:         raw.rr || 2.0,
    upside:     raw.upside || 0,
    rationale:  raw.rationale || "",
    catalysts:  raw.catalysts || [],
    tags:       raw.tags || [sector],
    sector,
    sparkline:  [],
    posted:     "AI · " + new Date().toLocaleTimeString("en-IN", { timeZone: "Asia/Kolkata", hour: "2-digit", minute: "2-digit" }),
    rsi:        raw.rsi_estimate || null,
    pe:         null,
    marketCap:  fmtCap(s.marketCap),
    analyst:    "BULLSEYE AI",
    source:     "AI Morning Scan",
    volumeRatio: +s.volumeRatio.toFixed(2),
    high52w:    s.high52w,
    low52w:     s.low52w,
    aiGenerated: true,
  };
}

async function runMorningScan(env) {
  if (!env?.GEMINI_KEY) { console.log("No GEMINI_KEY — skipping scan"); return; }
  const ist = new Date(new Date().toLocaleString("en-US", { timeZone: "Asia/Kolkata" }));
  const date = ist.toLocaleDateString("en-IN", { weekday: "long", day: "numeric", month: "short", year: "numeric" });

  // Fetch in 2 batches of ~42
  const half = Math.ceil(SCAN_SYMBOLS.length / 2);
  const allQuotes = [];
  for (const batch of [SCAN_SYMBOLS.slice(0, half), SCAN_SYMBOLS.slice(half)]) {
    try {
      const data = await fetchYahoo(batch.join(","));
      allQuotes.push(...(data?.quoteResponse?.result || []));
    } catch (e) { console.error("Batch fetch error:", e.message); }
    await sleep(500);
  }

  const screened = screenStocks(allQuotes).slice(0, 15);
  console.log(`Screened ${screened.length} stocks from ${allQuotes.length} fetched`);

  const picks = [];
  for (const s of screened) {
    try {
      const pick = await generateOnePick(s, env.GEMINI_KEY, date);
      picks.push(pick);
      console.log(`✓ ${s.symbol} → ${pick.action}`);
    } catch (e) { console.error(`✗ ${s.symbol}:`, e.message); }
    await sleep(300);
  }

  if (picks.length === 0) { console.log("No picks generated — aborting KV write"); return; }

  const payload = {
    picks,
    generatedAt: new Date().toISOString(),
    date,
    count: picks.length,
    scannedCount: allQuotes.length,
  };
  await env.STORE.put("picks:latest", JSON.stringify(payload), { expirationTtl: 86400 });
  console.log(`✅ Stored ${picks.length} picks in KV`);
}

// ── /api/picks endpoint ───────────────────────────────────────────────────────
async function handlePicks(url, env) {
  if (!env?.STORE) return err("KV not configured", 503);
  // Allow manual trigger: /api/picks?refresh=1 (admin use)
  if (url.searchParams.get("refresh") === "1") {
    await runMorningScan(env);
  }
  const data = await env.STORE.get("picks:latest", "json");
  if (!data) return json({ picks: [], date: null, generatedAt: null, fresh: false }, 0);
  return json({ ...data, fresh: true }, 0);
}

// ── Main handler ──────────────────────────────────────────────────────────────
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;

    if (request.method === "OPTIONS") return new Response(null, { headers: CORS });
    if (request.method === "POST") {
      if (path === "/api/ai") return handleAI(request, env);
      return err("Method not allowed", 405);
    }
    if (request.method !== "GET") return err("Method not allowed", 405);

    if (path === "/api/nse")            return handleNSE();
    if (path === "/api/bse")            return handleBSE();
    if (path === "/api/macro")          return handleMacro();
    if (path === "/api/crypto")         return handleCrypto();
    if (path === "/api/quotes")         return handleQuotes(url);
    if (path === "/api/gainers")        return handleMovers("gainers");
    if (path === "/api/losers")         return handleMovers("losers");
    if (path.startsWith("/api/chart/")) return handleChart(path);
    if (path === "/api/picks")          return handlePicks(url, env);
    if (path === "/api/news")           return handleNews(env);
    if (path === "/")                   return new Response("Bullseye API — OK", { headers: CORS });
    return err("Not found", 404);
  },

  async scheduled(event, env, ctx) {
    ctx.waitUntil(runMorningScan(env));
  },
};
