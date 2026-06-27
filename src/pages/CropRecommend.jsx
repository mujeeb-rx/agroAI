import { useState } from "react";
import { makeStyles } from "../theme.js";
import { t } from "../translations.js";

const CROP_DB = [
  { name: "Rice",        icon: "🌾", water: "High",   duration: "120-140 days", profit: "₹60,000-80,000/acre",   success: 92, soils: ["Clay","Loamy","Alluvial"],      seasons: ["Kharif"],          reason: "Thrives in high moisture clay soils with guaranteed water supply." },
  { name: "Wheat",       icon: "🌿", water: "Medium", duration: "130-150 days", profit: "₹45,000-65,000/acre",   success: 88, soils: ["Loamy","Alluvial","Clay"],      seasons: ["Rabi"],            reason: "Best cool-season crop for well-drained loamy soils." },
  { name: "Cotton",      icon: "🌸", water: "Medium", duration: "150-180 days", profit: "₹70,000-1,00,000/acre", success: 78, soils: ["Black Cotton","Clay"],           seasons: ["Kharif"],          reason: "Black cotton soil's water retention is ideal for long-season crops." },
  { name: "Sugarcane",   icon: "🎋", water: "High",   duration: "10-12 months", profit: "₹80,000-1,20,000/acre", success: 82, soils: ["Loamy","Alluvial","Clay"],      seasons: ["Kharif","Rabi"],   reason: "Deep rooting crop that thrives in tropical climates." },
  { name: "Maize",       icon: "🌽", water: "Medium", duration: "90-110 days",  profit: "₹35,000-55,000/acre",   success: 85, soils: ["Sandy","Loamy","Red Soil"],     seasons: ["Kharif","Zaid"],   reason: "Fast-growing with good adaptation to varied soil types." },
  { name: "Groundnut",   icon: "🥜", water: "Low",    duration: "100-120 days", profit: "₹50,000-70,000/acre",   success: 80, soils: ["Sandy","Red Soil","Loamy"],     seasons: ["Kharif","Zaid"],   reason: "Sandy soils with good drainage ensure high-quality pods." },
  { name: "Soybean",     icon: "🫘", water: "Medium", duration: "90-120 days",  profit: "₹40,000-55,000/acre",   success: 79, soils: ["Black Cotton","Loamy","Clay"],  seasons: ["Kharif"],          reason: "Nitrogen-fixing legume perfect for black cotton soils." },
  { name: "Tomato",      icon: "🍅", water: "Medium", duration: "70-90 days",   profit: "₹1,00,000-2,00,000/ac", success: 76, soils: ["Loamy","Red Soil","Sandy"],     seasons: ["Rabi","Zaid"],     reason: "High-value vegetable with quick return on investment." },
  { name: "Mustard",     icon: "🌼", water: "Low",    duration: "90-110 days",  profit: "₹30,000-45,000/acre",   success: 83, soils: ["Loamy","Alluvial"],             seasons: ["Rabi"],            reason: "Cold-season crop with low water requirement." },
  { name: "Sunflower",   icon: "🌻", water: "Low",    duration: "80-100 days",  profit: "₹35,000-50,000/acre",   success: 77, soils: ["Loamy","Sandy","Red Soil"],     seasons: ["Rabi","Zaid"],     reason: "Drought-tolerant oil crop with stable market demand." },
];

const STATES = ["Andhra Pradesh","Bihar","Chhattisgarh","Gujarat","Haryana","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Odisha","Punjab","Rajasthan","Tamil Nadu","Telangana","Uttar Pradesh","West Bengal"];
const SEASONS = ["Kharif (Jun-Sep)", "Rabi (Oct-Mar)", "Zaid (Mar-Jun)"];
const SOILS = ["Clay", "Sandy", "Loamy", "Black Cotton", "Red Soil", "Alluvial"];
const WATER_AVAIL = ["High (Irrigation available)", "Medium (Partial irrigation)", "Low (Rain-fed)"];

export default function CropRecommend({ bg, dark, lang }) {
  const s = makeStyles(bg);
  const [form, setForm] = useState({ state: "", season: "", soil: "", water: "", temp: "", rainfall: "" });
  const [results, setResults] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleChange(k, v) { setForm((f) => ({ ...f, [k]: v })); }

  function recommend() {
    if (!form.state || !form.season || !form.soil) { alert("Please fill state, season, and soil type."); return; }
    setLoading(true);
    setTimeout(() => {
      const seasonKey = form.season.includes("Kharif") ? "Kharif" : form.season.includes("Rabi") ? "Rabi" : "Zaid";
      const waterLevel = form.water.includes("High") ? "High" : form.water.includes("Low") ? "Low" : "Medium";

      let scored = CROP_DB.map((crop) => {
        let score = crop.success;
        if (crop.soils.includes(form.soil)) score += 10;
        if (crop.seasons.includes(seasonKey)) score += 12;
        if (crop.water === waterLevel) score += 8;
        else if (Math.abs(["Low","Medium","High"].indexOf(crop.water) - ["Low","Medium","High"].indexOf(waterLevel)) === 1) score += 3;
        return { ...crop, score: Math.min(score, 99) };
      });

      scored.sort((a, b) => b.score - a.score);
      setResults(scored.slice(0, 5));
      setLoading(false);
    }, 1500);
  }

  return (
    <div style={s.section}>
      <h2 style={s.pageTitle}>{t(lang, "recommend", "title")}</h2>
      <p style={s.pageSub}>{t(lang, "recommend", "subtitle")}</p>

      <div style={{ ...s.glassCard, marginBottom: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16 }}>
          {[
            { key: "state", label: "State *", options: STATES },
            { key: "season", label: "Season *", options: SEASONS },
            { key: "soil", label: "Soil Type *", options: SOILS },
            { key: "water", label: "Water Availability", options: WATER_AVAIL },
          ].map(({ key, label, options }) => (
            <div key={key}>
              <label style={s.label}>{label}</label>
              <select value={form[key]} onChange={(e) => handleChange(key, e.target.value)} style={s.select}>
                <option value="">— Select —</option>
                {options.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          ))}
          <div>
            <label style={s.label}>Avg. Temperature (°C)</label>
            <input type="number" value={form.temp} onChange={(e) => handleChange("temp", e.target.value)} placeholder="e.g. 28" style={s.input} />
          </div>
          <div>
            <label style={s.label}>Annual Rainfall (mm)</label>
            <input type="number" value={form.rainfall} onChange={(e) => handleChange("rainfall", e.target.value)} placeholder="e.g. 900" style={s.input} />
          </div>
        </div>
        <div style={{ marginTop: 20 }}>
          <button onClick={recommend} style={s.btn("primary")} disabled={loading || !form.state || !form.season || !form.soil}>
            {loading ? "⏳ Analyzing..." : "🌱 Get Recommendations"}
          </button>
        </div>
      </div>

      {loading && (
        <div style={{ textAlign: "center", padding: "2rem", color: bg.muted }}>
          <div style={{ fontSize: 48, animation: "spin 1.5s linear infinite", display: "inline-block" }}>🌱</div>
          <p style={{ marginTop: 12, fontWeight: 600 }}>Analyzing crop suitability for your land...</p>
        </div>
      )}

      {results && (
        <div style={{ animation: "fadeIn 0.5s ease-out" }}>
          <h3 style={{ fontSize: 16, fontWeight: 700, color: bg.text, marginBottom: 16 }}>
            🏆 Top 5 Recommended Crops for {form.state}
          </h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {results.map((crop, i) => (
              <div key={crop.name} style={{
                ...s.glassCard,
                borderLeft: `4px solid ${i === 0 ? "#ffd700" : i === 1 ? "#c0c0c0" : i === 2 ? "#cd7f32" : bg.accent}`,
                animation: `fadeIn ${0.3 + i * 0.1}s ease-out`,
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ fontSize: 40, width: 56, height: 56, background: dark ? "rgba(76,175,80,0.1)" : "rgba(46,125,50,0.08)", borderRadius: 14, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      {crop.icon}
                    </div>
                    <div>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        {i === 0 && <span style={{ fontSize: 16 }}>🥇</span>}
                        {i === 1 && <span style={{ fontSize: 16 }}>🥈</span>}
                        {i === 2 && <span style={{ fontSize: 16 }}>🥉</span>}
                        <h3 style={{ fontSize: 17, fontWeight: 800, color: bg.text }}>{crop.name}</h3>
                      </div>
                      <p style={{ fontSize: 13, color: bg.muted, marginTop: 3, lineHeight: 1.4 }}>{crop.reason}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: "right", flexShrink: 0 }}>
                    <div style={{ fontSize: 24, fontWeight: 900, color: bg.accent }}>{crop.score}%</div>
                    <div style={{ fontSize: 10, color: bg.muted, fontWeight: 700 }}>SUCCESS RATE</div>
                  </div>
                </div>

                {/* Success bar */}
                <div style={{ margin: "14px 0 12px" }}>
                  <div style={{ height: 6, background: dark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)", borderRadius: 3, overflow: "hidden" }}>
                    <div style={{ height: "100%", width: `${crop.score}%`, background: `linear-gradient(90deg,${bg.accent},${bg.accentHover})`, borderRadius: 3, transition: "width 1s ease" }} />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 10 }}>
                  {[
                    { icon: "💧", label: "Water Req.", value: crop.water },
                    { icon: "📅", label: "Duration", value: crop.duration },
                    { icon: "💰", label: "Est. Profit", value: crop.profit },
                  ].map((stat) => (
                    <div key={stat.label} style={{ background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", borderRadius: 10, padding: "10px 12px" }}>
                      <div style={{ fontSize: 15, marginBottom: 2 }}>{stat.icon}</div>
                      <div style={{ fontSize: 10, color: bg.muted, fontWeight: 700, textTransform: "uppercase" }}>{stat.label}</div>
                      <div style={{ fontSize: 12, color: bg.text, fontWeight: 600, marginTop: 2 }}>{stat.value}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
