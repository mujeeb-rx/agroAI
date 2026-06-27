import { makeStyles } from "../theme.js";
import { t, tn } from "../translations.js";

const MOD_KEYS = [
  { key: "disease",        icon: "🔬", color: "#4caf50", badge: "AI Vision" },
  { key: "weather",        icon: "🌦️", color: "#42a5f5", badge: "Live Data" },
  { key: "yield",          icon: "📈", color: "#ab47bc", badge: "AI Model" },
  { key: "recommend",      icon: "🌱", color: "#26a69a", badge: "Smart" },
  { key: "irrigation",     icon: "💧", color: "#29b6f6", badge: "Efficient" },
  { key: "market",         icon: "💰", color: "#ffa726", badge: "Real-time" },
  { key: "chat",           icon: "🤖", color: "#ef5350", badge: "24/7" },
  { key: "calendar",       icon: "📋", color: "#8d6e63", badge: "Planner" },
  { key: "monitor",        icon: "🌿", color: "#66bb6a", badge: "Monitor" },
  { key: "sustainability", icon: "♻️", color: "#26a69a", badge: "Green" },
  { key: "history",        icon: "📁", color: "#78909c", badge: "Stored" },
];

export default function Dashboard({ setPage, bg, dark, lang }) {
  const s = makeStyles(bg);
  const farmerName = localStorage.getItem("agroai_farmer_name") || "Farmer";
  const hour = new Date().getHours();
  const greetingKey = hour < 12 ? "goodMorning" : hour < 17 ? "goodAfternoon" : "goodEvening";

  const STATS = [
    { icon: "🔬", labelKey: "disScans", value: () => {
      const h = JSON.parse(localStorage.getItem("agroai_history") || "[]");
      return h.length.toString();
    }},
    { icon: "🌾", labelKey: "cropsMonitored", value: () => "8" },
    { icon: "💬", labelKey: "aiQueries", value: () => {
      const q = parseInt(localStorage.getItem("agroai_query_count") || "0");
      return q.toString();
    }},
    { icon: "📅", labelKey: "daysActive", value: () => {
      const start = localStorage.getItem("agroai_start_date");
      if (!start) {
        localStorage.setItem("agroai_start_date", Date.now().toString());
        return "1";
      }
      return Math.max(1, Math.ceil((Date.now() - parseInt(start)) / 86400000)).toString();
    }},
  ];

  const tips = [
    { icon: "☀️", key: "tip1" },
    { icon: "💧", key: "tip2" },
    { icon: "🌿", key: "tip3" },
    { icon: "📊", key: "tip4" },
  ];

  return (
    <div style={s.section}>
      {/* Welcome Banner */}
      <div style={{
        background: `linear-gradient(135deg,${dark ? "#0d3320" : "#e8f5e9"},${dark ? "#0a1a0f" : "#f0f7f1"})`,
        border: `1px solid ${bg.border}`,
        borderRadius: 20,
        padding: "2rem",
        marginBottom: 28,
        position: "relative",
        overflow: "hidden",
        animation: "fadeIn 0.5s ease-out",
      }}>
        <div style={{ position: "absolute", right: 24, top: 0, fontSize: 100, opacity: 0.08, lineHeight: 1 }}>🌾</div>
        <div style={{ ...s.tag, marginBottom: 12 }}>{t(lang, "dashboard", "aiPowered")}</div>
        <h1 style={{
          fontSize: "clamp(1.6rem,4vw,2.4rem)",
          fontWeight: 900,
          background: dark ? "linear-gradient(135deg,#81c784,#4caf50,#a5d6a7)" : "linear-gradient(135deg,#1b5e20,#2e7d32)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          marginBottom: 8,
          letterSpacing: -1,
        }}>
          {t(lang, "dashboard", greetingKey)}, {farmerName}! 👋
        </h1>
        <p style={{ color: bg.muted, fontSize: 15, lineHeight: 1.6, maxWidth: 560 }}>
          {t(lang, "dashboard", "subtitle")}
        </p>
        <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
          <button style={s.btn("primary")} onClick={() => setPage("disease")}>🔬 {t(lang, "common", "detect")}</button>
          <button style={{ ...s.btn("outline") }} onClick={() => setPage("chat")}>🤖 {t(lang, "common", "askAI")}</button>
          <button style={{ ...s.btn("outline") }} onClick={() => setPage("yield")}>📈 {t(lang, "common", "predictYield")}</button>
        </div>
      </div>

      {/* Stats Row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(140px,1fr))", gap: 14, marginBottom: 28 }}>
        {STATS.map((stat) => (
          <div key={stat.labelKey} style={{
            ...s.glassCard,
            textAlign: "center",
            animation: "countUp 0.5s ease-out",
            padding: "1.2rem",
          }}>
            <div style={{ fontSize: 28, marginBottom: 6 }}>{stat.icon}</div>
            <div style={{ fontSize: 26, fontWeight: 900, color: bg.accent, lineHeight: 1 }}>{stat.value()}</div>
            <div style={{ fontSize: 11, color: bg.muted, marginTop: 4, fontWeight: 600 }}>{t(lang, "dashboard", stat.labelKey)}</div>
          </div>
        ))}
      </div>

      {/* Module Cards Grid */}
      <h2 style={{ fontSize: 18, fontWeight: 800, color: bg.text, marginBottom: 18, letterSpacing: -0.3 }}>
        {t(lang, "dashboard", "allFeatures")}
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(240px,1fr))", gap: 18 }}>
        {MOD_KEYS.map((mod, i) => (
          <div
            key={mod.key}
            onClick={() => setPage(mod.key)}
            style={{
              ...s.glassCard,
              cursor: "pointer",
              position: "relative",
              overflow: "hidden",
              animation: `fadeIn ${0.3 + i * 0.05}s ease-out`,
              borderTop: `3px solid ${mod.color}`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-6px)";
              e.currentTarget.style.boxShadow = `0 16px 40px ${dark ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.1)"}`;
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "";
            }}
          >
            <div style={{ position: "absolute", top: 12, right: 14 }}>
              <span style={{
                fontSize: 10, fontWeight: 700, color: mod.color,
                background: `${mod.color}20`, borderRadius: 10,
                padding: "2px 8px", border: `1px solid ${mod.color}40`,
              }}>{mod.badge}</span>
            </div>
            <div style={{ fontSize: 36, marginBottom: 12 }}>{mod.icon}</div>
            <h3 style={{ fontSize: 15, fontWeight: 700, color: bg.text, marginBottom: 6 }}>
              {tn(lang, "dashboard", "modTitles", mod.key)}
            </h3>
            <p style={{ fontSize: 13, color: bg.muted, lineHeight: 1.5 }}>
              {tn(lang, "dashboard", "modDescs", mod.key)}
            </p>
            <div style={{ marginTop: 14, color: mod.color, fontSize: 12, fontWeight: 700 }}>{t(lang, "common", "open")}</div>
          </div>
        ))}
      </div>

      {/* Quick Tips */}
      <div style={{ ...s.glassCard, marginTop: 28, borderLeft: `4px solid ${bg.accent}` }}>
        <div style={{ fontSize: 14, fontWeight: 700, color: bg.accent, marginBottom: 12 }}>{t(lang, "dashboard", "todaysTips")}</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 12 }}>
          {tips.map((tip) => (
            <div key={tip.key} style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
              <span style={{ fontSize: 20, flexShrink: 0 }}>{tip.icon}</span>
              <span style={{ fontSize: 13, color: bg.muted, lineHeight: 1.5 }}>{t(lang, "dashboard", tip.key)}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
