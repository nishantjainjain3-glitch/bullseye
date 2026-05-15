# Handoff: BULLSEYE — Stock Recommendations Platform

## Overview

**BULLSEYE** is a stock recommendations platform that surfaces high-conviction picks across Indian (NSE/BSE), US, and Crypto markets. Every recommendation comes with a concrete *trade plan*: entry zone, three price targets (T1/T2/T3), a stop loss, confidence score, risk level, time horizon, and the analyst thesis with catalysts.

The product is positioned as **"picks with targets, not opinions"** — the user knows exactly when to buy, when to sell, and where to take profits or cut losses.

## About the Design Files

The files in this bundle are **design references created in HTML / React (Babel-transpiled in browser)**. They are prototypes showing intended look and behavior — **not production code to copy directly**.

The task is to **recreate these designs in the target codebase's existing environment** (React Native / SwiftUI / native iOS / Next.js / Vue, etc.) using that codebase's established patterns, design system, state management, and routing. If no codebase exists yet, **Next.js + Tailwind + TypeScript** is a strong default for the web; **React Native (Expo) + NativeWind** is recommended for the mobile app.

## Fidelity

**High-fidelity (hifi).** Pixel-perfect mockups with final colors, typography, spacing, and interactions. The developer should recreate the UI as closely as possible to the prototype, then re-skin via the project's design tokens if one exists.

Mock data is illustrative — real implementation must connect to live price feeds and a recommendations source (analyst feed, algorithmic signals, or LLM-generated theses).

---

## Screens / Views

There are **7 main screens** plus an **onboarding splash** and a **stock detail panel** that slides over any screen.

### 1. Picks (Home) — `HomeScreen`
**Purpose:** Land here to see today's top recommendations. The most important screen.

**Layout:**
- Hero header with eyebrow date stamp, large serif headline ("Today's *highest-conviction* picks across the board."), and a meta row showing Active Picks / Avg Confidence / Buy-Sell-Hold split.
- Macro strip — horizontal grid of 8 cells (NIFTY 50, SENSEX, NASDAQ, S&P 500, BTC/USD, USD/INR, India VIX, GOLD).
- Two-column grid below: **left** = filter bar + recommendation cards grid (auto-fill, min 360px columns); **right** = 340px sidebar with Watchlist, Live Alerts, Market News.

**Filter bar chips:**
- Market: All / Indian / US / Crypto (with counts)
- Action: Any / Buy / Sell / Hold

**Recommendation Card** (`RecCard`) — the core component, see Component Spec below.

### 2. Stock Detail — `DetailPanel`
**Purpose:** Deep dive on one recommendation. Slides in from the right as an overlay (max-width 880px).

**Layout (top to bottom):**
1. **Head:** stock logo (56×56, market-tinted), name in serif, symbol/exchange/sector in mono. Close button (✕) top-right.
2. **Price row:** large price (40px mono), today's change, large action badge ("BUY" / "SELL · SHORT" / "HOLD").
3. **Chart:** 200px tall line chart with gradient fill, dashed grid lines.
4. **Price Targets section:** 5-column grid → SL / Entry Zone / T1 / T2 / T3. Each cell shows the price and % distance from current. Color-coded (SL red, Entry white, T1 green, T2 brand-gold, T3 blue). Below, a horizontal **target ladder** visualization showing all levels positioned proportionally.
5. **Analyst Thesis** — rationale box with a colored left border (green/red/amber by action), 14px body text, attribution line.
6. **Catalysts to Watch** — numbered list of 3 catalyst rows.
7. **Key Metrics** — 8-cell grid: Confidence, Risk Level, Time Horizon, RSI, P/E, Market Cap, Upside (T3), Source.
8. **Sticky footer:** primary action button ("Buy @ ₹2,920–2,965"), + Watchlist, Set Alert.

### 3. Screener — `ScreenerScreen`
**Purpose:** Table-style scan of all recommendations, sortable.

**Layout:** Hero + filter bar + dense data table. Columns: Symbol, Action, Price, Today's %, Entry, T1, T2, T3, Stop, R:R, Conf, Risk, Horizon. Sort by Confidence / Upside / R:R / Today's Move.

### 4. Watchlist — `WatchlistScreen`
**Purpose:** Tracked stocks the user has flagged.

**Layout:** Hero + table view. Columns: Symbol, Market, Price, Change, Action, Target 1, Upside, Confidence (mini ring), Actions (alert / remove icons).

### 5. Portfolio — `PortfolioScreen`
**Purpose:** Live P&L across owned positions.

**Layout:** Hero + 4-cell summary grid (Total INR / USD positions / Day P/L / Open Positions). Below, holdings table with cost basis, live price, value, P/L, return%, current signal.

**Critical:** INR and USD totals must be **tracked separately** — never sum across currencies.

### 6. Alerts — `AlertsScreen`
**Purpose:** Real-time triggers from picks (target hit, stop loss approaching, breakout, new pick, news).

**Layout:** Hero + filter chips + alert stream. Each alert row = icon (color-coded by type) + title + ticker chip + TRIGGERED badge if applicable + message + timestamp. Sidebar has alert delivery settings (push / email / Telegram / WhatsApp toggles).

### 7. News — `NewsScreen`
**Purpose:** Market headlines with impact rating.

**Layout:** Hero + category chips + two columns: news feed (headline + impact pill + source + category + time) and "Most Discussed" sidebar of trending tickers.

### 8. Profile / Settings — `SettingsScreen`
**Purpose:** Account, subscription, broker connection, tax reports.

**Layout:** Hero + account card with avatar, then list rows for Subscription / Broker / Currency / Risk Profile / 2FA / Tax Reports. Sidebar shows Pro plan benefits.

### 9. Onboarding (optional, off by default) — `OnboardingScreen`
**Purpose:** First-run welcome.

**Layout:** Two-column split. Left: eyebrow → serif headline "Stock picks with *targets*. Not opinions." → body copy → CTAs ("Get started — free for 7 days" / "See sample picks") → trust strip (rating, SEBI registered, user count). Right: two RecCards stacked at slight rotations to show the product.

---

## Component Spec: RecCard (most important)

This is the workhorse card used in the home grid and elsewhere.

**Structure:**
```
┌──────────────────────────────────────────┐
│ [LOGO] SYMBOL  EXCHANGE       [ACTION]  │   ← head
│        Company Name                      │
├──────────────────────────────────────────┤
│ ₹2,942.50    +1.84%        [sparkline]  │   ← price row
├──────────────────────────────────────────┤
│  SL    ENTRY    T1      T2      T3       │   ← targets block
│ 2780  2920–65  3120   3280   3450        │      (bg-soft strip)
├──────────────────────────────────────────┤
│ [○87] Confidence       [LOW] [3.2:1 R/R] │   ← foot
│       3–6 months                         │
└──────────────────────────────────────────┘
```

**Specifics:**
- 360px+ wide, ~280px tall
- Border-radius 10px, 1px border `--border` (#1d1d2a dark / #e6e3da light)
- Hover: border lightens to `--border-2`, translateY(-1px), top 2px accent strip fades in (green for BUY, red for SELL, amber for HOLD)
- **Logo** 36×36, rounded 8px, market-tinted (IN = saffron, US = blue, CRYPTO = orange)
- **Action badge** mono 11px / 700, padded pill, tinted bg + colored text: BUY=emerald `#34d399`, SELL=coral `#f87171`, HOLD=amber `#fbbf24`. If shorting, append " SHORT" tag.
- **Price** 22px mono 700, tabular numerals (font-feature-settings: "tnum")
- **Sparkline** 90×30 SVG with area gradient and 1.5px stroke
- **Targets block** 5-column grid on `--bg-soft` background. Each cell: mono 9px label uppercase + 12px mono 700 value, color-coded
- **Conf ring** 38×38, SVG circle with brand-gold stroke, dasharray animates fill, percentage in center
- **Risk chip** colored by level (LOW=green, MEDIUM=amber, HIGH=orange, VERY HIGH=red)
- **R:R chip** gold-tinted

---

## Interactions & Behavior

- **Card click** → opens `DetailPanel` slide-over (fade backdrop + translateX panel)
- **Esc / backdrop click** → closes detail panel
- **Tab switching** → top nav, no URL change in prototype but **production should use proper routing** (`/picks`, `/screener`, `/watchlist`, `/portfolio`, `/alerts`, `/news`, `/profile`, `/stock/:symbol` for detail)
- **Filter chips** → toggle to filter the grid/table
- **Sort chips** (screener) → resort table client-side
- **Hover states:** rows in tables get `--bg-soft` background, chips lighten border
- **Live dot** in market pill pulses (2s ease-in-out infinite)
- **Detail panel open** transition: 0.25s opacity + translateX(40px → 0) on the inner panel
- **Confidence ring** stroke-dashoffset transitions 0.6s on value change

### Animations
- All transitions 0.15–0.25s
- Use ease or ease-in-out
- No bounce / spring — keep it serious / professional

### Loading states
Prototype has none. Production should show:
- Skeleton cards in the grid
- Skeleton table rows
- Shimmer on price values during refresh

### Error states
- Network failure: show retry banner above the grid
- Symbol not found: empty state with "Try another search"

---

## State Management

**Local UI state:**
- `currentTab` ('home' | 'screener' | 'watchlist' | 'portfolio' | 'alerts' | 'news' | 'settings')
- `detailRec` (Recommendation | null) — which stock is open in detail panel
- `marketFilter` ('all' | 'IN' | 'US' | 'CRYPTO')
- `actionFilter` ('ALL' | 'BUY' | 'SELL' | 'HOLD')
- `sortBy` ('confidence' | 'upside' | 'rr' | 'change')

**Server-side data:**
- `recommendations[]` — refresh every 30s or on demand
- `prices` (live ticker stream) — websocket; update price + change + sparkline in place without re-rendering the whole card
- `watchlist[]` — per-user; CRUD via API
- `portfolio[]` — per-user holdings; live valuation on every price tick
- `alerts[]` — push-subscribed; new alerts append to top of feed
- `news[]` — paginated, refresh every 5 min

**Critical perf:** sparkline + price updates should NOT re-render the entire card grid. Memoize cards by symbol; only update the changed fields via context or per-symbol stores (zustand / jotai are good fits).

---

## Design Tokens

### Colors

**Dark theme (default):**
```
--bg:        #07070a   (page background)
--bg-soft:   #0c0c12   (subtle elevation)
--surface:   #11111a   (cards)
--surface-2: #171722   (input bg, hover)
--surface-3: #1f1f2c   (chip / divider bg)

--border:    #1d1d2a   (default card border)
--border-2:  #2a2a3a   (hover / emphasis)
--border-3:  #3a3a4e   (input focus)

--t-1: #f4f4f7   (primary text)
--t-2: #a4a4b8   (secondary text)
--t-3: #6c6c84   (tertiary / labels)
--t-4: #44445a   (faint / disabled)
```

**Light theme:**
```
--bg:        #f7f6f1
--bg-soft:   #efede7
--surface:   #ffffff
--surface-2: #f1efe8
--surface-3: #e6e3da
--border:    #e6e3da
--border-2:  #d4d0c4
--border-3:  #b8b3a3
--t-1: #1a1814
--t-2: #5a564e
--t-3: #8a8578
--t-4: #b8b3a3
```

**Status (same in both themes):**
```
--buy:    #34d399   emerald
--sell:   #f87171   coral
--hold:   #fbbf24   amber
--brand:  #d4a04a   saffron / bullseye gold
```

Each has `-w` (color + 22 alpha) and `-d` (color + 14 alpha) variants for tinted backgrounds.

**Risk levels:**
- LOW → green `#34d399`
- MEDIUM → amber `#fbbf24`
- HIGH → orange `#fb923c`
- VERY HIGH → red `#f87171`

### Typography

| Use | Font | Weight | Size |
|---|---|---|---|
| Hero headlines | Instrument Serif | 400 (italic for emphasis) | 56px / 1.02 / -0.02em |
| Section titles | Instrument Serif | 400 | 28px / -0.01em |
| Body / UI | Manrope | 500 / 600 | 13–14px |
| Numbers / prices | JetBrains Mono | 600 / 700 | 11–22px tabular |
| Labels / eyebrows | JetBrains Mono | 500 | 10–11px, letter-spacing 0.06–0.16em, uppercase |
| Button labels | Manrope | 700 | 13px, letter-spacing 0.03em |

Fonts loaded from Google Fonts: `Manrope`, `JetBrains Mono`, `Instrument Serif`, `Space Grotesk` (optional alt headline).

### Spacing scale

Roughly 4 / 8 / 12 / 14 / 16 / 20 / 24 / 28 / 32 — comfortable density, not cramped.

### Border radius

| Token | Value | Use |
|---|---|---|
| `--radius-sm` | 6px | inputs, small chips |
| `--radius` | 10px | cards, panels |
| `--radius-lg` | 14px | onboarding card |
| (round) | 999px | pill chips |
| (full) | 50% | avatars, dots |

### Shadows

Prototype uses no shadows — relies on borders + subtle surface elevation. Keep this restraint. Optional: `0 0 10px rgba(52, 211, 153, 0.4)` for the pulsing "live" dot only.

---

## Recommendation Data Model

```ts
type Recommendation = {
  id: string;
  symbol: string;          // "RELIANCE"
  exchange: string;        // "NSE" | "NASDAQ" | "NYSE" | "Crypto"
  name: string;            // "Reliance Industries"
  sector: string;
  market: "IN" | "US" | "CRYPTO";
  currency: "₹" | "$";
  price: number;
  change: number;          // % today
  action: "BUY" | "SELL" | "HOLD";
  direction?: "SHORT";     // optional; SELL recs may be short positions
  confidence: number;      // 0–100
  risk: "LOW" | "MEDIUM" | "HIGH" | "VERY HIGH";
  horizon: string;         // "3–6 months"
  entry: { low: number; high: number };
  targets: [number, number, number];   // T1, T2, T3
  stopLoss: number;
  rr: number;              // risk:reward ratio
  upside: number;          // % to T3 (negative for shorts)
  source: string;          // "Analyst" | "Algo Signal" | "AI + Analyst" | etc.
  analyst: string;         // attribution
  rationale: string;       // 2–4 sentences
  catalysts: string[];     // 3 items
  tags: string[];          // ["Largecap", "Banking"]
  sparkline: number[];     // last ~10 price points
  posted: string;          // relative time
  rsi: number;
  pe: number | null;
  marketCap: string;
};
```

See `data.js` for 27 fully-populated example records spanning Indian, US, and Crypto markets.

---

## Backend Requirements (production)

This is a design handoff but the developer will need to integrate:

1. **Live prices** — WebSocket for real-time. Suggested providers:
   - NSE: Marketstack, Alpha Vantage, or licensed NSE direct
   - US: Polygon, Alpha Vantage, IEX Cloud
   - Crypto: CoinGecko, Binance public WS, CoinAPI

2. **Recommendations source** — must be one or a blend of:
   - Curated analyst feed (Bloomberg, Reuters, MoneyControl scraping with permission)
   - Algorithmic signals (RSI/MACD/breakout detection from price data)
   - LLM-generated theses (Claude / GPT given price + news + earnings input)

3. **News feed** — NewsAPI, Tickertape, or scraped feeds

4. **Push notifications** — FCM (web/Android) + APNs (iOS) for alerts

5. **Compliance** — In India, recommendations require **SEBI Research Analyst registration**. The onboarding mentions "SEBI Registered" — this must be real. In the US, similar SEC considerations.

6. **Broker integration** (for one-tap buy/sell) — Zerodha Kite Connect, Upstox API, Angel One SmartAPI for India; Alpaca, Tradier for US.

---

## Responsive Behavior

Prototype is desktop-first (designed at 1440px). Breakpoints:
- **≥ 1080px**: 2-column grid (content + 340px sidebar)
- **< 1080px**: single column, sidebar drops below
- **< 720px**: 16px gutters, navtabs hide (need hamburger / bottom nav), search hides, single-column card grid, simplified portfolio summary

For a true mobile app build, redesign navigation as bottom tab bar (Picks / Screener / Portfolio / Alerts / Profile) and convert the detail overlay to a full-screen pushed view.

---

## Files

All files in this folder, in load order:

| File | Purpose |
|---|---|
| `Bullseye.html` | Entry point — wires up scripts and fonts |
| `styles.css` | All styles, design tokens, layout |
| `data.js` | Mock recommendations + news + alerts + portfolio |
| `tweaks-panel.jsx` | Design-time tweaks panel (NOT for production) |
| `components.jsx` | Reusable components: `RecCard`, `Sparkline`, `ConfRing`, `BigChart`, `TargetLadder`, `WatchlistItem` |
| `screens.jsx` | All screen components |
| `app.jsx` | Root `App`, navigation, detail-panel state, tweaks wiring |

**Note:** `tweaks-panel.jsx` and the `<TweaksPanel>` block in `app.jsx` are **design-time only** — used to switch theme / accent / font during the review. Drop these entirely in production.

---

## Assets

- **Fonts:** Manrope, JetBrains Mono, Instrument Serif, Space Grotesk — Google Fonts.
- **Icons:** Currently text glyphs (✓ ✕ ↗ ★ ◉ ▤ ▦ ≡ 🔍 🔔). Replace with a proper icon set in production (Lucide, Phosphor, or Heroicons).
- **Logos:** Stock logos are currently 3-letter mono initials. Production should use real ticker logos via Clearbit Logo API or self-hosted SVGs.
- **No images / no illustrations** — design is type-first.

---

## Open Questions for Product

Things the design intentionally leaves unanswered — flag these to product before implementing:

1. **Who generates recommendations?** Analysts on staff, third-party feed, or AI? Affects trust labels (`source` field) and compliance.
2. **Refresh cadence?** Are picks updated daily, intraday, or live?
3. **Position sizing?** Should we suggest % of portfolio to allocate per pick?
4. **Multi-currency portfolio?** Currently INR / USD shown separately — does the user want a unified valuation?
5. **Broker integration scope?** "Buy @ ₹2,920" button — does this place a real order, deep-link to broker app, or copy to clipboard?
6. **Free vs. Pro gating** — what's free, what's paywalled?
7. **Regional restriction** — show US stocks to Indian users only after enabling LRS/foreign-broker connection?
