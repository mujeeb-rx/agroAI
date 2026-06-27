// ─── AgroAI Shared Design Tokens ──────────────────────────────────────────────

export function getTheme(dark) {
  return dark
    ? {
        bg: "#0a1a0f",
        card: "#0f2318",
        cardGlass: "rgba(15,35,24,0.85)",
        border: "#1a4028",
        text: "#e8f5e9",
        muted: "#81c784",
        accent: "#4caf50",
        accentHover: "#66bb6a",
        danger: "#ef5350",
        warning: "#ff9800",
        info: "#42a5f5",
        grad: "linear-gradient(135deg,#0a1a0f 0%,#0d2b19 50%,#0a1a0f 100%)",
        cardGrad: "linear-gradient(135deg,rgba(15,35,24,0.9),rgba(10,26,15,0.95))",
        sidebar: "rgba(8,20,12,0.97)",
        navActive: "rgba(76,175,80,0.15)",
        shadow: "0 8px 32px rgba(0,0,0,0.4)",
        shadowCard: "0 4px 16px rgba(0,0,0,0.3)",
        glass: "backdrop-filter:blur(20px)",
      }
    : {
        bg: "#f0f7f1",
        card: "#ffffff",
        cardGlass: "rgba(255,255,255,0.9)",
        border: "#c8e6c9",
        text: "#1b2e1c",
        muted: "#4a7c59",
        accent: "#2e7d32",
        accentHover: "#388e3c",
        danger: "#c62828",
        warning: "#e65100",
        info: "#1565c0",
        grad: "linear-gradient(135deg,#e8f5e9 0%,#f0f7f1 50%,#e8f5e9 100%)",
        cardGrad: "linear-gradient(135deg,rgba(255,255,255,0.95),rgba(240,247,241,0.98))",
        sidebar: "rgba(240,247,241,0.98)",
        navActive: "rgba(46,125,50,0.1)",
        shadow: "0 8px 32px rgba(0,0,0,0.08)",
        shadowCard: "0 4px 16px rgba(0,0,0,0.06)",
        glass: "backdrop-filter:blur(20px)",
      };
}

export const ANIMATIONS = `
  @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-10px)} }
  @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-8px)} }
  @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
  @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.6;transform:scale(1.2)} }
  @keyframes fadeIn { from{opacity:0;transform:translateY(16px)} to{opacity:1;transform:translateY(0)} }
  @keyframes slideInLeft { from{opacity:0;transform:translateX(-24px)} to{opacity:1;transform:translateX(0)} }
  @keyframes slideInRight { from{opacity:0;transform:translateX(24px)} to{opacity:1;transform:translateX(0)} }
  @keyframes shimmer { 0%{background-position:-200% 0} 100%{background-position:200% 0} }
  @keyframes fillBar { from{width:0} to{width:var(--target-width,100%)} }
  @keyframes countUp { from{opacity:0;transform:scale(0.7)} to{opacity:1;transform:scale(1)} }
  @keyframes growHeight { from{height:0} to{height:var(--target-height,100%)} }
  @keyframes glowPulse { 0%,100%{box-shadow:0 0 8px rgba(76,175,80,0.3)} 50%{box-shadow:0 0 24px rgba(76,175,80,0.7)} }
`;

export const SIDEBAR_ITEMS = [
  { key: "dashboard",      icon: "🏡", label: "Dashboard" },
  { key: "disease",        icon: "🔬", label: "Disease Detection" },
  { key: "chat",           icon: "🤖", label: "AI Assistant" },
  { key: "yield",          icon: "📈", label: "Yield Prediction" },
  { key: "recommend",      icon: "🌱", label: "Crop Recommendation" },
  { key: "weather",        icon: "🌦️", label: "Weather" },
  { key: "market",         icon: "💰", label: "Market Prices" },
  { key: "calendar",       icon: "📋", label: "Crop Calendar" },
  { key: "irrigation",     icon: "💧", label: "Smart Irrigation" },
  { key: "monitor",        icon: "🌿", label: "Crop Monitoring" },
  { key: "history",        icon: "📁", label: "History" },
  { key: "sustainability", icon: "♻️", label: "Sustainability" },
  { key: "settings",       icon: "⚙️", label: "Settings" },
];

export const langLabels = {
  en: "🇬🇧 English", ta: "🇮🇳 தமிழ்", hi: "🇮🇳 हिंदी",
  te: "🇮🇳 తెలుగు", kn: "🇮🇳 ಕನ್ನಡ", mr: "🇮🇳 मराठी",
  bn: "🇮🇳 বাংলা", ml: "🇮🇳 മലയാളം",
};

export const speechLangMap = {
  en: "en-IN", hi: "hi-IN", ta: "ta-IN", te: "te-IN",
  kn: "kn-IN", mr: "mr-IN", bn: "bn-IN", ml: "ml-IN",
};

export function makeStyles(bg) {
  return {
    section: { maxWidth: 1100, margin: "0 auto", padding: "2.5rem 1.5rem" },
    card: {
      background: bg.card,
      border: `1px solid ${bg.border}`,
      borderRadius: 18,
      padding: "1.5rem",
      transition: "all 0.3s",
    },
    glassCard: {
      background: bg.cardGlass,
      backdropFilter: "blur(16px)",
      border: `1px solid ${bg.border}`,
      borderRadius: 18,
      padding: "1.5rem",
      transition: "all 0.3s",
    },
    btn: (variant = "primary") => ({
      cursor: "pointer",
      fontFamily: "inherit",
      fontWeight: 600,
      fontSize: 14,
      borderRadius: 12,
      padding: "10px 22px",
      border: variant === "outline" ? `1.5px solid ${bg.accent}` : "none",
      background:
        variant === "primary"
          ? `linear-gradient(135deg,${bg.accent},${bg.accentHover})`
          : variant === "danger"
          ? "rgba(239,83,80,0.15)"
          : "transparent",
      color:
        variant === "primary"
          ? "#fff"
          : variant === "danger"
          ? bg.danger
          : bg.accent,
      transition: "all 0.2s",
      boxShadow: variant === "primary" ? `0 4px 14px rgba(76,175,80,0.3)` : "none",
    }),
    input: {
      width: "100%",
      background: bg.bg === "#0a1a0f" ? "rgba(255,255,255,0.05)" : "#f8faf8",
      border: `1px solid ${bg.border}`,
      borderRadius: 12,
      padding: "11px 14px",
      color: bg.text,
      fontFamily: "inherit",
      fontSize: 14,
      outline: "none",
      boxSizing: "border-box",
      transition: "border-color 0.2s",
    },
    select: {
      background: bg.bg === "#0a1a0f" ? "rgba(255,255,255,0.05)" : "#f8faf8",
      border: `1px solid ${bg.border}`,
      borderRadius: 12,
      padding: "11px 14px",
      color: bg.text,
      fontFamily: "inherit",
      fontSize: 14,
      outline: "none",
      width: "100%",
      cursor: "pointer",
    },
    tag: {
      display: "inline-block",
      background: bg.bg === "#0a1a0f" ? "rgba(76,175,80,0.15)" : "rgba(46,125,50,0.1)",
      color: bg.accent,
      borderRadius: 20,
      padding: "4px 12px",
      fontSize: 12,
      fontWeight: 600,
    },
    label: {
      display: "block",
      fontSize: 12,
      fontWeight: 700,
      marginBottom: 8,
      color: bg.muted,
      textTransform: "uppercase",
      letterSpacing: 0.6,
    },
    pageTitle: {
      fontSize: "clamp(1.4rem,3vw,2rem)",
      fontWeight: 800,
      marginBottom: 6,
      color: bg.text,
      letterSpacing: -0.5,
    },
    pageSub: {
      color: bg.muted,
      marginBottom: 28,
      fontSize: 14,
      lineHeight: 1.6,
    },
  };
}
