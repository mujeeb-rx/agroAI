import { useState, useRef, useEffect } from "react";
import { makeStyles } from "../theme.js";
import { t } from "../translations.js";

const WEATHER_API_KEY = "cf8cc0f5d240207ed8400595532e66dc";

function WeatherMap({ lat, lon, dark, bg }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current || typeof window.L === "undefined") return;
    const L = window.L;
    delete L.Icon.Default.prototype._getIconUrl;
    L.Icon.Default.mergeOptions({
      iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
      iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
      shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
    });
    if (!mapInstanceRef.current) {
      mapInstanceRef.current = L.map(mapRef.current, { zoomControl: true, attributionControl: false }).setView([lat, lon], 12);
    } else {
      mapInstanceRef.current.setView([lat, lon], 12);
    }
    const map = mapInstanceRef.current;
    map.eachLayer((layer) => { if (layer instanceof L.TileLayer) map.removeLayer(layer); });
    const tileUrl = dark
      ? "https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
      : "https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png";
    L.tileLayer(tileUrl, { maxZoom: 19 }).addTo(map);
    if (markerRef.current) { markerRef.current.setLatLng([lat, lon]); }
    else { markerRef.current = L.marker([lat, lon]).addTo(map); }
    setTimeout(() => map.invalidateSize(), 200);
  }, [lat, lon, dark]);

  useEffect(() => {
    return () => {
      if (mapInstanceRef.current) { mapInstanceRef.current.remove(); mapInstanceRef.current = null; markerRef.current = null; }
    };
  }, []);

  return (
    <div style={{ height: 260, borderRadius: 16, overflow: "hidden", border: `1px solid ${bg.border}` }}>
      <div ref={mapRef} style={{ width: "100%", height: "100%", zIndex: 1 }} />
    </div>
  );
}

function ForecastDay({ day, bg }) {
  return (
    <div style={{
      background: bg.bg === "#0a1a0f" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
      border: `1px solid ${bg.border}`,
      borderRadius: 14,
      padding: "14px 10px",
      textAlign: "center",
      minWidth: 90,
      flex: 1,
    }}>
      <div style={{ fontSize: 11, fontWeight: 700, color: bg.muted, marginBottom: 6 }}>{day.date}</div>
      <div style={{ fontSize: 28, marginBottom: 6 }}>{day.icon}</div>
      <div style={{ fontSize: 13, fontWeight: 800, color: bg.accent }}>{day.max}°C</div>
      <div style={{ fontSize: 11, color: bg.muted }}>{day.min}°C</div>
      <div style={{ fontSize: 11, color: "#42a5f5", marginTop: 4 }}>💧 {day.rain}%</div>
    </div>
  );
}

export default function Weather({ bg, dark, lang }) {
  const s = makeStyles(bg);
  const [weatherCity, setWeatherCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef(null);
  const suggestionTimer = useRef(null);

  useEffect(() => {
    function handleOutsideClick(e) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) setShowSuggestions(false);
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  function handleWeatherInput(value) {
    setWeatherCity(value);
    clearTimeout(suggestionTimer.current);
    if (value.trim().length < 2) { setLocationSuggestions([]); setShowSuggestions(false); return; }
    suggestionTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(value)}&limit=6&appid=${WEATHER_API_KEY}`);
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) { setLocationSuggestions(data); setShowSuggestions(true); }
        else { setLocationSuggestions([]); setShowSuggestions(false); }
      } catch (_) { setLocationSuggestions([]); }
    }, 350);
  }

  function selectSuggestion(item) {
    const label = item.state ? `${item.name}, ${item.state}, ${item.country}` : `${item.name}, ${item.country}`;
    setWeatherCity(label);
    setShowSuggestions(false);
    setLocationSuggestions([]);
    fetchWeather(label);
  }

  async function fetchWeather(cityOverride) {
    const city = cityOverride || weatherCity;
    if (!city.trim()) return;
    setWeatherLoading(true);
    setWeatherData(null);
    setForecast([]);
    try {
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=metric`);
      if (!res.ok) throw new Error("City not found");
      const data = await res.json();
      const iconMap = { Clear: "☀️", Clouds: "⛅", Rain: "🌧️", Drizzle: "🌦️", Thunderstorm: "⛈️", Snow: "❄️", Mist: "🌫️", Haze: "🌫️", Fog: "🌫️" };
      const condition = data.weather[0].main;
      const temp = Math.round(data.main.temp);
      const humidity = data.main.humidity;
      const wind = Math.round(data.wind.speed * 3.6);
      const rain = data.rain ? Math.round(data.rain["1h"] || 0) : 0;
      const uvEstimate = condition === "Clear" ? 8 : condition === "Clouds" ? 4 : 2;

      let advice = "";
      try {
        const tipRes = await fetch("/api/weather-tip", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ city, temp, humidity, wind, description: data.weather[0].description, rain }) });
        const tipData = await tipRes.json();
        advice = tipData?.tip || "";
      } catch (_) {}

      if (!advice) {
        if (temp > 38) advice = "🌡️ Extreme heat! Water crops early morning and evening. Avoid field work midday.";
        else if (rain > 5) advice = "🌧️ Rain detected. Skip irrigation today. Watch for waterlogging in low-lying fields.";
        else if (humidity > 80) advice = "💧 High humidity increases fungal disease risk. Consider preventive fungicide spray.";
        else if (wind > 30) advice = "💨 Strong winds! Avoid spraying pesticides or fertilizers today.";
        else advice = "✅ Good farming conditions today. Ideal for field inspection and light irrigation.";
      }

      setWeatherData({
        temp, humidity, wind, rain, uvIndex: uvEstimate,
        condition: `${condition} — ${data.weather[0].description}`,
        icon: iconMap[condition] || "🌤️",
        advice, city: data.name + ", " + data.sys.country,
        lat: data.coord?.lat, lon: data.coord?.lon,
        feelsLike: Math.round(data.main.feels_like),
        pressure: data.main.pressure,
        visibility: Math.round((data.visibility || 10000) / 1000),
      });

      // Fetch 7-day forecast
      const fRes = await fetch(`https://api.openweathermap.org/data/2.5/forecast?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=metric`);
      if (fRes.ok) {
        const fData = await fRes.json();
        const dayMap = {};
        fData.list.forEach((item) => {
          const date = new Date(item.dt * 1000);
          const key = date.toLocaleDateString("en-IN", { weekday: "short", month: "short", day: "numeric" });
          if (!dayMap[key]) {
            dayMap[key] = { date: key, temps: [], rains: [], icon: iconMap[item.weather[0].main] || "🌤️" };
          }
          dayMap[key].temps.push(item.main.temp);
          dayMap[key].rains.push(item.pop * 100);
        });
        const days = Object.values(dayMap).slice(0, 7).map((d) => ({
          date: d.date,
          icon: d.icon,
          max: Math.round(Math.max(...d.temps)),
          min: Math.round(Math.min(...d.temps)),
          rain: Math.round(Math.max(...d.rains)),
        }));
        setForecast(days);
      }
    } catch (err) {
      alert(`⚠️ Could not find weather for "${city}". Please check the city name.`);
    }
    setWeatherLoading(false);
  }

  async function fetchWeatherByLocation() {
    setWeatherLoading(true);
    try {
      const coords = await new Promise((resolve, reject) => {
        if (!navigator.geolocation) return reject(new Error("no_geo"));
        const timer = setTimeout(() => reject(new Error("timeout")), 10000);
        navigator.geolocation.getCurrentPosition(
          (pos) => { clearTimeout(timer); resolve(pos.coords); },
          (err) => { clearTimeout(timer); reject(err); },
          { enableHighAccuracy: true, timeout: 9000, maximumAge: 60000 }
        );
      });
      const res = await fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${coords.latitude}&lon=${coords.longitude}&appid=${WEATHER_API_KEY}&units=metric`);
      const data = await res.json();
      setWeatherCity(data.name);
      await fetchWeather(data.name);
    } catch (err) {
      try {
        const ipRes = await fetch("http://ip-api.com/json/?fields=lat,lon,city,status");
        const ipData = await ipRes.json();
        if (ipData.status === "success") { setWeatherCity(ipData.city); await fetchWeather(ipData.city); return; }
      } catch (_) {}
      setWeatherLoading(false);
      alert("⚠️ Could not detect location. Please type your city name.");
    }
  }

  const aiAdviceLines = weatherData?.advice
    ? [
        weatherData.advice,
        weatherData.rain > 5 ? "🌧️ Rain is expected. Delay pesticide spraying." : null,
        weatherData.humidity > 75 ? "🍄 High humidity increases fungal disease risk. Monitor crops closely." : null,
        weatherData.temp > 35 ? "☀️ Heat stress possible. Irrigate in early morning." : null,
        weatherData.wind > 25 ? "💨 Wind speed high. Avoid aerial spraying." : null,
      ].filter(Boolean)
    : [];

  return (
    <div style={s.section}>
      <h2 style={s.pageTitle}>{t(lang, "weather", "title")}</h2>
      <p style={s.pageSub}>{t(lang, "weather", "subtitle")}</p>

      {/* Search bar */}
      <div style={{ display: "flex", gap: 10, marginBottom: 20, maxWidth: 640, flexWrap: "wrap", alignItems: "flex-start" }}>
        <div ref={suggestionsRef} style={{ position: "relative", flex: 1, minWidth: 200 }}>
          <input
            value={weatherCity}
            onChange={(e) => handleWeatherInput(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { setShowSuggestions(false); fetchWeather(); } if (e.key === "Escape") setShowSuggestions(false); }}
            onFocus={() => locationSuggestions.length > 0 && setShowSuggestions(true)}
            placeholder="Search village or city..."
            style={s.input}
            autoComplete="off"
          />
          {showSuggestions && locationSuggestions.length > 0 && (
            <div style={{ position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0, background: dark ? "#0f2318" : "#fff", border: `1px solid ${bg.accent}`, borderRadius: 12, boxShadow: bg.shadow, zIndex: 999, overflow: "hidden" }}>
              {locationSuggestions.map((item, i) => {
                const flag = item.country ? String.fromCodePoint(...[...item.country.toUpperCase()].map(c => 0x1F1E6 - 65 + c.charCodeAt(0))) : "🌍";
                return (
                  <div key={i} onMouseDown={() => selectSuggestion(item)} style={{ padding: "11px 16px", cursor: "pointer", borderBottom: i < locationSuggestions.length - 1 ? `1px solid ${dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}` : "none", display: "flex", alignItems: "center", gap: 10 }}
                    onMouseEnter={e => e.currentTarget.style.background = dark ? "rgba(76,175,80,0.15)" : "rgba(46,125,50,0.08)"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <span style={{ fontSize: 20 }}>{flag}</span>
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 13, color: bg.text }}>📍 {item.name}</div>
                      <div style={{ fontSize: 11, color: bg.muted }}>{[item.state, item.country].filter(Boolean).join(", ")}</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
        <button onClick={() => { setShowSuggestions(false); fetchWeather(); }} style={s.btn("primary")} disabled={weatherLoading}>{weatherLoading ? "⏳" : "🔍 Search"}</button>
        <button onClick={fetchWeatherByLocation} style={s.btn("outline")} disabled={weatherLoading}>📍 My Location</button>
      </div>

      {/* Loading */}
      {weatherLoading && (
        <div style={{ textAlign: "center", padding: "2.5rem", color: bg.muted }}>
          <div style={{ fontSize: 48, animation: "spin 1.5s linear infinite", display: "inline-block" }}>🌍</div>
          <p style={{ marginTop: 12, fontWeight: 600 }}>Fetching live weather data...</p>
        </div>
      )}

      {/* Empty state */}
      {!weatherData && !weatherLoading && (
        <div style={{ textAlign: "center", padding: "3rem", color: bg.muted }}>
          <div style={{ fontSize: 72, marginBottom: 16, animation: "float 3s ease-in-out infinite", display: "inline-block" }}>🌤️</div>
          <p style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Search your city or click 📍 My Location</p>
          <p style={{ fontSize: 13 }}>Powered by OpenWeatherMap + Gemini AI farming advice</p>
        </div>
      )}

      {/* Weather data */}
      {weatherData && (
        <div style={{ animation: "fadeIn 0.4s ease-out" }}>
          {/* City header */}
          <div style={{ ...s.glassCard, marginBottom: 20, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
              <span style={{ fontSize: 56 }}>{weatherData.icon}</span>
              <div>
                <div style={{ fontSize: 22, fontWeight: 800, color: bg.text }}>📍 {weatherData.city}</div>
                <div style={{ fontSize: 14, color: bg.muted, marginTop: 2 }}>{weatherData.condition}</div>
                <div style={{ fontSize: 36, fontWeight: 900, color: bg.accent, marginTop: 4 }}>{weatherData.temp}°C</div>
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <div style={{ fontSize: 13, color: bg.muted }}>Feels like {weatherData.feelsLike}°C</div>
              <div style={{ fontSize: 13, color: bg.muted }}>Visibility {weatherData.visibility} km</div>
              <div style={{ fontSize: 13, color: bg.muted }}>Pressure {weatherData.pressure} hPa</div>
            </div>
          </div>

          {/* Metrics grid */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(130px,1fr))", gap: 14, marginBottom: 20 }}>
            {[
              { icon: "💧", label: "Humidity", value: `${weatherData.humidity}%` },
              { icon: "🌧️", label: "Rainfall", value: `${weatherData.rain} mm` },
              { icon: "💨", label: "Wind", value: `${weatherData.wind} km/h` },
              { icon: "☀️", label: "UV Index", value: weatherData.uvIndex <= 2 ? `${weatherData.uvIndex} Low` : weatherData.uvIndex <= 5 ? `${weatherData.uvIndex} Moderate` : `${weatherData.uvIndex} High` },
            ].map((w) => (
              <div key={w.label} style={{ ...s.glassCard, textAlign: "center", padding: "1.2rem" }}>
                <div style={{ fontSize: 28, marginBottom: 6 }}>{w.icon}</div>
                <div style={{ fontSize: 20, fontWeight: 800, color: bg.accent }}>{w.value}</div>
                <div style={{ fontSize: 12, color: bg.muted, marginTop: 4 }}>{w.label}</div>
              </div>
            ))}
          </div>

          {/* AI Farming Advice */}
          {aiAdviceLines.length > 0 && (
            <div style={{ ...s.glassCard, borderLeft: `4px solid ${bg.accent}`, marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: bg.accent, marginBottom: 12 }}>🌾 AI Farming Advisory</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {aiAdviceLines.map((line, i) => (
                  <div key={i} style={{ fontSize: 14, color: bg.text, lineHeight: 1.6, display: "flex", gap: 8 }}>
                    <span style={{ color: bg.accent, fontWeight: 700, flexShrink: 0 }}>•</span> {line}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7-Day Forecast */}
          {forecast.length > 0 && (
            <div style={{ ...s.glassCard, marginBottom: 20 }}>
              <div style={{ fontSize: 14, fontWeight: 700, color: bg.text, marginBottom: 14 }}>📅 7-Day Forecast</div>
              <div style={{ display: "flex", gap: 10, overflowX: "auto", paddingBottom: 8 }}>
                {forecast.map((day) => <ForecastDay key={day.date} day={day} bg={bg} />)}
              </div>
            </div>
          )}

          {/* Map */}
          {weatherData.lat && weatherData.lon && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 700, color: bg.text, marginBottom: 10 }}>🗺️ Location Map</div>
              <WeatherMap lat={weatherData.lat} lon={weatherData.lon} dark={dark} bg={bg} />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
