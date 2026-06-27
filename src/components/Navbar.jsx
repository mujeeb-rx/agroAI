import { langLabels } from "../theme.js";

export default function Navbar({ page, setPage, dark, setDark, bg, lang, changeLang, sidebarWidth }) {
  return (
    <header
      style={{
        position: "fixed",
        top: 0,
        left: sidebarWidth,
        right: 0,
        height: 64,
        zIndex: 100,
        background: dark ? "rgba(10,26,15,0.95)" : "rgba(255,255,255,0.95)",
        backdropFilter: "blur(16px)",
        borderBottom: `1px solid ${bg.border}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 1.5rem",
        gap: 12,
        transition: "left 0.3s cubic-bezier(0.4,0,0.2,1)",
      }}
    >
      {/* Page title breadcrumb */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <div style={{ fontSize: 13, color: bg.muted, fontWeight: 600 }}>
          🌿 AgroAI
        </div>
        <span style={{ color: bg.border, fontSize: 16 }}>/</span>
        <div style={{ fontSize: 14, color: bg.text, fontWeight: 700, textTransform: "capitalize" }}>
          {page.replace(/([A-Z])/g, ' $1')}
        </div>
      </div>

      {/* Right controls */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
        {/* Language selector */}
        <div style={{
          display: "flex",
          alignItems: "center",
          gap: 4,
          background: dark ? "rgba(76,175,80,0.12)" : "rgba(46,125,50,0.08)",
          border: `1px solid ${bg.accent}`,
          borderRadius: 20,
          padding: "4px 10px 4px 8px",
        }}>
          <span style={{ fontSize: 13 }}>🌐</span>
          <select
            value={lang}
            onChange={(e) => changeLang(e.target.value)}
            style={{
              background: "transparent",
              border: "none",
              color: bg.accent,
              fontSize: 12,
              fontWeight: 700,
              cursor: "pointer",
              outline: "none",
              fontFamily: "inherit",
              maxWidth: 110,
            }}
          >
            <option value="en">🇬🇧 English</option>
            <option value="ta">🇮🇳 தமிழ்</option>
            <option value="hi">🇮🇳 हिंदी</option>
            <option value="te">🇮🇳 తెలుగు</option>
            <option value="kn">🇮🇳 ಕನ್ನಡ</option>
            <option value="mr">🇮🇳 मराठी</option>
            <option value="bn">🇮🇳 বাংলা</option>
            <option value="ml">🇮🇳 മലയാളം</option>
          </select>
        </div>

        {/* Dark mode toggle */}
        <button
          onClick={() => setDark(!dark)}
          style={{
            background: dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)",
            border: `1px solid ${bg.border}`,
            borderRadius: 20,
            padding: "5px 12px",
            cursor: "pointer",
            fontSize: 14,
            color: bg.text,
            fontFamily: "inherit",
            transition: "all 0.2s",
          }}
          title={dark ? "Switch to Light Mode" : "Switch to Dark Mode"}
        >
          {dark ? "☀️ Light" : "🌙 Dark"}
        </button>
      </div>
    </header>
  );
}
