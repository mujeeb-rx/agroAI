import { useState, useEffect } from "react";
import { makeStyles } from "../theme.js";
import { t } from "../translations.js";

const STATES = ["Andhra Pradesh","Bihar","Chhattisgarh","Gujarat","Haryana","Himachal Pradesh","Jharkhand","Karnataka","Kerala","Madhya Pradesh","Maharashtra","Odisha","Punjab","Rajasthan","Tamil Nadu","Telangana","Uttar Pradesh","Uttarakhand","West Bengal"];
const CROPS = ["Rice","Wheat","Maize","Cotton","Sugarcane","Soybean","Groundnut","Tomato","Onion","Potato"];

export default function Settings({ bg, dark, setDark, lang, changeLang }) {
  const s = makeStyles(bg);
  const [saved, setSaved] = useState(false);
  const [form, setForm] = useState({
    farmerName: "",
    state: "",
    district: "",
    primaryCrop: "",
    farmSize: "",
    phone: "",
    voiceEnabled: true,
    notificationsEnabled: true,
    autoSaveHistory: true,
  });

  useEffect(() => {
    const stored = localStorage.getItem("agroai_settings");
    if (stored) {
      try { setForm(JSON.parse(stored)); } catch (_) {}
    } else {
      setForm((f) => ({
        ...f,
        farmerName: localStorage.getItem("agroai_farmer_name") || "",
      }));
    }
  }, []);

  function handleChange(k, v) { setForm((f) => ({ ...f, [k]: v })); setSaved(false); }

  function saveSettings() {
    localStorage.setItem("agroai_settings", JSON.stringify(form));
    localStorage.setItem("agroai_farmer_name", form.farmerName);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  }

  function clearAllData() {
    if (!window.confirm("⚠️ This will delete all your history, settings, and preferences. Are you sure?")) return;
    ["agroai_history","agroai_settings","agroai_farmer_name","agroai_query_count","agroai_start_date"].forEach((k) => localStorage.removeItem(k));
    setForm({ farmerName: "", state: "", district: "", primaryCrop: "", farmSize: "", phone: "", voiceEnabled: true, notificationsEnabled: true, autoSaveHistory: true });
    setSaved(false);
  }

  const Toggle = ({ value, onChange, label }) => (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: `1px solid ${bg.border}` }}>
      <span style={{ fontSize: 14, color: bg.text }}>{label}</span>
      <div
        onClick={() => onChange(!value)}
        style={{
          width: 48, height: 26, borderRadius: 13,
          background: value ? bg.accent : (dark ? "rgba(255,255,255,0.15)" : "rgba(0,0,0,0.15)"),
          position: "relative", cursor: "pointer",
          transition: "background 0.3s",
          flexShrink: 0,
        }}
      >
        <div style={{
          position: "absolute",
          top: 3, left: value ? 25 : 3,
          width: 20, height: 20,
          borderRadius: "50%", background: "#fff",
          transition: "left 0.3s",
          boxShadow: "0 1px 4px rgba(0,0,0,0.2)",
        }} />
      </div>
    </div>
  );

  return (
    <div style={s.section}>
      <h2 style={s.pageTitle}>{t(lang, "settings", "title")}</h2>
      <p style={s.pageSub}>{t(lang, "settings", "subtitle")}</p>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", gap: 20 }}>
        {/* Farmer Profile */}
        <div style={s.glassCard}>
          <div style={{ fontSize: 14, fontWeight: 800, color: bg.text, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
            <span>👤</span> Farmer Profile
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div>
              <label style={s.label}>Farmer Name</label>
              <input value={form.farmerName} onChange={(e) => handleChange("farmerName", e.target.value)} placeholder="Enter your name" style={s.input} />
            </div>
            <div>
              <label style={s.label}>State</label>
              <select value={form.state} onChange={(e) => handleChange("state", e.target.value)} style={s.select}>
                <option value="">— Select State —</option>
                {STATES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>
            <div>
              <label style={s.label}>District / Village</label>
              <input value={form.district} onChange={(e) => handleChange("district", e.target.value)} placeholder="Enter district or village" style={s.input} />
            </div>
            <div>
              <label style={s.label}>Primary Crop</label>
              <select value={form.primaryCrop} onChange={(e) => handleChange("primaryCrop", e.target.value)} style={s.select}>
                <option value="">— Select Crop —</option>
                {CROPS.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label style={s.label}>Farm Size (Acres)</label>
              <input type="number" min="0.1" step="0.5" value={form.farmSize} onChange={(e) => handleChange("farmSize", e.target.value)} placeholder="e.g. 5" style={s.input} />
            </div>
            <div>
              <label style={s.label}>Phone Number (optional)</label>
              <input type="tel" value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} placeholder="+91 XXXXX XXXXX" style={s.input} />
            </div>
          </div>
        </div>

        {/* App Preferences */}
        <div style={{ display: "flex", flexDirection: "column", gap: 20 }}>
          <div style={s.glassCard}>
            <div style={{ fontSize: 14, fontWeight: 800, color: bg.text, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
              <span>🎨</span> Appearance
            </div>
            <div style={{ fontSize: 12, color: bg.muted, marginBottom: 16 }}>Theme and display preferences</div>
            <Toggle value={dark} onChange={(v) => setDark(v)} label="🌙 Dark Mode" />
            <div style={{ padding: "16px 0", borderBottom: `1px solid ${bg.border}` }}>
              <label style={s.label}>Language</label>
              <select value={lang} onChange={(e) => changeLang(e.target.value)} style={s.select}>
                <option value="en">🇬🇧 English</option>
                <option value="ta">🇮🇳 தமிழ் (Tamil)</option>
                <option value="hi">🇮🇳 हिंदी (Hindi)</option>
                <option value="te">🇮🇳 తెలుగు (Telugu)</option>
                <option value="kn">🇮🇳 ಕನ್ನಡ (Kannada)</option>
                <option value="mr">🇮🇳 मराठी (Marathi)</option>
                <option value="bn">🇮🇳 বাংলা (Bengali)</option>
                <option value="ml">🇮🇳 മലയാളം (Malayalam)</option>
              </select>
            </div>
          </div>

          <div style={s.glassCard}>
            <div style={{ fontSize: 14, fontWeight: 800, color: bg.text, marginBottom: 4, display: "flex", alignItems: "center", gap: 8 }}>
              <span>🔔</span> Preferences
            </div>
            <div style={{ fontSize: 12, color: bg.muted, marginBottom: 16 }}>Voice and notification settings</div>
            <Toggle value={form.voiceEnabled} onChange={(v) => handleChange("voiceEnabled", v)} label="🎙️ Voice Assistant" />
            <Toggle value={form.notificationsEnabled} onChange={(v) => handleChange("notificationsEnabled", v)} label="🔔 Farming Reminders" />
            <Toggle value={form.autoSaveHistory} onChange={(v) => handleChange("autoSaveHistory", v)} label="📁 Auto-Save Scan History" />
          </div>

          {/* App info */}
          <div style={s.glassCard}>
            <div style={{ fontSize: 14, fontWeight: 800, color: bg.text, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
              <span>ℹ️</span> App Information
            </div>
            {[
              { label: "Version", value: "2.0.0" },
              { label: "AI Engine", value: "Google Gemini" },
              { label: "Language Support", value: "8 Languages" },
              { label: "Platform", value: "Web PWA" },
            ].map((info) => (
              <div key={info.label} style={{ display: "flex", justifyContent: "space-between", padding: "8px 0", borderBottom: `1px solid ${bg.border}`, fontSize: 13 }}>
                <span style={{ color: bg.muted }}>{info.label}</span>
                <span style={{ color: bg.text, fontWeight: 600 }}>{info.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Save & Danger zone */}
      <div style={{ display: "flex", gap: 12, marginTop: 24, flexWrap: "wrap", alignItems: "center" }}>
        <button onClick={saveSettings} style={{ ...s.btn("primary"), display: "flex", alignItems: "center", gap: 8 }}>
          {saved ? "✅ Saved!" : "💾 Save Settings"}
        </button>
        {saved && <span style={{ fontSize: 13, color: "#4caf50", fontWeight: 700 }}>Settings saved successfully!</span>}
      </div>

      {/* Danger zone */}
      <div style={{ ...s.glassCard, marginTop: 24, borderTop: "3px solid #f44336" }}>
        <div style={{ fontSize: 13, fontWeight: 800, color: "#f44336", marginBottom: 8 }}>⚠️ Danger Zone</div>
        <p style={{ fontSize: 13, color: bg.muted, marginBottom: 14, lineHeight: 1.6 }}>
          Permanently delete all scan history, settings, and app data. This action cannot be undone.
        </p>
        <button onClick={clearAllData} style={{ ...s.btn("danger"), border: "1.5px solid #f44336" }}>
          🗑️ Clear All App Data
        </button>
      </div>
    </div>
  );
}
