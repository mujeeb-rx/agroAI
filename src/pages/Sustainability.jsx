import { makeStyles } from "../theme.js";
import { t } from "../translations.js";

const SUSTAINABILITY_TOPICS = [
  {
    icon: "🌿",
    title: "Organic Farming",
    color: "#4caf50",
    desc: "Grow crops without synthetic pesticides or fertilizers. Use compost, green manure, and biological pest control to maintain long-term soil health.",
    tips: [
      "Use FYM (Farm Yard Manure) 10-15 tons/acre annually",
      "Practice green manuring with Dhaincha or Sunhemp",
      "Apply neem-based biopesticides instead of chemicals",
      "Get organic certification for premium market prices",
    ],
    stat: { label: "Yield Improvement", value: "+15-20%" },
  },
  {
    icon: "💧",
    title: "Water Conservation",
    color: "#42a5f5",
    desc: "Save up to 50% of irrigation water by adopting modern techniques. Every drop saved helps fight drought and reduces your farming cost.",
    tips: [
      "Switch to drip irrigation to save 40-60% water",
      "Mulch soil with straw or plastic to reduce evaporation",
      "Irrigate in early morning or evening (not midday)",
      "Level your field to prevent runoff and waterlogging",
    ],
    stat: { label: "Water Savings", value: "Up to 60%" },
  },
  {
    icon: "🌧️",
    title: "Rainwater Harvesting",
    color: "#29b6f6",
    desc: "Collect and store rainwater on your farm using farm ponds, check dams, and bunds. Reduce dependence on borewell water.",
    tips: [
      "Build a farm pond (0.1 acre) to collect 1 lakh litres/year",
      "Construct check dams across field drainage channels",
      "Use contour bunding to reduce runoff on slopes",
      "Install rooftop rainwater collection for domestic use",
    ],
    stat: { label: "Storage Capacity", value: "1-5 lakh L" },
  },
  {
    icon: "🐛",
    title: "Natural Pest Control",
    color: "#8bc34a",
    desc: "Use biological and botanical methods to control pests. Protect beneficial insects like ladybirds and lacewings that eat harmful pests.",
    tips: [
      "Release Trichogramma cards for stem borer control",
      "Use Yellow Sticky Traps for whitefly and aphids",
      "Spray neem oil 3% to repel a wide range of pests",
      "Attract birds by placing perches in the field",
    ],
    stat: { label: "Cost Reduction", value: "30-40%" },
  },
  {
    icon: "🔄",
    title: "Crop Rotation",
    color: "#ab47bc",
    desc: "Rotate crops seasonally to break disease and pest cycles, improve soil structure, and reduce fertilizer dependency.",
    tips: [
      "Follow legume-cereal rotation (Rice → Groundnut)",
      "Avoid growing the same crop family consecutively",
      "Include a green manure crop every 3rd season",
      "Rotate between deep-rooted and shallow-rooted crops",
    ],
    stat: { label: "Soil Health Boost", value: "+25-35%" },
  },
  {
    icon: "♻️",
    title: "Composting",
    color: "#ffa726",
    desc: "Convert farm waste, crop residues, and kitchen scraps into valuable compost. One acre of compost can replace 2 bags of chemical fertilizer.",
    tips: [
      "Create a compost pit (10×5×3 ft) near your field",
      "Mix green and dry materials in 1:2 ratio",
      "Add cow dung or bioculture to speed decomposition",
      "Compost is ready in 45-60 days — dark and earthy smell",
    ],
    stat: { label: "Fertilizer Savings", value: "₹3,000-5,000/acre" },
  },
  {
    icon: "🌍",
    title: "Carbon-Friendly Farming",
    color: "#26a69a",
    desc: "Reduce your farm's carbon footprint and contribute to climate action. Healthy soils store carbon, fight climate change, and improve yields.",
    tips: [
      "Avoid burning crop residues — incorporate into soil",
      "Plant trees on field boundaries (agro-forestry)",
      "Use solar-powered pumps instead of diesel",
      "Practice zero-tillage or minimal tillage farming",
    ],
    stat: { label: "Carbon Sequestered", value: "0.5-1 t/acre/yr" },
  },
];

export default function Sustainability({ bg, dark, lang }) {
  const s = makeStyles(bg);

  return (
    <div style={s.section}>
      {/* Header */}
      <div style={{
        ...s.glassCard,
        textAlign: "center",
        marginBottom: 32,
        padding: "3rem 2rem",
        background: dark
          ? "linear-gradient(135deg,rgba(15,35,24,0.9),rgba(10,26,15,0.95))"
          : "linear-gradient(135deg,rgba(232,245,233,0.95),rgba(240,247,241,0.98))",
        position: "relative",
        overflow: "hidden",
      }}>
        <div style={{ position: "absolute", inset: 0, background: `radial-gradient(ellipse at 50% 0%,rgba(76,175,80,0.08) 0%,transparent 70%)`, pointerEvents: "none" }} />
        <div style={{ fontSize: 64, marginBottom: 16, animation: "float 3s ease-in-out infinite", display: "inline-block" }}>🌍</div>
        <h1 style={s.pageTitle}>{t(lang, "sustainability", "title")}</h1>
        <p style={{ color: bg.muted, fontSize: 15, lineHeight: 1.7, maxWidth: 580, margin: "0 auto" }}>
          {t(lang, "sustainability", "subtitle")}
        </p>
        <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 20, flexWrap: "wrap" }}>
          {["🌿 Eco-Friendly", "💰 Cost Saving", "🏆 Higher Yield", "🌧️ Water Smart"].map((tag) => (
            <span key={tag} style={{ ...s.tag, fontSize: 13, padding: "6px 16px" }}>{tag}</span>
          ))}
        </div>
      </div>

      {/* Topic cards */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(320px,1fr))", gap: 20 }}>
        {SUSTAINABILITY_TOPICS.map((topic, i) => (
          <div
            key={topic.title}
            style={{
              ...s.glassCard,
              borderTop: `3px solid ${topic.color}`,
              animation: `fadeIn ${0.3 + i * 0.08}s ease-out`,
            }}
          >
            {/* Card header */}
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div style={{
                  width: 52, height: 52,
                  borderRadius: 14,
                  background: `${topic.color}20`,
                  border: `2px solid ${topic.color}40`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 26,
                }}>
                  {topic.icon}
                </div>
                <h3 style={{ fontSize: 16, fontWeight: 800, color: bg.text }}>{topic.title}</h3>
              </div>
              <div style={{ textAlign: "right" }}>
                <div style={{ fontSize: 16, fontWeight: 900, color: topic.color }}>{topic.stat.value}</div>
                <div style={{ fontSize: 9, color: bg.muted, fontWeight: 700, textTransform: "uppercase" }}>{topic.stat.label}</div>
              </div>
            </div>

            <p style={{ fontSize: 13, color: bg.muted, lineHeight: 1.65, marginBottom: 14 }}>{topic.desc}</p>

            {/* Tips */}
            <div style={{ background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", borderRadius: 10, padding: "12px 14px" }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: topic.color, textTransform: "uppercase", letterSpacing: 0.6, marginBottom: 8 }}>
                💡 Practical Tips
              </div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                {topic.tips.map((tip, j) => (
                  <div key={j} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <span style={{ color: topic.color, fontWeight: 700, flexShrink: 0, fontSize: 13 }}>✓</span>
                    <span style={{ fontSize: 12, color: bg.text, lineHeight: 1.5 }}>{tip}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div style={{ ...s.glassCard, marginTop: 32, textAlign: "center", padding: "2.5rem", borderTop: `3px solid ${bg.accent}` }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🌾</div>
        <h3 style={{ fontSize: 18, fontWeight: 800, color: bg.text, marginBottom: 8 }}>Every Sustainable Choice Matters</h3>
        <p style={{ color: bg.muted, fontSize: 14, lineHeight: 1.6, maxWidth: 480, margin: "0 auto 16px" }}>
          Sustainable farming is not just good for the environment — it reduces costs, improves soil health, and ensures your land remains productive for decades.
        </p>
        <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
          <span style={{ ...s.tag, padding: "8px 16px", fontSize: 13 }}>🌱 Start with one practice today</span>
          <span style={{ ...s.tag, padding: "8px 16px", fontSize: 13 }}>📱 Share with your farming community</span>
        </div>
      </div>
    </div>
  );
}
