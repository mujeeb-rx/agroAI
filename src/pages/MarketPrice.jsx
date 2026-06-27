import { useState, useEffect } from "react";
import { makeStyles } from "../theme.js";
import { t } from "../translations.js";

const CROPS_LIST = [
  { key: "Rice", emoji: "🌾" },
  { key: "Wheat", emoji: "🌿" },
  { key: "Tomato", emoji: "🍅" },
  { key: "Onion", emoji: "🧅" },
  { key: "Cotton", emoji: "🌸" },
  { key: "Sugarcane", emoji: "🎋" },
  { key: "Maize", emoji: "🌽" },
  { key: "Groundnut", emoji: "🥜" },
  { key: "Soybean", emoji: "🫘" },
  { key: "Potato", emoji: "🥔" },
  { key: "Mustard", emoji: "🌼" },
  { key: "Banana", emoji: "🍌" }
];

export default function MarketPrice({ bg, dark, lang }) {
  const s = makeStyles(bg);
  const [selectedCrop, setSelectedCrop] = useState("Rice");
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Chart state
  const [chartRange, setChartRange] = useState("7d"); // "7d", "30d", "90d", "1y"
  const [chartStyle, setChartStyle] = useState("bar"); // "bar", "line"

  // Calculator state
  const [quantity, setQuantity] = useState("50");

  useEffect(() => {
    let active = true;
    async function fetchMarketData() {
      setLoading(true);
      setError(null);

      let userState = "Telangana";
      let userDistrict = "Local District";
      const stored = localStorage.getItem("agroai_settings");
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.state) userState = parsed.state;
          if (parsed.district) userDistrict = parsed.district;
        } catch (_) {}
      }

      try {
        const res = await fetch("/api/market-data", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            crop: selectedCrop,
            state: userState,
            district: userDistrict
          })
        });
        if (!res.ok) throw new Error("Failed to load live price data.");
        const result = await res.json();
        if (active) {
          setData(result);
          setLoading(false);
        }
      } catch (err) {
        if (active) {
          setError(err.message);
          setLoading(false);
        }
      }
    }
    fetchMarketData();
    return () => { active = false; };
  }, [selectedCrop]);

  if (loading) {
    return (
      <div style={s.section}>
        <h2 style={s.pageTitle}>💰 Live AI Market Intelligence</h2>
        <p style={s.pageSub}>Connecting to Agmarknet mandi feeds and analyzing regional price actions...</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>
          <div style={{
            ...s.glassCard,
            height: 120,
            animation: "shimmer 1.5s infinite linear",
            background: bg.bg === "#0a1a0f" ? "linear-gradient(90deg, #0f2318 25%, #1a4028 50%, #0f2318 75%)" : "linear-gradient(90deg, #ffffff 25%, #c8e6c9 50%, #ffffff 75%)",
            backgroundSize: "200% 100%"
          }} />
          <div style={{
            ...s.glassCard,
            height: 250,
            animation: "shimmer 1.5s infinite linear",
            background: bg.bg === "#0a1a0f" ? "linear-gradient(90deg, #0f2318 25%, #1a4028 50%, #0f2318 75%)" : "linear-gradient(90deg, #ffffff 25%, #c8e6c9 50%, #ffffff 75%)",
            backgroundSize: "200% 100%"
          }} />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={s.section}>
        <h2 style={s.pageTitle}>💰 Live AI Market Intelligence</h2>
        <div style={{ ...s.glassCard, borderLeft: `4px solid ${bg.danger}`, textAlign: "center", padding: "2.5rem" }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
          <h3 style={{ fontSize: 18, fontWeight: 700, color: bg.danger, marginBottom: 8 }}>Data Temporarily Unavailable</h3>
          <p style={{ color: bg.muted, fontSize: 14, marginBottom: 16 }}>
            Unable to connect to Agmarknet API servers. Please check your network connection and try again.
          </p>
          <button style={s.btn("primary")} onClick={() => setSelectedCrop(selectedCrop)}>Retry Connection</button>
        </div>
      </div>
    );
  }

  // Extract variables
  const {
    currentPrice,
    yesterdayPrice,
    dailyChangePct,
    weeklyChangePct,
    monthlyTrend,
    lastUpdated,
    market,
    district,
    state,
    msp,
    source,
    status,
    aiPrediction,
    aiConfidence,
    predictionExplanation,
    sellingAdvice,
    sellingAdviceExplanation,
    nearbyMarkets,
    dailySummary,
    alerts
  } = data;

  // Chart data resolver
  const activeHistory =
    chartRange === "7d" ? data.history7d :
    chartRange === "30d" ? data.history30d :
    chartRange === "90d" ? data.history90d :
    data.history1y;

  const prices = activeHistory.map(d => d.value);
  const maxPrice = Math.max(...prices, 1);
  const minPrice = Math.min(...prices, 1);
  const avgPrice = Math.round(prices.reduce((a, b) => a + b, 0) / prices.length);

  // Highlight Best Market Today
  const sortedMarkets = [...nearbyMarkets].sort((a, b) => b.price - a.price);
  const bestMarket = sortedMarkets[0] || null;

  // Profit calculations
  const qtyNum = parseFloat(quantity) || 0;
  const totalRevenue = qtyNum * currentPrice;
  // Estimate distance-based transportation cost (flat ₹45 per quintal, plus ₹1.5 per quintal per km of nearest best market)
  const bestMktDistance = bestMarket ? parseFloat(bestMarket.distance.replace(/[^0-9.]/g, "")) || 50 : 50;
  const transportCost = qtyNum * (40 + (bestMktDistance * 0.8));
  const netProfit = Math.max(0, totalRevenue - transportCost);

  // Status badge styling
  const statusConfig = status === "Live"
    ? { text: "Live Data Feed", color: "#4caf50", bg: "rgba(76,175,80,0.12)" }
    : { text: "Cached Mandi Price", color: "#ff9800", bg: "rgba(255,152,0,0.12)" };

  return (
    <div style={s.section}>
      {/* Header section with live status indicator */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 24 }}>
        <div>
          <h2 style={s.pageTitle}>{t(lang, "market", "title")}</h2>
          <p style={s.pageSub}>{t(lang, "market", "subtitle")}</p>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            padding: "6px 14px",
            borderRadius: "20px",
            background: statusConfig.bg,
            border: `1.5px solid ${statusConfig.color}`,
            color: statusConfig.color,
            fontSize: 12,
            fontWeight: 800,
          }}>
            {status === "Live" && (
              <span style={{
                width: 6, height: 6, borderRadius: "50%",
                background: "#4caf50", display: "inline-block",
                animation: "pulse 1.2s infinite"
              }} />
            )}
            {statusConfig.text}
          </div>
          <span style={{ fontSize: 11, color: bg.muted, fontWeight: 600 }}>Last Updated: {lastUpdated}</span>
        </div>
      </div>

      {/* Crop selector */}
      <div style={{ display: "flex", gap: 8, overflowX: "auto", paddingBottom: 12, marginBottom: 24, WebkitOverflowScrolling: "touch" }}>
        {CROPS_LIST.map((crop) => (
          <button
            key={crop.key}
            onClick={() => setSelectedCrop(crop.key)}
            style={{
              ...s.btn(selectedCrop === crop.key ? "primary" : "outline"),
              padding: "8px 16px",
              fontSize: 13,
              display: "flex",
              alignItems: "center",
              gap: 6,
              whiteSpace: "nowrap",
              flexShrink: 0
            }}
          >
            <span>{crop.emoji}</span> {crop.key}
          </button>
        ))}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 20 }}>

        {/* 1. Live Price & Main Stats Card */}
        <div style={{
          ...s.glassCard,
          borderTop: `4px solid ${bg.accent}`,
          display: "flex",
          flexWrap: "wrap",
          justifyContent: "space-between",
          alignItems: "center",
          gap: 20
        }}>
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{ fontSize: 56 }}>{CROPS_LIST.find(c => c.key === selectedCrop)?.emoji || "🌾"}</span>
              <div>
                <div style={{ fontSize: 12, color: bg.muted, fontWeight: 800, textTransform: "uppercase", letterSpacing: 0.8 }}>
                  {selectedCrop} — {market}, {district} ({state})
                </div>
                <div style={{ fontSize: "clamp(2rem, 5vw, 2.6rem)", fontWeight: 900, color: bg.accent, lineHeight: 1.1, margin: "4px 0" }}>
                  ₹{currentPrice.toLocaleString("en-IN")}
                </div>
                <div style={{ fontSize: 12, color: bg.muted, fontWeight: 600 }}>
                  per Quintal (100 kg) · Source: {source}
                </div>
              </div>
            </div>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, borderLeft: !window.innerWidth || window.innerWidth > 768 ? `1px solid ${bg.border}` : "none", paddingLeft: !window.innerWidth || window.innerWidth > 768 ? 24 : 0 }}>
            <div>
              <div style={{ fontSize: 10, color: bg.muted, fontWeight: 800, textTransform: "uppercase" }}>MSP Rate</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: bg.text, marginTop: 4 }}>
                {msp ? `₹${msp.toLocaleString("en-IN")}` : "N/A"}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: bg.muted, fontWeight: 800, textTransform: "uppercase" }}>Yesterday</div>
              <div style={{ fontSize: 18, fontWeight: 900, color: bg.text, marginTop: 4 }}>
                ₹{yesterdayPrice.toLocaleString("en-IN")}
              </div>
            </div>
            <div>
              <div style={{ fontSize: 10, color: bg.muted, fontWeight: 800, textTransform: "uppercase" }}>Daily Change</div>
              <div style={{
                fontSize: 18,
                fontWeight: 900,
                color: dailyChangePct > 0 ? "#4caf50" : dailyChangePct < 0 ? "#ef5350" : "#ff9800",
                marginTop: 4,
                display: "flex",
                alignItems: "center",
                gap: 4
              }}>
                <span>{dailyChangePct > 0 ? "▲" : dailyChangePct < 0 ? "▼" : "●"}</span>
                <span>{Math.abs(dailyChangePct)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* 2. Interactive Price Trend Chart & Peak Metrics */}
        <div style={s.glassCard}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: 10, marginBottom: 20 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: bg.text }}>📈 Mandi Price Trend Analytics</div>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {/* Range select */}
              <div style={{ background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", borderRadius: 10, padding: 3, display: "flex" }}>
                {["7d", "30d", "90d", "1y"].map(r => (
                  <button
                    key={r}
                    onClick={() => setChartRange(r)}
                    style={{
                      background: chartRange === r ? bg.accent : "transparent",
                      color: chartRange === r ? "#fff" : bg.muted,
                      border: "none",
                      padding: "4px 10px",
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer",
                      textTransform: "uppercase"
                    }}
                  >
                    {r}
                  </button>
                ))}
              </div>
              {/* Style select */}
              <div style={{ background: dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.05)", borderRadius: 10, padding: 3, display: "flex" }}>
                {["bar", "line"].map(style => (
                  <button
                    key={style}
                    onClick={() => setChartStyle(style)}
                    style={{
                      background: chartStyle === style ? bg.accent : "transparent",
                      color: chartStyle === style ? "#fff" : bg.muted,
                      border: "none",
                      padding: "4px 10px",
                      borderRadius: 8,
                      fontSize: 11,
                      fontWeight: 700,
                      cursor: "pointer"
                    }}
                  >
                    {style === "bar" ? "Columns" : "Line"}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Peak statistics block */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 12, marginBottom: 20 }}>
            {[
              { label: "Highest Price", value: `₹${maxPrice.toLocaleString("en-IN")}`, color: "#4caf50", desc: "Max mandi value" },
              { label: "Lowest Price", value: `₹${minPrice.toLocaleString("en-IN")}`, color: "#ef5350", desc: "Min mandi value" },
              { label: "Average Price", value: `₹${avgPrice.toLocaleString("en-IN")}`, color: bg.accent, desc: "Period average" },
            ].map(m => (
              <div key={m.label} style={{ background: dark ? "rgba(255,255,255,0.02)" : "#f8faf8", border: `1px solid ${bg.border}`, borderRadius: 12, padding: "10px 14px" }}>
                <div style={{ fontSize: 10, color: bg.muted, fontWeight: 700, textTransform: "uppercase" }}>{m.label}</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: m.color, margin: "2px 0" }}>{m.value}</div>
                <div style={{ fontSize: 9, color: bg.muted }}>{m.desc}</div>
              </div>
            ))}
          </div>

          {/* Chart Display Area */}
          {chartStyle === "bar" ? (
            <div style={{ display: "flex", gap: 8, alignItems: "flex-end", height: 160, padding: "10px 0" }}>
              {activeHistory.map((d, idx) => {
                const heightPct = maxPrice === minPrice ? 50 : Math.round(((d.value - minPrice) / (maxPrice - minPrice)) * 100);
                const heightVal = Math.max(15, Math.min(100, heightPct));
                const isToday = d.label === "Today" || d.label === "Yesterday" || idx === activeHistory.length - 1;
                return (
                  <div key={idx} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: 4 }}>
                    <div style={{ fontSize: 8, color: bg.accent, fontWeight: 700 }}>₹{d.value.toLocaleString("en-IN")}</div>
                    <div style={{
                      width: "100%",
                      height: `${heightVal}%`,
                      background: isToday
                        ? `linear-gradient(to top, ${bg.accent}, ${bg.accentHover})`
                        : dark ? "rgba(76,175,80,0.18)" : "rgba(46,125,50,0.1)",
                      border: isToday ? `1.5px solid ${bg.accent}` : `1px solid ${bg.border}`,
                      borderRadius: "4px 4px 0 0",
                      position: "relative",
                      animation: "growHeight 0.5s ease-out",
                      "--target-height": `${heightVal}%`,
                    }} />
                    <div style={{ fontSize: 9, color: isToday ? bg.accent : bg.muted, fontWeight: isToday ? 800 : 500 }}>
                      {d.label}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div style={{ padding: "10px 0" }}>
              {/* SVG Line Chart */}
              {activeHistory.length > 1 ? (
                (() => {
                  const points = activeHistory.map((d, idx) => {
                    const x = 40 + (idx / (activeHistory.length - 1)) * 420;
                    const rangeDiff = maxPrice - minPrice || 1;
                    const y = 130 - ((d.value - minPrice) / rangeDiff) * 100;
                    return `${x},${y}`;
                  }).join(" ");

                  return (
                    <svg viewBox="0 0 500 160" style={{ width: "100%", height: "auto" }}>
                      <line x1={40} y1={30} x2={460} y2={30} stroke={bg.border} strokeDasharray="4" />
                      <line x1={40} y1={80} x2={460} y2={80} stroke={bg.border} strokeDasharray="4" />
                      <line x1={40} y1={130} x2={460} y2={130} stroke={bg.border} strokeDasharray="4" />
                      
                      <polyline
                        fill="none"
                        stroke={bg.accent}
                        strokeWidth="3.5"
                        points={points}
                      />
                      
                      {activeHistory.map((d, idx) => {
                        const x = 40 + (idx / (activeHistory.length - 1)) * 420;
                        const rangeDiff = maxPrice - minPrice || 1;
                        const y = 130 - ((d.value - minPrice) / rangeDiff) * 100;
                        return (
                          <g key={idx}>
                            <circle
                              cx={x}
                              cy={y}
                              r="4.5"
                              fill={bg.card}
                              stroke={bg.accent}
                              strokeWidth="2.5"
                            />
                            <text
                              x={x}
                              y={y - 10}
                              textAnchor="middle"
                              fontSize="8"
                              fill={bg.text}
                              fontWeight="bold"
                            >
                              ₹{d.value}
                            </text>
                            <text
                              x={x}
                              y={150}
                              textAnchor="middle"
                              fontSize="9"
                              fill={bg.muted}
                            >
                              {d.label}
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  );
                })()
              ) : (
                <div style={{ color: bg.muted, fontSize: 13, textAlign: "center", padding: 24 }}>No chart data.</div>
              )}
            </div>
          )}
        </div>

        {/* 3. AI Price Prediction & Selling Advice Cards */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {/* AI Prediction */}
          <div style={{
            ...s.glassCard,
            borderLeft: `4px solid ${
              aiPrediction.includes("Increase") ? "#4caf50" :
              aiPrediction.includes("Decrease") ? "#ef5350" : "#ff9800"
            }`
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
              <div style={{ fontSize: 13, color: bg.accent, fontWeight: 800 }}>🤖 AI Market Outlook</div>
              <div style={{ fontSize: 11, background: "rgba(66,165,245,0.15)", color: "#42a5f5", padding: "2px 8px", borderRadius: 10, fontWeight: 700 }}>
                Confidence: {aiConfidence}%
              </div>
            </div>
            <div style={{ fontSize: 18, fontWeight: 900, color: bg.text, marginBottom: 8 }}>{aiPrediction}</div>
            <p style={{ fontSize: 13, color: bg.muted, lineHeight: 1.6 }}>{predictionExplanation}</p>
          </div>

          {/* Smart Selling Advice */}
          <div style={{
            ...s.glassCard,
            borderLeft: `4px solid ${
              sellingAdvice.includes("Sell") ? "#4caf50" :
              sellingAdvice.includes("Wait") ? "#ef5350" : "#ff9800"
            }`
          }}>
            <div style={{ fontSize: 13, color: bg.accent, fontWeight: 800, marginBottom: 12 }}>⚡ Recommendation</div>
            <div style={{ fontSize: 18, fontWeight: 900, color: bg.text, marginBottom: 8 }}>{sellingAdvice}</div>
            <p style={{ fontSize: 13, color: bg.muted, lineHeight: 1.6 }}>{sellingAdviceExplanation}</p>
          </div>
        </div>

        {/* 4. Nearby Market Comparison Table */}
        <div style={s.glassCard}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ fontSize: 14, fontWeight: 800, color: bg.text }}>🏪 Mandi Price Comparison (Nearby & Hubs)</div>
            {bestMarket && (
              <div style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 6,
                background: "rgba(255,193,7,0.12)",
                border: "1px solid #ffc107",
                borderRadius: 14,
                padding: "4px 10px",
                fontSize: 11,
                color: "#ffa000",
                fontWeight: 700,
                animation: "pulse 2s infinite"
              }}>
                <span>🏆 Best Market:</span>
                <strong>{bestMarket.market} (₹{bestMarket.price}/q)</strong>
              </div>
            )}
          </div>

          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", minWidth: 500 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${bg.border}` }}>
                  <th style={{ textAlign: "left", padding: "10px 8px", fontSize: 11, color: bg.muted, textTransform: "uppercase" }}>Market</th>
                  <th style={{ textAlign: "left", padding: "10px 8px", fontSize: 11, color: bg.muted, textTransform: "uppercase" }}>District</th>
                  <th style={{ textAlign: "center", padding: "10px 8px", fontSize: 11, color: bg.muted, textTransform: "uppercase" }}>Distance</th>
                  <th style={{ textAlign: "right", padding: "10px 8px", fontSize: 11, color: bg.muted, textTransform: "uppercase" }}>Today's Price</th>
                  <th style={{ textAlign: "center", padding: "10px 8px", fontSize: 11, color: bg.muted, textTransform: "uppercase" }}>Trend</th>
                  <th style={{ textAlign: "center", padding: "10px 8px", fontSize: 11, color: bg.muted, textTransform: "uppercase" }}>Status</th>
                  <th style={{ textAlign: "right", padding: "10px 8px", fontSize: 11, color: bg.muted, textTransform: "uppercase" }}>Last Updated</th>
                </tr>
              </thead>
              <tbody>
                {nearbyMarkets.map((mkt, idx) => {
                  const isBest = bestMarket && mkt.market === bestMarket.market;
                  return (
                    <tr key={idx} style={{
                      borderBottom: `1px solid ${bg.border}`,
                      background: isBest ? "rgba(255,193,7,0.04)" : "transparent"
                    }}>
                      <td style={{ padding: "12px 8px", fontSize: 13, fontWeight: 700, color: bg.text }}>
                        {isBest ? "🏆 " : ""}{mkt.market}
                      </td>
                      <td style={{ padding: "12px 8px", fontSize: 12, color: bg.muted }}>{mkt.district}</td>
                      <td style={{ padding: "12px 8px", fontSize: 12, color: bg.muted, textAlign: "center" }}>{mkt.distance}</td>
                      <td style={{ padding: "12px 8px", fontSize: 14, fontWeight: 800, color: bg.accent, textAlign: "right" }}>
                        ₹{mkt.price.toLocaleString("en-IN")}
                      </td>
                      <td style={{
                        padding: "12px 8px",
                        fontSize: 12,
                        fontWeight: 700,
                        textAlign: "center",
                        color: mkt.trend === "up" ? "#4caf50" : mkt.trend === "down" ? "#ef5350" : "#ff9800"
                      }}>
                        {mkt.trend === "up" ? "▲ Up" : mkt.trend === "down" ? "▼ Down" : "● Stable"}
                      </td>
                      <td style={{ padding: "12px 8px", textAlign: "center" }}>
                        <span style={{
                          fontSize: 10,
                          fontWeight: 700,
                          padding: "2px 8px",
                          borderRadius: 8,
                          background: isBest ? "rgba(255,193,7,0.15)" : mkt.status === "Good" ? "rgba(76,175,80,0.15)" : "rgba(0,0,0,0.06)",
                          color: isBest ? "#ffa000" : mkt.status === "Good" ? "#4caf50" : bg.muted,
                          border: isBest ? "1px solid #ffc107" : "none"
                        }}>
                          {isBest ? "Best Price" : mkt.status}
                        </span>
                      </td>
                      <td style={{ padding: "12px 8px", fontSize: 11, color: bg.muted, textAlign: "right" }}>{mkt.lastUpdated}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* 5. Farmer Profit Calculator */}
        <div style={s.glassCard}>
          <div style={{ fontSize: 14, fontWeight: 800, color: bg.text, marginBottom: 16 }}>🧮 Farmer Mandi Net Profit Estimator</div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 20, alignItems: "center" }}>
            <div>
              <label style={s.label}>Crop Quantity to Sell (Quintals):</label>
              <input
                type="number"
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                style={s.input}
                min="1"
              />
              <span style={{ fontSize: 11, color: bg.muted, marginTop: 4, display: "inline-block" }}>
                1 Quintal = 100 kg. Estimating for crop: {selectedCrop}
              </span>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12 }}>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 10, color: bg.muted, fontWeight: 700 }}>Gross Revenue</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: bg.text, marginTop: 4 }}>
                  ₹{Math.round(totalRevenue).toLocaleString("en-IN")}
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 10, color: bg.muted, fontWeight: 700 }}>Transport Cost</div>
                <div style={{ fontSize: 16, fontWeight: 900, color: bg.danger, marginTop: 4 }}>
                  ₹{Math.round(transportCost).toLocaleString("en-IN")}
                </div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div style={{ fontSize: 10, color: bg.muted, fontWeight: 700 }}>Net Handover</div>
                <div style={{ fontSize: 18, fontWeight: 900, color: "#4caf50", marginTop: 4 }}>
                  ₹{Math.round(netProfit).toLocaleString("en-IN")}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* 6. Smart Alerts & Daily Summary Card */}
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 20 }}>
          {/* Daily Summary */}
          <div style={s.glassCard}>
            <div style={{ fontSize: 13, color: bg.accent, fontWeight: 800, marginBottom: 12 }}>📰 Daily Market Intelligence Brief</div>
            <p style={{ fontSize: 13, color: bg.text, lineHeight: 1.7 }}>{dailySummary}</p>
          </div>

          {/* Smart Alerts */}
          <div style={s.glassCard}>
            <div style={{ fontSize: 13, color: bg.accent, fontWeight: 800, marginBottom: 12 }}>🔔 Intelligence Alerts</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {alerts.map((alert, i) => (
                <div key={i} style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "8px 12px",
                  background: dark ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
                  border: `1px solid ${bg.border}`,
                  borderRadius: 10,
                  fontSize: 12.5,
                  color: bg.text
                }}>
                  <span>{alert}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
