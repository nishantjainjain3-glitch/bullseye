/* global React, RECOMMENDATIONS, NEWS_ITEMS, ALERTS_DATA, PORTFOLIO */
/* global RecCard, WatchlistItem, ConfRing, BigChart, TargetLadder, Sparkline, fmtPrice, fmtChange, pctFromCurrent */
// All screens for BULLSEYE

const { useState: useS, useMemo: useM, useEffect: useE } = React;

// =============== HOME / TOP PICKS ===============
function HomeScreen({ onOpenDetail }) {
  const [filter, setFilter] = useS("all");
  const [actionFilter, setActionFilter] = useS("ALL");

  const filtered = useM(() => {
    let r = RECOMMENDATIONS;
    if (filter !== "all") r = r.filter(x => x.market === filter);
    if (actionFilter !== "ALL") r = r.filter(x => x.action === actionFilter);
    return r;
  }, [filter, actionFilter]);

  const stats = useM(() => {
    const total = RECOMMENDATIONS.length;
    const buys = RECOMMENDATIONS.filter(r => r.action === "BUY").length;
    const sells = RECOMMENDATIONS.filter(r => r.action === "SELL").length;
    const holds = RECOMMENDATIONS.filter(r => r.action === "HOLD").length;
    const avgConf = Math.round(RECOMMENDATIONS.reduce((a, r) => a + r.confidence, 0) / total);
    return { total, buys, sells, holds, avgConf };
  }, []);

  const watchlistRecs = RECOMMENDATIONS.slice(0, 7);

  return (
    <div>
      <div className="hero">
        <div>
          <div className="hero-eyebrow">Friday · 15 May 2026 · Market Open</div>
          <h1>
            Today's <em>highest-conviction</em><br />
            picks across the board.
          </h1>
        </div>
        <div className="hero-meta">
          <div>
            Active Picks
            <strong>{stats.total}</strong>
          </div>
          <div>
            Avg Confidence
            <strong>{stats.avgConf}%</strong>
          </div>
          <div>
            Buy / Sell / Hold
            <strong>{stats.buys} / {stats.sells} / {stats.holds}</strong>
          </div>
        </div>
      </div>

      <div className="macro-strip">
        <div className="macro-cell"><div className="ml">NIFTY 50</div><div className="mv">24,180</div><div className="mc up">+0.84%</div></div>
        <div className="macro-cell"><div className="ml">SENSEX</div><div className="mv">79,450</div><div className="mc up">+0.62%</div></div>
        <div className="macro-cell"><div className="ml">NASDAQ</div><div className="mv">21,420</div><div className="mc up">+1.12%</div></div>
        <div className="macro-cell"><div className="ml">S&amp;P 500</div><div className="mv">5,842</div><div className="mc up">+0.48%</div></div>
        <div className="macro-cell"><div className="ml">BTC / USD</div><div className="mv">$98,420</div><div className="mc up">+1.84%</div></div>
        <div className="macro-cell"><div className="ml">USD / INR</div><div className="mv">83.42</div><div className="mc dn">−0.12%</div></div>
        <div className="macro-cell"><div className="ml">India VIX</div><div className="mv">13.8</div><div className="mc dn">−2.40%</div></div>
        <div className="macro-cell"><div className="ml">GOLD ₹/10g</div><div className="mv">71,820</div><div className="mc up">+0.42%</div></div>
      </div>

      <div className="page-grid">
        <div>
          <div className="filter-bar">
            <button className={`chip ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>
              All Markets <span className="count">{RECOMMENDATIONS.length}</span>
            </button>
            <button className={`chip ${filter === "IN" ? "active" : ""}`} onClick={() => setFilter("IN")}>
              🇮🇳 Indian <span className="count">{RECOMMENDATIONS.filter(r => r.market === "IN").length}</span>
            </button>
            <button className={`chip ${filter === "US" ? "active" : ""}`} onClick={() => setFilter("US")}>
              🇺🇸 US <span className="count">{RECOMMENDATIONS.filter(r => r.market === "US").length}</span>
            </button>
            <button className={`chip ${filter === "CRYPTO" ? "active" : ""}`} onClick={() => setFilter("CRYPTO")}>
              ₿ Crypto <span className="count">{RECOMMENDATIONS.filter(r => r.market === "CRYPTO").length}</span>
            </button>
            <div className="chip-divider"></div>
            <button className={`chip ${actionFilter === "ALL" ? "active" : ""}`} onClick={() => setActionFilter("ALL")}>Any</button>
            <button className={`chip ${actionFilter === "BUY" ? "active" : ""}`} onClick={() => setActionFilter("BUY")}>Buy</button>
            <button className={`chip ${actionFilter === "SELL" ? "active" : ""}`} onClick={() => setActionFilter("SELL")}>Sell</button>
            <button className={`chip ${actionFilter === "HOLD" ? "active" : ""}`} onClick={() => setActionFilter("HOLD")}>Hold</button>
            <div className="right">
              <button className="iconbtn" title="Grid">▦</button>
              <button className="iconbtn" title="List">≡</button>
            </div>
          </div>

          <div className="recs-grid">
            {filtered.map(r => (
              <RecCard key={r.id} rec={r} onClick={() => onOpenDetail(r)} />
            ))}
          </div>
        </div>

        <aside>
          <div className="rail-card">
            <div className="rail-head">
              <div className="rail-title">Watchlist <span className="count-pill">{watchlistRecs.length}</span></div>
              <a className="rail-action">Manage</a>
            </div>
            {watchlistRecs.map(r => (
              <WatchlistItem key={r.id} rec={r} onClick={() => onOpenDetail(r)} />
            ))}
          </div>

          <div className="rail-card">
            <div className="rail-head">
              <div className="rail-title">Live Alerts <span className="count-pill">{ALERTS_DATA.length}</span></div>
              <a className="rail-action">View all</a>
            </div>
            {ALERTS_DATA.slice(0, 4).map(a => (
              <div className="alert-item" key={a.id}>
                <div className={`alert-icon ${a.type}`}>
                  {a.type === "TARGET_HIT" && "✓"}
                  {a.type === "STOP_LOSS" && "!"}
                  {a.type === "BREAKOUT" && "↗"}
                  {a.type === "NEW_PICK" && "★"}
                  {a.type === "PRICE_ALERT" && "◉"}
                  {a.type === "NEWS" && "▤"}
                </div>
                <div className="alert-body">
                  <div className="alert-title">
                    {a.type.replace("_", " ")}
                    <span className="alert-sym">{a.symbol}</span>
                  </div>
                  <div className="alert-msg">{a.message}</div>
                  <div className="alert-time">{a.time}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="rail-card">
            <div className="rail-head">
              <div className="rail-title">Market News</div>
              <a className="rail-action">All news →</a>
            </div>
            {NEWS_ITEMS.slice(0, 5).map((n, i) => (
              <div className="news-item" key={i}>
                <div className="news-headline">{n.title}</div>
                <div className="news-meta">
                  <span className={`news-impact ${n.impact}`}>{n.impact}</span>
                  <span className="news-source">{n.source}</span>
                  <span className="news-dot">•</span>
                  <span>{n.category}</span>
                  <span className="news-dot">•</span>
                  <span>{n.time}</span>
                </div>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

// =============== DETAIL OVERLAY ===============
function DetailPanel({ rec, onClose }) {
  if (!rec) return null;
  const actionCls = rec.action.toLowerCase();
  const upCls = rec.change >= 0 ? "up" : "dn";
  const isShort = rec.direction === "SHORT";

  return (
    <div className={`detail-overlay ${rec ? "open" : ""}`} onClick={onClose}>
      <div className="detail-panel" onClick={e => e.stopPropagation()}>
        <div className="detail-head">
          <div className="detail-title-block">
            <div className={`detail-logo ${rec.market.toLowerCase()}`} style={{
              background: rec.market === "CRYPTO" ? "#f7931a22" : rec.market === "US" ? "#4480ff22" : "#d4a04a22",
              color: rec.market === "CRYPTO" ? "#f7931a" : rec.market === "US" ? "#6fa0ff" : "var(--brand)",
              borderColor: rec.market === "CRYPTO" ? "#f7931a44" : rec.market === "US" ? "#4480ff44" : "#d4a04a44"
            }}>{rec.symbol.slice(0, 3)}</div>
            <div className="detail-name-block">
              <h2>{rec.name}</h2>
              <div className="detail-sub">{rec.symbol} · {rec.exchange} · {rec.sector}</div>
            </div>
          </div>
          <button className="detail-close" onClick={onClose}>✕</button>
        </div>

        <div className="detail-price-row">
          <div>
            <span className="detail-price">{fmtPrice(rec.price, rec.currency)}</span>
            <span className={`detail-change ${upCls}`}>{fmtChange(rec.change)}</span>
          </div>
          <div className={`detail-action-large ${actionCls}`}>
            {rec.action}{isShort && " · SHORT"}
          </div>
        </div>

        <div className="detail-chart">
          <BigChart data={rec.sparkline} action={rec.action} />
        </div>

        <div className="detail-section">
          <h3>Price Targets · Risk:Reward {rec.rr}:1</h3>
          <div className="detail-targets">
            <div className="detail-target sl">
              <div className="lbl">STOP LOSS</div>
              <div className="val">{fmtPrice(rec.stopLoss, rec.currency)}</div>
              <div className="upside">{pctFromCurrent(rec.price, rec.stopLoss).toFixed(1)}%</div>
            </div>
            <div className="detail-target entry">
              <div className="lbl">ENTRY ZONE</div>
              <div className="val" style={{ fontSize: 15 }}>{rec.currency}{rec.entry.low}–{rec.entry.high}</div>
              <div className="upside">avg {rec.currency}{((rec.entry.low + rec.entry.high) / 2).toFixed(2)}</div>
            </div>
            {rec.targets.map((t, i) => (
              <div className={`detail-target t${i + 1}`} key={i}>
                <div className="lbl">TARGET {i + 1}</div>
                <div className="val">{fmtPrice(t, rec.currency)}</div>
                <div className="upside">{pctFromCurrent(rec.price, t) > 0 ? "+" : ""}{pctFromCurrent(rec.price, t).toFixed(1)}%</div>
              </div>
            ))}
          </div>
          <TargetLadder rec={rec} />
        </div>

        <div className="detail-section">
          <h3>Analyst Thesis</h3>
          <div className={`rationale-box ${actionCls}`}>
            {rec.rationale}
            <div className="analyst-line">
              <span>— {rec.analyst}</span>
              <span>·</span>
              <span>via {rec.source}</span>
              <span>·</span>
              <span>{rec.posted}</span>
            </div>
          </div>
        </div>

        <div className="detail-section">
          <h3>Catalysts to Watch</h3>
          <div className="catalyst-list">
            {rec.catalysts.map((c, i) => (
              <div className="catalyst-row" key={i}>
                <div className="catalyst-num">{i + 1}</div>
                <div className="catalyst-text">{c}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="detail-section">
          <h3>Key Metrics</h3>
          <div className="metrics-grid">
            <div className="metric-cell"><div className="metric-lbl">Confidence</div><div className="metric-val">{rec.confidence}%</div></div>
            <div className="metric-cell"><div className="metric-lbl">Risk Level</div><div className="metric-val">{rec.risk}</div></div>
            <div className="metric-cell"><div className="metric-lbl">Time Horizon</div><div className="metric-val" style={{ fontSize: 13 }}>{rec.horizon}</div></div>
            <div className="metric-cell"><div className="metric-lbl">RSI (14)</div><div className="metric-val">{rec.rsi}</div></div>
            <div className="metric-cell"><div className="metric-lbl">P/E Ratio</div><div className="metric-val">{rec.pe || "—"}</div></div>
            <div className="metric-cell"><div className="metric-lbl">Market Cap</div><div className="metric-val" style={{ fontSize: 13 }}>{rec.marketCap}</div></div>
            <div className="metric-cell"><div className="metric-lbl">Upside (T3)</div><div className="metric-val">{(rec.upside > 0 ? "+" : "") + rec.upside.toFixed(1)}%</div></div>
            <div className="metric-cell"><div className="metric-lbl">Source</div><div className="metric-val" style={{ fontSize: 12 }}>{rec.source}</div></div>
          </div>
        </div>

        <div className="detail-actions">
          <button className={`btn-primary ${actionCls === "sell" ? "sell" : ""}`}>
            {rec.action === "SELL" ? `Sell @ ${rec.currency}${rec.entry.low}–${rec.entry.high}` : `Buy @ ${rec.currency}${rec.entry.low}–${rec.entry.high}`}
          </button>
          <button className="btn-secondary">+ Watchlist</button>
          <button className="btn-secondary">Set Alert</button>
        </div>
      </div>
    </div>
  );
}

// =============== WATCHLIST SCREEN ===============
function WatchlistScreen({ onOpenDetail }) {
  const items = RECOMMENDATIONS.slice(0, 12);
  return (
    <div>
      <div className="hero">
        <div>
          <div className="hero-eyebrow">Your Watchlist</div>
          <h1>Stocks <em>you're</em> tracking.</h1>
        </div>
        <div className="hero-meta">
          <div>Tracked<strong>{items.length}</strong></div>
          <div>Avg Performance<strong className="up">+12.4%</strong></div>
        </div>
      </div>

      <table className="screener-table">
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Market</th>
            <th>Price</th>
            <th>Change</th>
            <th>Action</th>
            <th>Target 1</th>
            <th>Upside</th>
            <th>Conf</th>
            <th style={{ textAlign: "right" }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {items.map(r => (
            <tr key={r.id} onClick={() => onOpenDetail(r)} style={{ cursor: "pointer" }}>
              <td>
                <div className="sym-cell">
                  <div className={`wl-mini-logo ${r.market.toLowerCase()}`} style={{
                    background: r.market === "CRYPTO" ? "#f7931a22" : r.market === "US" ? "#4480ff22" : "#d4a04a22",
                    color: r.market === "CRYPTO" ? "#f7931a" : r.market === "US" ? "#6fa0ff" : "var(--brand)"
                  }}>{r.symbol.slice(0, 2)}</div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{r.symbol}</div>
                    <div style={{ fontSize: 11, color: "var(--t-3)" }}>{r.name}</div>
                  </div>
                </div>
              </td>
              <td><span className="tagchip">{r.exchange}</span></td>
              <td className="num">{fmtPrice(r.price, r.currency)}</td>
              <td className={`num ${r.change >= 0 ? "up" : "dn"}`}>{fmtChange(r.change)}</td>
              <td><span className={`action-badge ${r.action.toLowerCase()}`}>{r.action}</span></td>
              <td className="num">{fmtPrice(r.targets[0], r.currency)}</td>
              <td className={`num ${pctFromCurrent(r.price, r.targets[0]) >= 0 ? "up" : "dn"}`}>
                {pctFromCurrent(r.price, r.targets[0]) >= 0 ? "+" : ""}{pctFromCurrent(r.price, r.targets[0]).toFixed(1)}%
              </td>
              <td><ConfRing value={r.confidence} size={32} /></td>
              <td>
                <div className="actions">
                  <button className="iconbtn" title="Alert">🔔</button>
                  <button className="iconbtn" title="Remove">✕</button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// =============== PORTFOLIO SCREEN ===============
function PortfolioScreen({ onOpenDetail }) {
  const enriched = PORTFOLIO.map(p => {
    const value = p.qty * p.current;
    const invested = p.qty * p.avg;
    const pnl = value - invested;
    const ret = (pnl / invested) * 100;
    return { ...p, value, invested, pnl, ret };
  });

  const totalsByCcy = enriched.reduce((acc, p) => {
    if (!acc[p.currency]) acc[p.currency] = { value: 0, invested: 0, pnl: 0 };
    acc[p.currency].value += p.value;
    acc[p.currency].invested += p.invested;
    acc[p.currency].pnl += p.pnl;
    return acc;
  }, {});

  return (
    <div>
      <div className="hero">
        <div>
          <div className="hero-eyebrow">Portfolio</div>
          <h1>Your <em>positions</em>, all in one view.</h1>
        </div>
      </div>

      <div className="portfolio-summary">
        <div className="ps-cell">
          <div className="lbl">Total Value (INR)</div>
          <div className="val large">₹{totalsByCcy["₹"]?.value.toLocaleString("en-IN", { maximumFractionDigits: 0 }) || 0}</div>
          <div className={`sub ${totalsByCcy["₹"]?.pnl >= 0 ? "up" : "dn"}`}>
            {totalsByCcy["₹"]?.pnl >= 0 ? "+" : ""}₹{totalsByCcy["₹"]?.pnl.toLocaleString("en-IN", { maximumFractionDigits: 0 })} ({((totalsByCcy["₹"]?.pnl / totalsByCcy["₹"]?.invested) * 100).toFixed(1)}%)
          </div>
        </div>
        <div className="ps-cell">
          <div className="lbl">USD Positions</div>
          <div className="val">${totalsByCcy["$"]?.value.toLocaleString("en-US", { maximumFractionDigits: 0 }) || 0}</div>
          <div className={`sub ${totalsByCcy["$"]?.pnl >= 0 ? "up" : "dn"}`}>
            {totalsByCcy["$"]?.pnl >= 0 ? "+" : ""}${totalsByCcy["$"]?.pnl.toLocaleString("en-US", { maximumFractionDigits: 0 })}
          </div>
        </div>
        <div className="ps-cell">
          <div className="lbl">Day P/L</div>
          <div className="val up">+₹14,820</div>
          <div className="sub up">+0.84% today</div>
        </div>
        <div className="ps-cell">
          <div className="lbl">Open Positions</div>
          <div className="val">{enriched.length}</div>
          <div className="sub">across 3 markets</div>
        </div>
      </div>

      <table className="screener-table">
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Market</th>
            <th>Qty</th>
            <th>Avg Buy</th>
            <th>Live</th>
            <th>Value</th>
            <th>P/L</th>
            <th>Return</th>
            <th>Signal</th>
          </tr>
        </thead>
        <tbody>
          {enriched.map((p, i) => {
            const rec = RECOMMENDATIONS.find(r => r.symbol === p.symbol);
            return (
              <tr key={i} onClick={() => rec && onOpenDetail(rec)} style={{ cursor: "pointer" }}>
                <td><div style={{ fontWeight: 600 }}>{p.symbol}</div></td>
                <td><span className="tagchip">{p.market}</span></td>
                <td className="num">{p.qty}</td>
                <td className="num">{p.currency}{p.avg.toLocaleString()}</td>
                <td className="num">{p.currency}{p.current.toLocaleString()}</td>
                <td className="num">{p.currency}{p.value.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                <td className={`num ${p.pnl >= 0 ? "up" : "dn"}`}>{p.pnl >= 0 ? "+" : ""}{p.currency}{p.pnl.toLocaleString(undefined, { maximumFractionDigits: 0 })}</td>
                <td className={`num ${p.ret >= 0 ? "up" : "dn"}`}>{p.ret >= 0 ? "+" : ""}{p.ret.toFixed(1)}%</td>
                <td>{rec && <span className={`action-badge ${rec.action.toLowerCase()}`}>{rec.action}</span>}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

// =============== SCREENER ===============
function ScreenerScreen({ onOpenDetail }) {
  const [sortBy, setSortBy] = useS("confidence");
  const [filter, setFilter] = useS("all");

  const data = useM(() => {
    let r = [...RECOMMENDATIONS];
    if (filter !== "all") r = r.filter(x => x.market === filter);
    r.sort((a, b) => {
      if (sortBy === "confidence") return b.confidence - a.confidence;
      if (sortBy === "upside") return Math.abs(b.upside) - Math.abs(a.upside);
      if (sortBy === "change") return b.change - a.change;
      if (sortBy === "rr") return b.rr - a.rr;
      return 0;
    });
    return r;
  }, [sortBy, filter]);

  return (
    <div>
      <div className="hero">
        <div>
          <div className="hero-eyebrow">Screener</div>
          <h1>Find your next <em>position</em>.</h1>
        </div>
      </div>

      <div className="filter-bar">
        <button className={`chip ${filter === "all" ? "active" : ""}`} onClick={() => setFilter("all")}>All</button>
        <button className={`chip ${filter === "IN" ? "active" : ""}`} onClick={() => setFilter("IN")}>Indian</button>
        <button className={`chip ${filter === "US" ? "active" : ""}`} onClick={() => setFilter("US")}>US</button>
        <button className={`chip ${filter === "CRYPTO" ? "active" : ""}`} onClick={() => setFilter("CRYPTO")}>Crypto</button>
        <div className="chip-divider"></div>
        <span style={{ fontSize: 11, color: "var(--t-3)", marginRight: 4, fontFamily: "var(--font-mono)" }}>SORT</span>
        <button className={`chip ${sortBy === "confidence" ? "active" : ""}`} onClick={() => setSortBy("confidence")}>Confidence</button>
        <button className={`chip ${sortBy === "upside" ? "active" : ""}`} onClick={() => setSortBy("upside")}>Upside</button>
        <button className={`chip ${sortBy === "rr" ? "active" : ""}`} onClick={() => setSortBy("rr")}>R:R</button>
        <button className={`chip ${sortBy === "change" ? "active" : ""}`} onClick={() => setSortBy("change")}>Today's Move</button>
      </div>

      <table className="screener-table">
        <thead>
          <tr>
            <th>Symbol</th>
            <th>Action</th>
            <th>Price</th>
            <th>Today</th>
            <th>Entry</th>
            <th>T1</th>
            <th>T2</th>
            <th>T3</th>
            <th>Stop</th>
            <th>R:R</th>
            <th>Conf</th>
            <th>Risk</th>
            <th>Horizon</th>
          </tr>
        </thead>
        <tbody>
          {data.map(r => (
            <tr key={r.id} onClick={() => onOpenDetail(r)} style={{ cursor: "pointer" }}>
              <td>
                <div className="sym-cell">
                  <div className={`wl-mini-logo`} style={{
                    background: r.market === "CRYPTO" ? "#f7931a22" : r.market === "US" ? "#4480ff22" : "#d4a04a22",
                    color: r.market === "CRYPTO" ? "#f7931a" : r.market === "US" ? "#6fa0ff" : "var(--brand)"
                  }}>{r.symbol.slice(0, 2)}</div>
                  <div>
                    <div style={{ fontWeight: 600 }}>{r.symbol}</div>
                    <div style={{ fontSize: 10, color: "var(--t-3)" }}>{r.exchange}</div>
                  </div>
                </div>
              </td>
              <td><span className={`action-badge ${r.action.toLowerCase()}`}>{r.action}</span></td>
              <td className="num">{fmtPrice(r.price, r.currency)}</td>
              <td className={`num ${r.change >= 0 ? "up" : "dn"}`}>{fmtChange(r.change)}</td>
              <td className="num" style={{ fontSize: 11 }}>{r.currency}{r.entry.low}–{r.entry.high}</td>
              <td className="num up">{fmtPrice(r.targets[0], r.currency)}</td>
              <td className="num" style={{ color: "var(--brand)" }}>{fmtPrice(r.targets[1], r.currency)}</td>
              <td className="num" style={{ color: "#6fa0ff" }}>{fmtPrice(r.targets[2], r.currency)}</td>
              <td className="num dn">{fmtPrice(r.stopLoss, r.currency)}</td>
              <td><span className="rr-chip">{r.rr}:1</span></td>
              <td className="num">{r.confidence}%</td>
              <td><span className={`risk-chip risk-${r.risk.replace(" ", "-")}`}>{r.risk}</span></td>
              <td style={{ fontSize: 11, color: "var(--t-2)" }}>{r.horizon}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// =============== ALERTS ===============
function AlertsScreen({ onOpenDetail }) {
  const alerts = [...ALERTS_DATA, ...ALERTS_DATA.map(a => ({ ...a, id: a.id + 10, time: "1d ago" }))];
  return (
    <div>
      <div className="hero">
        <div>
          <div className="hero-eyebrow">Alerts & Notifications</div>
          <h1><em>Real-time</em> signals from your stocks.</h1>
        </div>
        <div className="hero-meta">
          <div>Active<strong>{alerts.filter(a => !a.triggered).length}</strong></div>
          <div>Triggered Today<strong>{alerts.filter(a => a.triggered).length}</strong></div>
        </div>
      </div>

      <div className="page-grid">
        <div>
          <div className="filter-bar">
            <button className="chip active">All</button>
            <button className="chip">Target Hit</button>
            <button className="chip">Stop Loss</button>
            <button className="chip">Breakouts</button>
            <button className="chip">New Picks</button>
          </div>
          <div className="rail-card">
            {alerts.map(a => {
              const rec = RECOMMENDATIONS.find(r => r.symbol === a.symbol);
              return (
                <div className="alert-item" key={a.id} onClick={() => rec && onOpenDetail(rec)} style={{ cursor: "pointer" }}>
                  <div className={`alert-icon ${a.type}`}>
                    {a.type === "TARGET_HIT" && "✓"}
                    {a.type === "STOP_LOSS" && "!"}
                    {a.type === "BREAKOUT" && "↗"}
                    {a.type === "NEW_PICK" && "★"}
                    {a.type === "PRICE_ALERT" && "◉"}
                    {a.type === "NEWS" && "▤"}
                  </div>
                  <div className="alert-body">
                    <div className="alert-title">
                      {a.type.replace("_", " ")}
                      <span className="alert-sym">{a.symbol}</span>
                      {a.triggered && <span className="tagchip" style={{ background: "var(--buy-w)", color: "var(--buy)" }}>TRIGGERED</span>}
                    </div>
                    <div className="alert-msg">{a.message}</div>
                    <div className="alert-time">{a.time}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <aside>
          <div className="rail-card">
            <div className="rail-head">
              <div className="rail-title">Alert Settings</div>
            </div>
            <div style={{ padding: "16px" }}>
              <div style={{ fontSize: 12, color: "var(--t-2)", marginBottom: 14 }}>
                Get notified the moment a pick hits its target, breaks support, or a new high-conviction recommendation goes live.
              </div>
              {["Push notifications", "Email digest (daily)", "Telegram alerts", "WhatsApp alerts"].map((label, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "10px 0", borderTop: i ? "1px solid var(--border)" : "none", fontSize: 13 }}>
                  <span>{label}</span>
                  <div style={{ width: 32, height: 18, background: i < 2 ? "var(--buy)" : "var(--surface-3)", borderRadius: 10, position: "relative", flexShrink: 0 }}>
                    <div style={{ position: "absolute", top: 2, left: i < 2 ? 16 : 2, width: 14, height: 14, background: "#fff", borderRadius: "50%", transition: "left 0.2s" }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// =============== NEWS ===============
function NewsScreen() {
  const extendedNews = [...NEWS_ITEMS, ...NEWS_ITEMS.map(n => ({ ...n, time: "Yesterday" }))];
  const categories = ["All", "Indian", "US", "Crypto", "Macro", "Banking", "Tech"];
  return (
    <div>
      <div className="hero">
        <div>
          <div className="hero-eyebrow">Market News</div>
          <h1>What's <em>moving</em> the tape.</h1>
        </div>
      </div>

      <div className="filter-bar">
        {categories.map((c, i) => (
          <button key={c} className={`chip ${i === 0 ? "active" : ""}`}>{c}</button>
        ))}
      </div>

      <div className="page-grid">
        <div>
          <div className="rail-card">
            {extendedNews.map((n, i) => (
              <div className="news-item" key={i} style={{ padding: "18px 22px" }}>
                <div className="news-headline" style={{ fontSize: 15, marginBottom: 8 }}>{n.title}</div>
                <div className="news-meta">
                  <span className={`news-impact ${n.impact}`}>{n.impact} IMPACT</span>
                  <span className="news-source">{n.source}</span>
                  <span className="news-dot">•</span>
                  <span>{n.category}</span>
                  <span className="news-dot">•</span>
                  <span>{n.time}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
        <aside>
          <div className="rail-card">
            <div className="rail-head"><div className="rail-title">Most Discussed</div></div>
            {RECOMMENDATIONS.slice(0, 5).map(r => (
              <WatchlistItem key={r.id} rec={r} onClick={() => {}} />
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

// =============== SETTINGS / PROFILE ===============
function SettingsScreen() {
  return (
    <div>
      <div className="hero">
        <div>
          <div className="hero-eyebrow">Profile & Settings</div>
          <h1>Make BULLSEYE <em>yours</em>.</h1>
        </div>
      </div>

      <div className="page-grid">
        <div>
          <div className="rail-card">
            <div className="rail-head"><div className="rail-title">Account</div></div>
            <div style={{ padding: "20px 22px", display: "flex", alignItems: "center", gap: 16, borderBottom: "1px solid var(--border)" }}>
              <div className="avatar" style={{ width: 56, height: 56, fontSize: 20 }}>A</div>
              <div>
                <div style={{ fontSize: 16, fontWeight: 600 }}>Aarav Sharma</div>
                <div style={{ fontSize: 12, color: "var(--t-3)", fontFamily: "var(--font-mono)" }}>aarav@gmail.com · PRO member</div>
              </div>
              <button className="btn-secondary" style={{ marginLeft: "auto" }}>Edit</button>
            </div>
            {[
              ["Subscription", "BULLSEYE Pro · ₹1,499/month", "Manage"],
              ["Broker Connection", "Zerodha Kite · Connected", "Switch"],
              ["Default Currency", "INR (₹)", "Change"],
              ["Risk Profile", "Moderate · Balanced", "Re-take"],
              ["Two-Factor Auth", "Enabled · SMS + Authenticator", "Configure"],
              ["Tax Reports", "FY 2025-26 ready", "Download"],
            ].map(([k, v, action]) => (
              <div key={k} style={{ padding: "14px 22px", display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid var(--border)" }}>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500 }}>{k}</div>
                  <div style={{ fontSize: 11, color: "var(--t-3)", fontFamily: "var(--font-mono)", marginTop: 2 }}>{v}</div>
                </div>
                <a className="rail-action">{action} →</a>
              </div>
            ))}
          </div>
        </div>
        <aside>
          <div className="rail-card">
            <div className="rail-head"><div className="rail-title">Pro Status</div></div>
            <div style={{ padding: 22 }}>
              <div className="font-serif" style={{ fontSize: 32, color: "var(--brand)", marginBottom: 4 }}>Pro</div>
              <div style={{ fontSize: 12, color: "var(--t-2)", marginBottom: 18 }}>Renews on 14 June 2026</div>
              {[
                "Unlimited picks across all markets",
                "Live target & stop alerts",
                "Analyst thesis & catalysts",
                "Algorithmic signals",
                "Portfolio AI review",
                "API access (200 req/day)"
              ].map(line => (
                <div key={line} style={{ display: "flex", gap: 8, fontSize: 12, padding: "6px 0", color: "var(--t-2)" }}>
                  <span style={{ color: "var(--buy)" }}>✓</span> {line}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// =============== ONBOARDING / WELCOME ===============
function OnboardingScreen({ onContinue }) {
  return (
    <div style={{ minHeight: "calc(100vh - 64px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 24 }}>
      <div style={{ maxWidth: 980, display: "grid", gridTemplateColumns: "1fr 1fr", gap: 60, alignItems: "center" }} className="onb-grid">
        <div>
          <div className="hero-eyebrow">Welcome to BULLSEYE</div>
          <h1 className="font-serif" style={{ fontSize: 56, lineHeight: 1.02, letterSpacing: "-0.02em", marginBottom: 18 }}>
            Stock picks with <em style={{ color: "var(--brand)", fontStyle: "italic" }}>targets</em>.<br />
            Not opinions.
          </h1>
          <p style={{ color: "var(--t-2)", fontSize: 15, lineHeight: 1.7, marginBottom: 28, maxWidth: 460 }}>
            Every recommendation comes with an entry zone, three target prices, a stop loss, confidence score, and the thesis behind it. Across NSE, US markets, and crypto.
          </p>
          <div style={{ display: "flex", gap: 10, marginBottom: 28 }}>
            <button className="btn-primary" onClick={onContinue}>Get started — free for 7 days</button>
            <button className="btn-secondary">See sample picks</button>
          </div>
          <div style={{ display: "flex", gap: 24, fontSize: 11, color: "var(--t-3)", fontFamily: "var(--font-mono)", letterSpacing: "0.06em", textTransform: "uppercase" }}>
            <span>★ 4.8 · 38k reviews</span>
            <span>SEBI Registered</span>
            <span>2.1M users</span>
          </div>
        </div>

        <div>
          <div style={{ transform: "rotate(-2deg)" }}>
            <RecCard rec={RECOMMENDATIONS[0]} onClick={() => {}} />
          </div>
          <div style={{ transform: "rotate(1.5deg) translateY(-30px) translateX(40px)" }}>
            <RecCard rec={RECOMMENDATIONS[12]} onClick={() => {}} />
          </div>
        </div>
      </div>
    </div>
  );
}

// expose
Object.assign(window, {
  HomeScreen, DetailPanel, WatchlistScreen, PortfolioScreen, ScreenerScreen, AlertsScreen, NewsScreen, SettingsScreen, OnboardingScreen
});
