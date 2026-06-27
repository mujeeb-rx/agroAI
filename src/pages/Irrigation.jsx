import { useState } from "react";
import { makeStyles } from "../theme.js";
import { t } from "../translations.js";

const CROPS = ["Rice", "Cotton", "Maize", "Tomato", "Chilli", "Groundnut", "Sugarcane", "Wheat", "Banana", "Onion"];
const GROWTH_STAGES = ["Germination (0-15 days)", "Seedling (15-30 days)", "Vegetative (30-60 days)", "Flowering (60-90 days)", "Fruiting/Grain Fill (90-120 days)", "Maturation (120+ days)"];
const WEATHER_CONDITIONS = ["Sunny & Dry", "Partly Cloudy", "Cloudy", "Light Rain", "Heavy Rain", "Humid"];

const CROP_LOGIC = {
  Rice: {
    method: "Flood/Furrow",
    baseWater: 30000, // liters/acre
    stages: {
      "Germination (0-15 days)": { factor: 0.5, desc: "Shallow flooding (2-3 cm) required for germination." },
      "Seedling (15-30 days)": { factor: 0.8, desc: "Maintain thin layer of water to support young seedlings." },
      "Vegetative (30-60 days)": { factor: 1.2, desc: "High water demand. Keep standing water (5-7 cm) to control weeds." },
      "Flowering (60-90 days)": { factor: 1.5, desc: "Peak water demand. Rice is highly sensitive to water stress during flowering." },
      "Fruiting/Grain Fill (90-120 days)": { factor: 1.1, desc: "Maintain flooded conditions for optimal grain filling." },
      "Maturation (120+ days)": { factor: 0.1, desc: "Drain the field 10-15 days before harvest to accelerate maturity." },
    }
  },
  Cotton: {
    method: "Drip Irrigation",
    baseWater: 15000,
    stages: {
      "Germination (0-15 days)": { factor: 0.4, desc: "Light moisture needed to promote crop emergence." },
      "Seedling (15-30 days)": { factor: 0.6, desc: "Moderate water needed. Avoid waterlogging which causes seedling rot." },
      "Vegetative (30-60 days)": { factor: 1.0, desc: "Steadily increasing water demand as plant grows." },
      "Flowering (60-90 days)": { factor: 1.4, desc: "Peak water requirement. Water stress leads to square or boll shedding." },
      "Fruiting/Grain Fill (90-120 days)": { factor: 1.1, desc: "Critical boll development phase. Maintain steady moisture." },
      "Maturation (120+ days)": { factor: 0.2, desc: "Reduce irrigation to encourage boll opening and prevent staining." },
    }
  },
  Maize: {
    method: "Sprinkler System",
    baseWater: 18000,
    stages: {
      "Germination (0-15 days)": { factor: 0.5, desc: "Moist soil needed for uniform germination." },
      "Seedling (15-30 days)": { factor: 0.7, desc: "Light watering to prevent nutrient leaching." },
      "Vegetative (30-60 days)": { factor: 1.1, desc: "Rapid vegetative growth. Leaf surface area expands rapidly." },
      "Flowering (60-90 days)": { factor: 1.6, desc: "Tasseling and silking phase. Most critical stage; water stress cuts yield significantly." },
      "Fruiting/Grain Fill (90-120 days)": { factor: 1.2, desc: "Grain filling stage. Adequate moisture increases kernel weight." },
      "Maturation (120+ days)": { factor: 0.2, desc: "Moisture demand drops as kernels reach black layer maturity." },
    }
  },
  Tomato: {
    method: "Drip Irrigation",
    baseWater: 12000,
    stages: {
      "Germination (0-15 days)": { factor: 0.4, desc: "Frequent light water applications to maintain seedbed moisture." },
      "Seedling (15-30 days)": { factor: 0.6, desc: "Regular shallow watering for strong root establishment." },
      "Vegetative (30-60 days)": { factor: 0.9, desc: "Steady water supply to support vegetative branching." },
      "Flowering (60-90 days)": { factor: 1.3, desc: "Highly critical stage. Uneven watering causes blossom drop." },
      "Fruiting/Grain Fill (90-120 days)": { factor: 1.5, desc: "Fruit expansion stage. Maintain even moisture to prevent blossom end rot." },
      "Maturation (120+ days)": { factor: 0.3, desc: "Reduce watering to improve brix (sugar) levels and prevent fruit splitting." },
    }
  },
  Chilli: {
    method: "Drip Irrigation",
    baseWater: 10000,
    stages: {
      "Germination (0-15 days)": { factor: 0.4, desc: "Gentle watering to avoid washing away tiny seeds." },
      "Seedling (15-30 days)": { factor: 0.6, desc: "Keep soil moist but not soggy to prevent damping-off." },
      "Vegetative (30-60 days)": { factor: 0.8, desc: "Normal watering. Chilli plants are sensitive to both drought and waterlogging." },
      "Flowering (60-90 days)": { factor: 1.2, desc: "Critical flowering stage. Water stress causes flower drop and reduced fruit set." },
      "Fruiting/Grain Fill (90-120 days)": { factor: 1.4, desc: "Fruit development. Steady supply ensures plump, healthy pods." },
      "Maturation (120+ days)": { factor: 0.3, desc: "Gradually reduce irrigation for drying and ripening phase." },
    }
  },
  Groundnut: {
    method: "Sprinkler System",
    baseWater: 14000,
    stages: {
      "Germination (0-15 days)": { factor: 0.5, desc: "Adequate moisture needed for seed germination and seedling emergence." },
      "Seedling (15-30 days)": { factor: 0.6, desc: "Moderate watering to promote root elongation." },
      "Vegetative (30-60 days)": { factor: 0.9, desc: "Flowering and pegging start. Pegs must easily penetrate the soil." },
      "Flowering (60-90 days)": { factor: 1.4, desc: "Pegging and early pod formation. The most critical period for water." },
      "Fruiting/Grain Fill (90-120 days)": { factor: 1.2, desc: "Pod filling stage. Maintain moisture in the pod zone." },
      "Maturation (120+ days)": { factor: 0.2, desc: "Dry soil preferred for easy harvesting and to prevent seed germination in pods." },
    }
  },
  Sugarcane: {
    method: "Flood/Furrow",
    baseWater: 28000,
    stages: {
      "Germination (0-15 days)": { factor: 0.6, desc: "Sufficient moisture required for setts germination." },
      "Seedling (15-30 days)": { factor: 0.8, desc: "Tillering stage starts. Frequent light watering is optimal." },
      "Vegetative (30-60 days)": { factor: 1.2, desc: "Grand growth phase. Very high evapotranspiration rate." },
      "Flowering (60-90 days)": { factor: 1.4, desc: "Peak cane elongation. High water requirement to form juicy stalks." },
      "Fruiting/Grain Fill (90-120 days)": { factor: 1.2, desc: "Continued growth. Maintain adequate irrigation." },
      "Maturation (120+ days)": { factor: 0.4, desc: "Withhold irrigation 3-4 weeks before harvest to increase sugar concentration." },
    }
  },
  Wheat: {
    method: "Sprinkler System",
    baseWater: 16000,
    stages: {
      "Germination (0-15 days)": { factor: 0.4, desc: "Crown Root Initiation (CRI) stage starting soon. Most critical stage." },
      "Seedling (15-30 days)": { factor: 0.7, desc: "Active tillering. Good moisture promotes healthy tillers." },
      "Vegetative (30-60 days)": { factor: 1.0, desc: "Jointing stage. Steady water is necessary." },
      "Flowering (60-90 days)": { factor: 1.4, desc: "Booting & flowering. High sensitivity to water stress; affects spikelet count." },
      "Fruiting/Grain Fill (90-120 days)": { factor: 1.2, desc: "Milking and dough stage. Adequate watering ensures plump grains." },
      "Maturation (120+ days)": { factor: 0.1, desc: "Drying phase. No irrigation required." },
    }
  },
  Banana: {
    method: "Drip Irrigation",
    baseWater: 22000,
    stages: {
      "Germination (0-15 days)": { factor: 0.7, desc: "Establishment of suckers. Constant high moisture needed." },
      "Seedling (15-30 days)": { factor: 0.9, desc: "Early growth. Banana is a water-loving plant with shallow roots." },
      "Vegetative (30-60 days)": { factor: 1.3, desc: "Active vegetative growth. Giant leaves evaporate water rapidly." },
      "Flowering (60-90 days)": { factor: 1.5, desc: "Inflorescence emergence. Peak water requirement for bunch size." },
      "Fruiting/Grain Fill (90-120 days)": { factor: 1.4, desc: "Bunch development. High water demand to fill individual fingers." },
      "Maturation (120+ days)": { factor: 0.8, desc: "Harvest preparation. Maintain moderate watering." },
    }
  },
  Onion: {
    method: "Drip Irrigation",
    baseWater: 9000,
    stages: {
      "Germination (0-15 days)": { factor: 0.4, desc: "Shallow root system requires frequent light watering." },
      "Seedling (15-30 days)": { factor: 0.6, desc: "Keep top soil moist. Avoid dry crusting." },
      "Vegetative (30-60 days)": { factor: 0.9, desc: "Steady water demand. Onion has very low drought tolerance." },
      "Flowering (60-90 days)": { factor: 1.2, desc: "Bulb initiation stage. Critical watering needed." },
      "Fruiting/Grain Fill (90-120 days)": { factor: 1.4, desc: "Bulb development. Keep soil moist; dry spells cause split bulbs." },
      "Maturation (120+ days)": { factor: 0.1, desc: "Stop watering 2 weeks before harvest to allow skins to dry and improve storage life." },
    }
  }
};

function Gauge({ value, max = 100, color, label, bg }) {
  const pct = Math.min((value / max) * 100, 100);
  const strokeDash = 2 * Math.PI * 45;
  const strokeDashOffset = strokeDash * (1 - pct / 100);
  return (
    <div style={{ textAlign: "center" }}>
      <svg width={110} height={110} viewBox="0 0 110 110">
        <circle cx={55} cy={55} r={45} fill="none" stroke={bg.bg === "#0a1a0f" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)"} strokeWidth={10} />
        <circle cx={55} cy={55} r={45} fill="none" stroke={color} strokeWidth={10}
          strokeDasharray={strokeDash} strokeDashoffset={strokeDashOffset}
          strokeLinecap="round" transform="rotate(-90 55 55)"
          style={{ transition: "stroke-dashoffset 1s ease" }} />
        <text x={55} y={52} textAnchor="middle" fontSize={18} fontWeight={800} fill={color}>{value}%</text>
        <text x={55} y={67} textAnchor="middle" fontSize={9} fill={bg.muted}>{label}</text>
      </svg>
    </div>
  );
}

export default function Irrigation({ bg, dark, lang }) {
  const s = makeStyles(bg);
  const [form, setForm] = useState({ crop: "", stage: "", weather: "", soilMoisture: 50, rainProbability: 20 });
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  function handleChange(k, v) {
    setForm((f) => {
      let updated = { ...f, [k]: v };
      if (k === "weather") {
        if (v === "Heavy Rain") updated.rainProbability = 100;
        else if (v === "Light Rain") updated.rainProbability = 80;
        else if (v === "Cloudy") updated.rainProbability = 40;
        else if (v === "Partly Cloudy") updated.rainProbability = 20;
        else if (v === "Sunny & Dry") updated.rainProbability = 0;
      }
      return updated;
    });
  }

  function analyze() {
    if (!form.crop || !form.stage || !form.weather) {
      alert("Please select crop, growth stage, and weather.");
      return;
    }
    setLoading(true);
    setTimeout(() => {
      const sm = parseInt(form.soilMoisture);
      const rainProb = parseInt(form.rainProbability);
      const crop = form.crop;
      const stage = form.stage;

      const cropConfig = CROP_LOGIC[crop] || {
        method: "Drip Irrigation",
        baseWater: 12000,
        stages: {}
      };

      const stageConfig = cropConfig.stages[stage] || { factor: 1.0, desc: "Standard growth phase water requirement." };
      const stageFactor = stageConfig.factor;
      const stageDesc = stageConfig.desc;

      // Smart Irrigation Status (Rule 1 & Rule 6)
      let status = "";
      let statusColor = "";
      let statusIcon = "";
      if (sm >= 70 || rainProb > 60) {
        status = "No Irrigation Needed Today";
        statusColor = "#4caf50";
        statusIcon = "🟢";
      } else if (sm >= 50 && sm <= 69) {
        status = "Irrigation Recommended Soon";
        statusColor = "#ff9800";
        statusIcon = "🟡";
      } else {
        status = "Irrigate Immediately";
        statusColor = "#ef5350";
        statusIcon = "🔴";
      }

      // Dynamic Water Quantity (Rule 2 & Rule 7)
      let quantityText = "";
      let quantityValue = 0;
      if (sm >= 70 || rainProb > 60) {
        quantityText = "Not Required";
      } else if (sm >= 50 && sm <= 69) {
        quantityText = "Light Irrigation";
      } else {
        const calculatedQty = Math.round(cropConfig.baseWater * stageFactor * (100 - sm) / 100);
        quantityValue = Math.max(100, Math.round(calculatedQty / 100) * 100);
        const mmValue = (quantityValue / 4047).toFixed(1);
        quantityText = `Required (${quantityValue.toLocaleString()} L/acre or ${mmValue} mm)`;
      }

      // Best Time to Irrigate (Rule 3 & Rule 7)
      let bestTime = "";
      if (rainProb > 60) {
        bestTime = "Wait until rain passes. Check soil moisture again after 24–48 hours.";
      } else if (sm >= 70) {
        bestTime = "No irrigation required today. Check soil moisture again after 24–48 hours.";
      } else {
        bestTime = "Early Morning (5 AM–8 AM) or Evening (5 PM–7 PM) to reduce evaporation.";
      }

      // Frequency (Rule 4 & Rule 7)
      let frequency = "";
      if (rainProb > 60) {
        frequency = "Reassess after rainfall.";
      } else if (sm >= 70) {
        frequency = "Monitor daily. Irrigation not required.";
      } else if (sm >= 50 && sm <= 69) {
        frequency = "Irrigate in approximately 2–3 days if no rainfall occurs.";
      } else {
        frequency = "Irrigate today.";
      }

      // Method Recommendation
      const method = cropConfig.method;

      // AI Reasoning (Rule 5)
      const reasoning = [];
      if (sm >= 70 || rainProb > 60) {
        if (rainProb > 60) {
          reasoning.push(`Soil moisture is currently at ${sm}%.`);
          reasoning.push(`High probability of rainfall (${rainProb}%) within the next 24 hours.`);
          reasoning.push(`Crop (${crop}) is in ${stage} stage.`);
          reasoning.push(`Rainfall will naturally compensate for crop water requirements.`);
          reasoning.push(`Delay irrigation until rainfall ends and reassess conditions.`);
        } else {
          reasoning.push(`Soil moisture is adequate (${sm}%).`);
          reasoning.push(`No significant rainfall expected (Rain probability: ${rainProb}%).`);
          reasoning.push(`Crop (${crop}) is in ${stage} stage with low water stress.`);
          reasoning.push(`Irrigation is not required today.`);
          reasoning.push(`Reassess after 24–48 hours.`);
        }
      } else {
        if (sm < 50) {
          reasoning.push(`Soil moisture has dropped below 50% (${sm}%).`);
          reasoning.push(`No rainfall is expected (Rain probability: ${rainProb}%).`);
          reasoning.push(`Crop (${crop}) is in ${stage} stage with high water demand.`);
          reasoning.push(`Immediate irrigation is recommended to avoid crop stress.`);
        } else {
          reasoning.push(`Soil moisture is moderate (${sm}%).`);
          reasoning.push(`No significant rainfall is expected (${rainProb}% probability).`);
          reasoning.push(`Crop (${crop}) is in ${stage} stage.`);
          reasoning.push(`Light irrigation is recommended soon to maintain optimal soil moisture.`);
        }
      }
      reasoning.push(stageDesc);

      setResult({
        status,
        statusColor,
        statusIcon,
        quantityText,
        quantityValue,
        bestTime,
        method,
        reasoning,
        frequency,
        soilMoisture: sm,
        rainProbability: rainProb
      });
      setLoading(false);
    }, 1200);
  }

  return (
    <div style={s.section}>
      <h2 style={s.pageTitle}>{t(lang, "irrigation", "title")}</h2>
      <p style={s.pageSub}>{t(lang, "irrigation", "subtitle")}</p>

      <div style={{ ...s.glassCard, marginBottom: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16, marginBottom: 20 }}>
          {[
            { key: "crop", label: "Crop *", options: CROPS },
            { key: "stage", label: "Growth Stage *", options: GROWTH_STAGES },
            { key: "weather", label: "Current Weather *", options: WEATHER_CONDITIONS },
          ].map(({ key, label, options }) => (
            <div key={key}>
              <label style={s.label}>{label}</label>
              <select value={form[key]} onChange={(e) => handleChange(key, e.target.value)} style={s.select}>
                <option value="">— Select —</option>
                {options.map((o) => <option key={o} value={o}>{o}</option>)}
              </select>
            </div>
          ))}
        </div>

        {/* Rain Probability Slider */}
        <div style={{ marginBottom: 20 }}>
          <label style={s.label}>
            Rain Probability (Next 24h): <span style={{ color: bg.accent }}>{form.rainProbability}%</span>
            {" "}({form.rainProbability > 60 ? "🌧️ Rain Expected" : form.rainProbability > 20 ? "⛅ Moderate" : "☀️ Clear Sky"})
          </label>
          <input
            type="range" min={0} max={100} value={form.rainProbability}
            onChange={(e) => handleChange("rainProbability", e.target.value)}
            style={{ width: "100%", accentColor: bg.accent, cursor: "pointer", height: 6 }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: bg.muted, marginTop: 4 }}>
            <span>0% (No Rain)</span><span>50% (Likely)</span><span>100% (Certain)</span>
          </div>
        </div>

        {/* Soil Moisture Slider */}
        <div style={{ marginBottom: 20 }}>
          <label style={s.label}>
            Soil Moisture Level: <span style={{ color: bg.accent }}>{form.soilMoisture}%</span>
            {" "}({form.soilMoisture < 30 ? "🔴 Very Dry" : form.soilMoisture < 50 ? "🟡 Dry" : form.soilMoisture < 70 ? "🟢 Adequate" : "💧 Very Moist"})
          </label>
          <input
            type="range" min={0} max={100} value={form.soilMoisture}
            onChange={(e) => handleChange("soilMoisture", e.target.value)}
            style={{ width: "100%", accentColor: bg.accent, cursor: "pointer", height: 6 }}
          />
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 10, color: bg.muted, marginTop: 4 }}>
            <span>0% (Very Dry)</span><span>50% (Optimal)</span><span>100% (Saturated)</span>
          </div>
        </div>

        <button onClick={analyze} style={s.btn("primary")} disabled={loading || !form.crop || !form.stage || !form.weather}>
          {loading ? "⏳ Analyzing..." : "💧 Get Irrigation Advice"}
        </button>
      </div>

      {result && (
        <div style={{ animation: "fadeIn 0.5s ease-out" }}>
          
          {/* Rule 6: Irrigation Status Card */}
          <div style={{
            ...s.glassCard,
            borderTop: `6px solid ${result.statusColor}`,
            marginBottom: 24,
            textAlign: "center",
            padding: "2rem",
            position: "relative",
            overflow: "hidden",
            boxShadow: `0 8px 32px ${result.statusColor}18`,
          }}>
            <div style={{ position: "absolute", right: 20, top: 10, fontSize: 80, opacity: 0.05, pointerEvents: "none" }}>💧</div>
            
            <div style={{ fontSize: 12, fontWeight: 800, color: bg.muted, textTransform: "uppercase", letterSpacing: 1.5, marginBottom: 10 }}>
              Irrigation Status
            </div>
            
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 8,
              padding: "10px 24px",
              borderRadius: "30px",
              background: `${result.statusColor}18`,
              border: `1.5px solid ${result.statusColor}`,
              color: result.statusColor,
              fontSize: "clamp(1.1rem, 2.5vw, 1.4rem)",
              fontWeight: 800,
              marginBottom: 14,
            }}>
              <span>{result.statusIcon}</span>
              <span>{result.status}</span>
            </div>
            
            <p style={{ color: bg.text, fontSize: 15, fontWeight: 500, lineHeight: 1.6, maxWidth: 600, margin: "0 auto" }}>
              {result.statusIcon === "🟢"
                ? `No irrigation is required for your ${form.crop} crop today. Natural conditions or current soil moisture levels are fully sufficient.`
                : result.statusIcon === "🟡"
                ? `Monitor soil moisture closely. Irrigation is recommended soon for your ${form.crop} crop to prevent crop stress.`
                : `Irrigate your ${form.crop} crop immediately to prevent severe dehydration and crop stress.`}
            </p>
          </div>

          {/* Gauges */}
          <div style={{ display: "flex", gap: 20, justifyContent: "center", flexWrap: "wrap", marginBottom: 24 }}>
            <Gauge value={result.soilMoisture} color={result.soilMoisture < 30 ? "#ef5350" : result.soilMoisture < 50 ? "#ff9800" : "#4caf50"} label="Soil Moisture" bg={bg} />
            <Gauge value={result.statusIcon === "🟢" ? 0 : result.statusIcon === "🟡" ? 40 : Math.round(100 - result.soilMoisture)} color={result.statusColor} label="Water Need" bg={bg} />
          </div>

          {/* Details */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 14, marginBottom: 20 }}>
            {[
              { icon: "💧", label: "Water Quantity", value: result.quantityText },
              { icon: "🕐", label: "Best Time to Irrigate", value: result.bestTime },
              { icon: "🚿", label: "Recommended Method", value: result.method },
              { icon: "📅", label: "Frequency", value: result.frequency },
            ].map((d) => (
              <div key={d.label} style={{ ...s.glassCard, padding: "1.2rem", transition: "transform 0.2s" }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>{d.icon}</div>
                <div style={{ fontSize: 11, fontWeight: 700, color: bg.muted, textTransform: "uppercase", marginBottom: 4 }}>{d.label}</div>
                <div style={{ fontSize: 14, fontWeight: 700, color: bg.text, lineHeight: 1.4 }}>{d.value}</div>
              </div>
            ))}
          </div>

          {/* Reasoning */}
          <div style={{ ...s.glassCard, borderLeft: `4px solid ${bg.accent}` }}>
            <div style={{ fontSize: 13, fontWeight: 700, color: bg.accent, marginBottom: 12 }}>🧠 Decision reasoning</div>
            {result.reasoning.map((r, i) => (
              <div key={i} style={{ display: "flex", gap: 8, marginBottom: 8 }}>
                <span style={{ color: bg.accent, fontWeight: 700, flexShrink: 0 }}>•</span>
                <span style={{ fontSize: 13, color: bg.text, lineHeight: 1.6 }}>{r}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
