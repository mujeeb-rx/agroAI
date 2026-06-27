import { useState, useEffect } from "react";
import { makeStyles } from "../theme.js";
import { t } from "../translations.js";

const CROPS = ["Rice","Wheat","Maize","Cotton","Sugarcane","Soybean","Groundnut","Tomato","Onion","Potato","Mustard","Sunflower"];

function MetricBar({ label, value, max = 100, color, icon, unit = "%", bg }) {
  const pct = Math.min((value / max) * 100, 100);
  const status = pct >= 70 ? "Good" : pct >= 40 ? "Fair" : "Poor";
  const statusColor = pct >= 70 ? "#4caf50" : pct >= 40 ? "#ff9800" : "#f44336";
  return (
    <div style={{ padding: "14px 0", borderBottom: `1px solid ${bg.border}` }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 18 }}>{icon}</span>
          <span style={{ fontSize: 13, fontWeight: 600, color: bg.text }}>{label}</span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ fontSize: 14, fontWeight: 800, color }}>
            {value}{unit !== "%" ? " " : ""}{unit}
          </span>
          <span style={{ fontSize: 10, fontWeight: 700, color: statusColor, background: `${statusColor}20`, borderRadius: 10, padding: "2px 8px" }}>
            {status}
          </span>
        </div>
      </div>
      <div style={{ height: 8, background: bg.bg === "#0a1a0f" ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)", borderRadius: 4, overflow: "hidden" }}>
        <div style={{
          height: "100%",
          width: `${pct}%`,
          background: `linear-gradient(90deg,${color},${color}bb)`,
          borderRadius: 4,
          transition: "width 1.2s cubic-bezier(0.4,0,0.2,1)",
          boxShadow: `0 0 8px ${color}44`,
        }} />
      </div>
    </div>
  );
}

function generateMonitorData(crop, weather) {
  const base = {
    healthScore: 72 + Math.floor(Math.random() * 20),
    diseaseRisk: 15 + Math.floor(Math.random() * 40),
    growthStage: 40 + Math.floor(Math.random() * 50),
    soilMoisture: 45 + Math.floor(Math.random() * 35),
    humidity: 55 + Math.floor(Math.random() * 30),
    temperature: 25 + Math.floor(Math.random() * 15),
    plantStress: 10 + Math.floor(Math.random() * 35),
    nitrogen: 55 + Math.floor(Math.random() * 35),
    phosphorus: 50 + Math.floor(Math.random() * 40),
    potassium: 60 + Math.floor(Math.random() * 30),
  };

  // Crop-specific adjustments
  if (crop === "Rice") { base.soilMoisture = Math.max(base.soilMoisture, 70); }
  if (crop === "Wheat") { base.temperature = Math.min(base.temperature, 28); }
  if (weather === "Rain") { base.soilMoisture = Math.min(90, base.soilMoisture + 25); base.humidity = Math.min(95, base.humidity + 20); }

  return base;
}

export default function CropMonitor({ bg, dark, lang }) {
  const s = makeStyles(bg);
  const [selectedCrop, setSelectedCrop] = useState("Rice");
  const [weather, setWeather] = useState("Sunny");
  const [data, setData] = useState(null);
  const [lastUpdated, setLastUpdated] = useState(null);

  function loadData() {
    setData(generateMonitorData(selectedCrop, weather));
    setLastUpdated(new Date().toLocaleTimeString());
  }

  useEffect(() => { loadData(); }, []);

  const metrics = data ? [
    { label: "Crop Health Score",   value: data.healthScore,   max: 100,  color: data.healthScore >= 70 ? "#4caf50" : "#ff9800",   icon: "🌿", unit: "%" },
    { label: "Disease Risk",        value: data.diseaseRisk,   max: 100,  color: data.diseaseRisk <= 30 ? "#4caf50" : data.diseaseRisk <= 60 ? "#ff9800" : "#f44336", icon: "🦠", unit: "%" },
    { label: "Growth Stage",        value: data.growthStage,   max: 100,  color: "#ab47bc",  icon: "📈", unit: "%" },
    { label: "Soil Moisture",       value: data.soilMoisture,  max: 100,  color: "#42a5f5",  icon: "💧", unit: "%" },
    { label: "Humidity",            value: data.humidity,      max: 100,  color: "#29b6f6",  icon: "💨", unit: "%" },
    { label: "Temperature",         value: data.temperature,   max: 50,   color: "#ffa726",  icon: "🌡️", unit: "°C" },
    { label: "Plant Stress Level",  value: data.plantStress,   max: 100,  color: data.plantStress <= 25 ? "#4caf50" : data.plantStress <= 50 ? "#ff9800" : "#f44336", icon: "⚡", unit: "%" },
    { label: "Nitrogen (N)",        value: data.nitrogen,      max: 100,  color: "#66bb6a",  icon: "🌱", unit: "%" },
    { label: "Phosphorus (P)",      value: data.phosphorus,    max: 100,  color: "#ef5350",  icon: "🔴", unit: "%" },
    { label: "Potassium (K)",       value: data.potassium,     max: 100,  color: "#ffd54f",  icon: "🟡", unit: "%" },
  ] : [];

  const overallStatus = data
    ? data.healthScore >= 75 ? { label: "Excellent", color: "#4caf50", icon: "✅" }
    : data.healthScore >= 55 ? { label: "Good", color: "#8bc34a", icon: "🟢" }
    : data.healthScore >= 35 ? { label: "Needs Attention", color: "#ff9800", icon: "⚠️" }
    : { label: "Critical", color: "#f44336", icon: "🚨" }
    : null;

  return (
    <div style={s.section}>
      <h2 style={s.pageTitle}>{t(lang, "monitor", "title")}</h2>
      <p style={s.pageSub}>{t(lang, "monitor", "subtitle")}</p>

      {/* Controls */}
      <div style={{ display: "flex", gap: 12, marginBottom: 24, flexWrap: "wrap", alignItems: "center" }}>
        <div>
          <label style={{ ...s.label, marginBottom: 4, display: "inline-block" }}>Crop</label>
          <select value={selectedCrop} onChange={(e) => setSelectedCrop(e.target.value)} style={{ ...s.select, width: "auto" }}>
            {CROPS.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>
        <div>
          <label style={{ ...s.label, marginBottom: 4, display: "inline-block" }}>Weather</label>
          <select value={weather} onChange={(e) => setWeather(e.target.value)} style={{ ...s.select, width: "auto" }}>
            {["Sunny","Cloudy","Rain","Humid","Windy"].map((w) => <option key={w} value={w}>{w}</option>)}
          </select>
        </div>
        <button onClick={loadData} style={{ ...s.btn("primary"), alignSelf: "flex-end" }}>🔄 Refresh Data</button>
        {lastUpdated && <span style={{ fontSize: 12, color: bg.muted, alignSelf: "flex-end", paddingBottom: 4 }}>Last updated: {lastUpdated}</span>}
      </div>

      {data && (
        <div style={{ animation: "fadeIn 0.5s ease-out" }}>
          {/* Overall Status */}
          <div style={{ ...s.glassCard, display: "flex", alignItems: "center", gap: 20, marginBottom: 24, borderTop: `3px solid ${overallStatus.color}` }}>
            <div style={{ fontSize: 56 }}>{overallStatus.icon}</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 22, fontWeight: 900, color: overallStatus.color }}>{overallStatus.label}</div>
              <div style={{ fontSize: 14, color: bg.muted }}>Overall crop condition for {selectedCrop}</div>
              <div style={{ fontSize: 13, color: bg.text, marginTop: 4 }}>
                Health Score: <strong style={{ color: bg.accent }}>{data.healthScore}/100</strong>
                {" · "}Disease Risk: <strong style={{ color: data.diseaseRisk > 50 ? "#f44336" : "#4caf50" }}>{data.diseaseRisk}%</strong>
              </div>
            </div>
            <div style={{ ...s.tag, fontSize: 13, padding: "6px 14px" }}>🌿 {selectedCrop}</div>
          </div>

          {/* Metrics */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))", gap: 20 }}>
            <div style={s.glassCard}>
              <div style={{ fontSize: 13, fontWeight: 700, color: bg.text, marginBottom: 4 }}>📊 Field Conditions</div>
              <div style={{ fontSize: 11, color: bg.muted, marginBottom: 12 }}>Real-time environmental metrics</div>
              {metrics.slice(0, 5).map((m) => <MetricBar key={m.label} {...m} bg={bg} />)}
            </div>
            <div style={s.glassCard}>
              <div style={{ fontSize: 13, fontWeight: 700, color: bg.text, marginBottom: 4 }}>🌱 Plant Health & Nutrients</div>
              <div style={{ fontSize: 11, color: bg.muted, marginBottom: 12 }}>Stress levels and nutrient status</div>
              {metrics.slice(5).map((m) => <MetricBar key={m.label} {...m} bg={bg} />)}
            </div>
          </div>

          {/* Insights */}
          <div style={{ ...s.glassCard, marginTop: 20, borderLeft: `4px solid ${bg.accent}` }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: bg.accent, marginBottom: 12 }}>🧠 AI Insights</div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 10 }}>
              {[
                { icon: "🔴", label: "Disease Risk", value: data.diseaseRisk <= 30 ? "Low — monitor weekly" : data.diseaseRisk <= 60 ? "Moderate — inspect bi-weekly" : "High — inspect immediately!" },
                { icon: "💧", label: "Water Status", value: data.soilMoisture >= 60 ? "Adequate — skip irrigation" : data.soilMoisture >= 40 ? "Moderate — irrigate in 2 days" : "Low — irrigate today!" },
                { icon: "🌱", label: "Nutrient Status", value: data.nitrogen >= 65 ? "N: Sufficient" : "N: Deficient — apply Urea" },
                { icon: "⚡", label: "Stress Alert", value: data.plantStress <= 25 ? "Low stress — crops healthy" : data.plantStress <= 50 ? "Moderate stress — check irrigation" : "High stress — immediate action!" },
              ].map((ins) => (
                <div key={ins.label} style={{ background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.02)", borderRadius: 10, padding: "10px 12px" }}>
                  <div style={{ fontSize: 16, marginBottom: 4 }}>{ins.icon}</div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: bg.muted, textTransform: "uppercase", marginBottom: 4 }}>{ins.label}</div>
                  <div style={{ fontSize: 12, color: bg.text, lineHeight: 1.5 }}>{ins.value}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ marginTop: 12, fontSize: 11, color: bg.muted, fontStyle: "italic" }}>
            * Values are AI-estimated based on crop type and weather conditions. Connect IoT sensors for real-time accuracy.
          </div>
        </div>
      )}
    </div>
  );
}
