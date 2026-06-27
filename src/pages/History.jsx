import { useState, useEffect } from "react";
import { makeStyles } from "../theme.js";
import { t } from "../translations.js";

const SEVERITY_CONFIG = {
  None:     { color: "#4caf50", icon: "✅" },
  Low:      { color: "#8bc34a", icon: "🟡" },
  Medium:   { color: "#ff9800", icon: "🟠" },
  High:     { color: "#f44336", icon: "🔴" },
  Critical: { color: "#b71c1c", icon: "🚨" },
};

export default function History({ bg, dark, lang }) {
  const s = makeStyles(bg);
  const [history, setHistory] = useState([]);
  const [filter, setFilter] = useState("All");
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmClear, setConfirmClear] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  function loadHistory() {
    const data = JSON.parse(localStorage.getItem("agroai_history") || "[]");
    setHistory(data);
  }

  function clearHistory() {
    if (!confirmClear) { setConfirmClear(true); return; }
    localStorage.removeItem("agroai_history");
    setHistory([]);
    setConfirmClear(false);
  }

  function deleteRecord(id) {
    const updated = history.filter((h) => h.id !== id);
    localStorage.setItem("agroai_history", JSON.stringify(updated));
    setHistory(updated);
  }

  function downloadJSON() {
    const blob = new Blob([JSON.stringify(history, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `AgroAI_History_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function downloadHTMLReport() {
    const html = `<!DOCTYPE html>
<html>
<head>
  <title>AgroAI Scan History Report</title>
  <style>
    body{font-family:Arial,sans-serif;max-width:900px;margin:40px auto;color:#1b2e1c;padding:0 24px;}
    .logo{color:#2e7d32;font-size:24px;font-weight:900;}
    h1{color:#1b5e20;border-bottom:3px solid #2e7d32;padding-bottom:12px;}
    .record{border:1px solid #c8e6c9;border-radius:10px;padding:16px;margin:16px 0;background:#f9fbe7;}
    .tag{display:inline-block;background:#e8f5e9;color:#2e7d32;border-radius:12px;padding:3px 10px;font-size:11px;font-weight:700;margin:2px;}
    img{max-width:120px;height:80px;object-fit:cover;border-radius:8px;border:2px solid #a5d6a7;}
    .grid{display:grid;grid-template-columns:auto 1fr;gap:16px;align-items:start;}
    .disclaimer{font-size:11px;color:#999;margin-top:32px;border-top:1px solid #eee;padding-top:12px;}
  </style>
</head>
<body>
  <div class="logo">🌿 AgroAI Smart Farming Platform</div>
  <h1>Disease Scan History Report</h1>
  <p>Generated: ${new Date().toLocaleString()} | Total Records: ${history.length}</p>
  ${history.map((h, i) => `
  <div class="record">
    <div class="grid">
      ${h.image ? `<img src="${h.image}" alt="scan" />` : `<div style="width:120px;height:80px;background:#e8f5e9;border-radius:8px;display:flex;align-items:center;justify-content:center;font-size:36px;">🔬</div>`}
      <div>
        <h3 style="margin:0 0 8px;color:#1b5e20;">#${i+1} — ${h.disease || "Unknown Disease"}</h3>
        <span class="tag">📅 ${h.date}</span>
        ${h.severity ? `<span class="tag">⚠️ ${h.severity}</span>` : ""}
        ${h.confidence ? `<span class="tag">🤖 ${h.confidence} confidence</span>` : ""}
        ${h.crop && h.crop !== "Unknown" ? `<span class="tag">🌾 ${h.crop}</span>` : ""}
        ${h.prevention ? `<p style="margin-top:10px;font-size:13px;"><strong>Prevention:</strong> ${h.prevention}</p>` : ""}
      </div>
    </div>
  </div>`).join("")}
  <div class="disclaimer">⚠️ This report is AI-generated for informational purposes. Consult a certified agricultural expert before applying any treatment.</div>
</body>
</html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `AgroAI_Scan_History_${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const severities = ["All", "None", "Low", "Medium", "High", "Critical"];

  const filtered = history.filter((h) => {
    const matchFilter = filter === "All" || h.severity === filter;
    const matchSearch = !searchTerm || (h.disease || "").toLowerCase().includes(searchTerm.toLowerCase()) || (h.crop || "").toLowerCase().includes(searchTerm.toLowerCase());
    return matchFilter && matchSearch;
  });

  return (
    <div style={s.section}>
      <h2 style={s.pageTitle}>{t(lang, "history", "title")}</h2>
      <p style={s.pageSub}>{t(lang, "history", "subtitle")}</p>

      {/* Stats row */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(120px,1fr))", gap: 12, marginBottom: 24 }}>
        {[
          { icon: "🔬", label: "Total Scans", value: history.length },
          { icon: "🔴", label: "High Risk", value: history.filter(h => h.severity === "High" || h.severity === "Critical").length },
          { icon: "✅", label: "Healthy", value: history.filter(h => h.severity === "None").length },
          { icon: "🟠", label: "Medium Risk", value: history.filter(h => h.severity === "Medium").length },
        ].map((stat) => (
          <div key={stat.label} style={{ ...s.glassCard, textAlign: "center", padding: "1rem" }}>
            <div style={{ fontSize: 26, marginBottom: 4 }}>{stat.icon}</div>
            <div style={{ fontSize: 22, fontWeight: 900, color: bg.accent }}>{stat.value}</div>
            <div style={{ fontSize: 10, color: bg.muted, fontWeight: 700 }}>{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Controls */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, flexWrap: "wrap", alignItems: "center" }}>
        <input
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="🔍 Search disease or crop..."
          style={{ ...s.input, flex: 1, minWidth: 200 }}
        />
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {severities.map((sev) => (
            <button key={sev} onClick={() => setFilter(sev)} style={{
              ...s.btn(filter === sev ? "primary" : "outline"),
              padding: "7px 14px", fontSize: 12,
            }}>{sev}</button>
          ))}
        </div>
      </div>

      {/* Action buttons */}
      <div style={{ display: "flex", gap: 10, marginBottom: 24, flexWrap: "wrap" }}>
        <button onClick={downloadHTMLReport} style={{ ...s.btn("outline"), display: "flex", alignItems: "center", gap: 6 }} disabled={history.length === 0}>
          📄 Download Report
        </button>
        <button onClick={downloadJSON} style={{ ...s.btn("outline"), display: "flex", alignItems: "center", gap: 6 }} disabled={history.length === 0}>
          💾 Export JSON
        </button>
        <button
          onClick={clearHistory}
          style={{ ...s.btn(confirmClear ? "danger" : "outline"), display: "flex", alignItems: "center", gap: 6 }}
          disabled={history.length === 0}
        >
          {confirmClear ? "⚠️ Confirm Clear All?" : "🗑️ Clear History"}
        </button>
        {confirmClear && (
          <button onClick={() => setConfirmClear(false)} style={{ ...s.btn("outline"), padding: "7px 14px" }}>Cancel</button>
        )}
      </div>

      {/* History list */}
      {filtered.length === 0 ? (
        <div style={{ textAlign: "center", padding: "4rem 2rem", color: bg.muted }}>
          <div style={{ fontSize: 72, marginBottom: 16, animation: "float 3s ease-in-out infinite", display: "inline-block" }}>📁</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8, color: bg.text }}>
            {history.length === 0 ? "No Scan History Yet" : "No Results Found"}
          </h3>
          <p style={{ fontSize: 14 }}>
            {history.length === 0
              ? "Go to Disease Detection, upload a crop photo, and save results here."
              : "Try adjusting your search or filter."}
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {filtered.map((record, i) => {
            const sev = SEVERITY_CONFIG[record.severity] || SEVERITY_CONFIG.Medium;
            return (
              <div key={record.id || i} style={{
                ...s.glassCard,
                borderLeft: `4px solid ${sev.color}`,
                animation: `fadeIn ${0.2 + i * 0.05}s ease-out`,
                display: "flex",
                gap: 16,
                alignItems: "flex-start",
                flexWrap: "wrap",
              }}>
                {/* Image thumbnail */}
                <div style={{ flexShrink: 0 }}>
                  {record.image ? (
                    <img src={record.image} alt="scan" style={{ width: 80, height: 80, objectFit: "cover", borderRadius: 12, border: `2px solid ${bg.border}` }} />
                  ) : (
                    <div style={{ width: 80, height: 80, background: dark ? "rgba(76,175,80,0.1)" : "rgba(46,125,50,0.08)", borderRadius: 12, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 36 }}>🔬</div>
                  )}
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8, flexWrap: "wrap" }}>
                    <div>
                      <h3 style={{ fontSize: 15, fontWeight: 800, color: sev.color, marginBottom: 4 }}>
                        {sev.icon} {record.disease || "Unknown Disease"}
                      </h3>
                      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 8 }}>
                        <span style={s.tag}>📅 {record.date}</span>
                        {record.crop && record.crop !== "Unknown" && <span style={s.tag}>🌾 {record.crop}</span>}
                        {record.severity && <span style={{ ...s.tag, color: sev.color, background: `${sev.color}20` }}>⚠️ {record.severity}</span>}
                        {record.confidence && <span style={s.tag}>🤖 {record.confidence}</span>}
                      </div>
                    </div>
                    <button onClick={() => deleteRecord(record.id)} style={{
                      background: "none", border: "none", cursor: "pointer", color: bg.muted, fontSize: 16, padding: 4,
                      flexShrink: 0,
                    }} title="Delete this record">🗑️</button>
                  </div>
                  {record.prevention && (
                    <p style={{ fontSize: 12, color: bg.muted, lineHeight: 1.5 }}>
                      🛡️ {record.prevention.slice(0, 120)}{record.prevention.length > 120 ? "..." : ""}
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
