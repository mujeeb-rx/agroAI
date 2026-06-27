import { useState, useEffect } from "react";
import { getTheme, ANIMATIONS, SIDEBAR_ITEMS } from "./src/theme.js";
import { t } from "./src/translations.js";
import Sidebar from "./src/components/Sidebar.jsx";
import Navbar from "./src/components/Navbar.jsx";

// Pages
import Dashboard from "./src/pages/Dashboard.jsx";
import Chat from "./src/pages/Chat.jsx";
import Weather from "./src/pages/Weather.jsx";
import Disease from "./src/pages/Disease.jsx";
import YieldPrediction from "./src/pages/YieldPrediction.jsx";
import CropRecommend from "./src/pages/CropRecommend.jsx";
import Irrigation from "./src/pages/Irrigation.jsx";
import CropMonitor from "./src/pages/CropMonitor.jsx";
import MarketPrice from "./src/pages/MarketPrice.jsx";
import CropCalendar from "./src/pages/CropCalendar.jsx";
import History from "./src/pages/History.jsx";
import Sustainability from "./src/pages/Sustainability.jsx";
import Settings from "./src/pages/Settings.jsx";

// Mobile bottom nav items (most used)
const MOBILE_NAV = [
  { key: "dashboard",  icon: "🏡", label: "Home" },
  { key: "disease",    icon: "🔬", label: "Detect" },
  { key: "chat",       icon: "🤖", label: "AI Chat" },
  { key: "weather",    icon: "🌦️", label: "Weather" },
  { key: "market",     icon: "💰", label: "Market" },
];

export default function AgroAI() {
  const [lang, setLang] = useState(() => {
    const stored = localStorage.getItem("agroai_lang");
    if (stored) return stored;
    const m = document.cookie.match(/googtrans=\/en\/([a-z]+)/);
    return m ? m[1] : "en";
  });
  const [dark, setDark] = useState(true);
  const [page, setPage] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const bg = getTheme(dark);

  // Sync Google Translate on mount
  useEffect(() => {
    if (lang && lang !== "en" && window.agroaiSetLanguage) {
      window.agroaiSetLanguage(lang);
    }
  }, []);

  // Responsive detection
  useEffect(() => {
    function handleResize() {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (!mobile) setMobileMenuOpen(false);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close mobile menu on page change
  useEffect(() => { setMobileMenuOpen(false); }, [page]);

  function changeLang(newLang) {
    setLang(newLang);
    localStorage.setItem("agroai_lang", newLang);
    if (window.agroaiSetLanguage) {
      window.agroaiSetLanguage(newLang);
    }
  }

  const sidebarWidth = isMobile ? 0 : sidebarCollapsed ? 70 : 260;

  function renderPage() {
    const props = { bg, dark, lang, changeLang, setPage, setDark };
    switch (page) {
      case "dashboard":      return <Dashboard {...props} />;
      case "chat":           return <Chat {...props} />;
      case "weather":        return <Weather {...props} />;
      case "disease":        return <Disease {...props} />;
      case "yield":          return <YieldPrediction {...props} />;
      case "recommend":      return <CropRecommend {...props} />;
      case "irrigation":     return <Irrigation {...props} />;
      case "monitor":        return <CropMonitor {...props} />;
      case "market":         return <MarketPrice {...props} />;
      case "calendar":       return <CropCalendar {...props} />;
      case "history":        return <History {...props} />;
      case "sustainability": return <Sustainability {...props} />;
      case "settings":       return <Settings {...props} />;
      default:               return <Dashboard {...props} />;
    }
  }

  return (
    <div style={{
      fontFamily: "'Outfit','Segoe UI',sans-serif",
      minHeight: "100vh",
      background: bg.grad,
      color: bg.text,
      transition: "all 0.3s",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; height: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${bg.border}; border-radius: 3px; }
        select option { background: ${dark ? "#0f2318" : "#fff"}; color: ${bg.text}; }
        input[type="range"] { -webkit-appearance: none; height: 6px; border-radius: 3px; background: ${dark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}; }
        input[type="range"]::-webkit-slider-thumb { -webkit-appearance: none; width: 18px; height: 18px; border-radius: 50%; background: ${bg.accent}; cursor: pointer; box-shadow: 0 2px 6px rgba(0,0,0,0.3); }
        ${ANIMATIONS}
        .desktop-sidebar { display: flex !important; }
        @media (max-width: 767px) {
          .desktop-sidebar { display: none !important; }
        }
      `}</style>

      {/* Desktop Sidebar */}
      {!isMobile && (
        <Sidebar
          page={page}
          setPage={setPage}
          dark={dark}
          bg={bg}
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
          lang={lang}
        />
      )}

      {/* Mobile Sidebar Overlay */}
      {isMobile && mobileMenuOpen && (
        <>
          <div
            onClick={() => setMobileMenuOpen(false)}
            style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 299 }}
          />
          <div style={{
            position: "fixed", top: 0, left: 0, bottom: 0, width: 280,
            background: bg.sidebar, backdropFilter: "blur(20px)",
            borderRight: `1px solid ${bg.border}`, zIndex: 300,
            overflowY: "auto", animation: "slideInLeft 0.25s ease-out",
          }}>
            {/* Mobile sidebar header */}
            <div style={{ padding: "20px 20px 16px", borderBottom: `1px solid ${bg.border}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 24 }}>🌿</span>
                <div>
                  <div style={{ fontSize: 16, fontWeight: 900, color: bg.accent }}>AgroAI</div>
                  <div style={{ fontSize: 10, color: bg.muted }}>Smart Farming Platform</div>
                </div>
              </div>
              <button onClick={() => setMobileMenuOpen(false)} style={{ background: "none", border: "none", color: bg.muted, fontSize: 20, cursor: "pointer" }}>✕</button>
            </div>
            <nav style={{ padding: "12px 0" }}>
              {SIDEBAR_ITEMS.map((item) => {
                const isActive = page === item.key;
                return (
                  <button
                    key={item.key}
                    onClick={() => { setPage(item.key); setMobileMenuOpen(false); }}
                    style={{
                      display: "flex", alignItems: "center", gap: 12,
                      padding: "12px 20px", width: "100%",
                      background: isActive ? bg.navActive : "transparent",
                      border: "none", borderLeft: isActive ? `3px solid ${bg.accent}` : "3px solid transparent",
                      cursor: "pointer", color: isActive ? bg.accent : bg.muted,
                      fontSize: 14, fontWeight: isActive ? 700 : 500, fontFamily: "inherit",
                      transition: "all 0.2s", marginBottom: 2,
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{item.icon}</span>
                    <span>{t(lang, "nav", item.key)}</span>
                  </button>
                );
              })}
            </nav>
          </div>
        </>
      )}

      {/* Top Navbar */}
      <Navbar
        page={page}
        setPage={setPage}
        dark={dark}
        setDark={setDark}
        bg={bg}
        lang={lang}
        changeLang={changeLang}
        sidebarWidth={sidebarWidth}
      >
        {/* Mobile menu button — passed via children prop pattern via extra prop */}
      </Navbar>

      {/* Mobile hamburger button in navbar */}
      {isMobile && (
        <button
          onClick={() => setMobileMenuOpen(true)}
          style={{
            position: "fixed", top: 16, left: 16, zIndex: 150,
            background: bg.accent, border: "none", borderRadius: 12,
            width: 36, height: 36, cursor: "pointer", fontSize: 16,
            display: "flex", alignItems: "center", justifyContent: "center",
            boxShadow: `0 4px 14px rgba(76,175,80,0.4)`,
          }}
        >
          ☰
        </button>
      )}

      {/* Main content area */}
      <main style={{
        marginLeft: isMobile ? 0 : sidebarWidth,
        marginTop: 64,
        minHeight: "calc(100vh - 64px)",
        transition: "margin-left 0.3s cubic-bezier(0.4,0,0.2,1)",
        paddingBottom: isMobile ? 80 : 0,
      }}>
        {renderPage()}

        {/* Footer */}
        <footer style={{
          borderTop: `1px solid ${bg.border}`,
          padding: "2rem 1.5rem",
          textAlign: "center",
          color: bg.muted,
          fontSize: 13,
          marginTop: 16,
        }}>
          <div style={{ fontWeight: 700, fontSize: 16, color: bg.accent, marginBottom: 8 }}>{t(lang, "footer", "brand")}</div>
          <p>{t(lang, "footer", "powered")}</p>
          <p style={{ marginTop: 6 }}>{t(lang, "footer", "madeWith")} · {new Date().getFullYear()}</p>
        </footer>
      </main>

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <nav style={{
          position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 200,
          background: dark ? "rgba(8,20,12,0.97)" : "rgba(255,255,255,0.97)",
          backdropFilter: "blur(20px)",
          borderTop: `1px solid ${bg.border}`,
          display: "flex",
          padding: "8px 0 env(safe-area-inset-bottom,8px)",
        }}>
          {MOBILE_NAV.map((item) => {
            const isActive = page === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setPage(item.key)}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  gap: 3,
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  color: isActive ? bg.accent : bg.muted,
                  fontFamily: "inherit",
                  padding: "4px 0",
                  transition: "all 0.2s",
                }}
              >
                <span style={{ fontSize: 22, lineHeight: 1 }}>{item.icon}</span>
                <span style={{ fontSize: 9, fontWeight: isActive ? 800 : 500 }}>{item.label}</span>
                {isActive && (
                  <div style={{ width: 20, height: 2.5, background: bg.accent, borderRadius: 2, marginTop: 1 }} />
                )}
              </button>
            );
          })}
        </nav>
      )}

      {/* Floating AI Chat button (non-mobile, when not on chat page) */}
      {!isMobile && page !== "chat" && (
        <button
          onClick={() => setPage("chat")}
          style={{
            position: "fixed", bottom: 24, right: 24,
            width: 56, height: 56, borderRadius: "50%",
            background: `linear-gradient(135deg,${bg.accent},${bg.accentHover})`,
            border: "none", cursor: "pointer", fontSize: 24,
            boxShadow: `0 4px 20px rgba(76,175,80,0.4)`,
            zIndex: 150,
            display: "flex", alignItems: "center", justifyContent: "center",
            animation: "float 3s ease-in-out infinite",
          }}
          title="Open AI Assistant"
        >
          🤖
        </button>
      )}
    </div>
  );
}
