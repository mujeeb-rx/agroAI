import { useState, useEffect } from "react";
import { makeStyles } from "../theme.js";
import { t } from "../translations.js";

const CROP_TEMPLATES = {
  Rice: {
    duration: 120,
    milestones: [
      { day: 0, type: "sow", label: "Nursery Preparation", icon: "🌱", advice: "Sow seeds in the nursery bed. Ensure proper drainage and light weeding." },
      { day: 15, type: "sow", label: "Transplant Seedlings", icon: "🌾", advice: "Transplant 25-30 days old seedlings from nursery to main field. Maintain 2-3 cm standing water." },
      { day: 25, type: "fert", label: "Basal Fertilizer Application", icon: "🧪", advice: "Apply basal dose of DAP (50 kg/acre) + Potash (20 kg/acre) in the field." },
      { day: 45, type: "water", label: "Active Tillering Irrigation", icon: "💧", advice: "Maintain 3-5 cm standing water during the vegetative stage to encourage maximum tillering." },
      { day: 55, type: "fert", label: "First Top Dressing", icon: "🧪", advice: "Apply 30 kg Urea per acre after weeding and ensure standing water is shallow." },
      { day: 70, type: "spray", label: "Stem Borer Inspection & Control", icon: "🐛", advice: "Inspect leaves for stem borer and leaf folder symptoms. Spray Cartap Hydrochloride if risk is high." },
      { day: 85, type: "water", label: "Panicle Initiation Irrigation", icon: "💧", advice: "Most critical water stage. Ensure fields are flooded with 5 cm water; dry spells will drastically reduce yield." },
      { day: 100, type: "spray", label: "Fungicide Spray", icon: "🧴", advice: "Spray Tricyclazole for blast disease prevention. Only spray on a dry, clear day." },
      { day: 120, type: "harvest", label: "Crop Harvesting", icon: "🌾", advice: "Harvest when 80-85% of grains turn golden yellow. Drain field 10 days before harvest." }
    ]
  },
  Wheat: {
    duration: 135,
    milestones: [
      { day: 0, type: "sow", label: "Field Sowing", icon: "🌱", advice: "Sow seeds at a depth of 4-5 cm using a seed drill. Apply basal NPK (50 kg/acre)." },
      { day: 21, type: "water", label: "Crown Root Initiation (CRI) Irrigation", icon: "💧", advice: "Highly critical first irrigation. Missing CRI stage watering reduces tillering by 40%." },
      { day: 40, type: "fert", label: "Top Dressing Urea", icon: "🧪", advice: "Apply 40 kg Urea per acre. Perform hand weeding or apply selective herbicide." },
      { day: 60, type: "water", label: "Late Jointing Stage Irrigation", icon: "💧", advice: "Ensure adequate soil moisture to support stem elongation." },
      { day: 80, type: "spray", label: "Aphids Monitoring", icon: "🐛", advice: "Inspect flag leaves for aphids. Spray Imidacloprid if counts exceed 5 pests per tiller." },
      { day: 100, type: "water", label: "Flowering Stage Irrigation", icon: "💧", advice: "Irrigate gently. Ensure no water stress during pollen grain formation." },
      { day: 120, type: "spray", label: "Yellow Rust Protection", icon: "🧴", advice: "Monitor flag leaf for orange/yellow rust spots. Apply Propiconazole fungicide." },
      { day: 135, type: "harvest", label: "Harvesting", icon: "🌾", advice: "Harvest when plants dry up completely and straw turns golden yellow. Moisture in grain should be < 12%." }
    ]
  },
  Cotton: {
    duration: 160,
    milestones: [
      { day: 0, type: "sow", label: "Soil Sowing", icon: "🌱", advice: "Sow Bt Cotton seeds at 90x60cm spacing. Apply basal organic compost + NPK." },
      { day: 15, type: "fert", label: "Emergence Fertilizer", icon: "🧪", advice: "Apply light dose of nitrogen to stimulate seedling vigor." },
      { day: 30, type: "water", label: "First Irrigation & Thinning", icon: "💧", advice: "Water the field. Perform crop thinning leaving one healthy plant per hill." },
      { day: 55, type: "fert", label: "Urea Top Dressing & Weeding", icon: "🧪", advice: "Top dress 35 kg Urea per acre. Perform deep inter-culturing to remove weeds." },
      { day: 75, type: "spray", label: "Bollworm Inspection", icon: "🐛", advice: "Check squares/bolls for pink bollworm damage. Install pheromone traps." },
      { day: 100, type: "water", label: "Peak Flowering Watering", icon: "💧", advice: "Maintain steady drip/furrow irrigation. Avoid stress to prevent square shedding." },
      { day: 130, type: "spray", label: "Sucking Pest Control", icon: "🧴", advice: "Inspect for whiteflies and jassids. Apply Neem oil spray or systemic insecticides." },
      { day: 160, type: "harvest", label: "First Boll Picking", icon: "🌾", advice: "Pick cotton manually from fully opened bolls. Avoid picking morning dew-covered bolls." }
    ]
  },
  Maize: {
    duration: 105,
    milestones: [
      { day: 0, type: "sow", label: "Field Sowing", icon: "🌱", advice: "Sow seeds at 60x20cm spacing. Apply NPK basal mixture (40 kg/acre)." },
      { day: 15, type: "spray", label: "Early Herbicide Application", icon: "🧴", advice: "Spray pre-emergence herbicide like Atrazine to suppress early weeds." },
      { day: 30, type: "water", label: "Knee-High Stage Irrigation", icon: "💧", advice: "Water the field. Apply top dressing of 30 kg Urea per acre." },
      { day: 50, type: "spray", label: "Fall Armyworm Inspection", icon: "🐛", advice: "Inspect leaf whorls for FAW larvae. Spray Emamectin Benzoate if damage is noticed." },
      { day: 70, type: "water", label: "Tasseling & Silking Irrigation", icon: "💧", advice: "Peak water demand stage. Ensure no water stress as it affects pollination." },
      { day: 90, type: "water", label: "Grain Filling Watering", icon: "💧", advice: "Maintain soil moisture. Heavy rain is beneficial; avoid field pooling." },
      { day: 105, type: "harvest", label: "Harvesting & Shelling", icon: "🌾", advice: "Harvest when the black layer appears at the base of kernels. Dry ears in sun." }
    ]
  },
  Tomato: {
    duration: 90,
    milestones: [
      { day: 0, type: "sow", label: "Nursery Bed Sowing", icon: "🌱", advice: "Sow seeds in rows on raised nursery beds. Cover with fine compost." },
      { day: 25, type: "sow", label: "Main Field Transplanting", icon: "🌾", advice: "Transplant healthy seedlings at 4-5 leaf stage. Apply organic manure (5 t/acre)." },
      { day: 35, type: "water", label: "Drip Irrigation Setup", icon: "💧", advice: "Start daily drip irrigation (30-45 mins). Install bamboo stakes for plant support." },
      { day: 50, type: "fert", label: "Foliar Spray NPK", icon: "🧪", advice: "Spray NPK 19:19:19 water-soluble fertilizer to encourage vegetative branching." },
      { day: 65, type: "spray", label: "Early Blight Fungicide", icon: "🧴", advice: "Spray Mancozeb to prevent early blight and leaf spot diseases." },
      { day: 80, type: "spray", label: "Fruit Borer Spray", icon: "🐛", advice: "Inspect green fruits for boreholes. Spray spinosad if fruit borers are active." },
      { day: 90, type: "harvest", label: "First Picking", icon: "🌾", advice: "Pick tomato fruits at breaker/pink stage for transport, or red-ripe for local sale." }
    ]
  },
  Chilli: {
    duration: 110,
    milestones: [
      { day: 0, type: "sow", label: "Nursery Sowing", icon: "🌱", advice: "Sow chilli seeds. Maintain high soil moisture using straw mulch cover." },
      { day: 30, type: "sow", label: "Transplanting & Basal Dose", icon: "🌾", advice: "Transplant seedlings. Apply 40 kg NPK mixture and ensure soil is moist." },
      { day: 45, type: "water", label: "Vegetative Drip Irrigation", icon: "💧", advice: "Water chilli plants using drip irrigation. Weed out the inter-row spaces." },
      { day: 60, type: "fert", label: "Top Dressing Potash", icon: "🧪", advice: "Apply 25 kg Potash per acre. Spray flower hormone (NAA) to prevent flower drop." },
      { day: 75, type: "spray", label: "Thrips & Leaf Curl Spray", icon: "🐛", advice: "Inspect for thrips or leaf curl. Spray Fipronil or Imidacloprid." },
      { day: 95, type: "water", label: "Fruit Development Irrigation", icon: "💧", advice: "Ensure moderate watering. Excess water at fruiting causes rotting." },
      { day: 110, type: "harvest", label: "Green Chilli Harvesting", icon: "🌾", advice: "Pick green chillies at mature size. If dry red chillies are needed, allow to ripen on plant." }
    ]
  },
  Groundnut: {
    duration: 115,
    milestones: [
      { day: 0, type: "sow", label: "Sowing", icon: "🌱", advice: "Treat seeds with Trichoderma. Sow in well-tilled sandy loam soil." },
      { day: 20, type: "water", label: "Emergence Watering", icon: "💧", advice: "Light sprinkler/furrow irrigation to ensure uniform plant emergence." },
      { day: 40, type: "fert", label: "Gypsum Application", icon: "🧪", advice: "Apply 200 kg Gypsum/acre. Gypsum provides Calcium critical for pod filling." },
      { day: 55, type: "water", label: "Pegging Stage Irrigation", icon: "💧", advice: "Most critical stage. Maintain loose, moist soil so pegs can enter easily." },
      { day: 75, type: "spray", label: "Leaf Miner & Tikka Leaf Spot", icon: "🐛", advice: "Monitor for Tikka spots. Spray Carbendazim fungicide if needed." },
      { day: 95, type: "water", label: "Pod Filling Watering", icon: "💧", advice: "Ensure good moisture in pod zone. Do not overwater (prevents pod rot)." },
      { day: 115, type: "harvest", label: "Pod Harvesting", icon: "🌾", advice: "Harvest when leaves turn yellow and inner pod shells show dark spots. Dig out pods." }
    ]
  },
  Onion: {
    duration: 120,
    milestones: [
      { day: 0, type: "sow", label: "Nursery Sowing", icon: "🌱", advice: "Sow onion seeds in nursery beds. Water daily using a rose can." },
      { day: 35, type: "sow", label: "Transplanting & Weed Bed", icon: "🌾", advice: "Transplant seedlings at 15cm spacing. Apply compost + single superphosphate." },
      { day: 50, type: "water", label: "Shallow Drip Irrigation", icon: "💧", advice: "Water daily. Onion has shallow roots and requires frequent light irrigation." },
      { day: 75, type: "fert", label: "Bulb Initiation Top Dress", icon: "🧪", advice: "Apply 30 kg Nitrogen per acre. Keep weeding to avoid nutrient theft." },
      { day: 95, type: "spray", label: "Thrips Monitoring", icon: "🐛", advice: "Inspect inner leaves for silver streaks (thrips). Spray Profenofos if detected." },
      { day: 110, type: "water", label: "Bulb Enlargement Irrigation", icon: "💧", advice: "Maintain soil moisture. Stop irrigation 15 days before harvest to dry outer skins." },
      { day: 120, type: "harvest", label: "Harvesting & Curing", icon: "🌾", advice: "Harvest when 50% of plant tops fall over. Cure in shade for 7 days to store longer." }
    ]
  },
  Sugarcane: {
    duration: 330,
    milestones: [
      { day: 0, type: "sow", label: "Setts Planting", icon: "🌱", advice: "Treat sugarcane setts with fungicide. Plant in deep furrows. Apply basal DAP." },
      { day: 30, type: "water", label: "First Irrigation & Shoot Check", icon: "💧", advice: "Irrigate the furrows. Check sett germination percentage." },
      { day: 60, type: "fert", label: "Tillering Top Dressing", icon: "🧪", advice: "Apply 50 kg Urea + 30 kg Potash per acre. Light earthing-up to support shoots." },
      { day: 120, type: "water", label: "Grand Growth Stage Irrigation", icon: "💧", advice: "Water weekly. Sugarcane enters high stalk elongation and needs high water volume." },
      { day: 180, type: "fert", label: "Grand Growth Top Dress & Earthing-up", icon: "🧪", advice: "Apply second dose of Urea. Complete full earthing-up to prevent cane lodging." },
      { day: 240, type: "spray", label: "Internode Borer Control", icon: "🐛", advice: "Release Trichogramma egg parasites or spray chlorpyrifos for borer control." },
      { day: 300, type: "water", label: "Late Stalk Watering", icon: "💧", advice: "Ensure moisture. Withhold irrigation 30 days before harvest to concentrate sugar." },
      { day: 330, type: "harvest", label: "Sugarcane Harvesting", icon: "🌾", advice: "Cut canes close to ground level. Harvest when lower leaves dry and stalks sound metallic." }
    ]
  },
  Banana: {
    duration: 300,
    milestones: [
      { day: 0, type: "sow", label: "Sucker Planting", icon: "🌱", advice: "Plant healthy sword suckers in 45x45cm pits. Mix pit soil with manure + DAP." },
      { day: 30, type: "water", label: "First Irrigation & Mulching", icon: "💧", advice: "Irrigate the suckers. Add thick straw mulch around base to retain humidity." },
      { day: 60, type: "fert", label: "First Fertilizer Application", icon: "🧪", advice: "Apply 100g Urea + 150g Potash per plant. Complete first desuckering." },
      { day: 120, type: "fert", label: "Second Fertilizer & Desuckering", icon: "🧪", advice: "Apply second dose of NPK. Remove side suckers to let main pseudostem grow." },
      { day: 180, type: "water", label: "Vegetative Drip Irrigation", icon: "💧", advice: "Water daily. Large leaves evaporate high amounts. Remove dry leaves." },
      { day: 210, type: "sow", label: "Bunch Emergence & Propping", icon: "🌾", advice: "Banana flower bunch emerges. Prop the pseudostem with bamboo to avoid breaking." },
      { day: 240, type: "spray", label: "Fruit Fly Spray & Sleeving", icon: "🧴", advice: "Spray bunch for fruit flies. Cover the bunch with blue polythene sleeves." },
      { day: 300, type: "harvest", label: "Bunch Harvesting", icon: "🌾", advice: "Harvest when fingers turn light green and ridges turn round. Cut bunched stems." }
    ]
  }
};

const SOIL_TYPES = ["Sandy", "Clay", "Loamy", "Black Cotton", "Red Soil"];
const WEATHER_CONDITIONS = ["Sunny & Dry", "Partly Cloudy", "Cloudy", "Rain Expected", "Heavy Rain"];

export default function CropCalendar({ bg, dark, lang }) {
  const s = makeStyles(bg);

  // Default sowing date is set to 48 days ago so there is visual progress and overdue/completed tasks on first load
  const getDefaultSowingDate = () => {
    const d = new Date();
    d.setDate(d.getDate() - 48);
    return d.toISOString().split("T")[0];
  };

  const [form, setForm] = useState({
    crop: "Rice",
    sowingDate: getDefaultSowingDate(),
    location: "Telangana",
    season: "Kharif",
    weather: "Sunny & Dry",
    soilType: "Clay",
    soilMoisture: 50
  });

  const [schedule, setSchedule] = useState([]);
  const [progress, setProgress] = useState({
    pct: 0,
    das: 0,
    remaining: 0,
    stage: "Vegetative",
    harvestDateStr: ""
  });
  const [alerts, setAlerts] = useState([]);

  function handleChange(k, v) {
    setForm(f => ({ ...f, [k]: v }));
  }

  // Calculate dynamic schedule
  useEffect(() => {
    const template = CROP_TEMPLATES[form.crop];
    if (!template) return;

    const sowDateObj = new Date(form.sowingDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const das = Math.max(0, Math.floor((today - sowDateObj) / (1000 * 60 * 60 * 24)));
    const pct = Math.min(100, Math.max(0, Math.round((das / template.duration) * 100)));
    const remaining = Math.max(0, template.duration - das);

    const harvestDate = new Date(sowDateObj);
    harvestDate.setDate(harvestDate.getDate() + template.duration);
    const harvestDateStr = harvestDate.toLocaleDateString("en-IN", { day: "numeric", month: "long", year: "numeric" });

    // Stage resolver
    let stage = "Germination";
    if (pct < 10) stage = "Germination Stage";
    else if (pct < 25) stage = "Seedling Stage";
    else if (pct < 60) stage = "Vegetative Stage";
    else if (pct < 80) stage = "Flowering Stage";
    else if (pct < 95) stage = "Fruiting & Grain Fill";
    else stage = "Maturation Stage";

    setProgress({ pct, das, remaining, stage, harvestDateStr });

    // Weather rules
    const isRainForecast = form.weather === "Rain Expected" || form.weather === "Heavy Rain";

    // Process tasks
    const activeSchedule = template.milestones.map((milestone, idx) => {
      const taskDate = new Date(sowDateObj);
      taskDate.setDate(taskDate.getDate() + milestone.day);
      const dateStr = taskDate.toLocaleDateString("en-IN", { day: "numeric", month: "long" });

      // Determine task status
      let status = "Upcoming"; // Completed, Current Task, Upcoming, Overdue
      if (das > milestone.day + 5) {
        status = "Completed";
      } else if (das > milestone.day) {
        status = "Overdue";
      } else if (das >= milestone.day - 3 && das <= milestone.day) {
        status = "Current Task";
      } else {
        // If it's the first upcoming task, it might be the active one
        status = "Upcoming";
      }

      // Context-aware weather warnings
      let weatherWarning = "";
      if (isRainForecast) {
        if (milestone.type === "water") {
          weatherWarning = "🌧️ Rain expected. Skip today's irrigation to prevent waterlogging.";
        } else if (milestone.type === "fert") {
          weatherWarning = "🌧️ Heavy rain predicted. Delay fertilizer application to avoid leaching.";
        } else if (milestone.type === "spray") {
          weatherWarning = "🌧️ Rain forecasted. Postpone spraying to prevent chemical wash-off.";
        }
      }

      return {
        ...milestone,
        date: taskDate,
        dateStr,
        status,
        weatherWarning
      };
    });

    // Resolve "Current Task" specifically to be the closest upcoming task if no tasks fit the 3-day window
    const hasCurrent = activeSchedule.some(t => t.status === "Current Task");
    if (!hasCurrent) {
      const nextTaskIndex = activeSchedule.findIndex(t => t.status === "Upcoming");
      if (nextTaskIndex !== -1) {
        activeSchedule[nextTaskIndex].status = "Current Task";
      }
    }

    setSchedule(activeSchedule);

    // Build notifications
    const activeAlerts = [];
    if (isRainForecast) {
      activeAlerts.push("🌧️ Rain expected soon. Delay irrigation and fertilizer applications.");
    }
    
    // Check for overdue tasks
    const overdueCount = activeSchedule.filter(t => t.status === "Overdue").length;
    if (overdueCount > 0) {
      activeAlerts.push(`⚠️ You have ${overdueCount} overdue farming activity! Check the planner.`);
    }

    // Stem borer / pest alerts based on vegetative stages
    if (form.crop === "Rice" && das > 40 && das < 75) {
      activeAlerts.push("🐛 High stem borer risk reported in regional advisory this week.");
    } else if (form.crop === "Tomato" && das > 50 && das < 85) {
      activeAlerts.push("🐛 High fruit borer alert. Inspect green fruits daily.");
    }

    // General stage alerts
    if (pct >= 50 && pct < 60) {
      activeAlerts.push("🧪 Fertilizer application (top dressing) is due today.");
    }
    if (remaining > 0 && remaining <= 15) {
      activeAlerts.push(`⏰ Harvest expected in ${remaining} days. Prepare storage bags.`);
    }

    setAlerts(activeAlerts);

  }, [form]);

  // ICS calendar download builder
  function downloadCalendar() {
    let icsContent = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//AgroAI//Smart Crop Planner//EN\n";
    schedule.forEach(t => {
      const dt = new Date(t.date).toISOString().replace(/[-:]/g, "").split(".")[0] + "Z";
      icsContent += `BEGIN:VEVENT\nSUMMARY:${form.crop} - ${t.label}\nDESCRIPTION:${t.advice}\nDTSTART:${dt.substring(0, 8)}T080000Z\nDTEND:${dt.substring(0, 8)}T090000Z\nEND:VEVENT\n`;
    });
    icsContent += "END:VCALENDAR";

    const blob = new Blob([icsContent], { type: "text/calendar" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${form.crop}_Crop_Schedule.ics`;
    a.click();
  }

  // Share via WhatsApp
  function shareWhatsApp() {
    let text = `🌿 *AgroAI Smart Crop Planner* 🌿\n\n`;
    text += `🌾 *Crop:* ${form.crop}\n`;
    text += `📅 *Sowing Date:* ${form.sowingDate}\n`;
    text += `📍 *Location:* ${form.location}\n`;
    text += `📈 *Progress:* ${progress.pct}% (${progress.stage})\n`;
    text += `🚜 *Estimated Harvest:* ${progress.harvestDateStr}\n\n`;
    text += `*Key Scheduled Activities:*\n`;

    schedule.slice(0, 4).forEach(t => {
      text += `• ${t.dateStr}: ${t.label} (${t.status})\n`;
    });
    text += `\nGenerate your complete smart schedule at AgroAI!`;

    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  }

  // Print schedule
  function printSchedule() {
    window.print();
  }

  return (
    <div style={s.section}>
      <h2 style={s.pageTitle}>{t(lang, "calendar", "title")}</h2>
      <p style={s.pageSub}>{t(lang, "calendar", "subtitle")}</p>

      {/* Input Parameters Form */}
      <div style={{ ...s.glassCard, marginBottom: 24 }} className="no-print">
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 16, marginBottom: 20 }}>
          <div>
            <label style={s.label}>Crop Type *</label>
            <select value={form.crop} onChange={(e) => handleChange("crop", e.target.value)} style={s.select}>
              {Object.keys(CROP_TEMPLATES).map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label style={s.label}>Sowing Date *</label>
            <input type="date" value={form.sowingDate} onChange={(e) => handleChange("sowingDate", e.target.value)} style={s.input} />
          </div>
          <div>
            <label style={s.label}>Season *</label>
            <select value={form.season} onChange={(e) => handleChange("season", e.target.value)} style={s.select}>
              <option value="Kharif">Kharif (Jun-Sep)</option>
              <option value="Rabi">Rabi (Oct-Mar)</option>
              <option value="Zaid">Zaid (Mar-Jun)</option>
            </select>
          </div>
          <div>
            <label style={s.label}>Location</label>
            <input type="text" value={form.location} onChange={(e) => handleChange("location", e.target.value)} style={s.input} />
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: 16 }}>
          <div>
            <label style={s.label}>Weather Forecast *</label>
            <select value={form.weather} onChange={(e) => handleChange("weather", e.target.value)} style={s.select}>
              {WEATHER_CONDITIONS.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>
          <div>
            <label style={s.label}>Soil Type *</label>
            <select value={form.soilType} onChange={(e) => handleChange("soilType", e.target.value)} style={s.select}>
              {SOIL_TYPES.map(st => <option key={st} value={st}>{st}</option>)}
            </select>
          </div>
          <div>
            <label style={s.label}>Soil Moisture: <span style={{ color: bg.accent }}>{form.soilMoisture}%</span></label>
            <input type="range" min={0} max={100} value={form.soilMoisture} onChange={(e) => handleChange("soilMoisture", e.target.value)} style={{ width: "100%", accentColor: bg.accent, height: 6 }} />
          </div>
        </div>
      </div>

      {/* Progress & Notification Row */}
      <div style={{ display: "grid", gridTemplateColumns: !window.innerWidth || window.innerWidth > 768 ? "1fr 1fr" : "1fr", gap: 20, marginBottom: 24 }}>
        
        {/* Progress Tracker */}
        <div style={s.glassCard}>
          <div style={{ fontSize: 13, fontWeight: 700, color: bg.text, marginBottom: 12 }}>📈 Crop Growth Progress</div>
          
          {/* Progress bar */}
          <div style={{ width: "100%", background: dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)", height: 20, borderRadius: 10, overflow: "hidden", position: "relative", marginBottom: 16 }}>
            <div style={{
              width: `${progress.pct}%`,
              background: `linear-gradient(90deg, ${bg.accent}, ${bg.accentHover})`,
              height: "100%",
              borderRadius: 10,
              transition: "width 0.5s ease",
            }} />
            <span style={{ position: "absolute", left: "50%", top: "50%", transform: "translate(-50%,-50%)", fontSize: 11, fontWeight: 900, color: "#fff", textShadow: "0 1px 3px rgba(0,0,0,0.5)" }}>
              {progress.pct}% Complete
            </span>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 10 }}>
            <div>
              <div style={{ fontSize: 10, color: bg.muted, fontWeight: 700, textTransform: "uppercase" }}>Current Stage</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: bg.accent }}>{progress.stage}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: bg.muted, fontWeight: 700, textTransform: "uppercase" }}>Estimated Harvest</div>
              <div style={{ fontSize: 14, fontWeight: 800, color: bg.text }}>{progress.harvestDateStr}</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: bg.muted, fontWeight: 700, textTransform: "uppercase" }}>Days After Sowing</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: bg.text }}>{progress.das} Days</div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: bg.muted, fontWeight: 700, textTransform: "uppercase" }}>Days Remaining</div>
              <div style={{ fontSize: 15, fontWeight: 800, color: bg.text }}>{progress.remaining} Days</div>
            </div>
          </div>
        </div>

        {/* Notifications & Smart Alerts */}
        <div style={s.glassCard}>
          <div style={{ fontSize: 13, fontWeight: 700, color: bg.text, marginBottom: 12 }}>🔔 Smart Planner Alerts</div>
          <div style={{ display: "flex", flexDirection: "column", gap: 8, maxHeight: 150, overflowY: "auto" }}>
            {alerts.length > 0 ? (
              alerts.map((a, i) => (
                <div key={i} style={{
                  padding: "8px 12px",
                  background: a.startsWith("⚠️") ? "rgba(239,83,80,0.12)" : "rgba(76,175,80,0.08)",
                  border: `1.5px solid ${a.startsWith("⚠️") ? bg.danger : bg.accent}`,
                  borderRadius: 10,
                  fontSize: 12,
                  color: a.startsWith("⚠️") ? bg.danger : bg.text
                }}>
                  {a}
                </div>
              ))
            ) : (
              <div style={{ color: bg.muted, fontSize: 12.5 }}>☀️ All operations are currently on track. No alerts today.</div>
            )}
          </div>
        </div>
      </div>

      {/* Share / Download Toolbar */}
      <div style={{ ...s.glassCard, padding: "12px 18px", marginBottom: 24, display: "flex", gap: 10, justifyContent: "space-between", alignItems: "center", flexWrap: "wrap" }} className="no-print">
        <span style={{ fontSize: 13, fontWeight: 700, color: bg.muted }}>🔧 Schedule Actions:</span>
        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <button onClick={printSchedule} style={s.btn("outline")} title="Print planner or save as PDF">📄 Download PDF</button>
          <button onClick={downloadCalendar} style={s.btn("outline")} title="Download .ics file to import in Google/Outlook Calendar">📅 Add to Calendar</button>
          <button onClick={shareWhatsApp} style={s.btn("outline")} title="Share schedule summary via WhatsApp">📤 WhatsApp Share</button>
        </div>
      </div>

      {/* Timeline Section */}
      <div style={s.glassCard} className="print-schedule-card">
        <h3 style={{ fontSize: 16, fontWeight: 800, color: bg.text, marginBottom: 20 }}>🚜 Planned Sowing & Care Schedule</h3>
        
        <div style={{ display: "flex", flexDirection: "column", gap: 0, position: "relative" }}>
          {schedule.map((task, idx) => {
            const isCurrent = task.status === "Current Task";
            const isCompleted = task.status === "Completed";
            const isOverdue = task.status === "Overdue";

            // Status style
            let badgeBg = "rgba(120,144,156,0.12)";
            let badgeColor = bg.muted;
            let dotBg = bg.border;

            if (isCompleted) {
              badgeBg = "rgba(76,175,80,0.12)";
              badgeColor = "#4caf50";
              dotBg = "#4caf50";
            } else if (isCurrent) {
              badgeBg = "rgba(66,165,245,0.12)";
              badgeColor = "#42a5f5";
              dotBg = "#42a5f5";
            } else if (isOverdue) {
              badgeBg = "rgba(239,83,80,0.12)";
              badgeColor = "#ef5350";
              dotBg = "#ef5350";
            }

            return (
              <div key={idx} style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 0,
                position: "relative",
              }}>
                {/* Vertical timeline line connector */}
                {idx < schedule.length - 1 && (
                  <div style={{
                    position: "absolute",
                    left: 99, // center of the dot column (width 110 + padding offsets)
                    top: 24,
                    bottom: -24,
                    width: 2,
                    background: isCompleted ? "#4caf50" : bg.border,
                    zIndex: 1
                  }} />
                )}

                {/* Left Date column */}
                <div style={{
                  width: 90,
                  flexShrink: 0,
                  padding: "16px 0",
                  textAlign: "right",
                }}>
                  <div style={{ fontSize: 13, fontWeight: 800, color: isCurrent ? bg.accent : bg.text }}>{task.dateStr}</div>
                  <div style={{ fontSize: 9, color: bg.muted, fontWeight: 600, marginTop: 2 }}>Day {task.day}</div>
                </div>

                {/* Middle timeline dot column */}
                <div style={{
                  width: 20,
                  flexShrink: 0,
                  padding: "18px 0",
                  display: "flex",
                  justifyContent: "center",
                  zIndex: 2
                }}>
                  <div style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: dotBg,
                    border: isCurrent ? `2.5px solid ${bg.accent}` : `2px solid ${dotBg}`,
                    boxShadow: isCurrent ? `0 0 10px ${bg.accent}` : "none",
                    animation: isCurrent ? "pulse 2s infinite" : "none"
                  }} />
                </div>

                {/* Right Task details column */}
                <div style={{
                  flex: 1,
                  padding: "12px 0 12px 14px",
                  animation: "fadeIn 0.5s ease-out"
                }}>
                  <div style={{
                    ...s.glassCard,
                    padding: "14px 18px",
                    border: isCurrent ? `2.5px solid ${bg.accent}` : `1px solid ${bg.border}`,
                    boxShadow: isCurrent ? `0 8px 24px rgba(76,175,80,0.15)` : "none",
                    transform: isCurrent ? "scale(1.01)" : "scale(1)",
                    transition: "all 0.3s",
                    display: "flex",
                    flexDirection: "column",
                    gap: 6
                  }}>
                    {/* Top status bar */}
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 8 }}>
                      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                        <span style={{ fontSize: 20 }}>{task.icon}</span>
                        <strong style={{ fontSize: 14, color: isCurrent ? bg.accent : bg.text }}>{task.label}</strong>
                      </div>
                      
                      {/* Status badge */}
                      <span style={{
                        fontSize: 10,
                        fontWeight: 900,
                        padding: "2px 8px",
                        borderRadius: 10,
                        background: badgeBg,
                        color: badgeColor,
                        textTransform: "uppercase",
                        letterSpacing: 0.5,
                        display: "inline-block"
                      }}>
                        {isCurrent ? "🔵 Current Task" : task.status}
                      </span>
                    </div>

                    {/* Task dynamic warning banner */}
                    {task.weatherWarning && (
                      <div style={{
                        background: "rgba(255,152,0,0.1)",
                        border: "1px solid #ff9800",
                        borderRadius: 8,
                        padding: "6px 10px",
                        fontSize: 11,
                        color: "#ef6c00",
                        fontWeight: 700,
                        marginTop: 4,
                        display: "flex",
                        gap: 6,
                        alignItems: "center"
                      }}>
                        <span>{task.weatherWarning}</span>
                      </div>
                    )}

                    {/* Task Advice */}
                    <div style={{ fontSize: 12.5, color: bg.muted, lineHeight: 1.5, marginTop: 4 }}>
                      <strong style={{ color: bg.text }}>AI Advice: </strong>{task.advice}
                    </div>
                  </div>
                </div>

              </div>
            );
          })}
        </div>
      </div>
      
      {/* Styles specifically for printing the schedule */}
      <style>{`
        @media print {
          body {
            background: #fff !important;
            color: #000 !important;
          }
          .no-print, header, aside, footer, nav, button {
            display: none !important;
          }
          main {
            margin: 0 !important;
            padding: 0 !important;
          }
          .print-schedule-card {
            border: none !important;
            background: transparent !important;
            box-shadow: none !important;
            width: 100% !important;
          }
        }
      `}</style>
    </div>
  );
}
