# Multi-asset Investment Dashboard

_Started 2026-05-11 09:59 UTC_

---

## User

so i want to make an apk for ios in which i get all the best stock recommendation and the target of the stock

## Assistant

## User

<system-info comment="Only acknowledge these if relevant">
Project title is now "STOCK APK"
Current date is now May 15, 2026
</system-info>

<attached_files>
- uploads/stocksense-pro.html
</attached_files>

## Assistant

_[tool: read_file]_

_[tool: read_file]_

_[tool: read_file]_

## Assistant

_[tool: questions_v2]_

Before I start designing, a few quick questions — these will save a lot of back-and-forth.

## User

Questions answered:
- clarify_platform: webpage
- market_focus: Indian (NSE/BSE) — ₹, Crypto, US stocks — $, Explore a few options, Decide for me
- rec_structure: all
- screens: all
- style_direction: all
- variations: all
- data_source: all
- interactivity: all
- audience: all
- name_brand: i need a webpage

## Assistant

_[tool: update_todos]_

Got it — webpage it is. I'll build a polished stock recommendation platform with all the screens, interactive, mixing Indian/US/Crypto picks, with rich target structures. I'll commit to one strong premium direction and expose style variations via a Tweaks panel.

_[tool: copy_starter_component]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: write_file]_

_[tool: show_html]_

_[tool: done]_

_[tool: fork_verifier_agent]_

Built **BULLSEYE** — a stock recommendations webpage with targets across NSE, US markets, and crypto.

**What's in it:**
- **Picks** (home) — 27 recommendations as rich cards: action badge (BUY/SELL/HOLD), entry zone, T1/T2/T3, stop loss, confidence ring, risk + R:R chips, sparkline
- **Stock detail panel** — click any card → full thesis, catalysts, target ladder visualization, key metrics, big chart
- **Screener** — sortable table by confidence / upside / R:R / day move
- **Watchlist** — table view of tracked stocks with one-tap actions
- **Portfolio** — INR + USD totals tracked separately, live P&L
- **Alerts** — target-hit / breakout / stop-loss / new-pick stream
- **News** — categorized market headlines
- **Profile** — subscription, broker connection, tax reports

**Tweaks panel** (bottom-right toggle in toolbar) lets you flip:
- Brand accent color (5 swatches)
- Dark / Light theme
- Headline font (Instrument Serif / Manrope / Space Grotesk)
- Show the onboarding splash screen

Let me know what to refine — different style direction, more screens, different recommendation structure, real numbers swapped in, etc.

## User

so in this i will get the top recomandation and also when to buy and when to sell trade ideas and all current update no stocks

## Assistant

Yes — exactly that. Here's where each thing lives in the app:

- **Top recommendations** → **Picks** tab (home). Cards are sorted by confidence, filter by market (Indian / US / Crypto) or action (Buy / Sell / Hold).
- **When to buy** → Every BUY card shows an **Entry zone** (e.g. ₹2,920–2,965 for Reliance) — that's the price band to enter at. Plus T1 / T2 / T3 targets and a Stop Loss.
- **When to sell** → SELL cards (like Adani Green, Palantir) show the same structure for shorts. Plus **Alerts** tab fires when targets hit or stop loss approaches.
- **Trade ideas** → Click any card → full detail panel with the analyst thesis, catalysts to watch, risk:reward, and time horizon.
- **Current updates** → **News** tab (categorized + impact level), plus the live Alerts feed (Target Hit, Breakout, Stop Loss approaching, New Pick).

A few things to flag — right now this is a **design prototype** with mock data (27 sample picks). To turn it into something that gives you *real* live recommendations, you'd need:

1. A live data feed (NSE/BSE API, Yahoo Finance, CoinGecko etc.)
2. A source of actual recommendations (analyst feed, your own algo, or AI-generated)

Do you want me to:
- **(a)** Polish the design further (add more screens, a different visual direction, mobile view)?
- **(b)** Wire it up with a real-ish data source so prices update?
- **(c)** Add specific features I missed — chart with indicators, paper trading, broker integration mockup, etc.?

## User

send this to claud code

## Assistant

_[tool: invoke_skill]_

_[tool: copy_files]_

_[tool: write_file]_

_[tool: present_fs_item_for_download]_

Handoff package ready to download above ↑

It contains all the design files (`Bullseye.html`, `styles.css`, `data.js`, components) + a thorough `README.md` covering screens, component specs, design tokens (colors / fonts / spacing), the data model, interactions, backend requirements, and open questions for product.

Drop the zip into Claude Code and ask it to implement in whichever framework you want (Next.js, React Native, etc.).

Want screenshots of the design included in the bundle?

