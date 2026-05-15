/* global React */
// Shared components for BULLSEYE

const { useState, useEffect, useMemo, useRef } = React;

// ----- Helpers -----
function fmtPrice(value, currency = "₹") {
  if (value === null || value === undefined) return "—";
  if (Math.abs(value) >= 1000) return `${currency}${value.toLocaleString("en-IN", { maximumFractionDigits: 2 })}`;
  if (Math.abs(value) >= 1) return `${currency}${value.toFixed(2)}`;
  return `${currency}${value.toFixed(4)}`;
}
function fmtChange(value) {
  const sign = value > 0 ? "+" : "";
  return `${sign}${value.toFixed(2)}%`;
}
function pctFromCurrent(current, target) {
  return ((target - current) / current) * 100;
}
function marketLabel(market) {
  return { IN: "NSE", US: "US", CRYPTO: "Crypto" }[market] || market;
}

// ----- Sparkline -----
function Sparkline({ data, action, width = 90, height = 30 }) {
  if (!data || !data.length) return null;
  const min = Math.min(...data);
  const max = Math.max(...data);
  const range = max - min || 1;
  const pts = data.map((v, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((v - min) / range) * (height - 4) - 2;
    return [x, y];
  });
  const path = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(" ");
  const areaPath = `${path} L${width},${height} L0,${height} Z`;
  const isDown = action === "SELL" || data[data.length - 1] < data[0];
  const gradId = `g-${Math.random().toString(36).slice(2, 8)}`;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="spark-svg" preserveAspectRatio="none">
      <defs>
        <linearGradient id={gradId} x1="0" x2="0" y1="0" y2="1">
          <stop offset="0%" stopColor={isDown ? "#f87171" : "#34d399"} stopOpacity="0.25" />
          <stop offset="100%" stopColor={isDown ? "#f87171" : "#34d399"} stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} />
      <path d={path} className={`spark-path ${isDown ? "spark-sell" : "spark-buy"}`} />
    </svg>
  );
}

// ----- Confidence ring -----
function ConfRing({ value, size = 38, strokeColor }) {
  const r = (size - 4) / 2 - 2;
  const c = 2 * Math.PI * r;
  const offset = c - (value / 100) * c;
  return (
    <div className="conf-ring" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${size} ${size}`}>
        <circle cx={size / 2} cy={size / 2} r={r} className="track" />
        <circle
          cx={size / 2} cy={size / 2} r={r}
          className="fill"
          style={{ stroke: strokeColor || "var(--brand)" }}
          strokeDasharray={c}
          strokeDashoffset={offset}
        />
      </svg>
      <div className="pct">{value}</div>
    </div>
  );
}

// ----- Big chart (for detail) -----
function BigChart({ data, action }) {
  const ref = useRef(null);
  const [size, setSize] = useState({ w: 800, h: 200 });
  useEffect(() => {
    if (!ref.current) return;
    const o = new ResizeObserver(entries => {
      for (const e of entries) {
        setSize({ w: e.contentRect.width, h: e.contentRect.height });
      }
    });
    o.observe(ref.current);
    return () => o.disconnect();
  }, []);

  if (!data?.length) return <div ref={ref} style={{ width: "100%", height: "100%" }} />;

  // Extend the sparkline with smoother interpolated data
  const extended = [];
  for (let i = 0; i < data.length - 1; i++) {
    extended.push(data[i]);
    for (let j = 1; j <= 4; j++) {
      const t = j / 5;
      extended.push(data[i] * (1 - t) + data[i + 1] * t + (Math.random() - 0.5) * (Math.abs(data[i + 1] - data[i]) * 0.15));
    }
  }
  extended.push(data[data.length - 1]);

  const min = Math.min(...extended);
  const max = Math.max(...extended);
  const range = max - min || 1;
  const pad = 20;
  const w = size.w;
  const h = size.h;
  const pts = extended.map((v, i) => {
    const x = pad + (i / (extended.length - 1)) * (w - 2 * pad);
    const y = pad + (h - 2 * pad) - ((v - min) / range) * (h - 2 * pad);
    return [x, y];
  });
  const path = pts.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(" ");
  const areaPath = `${path} L${w - pad},${h - pad} L${pad},${h - pad} Z`;
  const isDown = action === "SELL";
  const stroke = isDown ? "#f87171" : "#34d399";

  return (
    <div ref={ref} style={{ width: "100%", height: "100%", position: "relative" }}>
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: "100%", height: "100%" }} preserveAspectRatio="none">
        <defs>
          <linearGradient id="bigGrad" x1="0" x2="0" y1="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity="0.25" />
            <stop offset="100%" stopColor={stroke} stopOpacity="0" />
          </linearGradient>
        </defs>
        {/* horizontal grid lines */}
        {[0.25, 0.5, 0.75].map((t, i) => (
          <line key={i} x1={pad} y1={pad + t * (h - 2 * pad)} x2={w - pad} y2={pad + t * (h - 2 * pad)}
            stroke="#1d1d2a" strokeWidth="0.5" strokeDasharray="2,4" />
        ))}
        <path d={areaPath} fill="url(#bigGrad)" />
        <path d={path} fill="none" stroke={stroke} strokeWidth="1.75" strokeLinejoin="round" />
        <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="3" fill={stroke} />
        <circle cx={pts[pts.length - 1][0]} cy={pts[pts.length - 1][1]} r="6" fill={stroke} opacity="0.25" />
      </svg>
    </div>
  );
}

// ----- Target ladder -----
function TargetLadder({ rec }) {
  // For BUY: SL ... entry ... T1 ... T2 ... T3
  // For SELL (short): T3 ... T2 ... T1 ... entry ... SL (inverted)
  const isShort = rec.direction === "SHORT" || rec.action === "SELL";
  const entry = (rec.entry.low + rec.entry.high) / 2;
  const { stopLoss, targets, price } = rec;

  // For visualization: build range from SL to furthest target
  const allLevels = [stopLoss, entry, ...targets, price];
  const min = Math.min(...allLevels);
  const max = Math.max(...allLevels);
  const range = max - min || 1;
  const xPos = (v) => ((v - min) / range) * 100;

  // For SELL (short), the "progress" goes from entry DOWN to targets (so visual fill is from right to left)
  // We'll keep markers in true position but show context

  return (
    <div className="ladder-track" style={{ position: "relative", margin: "12px 6px 24px" }}>
      {/* Filled track between SL and current price */}
      {!isShort && (
        <div className="ladder-fill" style={{ left: `${xPos(rec.stopLoss)}%`, width: `${xPos(rec.price) - xPos(rec.stopLoss)}%` }} />
      )}
      {isShort && (
        <div className="ladder-fill" style={{ left: `${xPos(rec.price)}%`, width: `${xPos(rec.stopLoss) - xPos(rec.price)}%` }} />
      )}
      {/* Stop loss */}
      <div className="ladder-mark sl" style={{ left: `${xPos(stopLoss)}%` }} title={`SL ${stopLoss}`} />
      <div className="ladder-mark-label" style={{ left: `${xPos(stopLoss)}%` }}>SL</div>
      {/* Entry */}
      <div className="ladder-mark" style={{ left: `${xPos(entry)}%` }} title={`Entry ${entry}`} />
      <div className="ladder-mark-label" style={{ left: `${xPos(entry)}%` }}>Entry</div>
      {/* Targets */}
      {targets.map((t, i) => (
        <React.Fragment key={i}>
          <div className={`ladder-mark target ${i === 0 ? "t1" : ""}`} style={{ left: `${xPos(t)}%` }} title={`T${i + 1} ${t}`} />
          <div className="ladder-mark-label" style={{ left: `${xPos(t)}%` }}>T{i + 1}</div>
        </React.Fragment>
      ))}
      {/* Now */}
      <div className="ladder-mark now" style={{ left: `${xPos(price)}%` }} title={`Now ${price}`} />
    </div>
  );
}

// ----- Recommendation card -----
function RecCard({ rec, onClick, compact = false }) {
  const actionCls = rec.action.toLowerCase();
  const upClass = rec.change >= 0 ? "up" : "dn";
  const isShort = rec.direction === "SHORT";

  return (
    <div className={`rec-card ${actionCls}`} onClick={onClick}>
      <div className="rec-head">
        <div className="rec-ident">
          <div className={`rec-logo ${rec.market.toLowerCase()}`}>{rec.symbol.slice(0, 3)}</div>
          <div style={{ minWidth: 0 }}>
            <div className="rec-symbol">
              {rec.symbol}
              <span className="rec-exchange">{rec.exchange}</span>
            </div>
            <div className="rec-name">{rec.name}</div>
          </div>
        </div>
        <div className={`action-badge ${actionCls}`}>
          {rec.action}
          {isShort && <span className="short-tag">SHORT</span>}
        </div>
      </div>

      <div className="rec-price-row">
        <div className="rec-price">{fmtPrice(rec.price, rec.currency)}</div>
        <div className={`rec-change ${upClass}`}>{fmtChange(rec.change)}</div>
        <div className="rec-spark">
          <Sparkline data={rec.sparkline} action={rec.action} />
        </div>
      </div>

      <div className="targets-block">
        <div className="targets-grid">
          <div className="target-cell sl">
            <div className="tl">SL</div>
            <div className="tv">{fmtPrice(rec.stopLoss, rec.currency)}</div>
          </div>
          <div className="target-cell entry">
            <div className="tl">ENTRY</div>
            <div className="tv mono">{rec.currency}{rec.entry.low}–{rec.entry.high}</div>
          </div>
          {rec.targets.slice(0, 3).map((t, i) => (
            <div className={`target-cell t${i + 1}`} key={i}>
              <div className="tl">T{i + 1}</div>
              <div className="tv">{fmtPrice(t, rec.currency)}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="rec-foot">
        <div className="conf-block">
          <ConfRing value={rec.confidence} />
          <div className="conf-label">
            Confidence
            <strong>{rec.horizon}</strong>
          </div>
        </div>
        <div className="rec-meta-tags">
          <span className={`risk-chip risk-${rec.risk.replace(" ", "-")}`}>{rec.risk}</span>
          <span className="rr-chip">{rec.rr}:1 R/R</span>
        </div>
      </div>
    </div>
  );
}

// ----- Watchlist item -----
function WatchlistItem({ rec, onClick }) {
  const ch = rec.change >= 0 ? "up" : "dn";
  return (
    <div className="wl-item" onClick={onClick}>
      <div className="wl-info">
        <div className={`wl-mini-logo ${rec.market.toLowerCase()}`} style={{
          background: rec.market === "CRYPTO" ? "#f7931a22" : rec.market === "US" ? "#4480ff22" : "#d4a04a22",
          color: rec.market === "CRYPTO" ? "#f7931a" : rec.market === "US" ? "#6fa0ff" : "var(--brand)"
        }}>{rec.symbol.slice(0, 2)}</div>
        <div style={{ minWidth: 0 }}>
          <div className="wl-sym">{rec.symbol}</div>
          <div className="wl-name">{rec.name}</div>
        </div>
      </div>
      <div className="wl-price-block">
        <div className="wl-price">{fmtPrice(rec.price, rec.currency)}</div>
        <div className={`wl-change ${ch}`}>{fmtChange(rec.change)}</div>
      </div>
    </div>
  );
}

// expose
Object.assign(window, {
  fmtPrice, fmtChange, pctFromCurrent, marketLabel,
  Sparkline, ConfRing, BigChart, TargetLadder, RecCard, WatchlistItem
});
