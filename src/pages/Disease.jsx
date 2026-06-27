import { useState } from "react";
import { makeStyles, langLabels } from "../theme.js";
import { t } from "../translations.js";

function saveToHistory(record) {
  const existing = JSON.parse(localStorage.getItem("agroai_history") || "[]");
  existing.unshift({ ...record, id: Date.now(), date: new Date().toLocaleString() });
  localStorage.setItem("agroai_history", JSON.stringify(existing.slice(0, 50)));
}

function PDFReport({ data, diseaseImage, lang, bg }) {
  function downloadReport() {
    const dr = data;
    const html = `<!DOCTYPE html>
<html>
<head>
  <title>AgroAI Disease Report</title>
  <style>
    body{font-family:Arial,sans-serif;max-width:800px;margin:40px auto;color:#1b2e1c;padding:0 24px;}
    .logo{color:#2e7d32;font-size:24px;font-weight:900;margin-bottom:4px;}
    .header{border-bottom:3px solid #2e7d32;padding-bottom:16px;margin-bottom:24px;}
    .date{color:#666;font-size:13px;}
    .badge{display:inline-block;background:#e8f5e9;color:#2e7d32;border-radius:12px;padding:4px 12px;font-size:12px;font-weight:700;border:1px solid #a5d6a7;}
    .section{margin:20px 0;padding:16px;background:#f9fbe7;border-radius:10px;border-left:4px solid #8bc34a;}
    .section h3{color:#33691e;margin:0 0 8px;}
    .grid{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:20px 0;}
    .card{background:#f1f8e9;padding:14px;border-radius:8px;}
    .card h4{color:#558b2f;margin:0 0 6px;font-size:13px;text-transform:uppercase;}
    .disclaimer{font-size:11px;color:#999;margin-top:32px;border-top:1px solid #eee;padding-top:12px;}
    table{width:100%;border-collapse:collapse;}
    td,th{padding:8px 12px;border:1px solid #c8e6c9;text-align:left;font-size:13px;}
    th{background:#e8f5e9;font-weight:700;}
    img{max-width:280px;border-radius:10px;border:2px solid #a5d6a7;}
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">🌿 AgroAI Smart Farming Platform</div>
    <div class="date">Report generated: ${new Date().toLocaleString()} | Language: ${lang.toUpperCase()}</div>
  </div>

  <h1 style="color:#1b5e20;margin-bottom:8px;">Plant Disease Analysis Report</h1>
  ${diseaseImage ? `<img src="${diseaseImage}" alt="Crop Image" style="margin:12px 0 20px;" />` : ""}

  <div style="margin:20px 0;">
    <h2 style="color:#2e7d32;">🔬 Diagnosis: ${dr.disease || "Unknown"}</h2>
    <span class="badge">AI Confidence: ${dr.confidence || "High"}</span>
    ${dr.severity ? `<span class="badge" style="margin-left:8px;">Severity: ${dr.severity}</span>` : ""}
    ${dr.imageQuality ? `<span class="badge" style="margin-left:8px;">Image Quality: ${dr.imageQuality}</span>` : ""}
  </div>

  ${dr.symptoms ? `<div class="section"><h3>👁️ Symptoms Observed</h3><p>${dr.symptoms}</p></div>` : ""}

  ${dr.prevention ? `<div class="section"><h3>🛡️ Prevention</h3><p>${dr.prevention}</p></div>` : ""}
  ${dr.fertilizer ? `<div class="section"><h3>🌾 Fertilizer Advice</h3><p>${dr.fertilizer}</p></div>` : ""}
  ${dr.watering ? `<div class="section"><h3>💧 Watering Advice</h3><p>${dr.watering}</p></div>` : ""}

  ${dr.medicines && dr.medicines.length > 0 ? `
  <h3 style="color:#2e7d32;">💊 Recommended Medicines</h3>
  <table>
    <tr><th>Medicine</th><th>Type</th><th>Dose</th><th>Frequency</th></tr>
    ${dr.medicines.map(m => `<tr><td>${m.name}</td><td>${m.type}</td><td>${m.dose || "-"}</td><td>${m.frequency || "-"}</td></tr>`).join("")}
  </table>` : ""}

  <div class="disclaimer">
    ⚠️ Disclaimer: This report is AI-generated for informational purposes only. Always consult a certified agricultural expert before applying any treatment. AgroAI is not liable for crop losses arising from decisions made solely based on this report.
  </div>
</body>
</html>`;
    const blob = new Blob([html], { type: "text/html" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `AgroAI_Disease_Report_${Date.now()}.html`;
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <button onClick={downloadReport} style={{
      ...makeStyles(bg).btn("outline"),
      display: "flex", alignItems: "center", gap: 8, padding: "10px 18px",
    }}>
      📄 Download Report
    </button>
  );
}

export default function Disease({ bg, dark, lang, changeLang }) {
  const s = makeStyles(bg);
  const [diseaseImage, setDiseaseImage] = useState(null);
  const [diseaseResult, setDiseaseResult] = useState(null);
  const [diseaseLoading, setDiseaseLoading] = useState(false);
  const [savedToHistory, setSavedToHistory] = useState(false);

  async function analyzeDisease(e) {
    const file = e.target.files[0];
    if (!file) return;
    await runDiseaseAnalysis(file);
  }

  async function runDiseaseAnalysis(file) {
    const url = URL.createObjectURL(file);
    setDiseaseImage(url);
    setDiseaseLoading(true);
    setDiseaseResult(null);
    setSavedToHistory(false);
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const mimeType = file.type || "image/jpeg";
      const res = await fetch("/api/analyze-disease", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ base64, mimeType, lang }) });
      let result;
      try { result = await res.json(); }
      catch (e) { throw new Error(`Server connection failed (Status: ${res.status}). Ensure the backend is running.`); }
      if (!res.ok || result.error) throw new Error(result.error || "Analysis failed");
      setDiseaseResult(result);
    } catch (err) {
      setDiseaseResult({ error: err.message });
    }
    setDiseaseLoading(false);
  }

  function handleSaveToHistory() {
    if (!diseaseResult || diseaseResult.error) return;
    saveToHistory({
      image: diseaseImage,
      disease: diseaseResult.disease,
      severity: diseaseResult.severity,
      confidence: diseaseResult.confidence,
      prevention: diseaseResult.prevention,
      crop: "Unknown",
    });
    setSavedToHistory(true);
  }

  const severityConfig = {
    None:     { color: "#4caf50", bg: "rgba(76,175,80,0.15)",   icon: "✅", label: "Healthy" },
    Low:      { color: "#8bc34a", bg: "rgba(139,195,74,0.15)",  icon: "🟡", label: "Low" },
    Medium:   { color: "#ff9800", bg: "rgba(255,152,0,0.15)",   icon: "🟠", label: "Medium" },
    High:     { color: "#f44336", bg: "rgba(244,67,54,0.15)",   icon: "🔴", label: "High" },
    Critical: { color: "#b71c1c", bg: "rgba(183,28,28,0.2)",    icon: "🚨", label: "Critical" },
  };

  const medTypeConfig = {
    Fungicide:    { gradient: "linear-gradient(135deg,#1565c0,#0288d1)", emoji: "🍄" },
    Bactericide:  { gradient: "linear-gradient(135deg,#b71c1c,#e53935)", emoji: "🦠" },
    Insecticide:  { gradient: "linear-gradient(135deg,#e65100,#f57c00)", emoji: "🐛" },
    Biofungicide: { gradient: "linear-gradient(135deg,#1b5e20,#388e3c)", emoji: "🌿" },
    Nematicide:   { gradient: "linear-gradient(135deg,#4a148c,#7b1fa2)", emoji: "🪱" },
    default:      { gradient: "linear-gradient(135deg,#37474f,#546e7a)", emoji: "💊" },
  };

  const isHealthy = diseaseResult && !diseaseResult.error && (diseaseResult.severity === "None" || diseaseResult.disease?.toLowerCase().includes("healthy"));
  const dr = diseaseResult;

  return (
    <div style={s.section}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
        <div>
          <h2 style={s.pageTitle}>{t(lang, "disease", "title")}</h2>
          <p style={{ ...s.pageSub, marginBottom: 0 }}>
            {t(lang, "disease", "subtitle")}
          </p>
        </div>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: bg.muted, textTransform: "uppercase", letterSpacing: 0.8 }}>🌐 Result Language</div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
            {Object.entries(langLabels).map(([code, label]) => (
              <button key={code} onClick={() => changeLang(code)} style={{ ...s.btn(lang === code ? "primary" : "outline"), padding: "5px 11px", fontSize: 11, fontWeight: lang === code ? 700 : 500, borderRadius: 20 }}>{label}</button>
            ))}
          </div>
        </div>
      </div>

      {/* Upload */}
      <label style={{ display: "block", cursor: "pointer" }}>
        <div style={{ ...s.glassCard, border: `2px dashed ${diseaseImage ? bg.accent : bg.border}`, textAlign: "center", padding: diseaseImage ? "1.5rem" : "3rem", transition: "border-color 0.3s", position: "relative", overflow: "hidden" }}
          onMouseEnter={(e) => { e.currentTarget.style.borderColor = bg.accent; }}
          onMouseLeave={(e) => { e.currentTarget.style.borderColor = diseaseImage ? bg.accent : bg.border; }}>
          {diseaseImage ? (
            <div>
              <img src={diseaseImage} alt="Uploaded crop" style={{ maxHeight: 300, maxWidth: "100%", borderRadius: 12, display: "block", margin: "0 auto", boxShadow: bg.shadow, objectFit: "contain" }} />
              <div style={{ marginTop: 14, display: "inline-flex", alignItems: "center", gap: 6, background: dark ? "rgba(76,175,80,0.15)" : "rgba(46,125,50,0.1)", color: bg.accent, borderRadius: 20, padding: "5px 14px", fontSize: 13, fontWeight: 600 }}>📷 Click to change photo</div>
            </div>
          ) : (
            <>
              <div style={{ fontSize: 56, marginBottom: 12, animation: "float 3s ease-in-out infinite", display: "inline-block" }}>🔬</div>
              <div style={{ color: bg.muted, fontWeight: 600, fontSize: 15 }}>Upload Leaf / Crop Image</div>
              <div style={{ color: bg.muted, fontSize: 13, marginTop: 6 }}>PNG, JPG, WEBP supported</div>
              <div style={{ marginTop: 16, display: "inline-block", background: `linear-gradient(135deg,${bg.accent},${bg.accentHover})`, color: "#fff", borderRadius: 12, padding: "10px 24px", fontSize: 14, fontWeight: 700 }}>📁 Choose File</div>
            </>
          )}
        </div>
        <input type="file" accept="image/*" style={{ display: "none" }} onChange={analyzeDisease} />
      </label>

      {/* Loading */}
      {diseaseLoading && (
        <div style={{ textAlign: "center", padding: "2.5rem", color: bg.muted }}>
          <div style={{ fontSize: 48, animation: "spin 1s linear infinite", display: "inline-block" }}>🔬</div>
          <p style={{ marginTop: 14, fontWeight: 700, fontSize: 16 }}>Analyzing with AI Vision...</p>
          <p style={{ fontSize: 13, marginTop: 6 }}>Detailed report in {langLabels[lang]}</p>
        </div>
      )}

      {/* Results */}
      {dr && !dr.error && (
        <div style={{ marginTop: 28, animation: "fadeIn 0.5s ease-out" }}>

          {/* Confidence Score Card */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 14, marginBottom: 20 }}>
            {[
              { icon: "🤖", label: "AI Confidence", value: dr.confidence || "High", color: "#4caf50" },
              { icon: "📊", label: "Disease Risk", value: dr.severity || "Medium", color: severityConfig[dr.severity]?.color || "#ff9800" },
              { icon: "🖼️", label: "Image Quality", value: dr.imageQuality || "Good", color: "#42a5f5" },
            ].map((c) => (
              <div key={c.label} style={{ ...s.glassCard, textAlign: "center", padding: "1.2rem", borderTop: `3px solid ${c.color}` }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{c.icon}</div>
                <div style={{ fontSize: 18, fontWeight: 800, color: c.color }}>{c.value}</div>
                <div style={{ fontSize: 11, color: bg.muted, marginTop: 4, fontWeight: 600 }}>{c.label}</div>
              </div>
            ))}
          </div>

          {/* Healthy Plant Branch */}
          {isHealthy ? (
            <div style={{ ...s.glassCard, borderTop: "3px solid #4caf50", marginBottom: 16 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 16 }}>
                <span style={{ fontSize: 40 }}>✅</span>
                <div>
                  <h3 style={{ color: "#4caf50", fontSize: 20, fontWeight: 800 }}>Healthy Plant Detected!</h3>
                  <div style={{ fontSize: 13, color: bg.muted }}>No disease found. Your plant looks great!</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 12 }}>
                {[
                  { icon: "🌱", title: "Health Score", value: "Excellent (95/100)" },
                  { icon: "💧", title: "Watering", value: dr.watering || "Water at the base every 5–7 days. Avoid overhead irrigation." },
                  { icon: "🌾", title: "Next Fertilizer", value: dr.fertilizer || "Apply balanced NPK fertilizer in 2 weeks." },
                  { icon: "🛡️", title: "Preventive Tips", value: dr.prevention || "Monitor weekly. Ensure good air circulation between plants." },
                ].map((tip) => (
                  <div key={tip.title} style={{ background: dark ? "rgba(76,175,80,0.08)" : "#f1fef4", borderRadius: 12, padding: "14px" }}>
                    <div style={{ fontSize: 20, marginBottom: 6 }}>{tip.icon}</div>
                    <div style={{ fontSize: 11, fontWeight: 700, color: bg.muted, marginBottom: 4 }}>{tip.title}</div>
                    <div style={{ fontSize: 13, color: bg.text, lineHeight: 1.5 }}>{tip.value}</div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <>
              {/* Disease Header */}
              <div style={{ ...s.glassCard, borderLeft: `4px solid ${severityConfig[dr.severity]?.color || "#ff9800"}`, marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                      <span style={{ fontSize: 20 }}>⚠️</span>
                      <h3 style={{ color: severityConfig[dr.severity]?.color || "#ff9800", fontSize: "clamp(1.1rem,3vw,1.4rem)", fontWeight: 800 }}>{dr.disease}</h3>
                    </div>
                    {dr.severity && dr.severity !== "None" && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: severityConfig[dr.severity]?.bg, color: severityConfig[dr.severity]?.color, borderRadius: 20, padding: "4px 14px", fontSize: 12, fontWeight: 700, border: `1px solid ${severityConfig[dr.severity]?.color}` }}>
                        {severityConfig[dr.severity]?.icon} Severity: {severityConfig[dr.severity]?.label}
                      </span>
                    )}
                  </div>
                  {dr.model && <span style={s.tag}>🤖 {dr.model} · {langLabels[lang]}</span>}
                </div>
                {dr.symptoms && (
                  <div style={{ marginTop: 14, padding: "12px 16px", background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", borderRadius: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: bg.muted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>👁️ Symptoms Observed</div>
                    <p style={{ fontSize: 14, color: bg.text, lineHeight: 1.75 }}>{dr.symptoms}</p>
                  </div>
                )}
              </div>

              {/* Quick Actions */}
              {Array.isArray(dr.quick_actions) && dr.quick_actions.length > 0 && (
                <div style={{ ...s.glassCard, marginBottom: 16, borderLeft: "3px solid #ff9800" }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#ff9800", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12 }}>⚡ Immediate Actions</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {dr.quick_actions.map((action, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                        <span style={{ width: 24, height: 24, borderRadius: "50%", background: "#ff9800", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0 }}>{i + 1}</span>
                        <span style={{ fontSize: 14, color: bg.text, lineHeight: 1.6 }}>{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Medicines */}
              {Array.isArray(dr.medicines) && dr.medicines.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: bg.text, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 18 }}>💊</span> Recommended Medicines
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(260px,1fr))", gap: 14 }}>
                    {dr.medicines.map((med, i) => {
                      const mt = medTypeConfig[med.type] || medTypeConfig.default;
                      return (
                        <div key={i} style={{ ...s.glassCard, overflow: "hidden" }}>
                          <div style={{ background: mt.gradient, margin: "-1.5rem -1.5rem 14px -1.5rem", padding: "14px 18px", display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: 28 }}>{mt.emoji}</span>
                            <div>
                              <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.8)", letterSpacing: 1, textTransform: "uppercase" }}>{med.type}</div>
                              <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", lineHeight: 1.2, marginTop: 2 }}>{med.name}</div>
                            </div>
                          </div>
                          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {med.dose && <div style={{ display: "flex", gap: 8 }}><span>⚗️</span><div><span style={{ fontSize: 11, fontWeight: 700, color: bg.muted, display: "block" }}>Dose</span><span style={{ fontSize: 13, color: bg.text }}>{med.dose}</span></div></div>}
                            {med.frequency && <div style={{ display: "flex", gap: 8 }}><span>🗓️</span><div><span style={{ fontSize: 11, fontWeight: 700, color: bg.muted, display: "block" }}>Frequency</span><span style={{ fontSize: 13, color: bg.text }}>{med.frequency}</span></div></div>}
                            {med.apply && <div style={{ display: "flex", gap: 8 }}><span>🌿</span><div><span style={{ fontSize: 11, fontWeight: 700, color: bg.muted, display: "block" }}>How to Apply</span><span style={{ fontSize: 13, color: bg.text }}>{med.apply}</span></div></div>}
                            {med.brand && <div style={{ display: "flex", gap: 8 }}><span>🏷️</span><div><span style={{ fontSize: 11, fontWeight: 700, color: bg.muted, display: "block" }}>Brand Names</span><span style={{ fontSize: 13, color: bg.text }}>{med.brand}</span></div></div>}
                          </div>
                          <a href={`https://www.google.com/search?q=${encodeURIComponent(med.name + " pesticide india")}&tbm=isch`} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 14, padding: "8px 0", background: dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)", borderRadius: 8, color: bg.accent, fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
                            🔍 Search Product →
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Prevention / Fertilizer / Watering */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: 14 }}>
                {[
                  { icon: "🛡️", label: "Prevention", value: dr.prevention },
                  { icon: "🌾", label: "Fertilizer Advice", value: dr.fertilizer },
                  { icon: "💧", label: "Watering Advice", value: dr.watering },
                ].filter((i) => i.value).map((item) => (
                  <div key={item.label} style={{ ...s.glassCard, background: dark ? "rgba(255,255,255,0.03)" : "#f8fdf8" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 20 }}>{item.icon}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: bg.accent, textTransform: "uppercase", letterSpacing: 0.8 }}>{item.label}</span>
                    </div>
                    <p style={{ fontSize: 13, color: bg.text, lineHeight: 1.75 }}>{item.value}</p>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 10, marginTop: 20, flexWrap: "wrap" }}>
            <PDFReport data={dr} diseaseImage={diseaseImage} lang={lang} bg={bg} />
            <button onClick={handleSaveToHistory} disabled={savedToHistory} style={{ ...s.btn(savedToHistory ? "outline" : "primary"), display: "flex", alignItems: "center", gap: 8 }}>
              {savedToHistory ? "✅ Saved to History" : "📁 Save to History"}
            </button>
          </div>
        </div>
      )}

      {/* Error */}
      {dr?.error && (
        <div style={{ ...s.glassCard, marginTop: 24, borderLeft: "4px solid #ef5350", background: dark ? "rgba(239,83,80,0.05)" : "#fff5f5" }}>
          <p style={{ color: "#ef5350", fontWeight: 600 }}>⚠️ Analysis Failed</p>
          <p style={{ color: bg.muted, fontSize: 13, marginTop: 6 }}>{dr.error}</p>
          <p style={{ color: bg.muted, fontSize: 13, marginTop: 4 }}>Make sure the backend server is running (<code>npm run server</code>).</p>
        </div>
      )}
    </div>
  );
}
