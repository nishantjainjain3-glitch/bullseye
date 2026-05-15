/* global React, ReactDOM */
/* global HomeScreen, DetailPanel, WatchlistScreen, PortfolioScreen, ScreenerScreen, AlertsScreen, NewsScreen, SettingsScreen, OnboardingScreen */
/* global TweaksPanel, TweakSection, TweakRadio, TweakColor, TweakToggle, TweakSelect, useTweaks */

const { useState, useEffect } = React;

const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accent": "#d4a04a",
  "theme": "dark",
  "density": "comfortable",
  "headlineFont": "Instrument Serif",
  "showOnboarding": false
}/*EDITMODE-END*/;

const ACCENT_OPTIONS = ["#d4a04a", "#34d399", "#6fa0ff", "#f87171", "#c084fc"];
const FONT_OPTIONS = ["Instrument Serif", "Manrope", "Space Grotesk"];

function App() {
  const [tab, setTab] = useState("home");
  const [detail, setDetail] = useState(null);
  const [t, setTweak] = useTweaks(TWEAK_DEFAULTS);

  // Apply tweaks live via CSS vars
  useEffect(() => {
    document.documentElement.style.setProperty("--brand", t.accent);
    document.documentElement.style.setProperty("--brand-w", t.accent + "22");
    document.documentElement.style.setProperty("--brand-d", t.accent + "14");

    if (t.theme === "light") {
      document.documentElement.style.setProperty("--bg", "#f7f6f1");
      document.documentElement.style.setProperty("--bg-soft", "#efede7");
      document.documentElement.style.setProperty("--surface", "#ffffff");
      document.documentElement.style.setProperty("--surface-2", "#f1efe8");
      document.documentElement.style.setProperty("--surface-3", "#e6e3da");
      document.documentElement.style.setProperty("--border", "#e6e3da");
      document.documentElement.style.setProperty("--border-2", "#d4d0c4");
      document.documentElement.style.setProperty("--border-3", "#b8b3a3");
      document.documentElement.style.setProperty("--t-1", "#1a1814");
      document.documentElement.style.setProperty("--t-2", "#5a564e");
      document.documentElement.style.setProperty("--t-3", "#8a8578");
      document.documentElement.style.setProperty("--t-4", "#b8b3a3");
    } else {
      document.documentElement.style.removeProperty("--bg");
      document.documentElement.style.removeProperty("--bg-soft");
      document.documentElement.style.removeProperty("--surface");
      document.documentElement.style.removeProperty("--surface-2");
      document.documentElement.style.removeProperty("--surface-3");
      document.documentElement.style.removeProperty("--border");
      document.documentElement.style.removeProperty("--border-2");
      document.documentElement.style.removeProperty("--border-3");
      document.documentElement.style.removeProperty("--t-1");
      document.documentElement.style.removeProperty("--t-2");
      document.documentElement.style.removeProperty("--t-3");
      document.documentElement.style.removeProperty("--t-4");
    }

    if (t.headlineFont === "Manrope") {
      document.documentElement.style.setProperty("--font-serif", '"Manrope", sans-serif');
    } else if (t.headlineFont === "Space Grotesk") {
      document.documentElement.style.setProperty("--font-serif", '"Space Grotesk", sans-serif');
    } else {
      document.documentElement.style.setProperty("--font-serif", '"Instrument Serif", serif');
    }
  }, [t.accent, t.theme, t.headlineFont]);

  // Esc closes detail
  useEffect(() => {
    const fn = (e) => { if (e.key === "Escape") setDetail(null); };
    window.addEventListener("keydown", fn);
    return () => window.removeEventListener("keydown", fn);
  }, []);

  // Track which tab when detail opens — passed to all screens
  const openDetail = (rec) => setDetail(rec);

  return (
    <React.Fragment>
      {t.showOnboarding && (
        <OnboardingScreen onContinue={() => setTweak("showOnboarding", false)} />
      )}

      {!t.showOnboarding && (
        <React.Fragment>
          <nav className="topnav">
            <div className="brand-mark">
              <div className="bull"></div>
              <span>BULL<em>seye</em></span>
            </div>
            <div className="navtabs">
              <button className={`navtab ${tab === "home" ? "active" : ""}`} onClick={() => setTab("home")}>Picks</button>
              <button className={`navtab ${tab === "screener" ? "active" : ""}`} onClick={() => setTab("screener")}>Screener</button>
              <button className={`navtab ${tab === "watchlist" ? "active" : ""}`} onClick={() => setTab("watchlist")}>Watchlist</button>
              <button className={`navtab ${tab === "portfolio" ? "active" : ""}`} onClick={() => setTab("portfolio")}>Portfolio</button>
              <button className={`navtab ${tab === "alerts" ? "active" : ""}`} onClick={() => setTab("alerts")}>
                Alerts
                <span className="dot-new"></span>
              </button>
              <button className={`navtab ${tab === "news" ? "active" : ""}`} onClick={() => setTab("news")}>News</button>
              <button className={`navtab ${tab === "settings" ? "active" : ""}`} onClick={() => setTab("settings")}>Profile</button>
            </div>
            <div className="navright">
              <div className="search-mini" onClick={() => alert("Search opens here")}>
                <span>🔍</span>
                <span>Search any stock or crypto…</span>
                <span className="kbd">⌘K</span>
              </div>
              <div className="market-pill">
                <span className="live-dot"></span>
                NSE OPEN · 13:42 IST
              </div>
              <div className="avatar">A</div>
            </div>
          </nav>

          <div className="page">
            {tab === "home" && <HomeScreen onOpenDetail={openDetail} />}
            {tab === "screener" && <ScreenerScreen onOpenDetail={openDetail} />}
            {tab === "watchlist" && <WatchlistScreen onOpenDetail={openDetail} />}
            {tab === "portfolio" && <PortfolioScreen onOpenDetail={openDetail} />}
            {tab === "alerts" && <AlertsScreen onOpenDetail={openDetail} />}
            {tab === "news" && <NewsScreen />}
            {tab === "settings" && <SettingsScreen />}
          </div>

          {detail && <DetailPanel rec={detail} onClose={() => setDetail(null)} />}
        </React.Fragment>
      )}

      <TweaksPanel title="Tweaks">
        <TweakSection title="Style">
          <TweakColor
            label="Brand accent"
            value={t.accent}
            options={ACCENT_OPTIONS}
            onChange={v => setTweak("accent", v)}
          />
          <TweakRadio
            label="Theme"
            value={t.theme}
            options={[{ value: "dark", label: "Dark" }, { value: "light", label: "Light" }]}
            onChange={v => setTweak("theme", v)}
          />
          <TweakSelect
            label="Headline font"
            value={t.headlineFont}
            options={FONT_OPTIONS.map(f => ({ value: f, label: f }))}
            onChange={v => setTweak("headlineFont", v)}
          />
        </TweakSection>
        <TweakSection title="Demo">
          <TweakToggle
            label="Show onboarding screen"
            value={t.showOnboarding}
            onChange={v => setTweak("showOnboarding", v)}
          />
        </TweakSection>
      </TweaksPanel>
    </React.Fragment>
  );
}

ReactDOM.createRoot(document.getElementById("root")).render(<App />);
