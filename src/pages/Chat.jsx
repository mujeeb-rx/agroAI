import { useState, useEffect, useRef } from "react";
import { makeStyles, langLabels, speechLangMap } from "../theme.js";

const greetings = {
  en: "🌾 Hello! I'm AgroAI, your smart farming assistant. Ask me anything about crops, weather, fertilizers, or plant diseases!",
  ta: "🌾 வணக்கம்! நான் AgroAI, உங்கள் விவசாய உதவியாளர். பயிர்கள், வானிலை, உரங்கள் அல்லது தாவர நோய்கள் பற்றி எதையும் கேளுங்கள்!",
  hi: "🌾 नमस्ते! मैं AgroAI हूँ, आपका स्मार्ट कृषि सहायक। फसलों, मौसम, उर्वरकों या पौधों की बीमारियों के बारे में कुछ भी पूछें!",
  te: "🌾 నమస్కారం! నేను AgroAI, మీ స్మార్ట్ వ్యవసాయ సహాయకుడిని. పంటలు, వాతావరణం, ఎరువులు లేదా మొక్కల వ్యాధుల గురించి ఏదైనా అడగండి!",
  kn: "🌾 ನಮಸ್ಕಾರ! ನಾನು AgroAI, ನಿಮ್ಮ ಸ್ಮಾರ್ಟ್ ಕೃಷಿ ಸಹಾಯಕ.",
  mr: "🌾 नमस्कार! मी AgroAI आहे, तुमचा स्मार्ट शेती सहाय्यक.",
  bn: "🌾 নমস্কার! আমি AgroAI, আপনার স্মার্ট কৃষি সহকারী।",
  ml: "🌾 നമസ്കാരം! ഞാൻ AgroAI, നിങ്ങളുടെ സ്മാർട്ട് കൃഷി സഹായി.",
};

const suggestedPrompts = {
  en: ["Best fertilizer for rice?", "How to prevent leaf disease?", "Today weather for farming?", "Best crop for summer?"],
  ta: ["நெல்லுக்கு சிறந்த உரம்?", "இலை நோயை தடுப்பது எப்படி?", "இன்றைய வானிலை?", "கோடைக்கு சிறந்த பயிர்?"],
  hi: ["चावल के लिए सबसे अच्छा उर्वरक?", "पत्ती की बीमारी को कैसे रोकें?", "खेती के लिए आज का मौसम?", "गर्मियों के लिए सबसे अच्छी फसल?"],
  te: ["వరికి ఉత్తమ ఎరువులు?", "ఆకు వ్యాధిని ఎలా నివారించాలి?", "వ్యవసాయం కోసం నేటి వాతావరణం?", "వేసవికి ఉత్తమ పంట?"],
  kn: ["ಭತ್ತಕ್ಕೆ ಉತ್ತಮ ರಸಗೊಬ್ಬರ?", "ಎಲೆ ರೋಗ ತಡೆಗಟ್ಟುವುದು?", "ಇಂದಿನ ಹವಾಮಾನ?", "ಬೇಸಿಗೆ ಬೆಳೆ?"],
  mr: ["भातासाठी उत्तम खत?", "पानांचा आजार कसा टाळायचा?", "आजचे हवामान?", "उन्हाळ्यातील पीक?"],
  bn: ["ধানের জন্য সেরা সার?", "পাতার রোগ প্রতিরোধ?", "আজকের আবহাওয়া?", "গ্রীষ্মের সেরা ফসল?"],
  ml: ["നെല്ലിന് ഏറ്റവും മികച്ച വളം?", "ഇലരോഗം തടയുക?", "ഇന്നത്തെ കാലാവസ്ഥ?", "വേനൽ വിള?"],
};

export default function Chat({ bg, dark, lang, changeLang }) {
  const s = makeStyles(bg);
  const [messages, setMessages] = useState([{ role: "assistant", text: greetings[lang] || greetings.en }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [chatImageFile, setChatImageFile] = useState(null);
  const [chatImagePreview, setChatImagePreview] = useState(null);
  const chatEndRef = useRef(null);
  const chatFileInputRef = useRef(null);
  const chatCameraInputRef = useRef(null);
  const recognitionRef = useRef(null);

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);
  useEffect(() => {
    setMessages([{ role: "assistant", text: greetings[lang] || greetings.en }]);
  }, [lang]);

  function clearChat() {
    setMessages([{ role: "assistant", text: greetings[lang] || greetings.en }]);
    setInput("");
  }

  async function sendMessage(text) {
    const userMsg = text || input;
    if (!userMsg.trim()) return;

    const count = parseInt(localStorage.getItem("agroai_query_count") || "0");
    localStorage.setItem("agroai_query_count", (count + 1).toString());

    const history = messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role, content: m.text }));

    setMessages((m) => [...m, { role: "user", text: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lang, messages: [...history, { role: "user", content: userMsg }] }),
      });
      let data;
      try { data = await res.json(); }
      catch (e) { throw new Error(`Server connection failed (Status: ${res.status}).`); }
      if (!res.ok || data.error) throw new Error(data.error || "Backend error");
      const aiText = data.answer || "⚠️ No response received.";
      setMessages((m) => [...m, { role: "assistant", text: aiText }]);

      if (window.speechSynthesis && aiText) {
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(aiText.replace(/[*#\-•]/g, "").replace(/[\u{1F300}-\u{1FAFF}]/gu, ""));
        utter.lang = speechLangMap[lang] || "en-IN";
        utter.rate = 0.9;
        setTimeout(() => window.speechSynthesis.speak(utter), 120);
      }
    } catch (err) {
      setMessages((m) => [...m, { role: "assistant", text: `⚠️ **Could not reach AI backend.**\n\n${err.message}\n\nMake sure the backend server is running (\`npm run server\`).` }]);
    }
    setLoading(false);
  }

  function startVoice() {
    if (listening) {
      recognitionRef.current?.abort();
      recognitionRef.current = null;
      setListening(false);
      return;
    }
    if (window.speechSynthesis) window.speechSynthesis.cancel();
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      setMessages((m) => [...m, { role: "assistant", text: "⚠️ Voice input not supported. Use Chrome or Edge." }]);
      return;
    }
    const recog = new SR();
    recognitionRef.current = recog;
    recog.lang = speechLangMap[lang] || "en-IN";
    recog.continuous = false;
    recog.interimResults = false;
    recog.onstart = () => setListening(true);
    recog.onend = () => { setListening(false); recognitionRef.current = null; };
    recog.onerror = (e) => {
      setListening(false);
      recognitionRef.current = null;
      if (e.error === "no-speech" || e.error === "aborted") return;
      if (e.error === "not-allowed") setMessages((m) => [...m, { role: "assistant", text: "🎤 Microphone permission denied." }]);
    };
    recog.onresult = (e) => {
      const transcript = e.results[0][0].transcript.trim();
      if (!transcript) return;
      setInput(transcript);
      setTimeout(() => sendMessage(transcript), 200);
    };
    try { recog.start(); } catch (err) { setListening(false); recognitionRef.current = null; }
  }

  function handleChatImagePick(e) {
    const file = e.target.files[0];
    if (!file) return;
    setChatImageFile(file);
    setChatImagePreview(URL.createObjectURL(file));
    e.target.value = "";
  }

  function sendChatWithImage() {
    if (chatImageFile) {
      sendMessage(`[Image Analysis Request] Please analyze this crop/leaf image and provide disease diagnosis.`);
      setChatImageFile(null);
      setChatImagePreview(null);
    } else {
      sendMessage();
    }
  }

  const prompts = suggestedPrompts[lang] || suggestedPrompts.en;

  return (
    <div style={s.section}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
        <div>
          <h2 style={s.pageTitle}>🤖 AgroAI Chat Assistant</h2>
          <p style={s.pageSub}>Powered by Gemini AI — Ask any farming question in your language</p>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {Object.entries(langLabels).map(([code, label]) => (
              <button key={code} onClick={() => changeLang(code)} style={{
                ...s.btn(lang === code ? "primary" : "outline"),
                padding: "5px 11px", fontSize: 11, fontWeight: lang === code ? 700 : 500,
              }}>{label}</button>
            ))}
          </div>
          <button onClick={clearChat} style={{ ...s.btn("outline"), padding: "5px 12px", fontSize: 13 }}>🗑️ Clear</button>
        </div>
      </div>

      {/* Active lang badge */}
      <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: dark ? "rgba(76,175,80,0.15)" : "rgba(46,125,50,0.08)", border: `1px solid ${bg.accent}`, borderRadius: 20, padding: "4px 14px", fontSize: 12, fontWeight: 700, color: bg.accent, marginBottom: 16 }}>
        🗣️ AI replies in: {langLabels[lang]}
      </div>

      {/* Suggested prompts */}
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
        {prompts.map((p) => (
          <button key={p} style={{ ...s.btn("outline"), padding: "7px 14px", fontSize: 12 }} onClick={() => sendMessage(p)}>{p}</button>
        ))}
      </div>

      {/* Chat window */}
      <div style={{ ...s.glassCard, height: 420, overflowY: "auto", display: "flex", flexDirection: "column", gap: 14, padding: "1.2rem" }}>
        {messages.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 8, animation: "fadeIn 0.3s ease-out" }}>
            {m.role === "assistant" && <div style={{ fontSize: 20, flexShrink: 0 }}>🌿</div>}
            <div style={{
              maxWidth: "80%", padding: "11px 15px",
              borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
              background: m.role === "user" ? `linear-gradient(135deg,${bg.accent},${bg.accentHover})` : (dark ? "rgba(255,255,255,0.07)" : "#f1f8f2"),
              color: m.role === "user" ? "#fff" : bg.text, fontSize: 14, lineHeight: 1.75, whiteSpace: "pre-wrap",
              boxShadow: m.role === "user" ? "none" : bg.shadowCard,
            }}>{m.text}</div>
          </div>
        ))}
        {loading && (
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <div style={{ fontSize: 20 }}>🌿</div>
            <div style={{ padding: "10px 16px", borderRadius: "18px 18px 18px 4px", background: dark ? "rgba(255,255,255,0.07)" : "#f1f8f2", fontSize: 13, color: bg.muted }}>
              <span style={{ display: "inline-flex", gap: 5, alignItems: "center" }}>
                <span>Thinking</span>
                {[0, 1, 2].map((i) => <span key={i} style={{ width: 6, height: 6, borderRadius: "50%", background: bg.accent, display: "inline-block", animation: `bounce 1s ${i * 0.2}s infinite` }} />)}
              </span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Hidden file inputs */}
      <input ref={chatFileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handleChatImagePick} />
      <input ref={chatCameraInputRef} type="file" accept="image/*" capture="environment" style={{ display: "none" }} onChange={handleChatImagePick} />

      {/* Image preview */}
      {chatImagePreview && (
        <div style={{ display: "flex", alignItems: "center", gap: 10, marginTop: 10, padding: "8px 12px", background: dark ? "rgba(76,175,80,0.12)" : "rgba(46,125,50,0.08)", borderRadius: 12, border: `1px solid ${bg.accent}` }}>
          <img src={chatImagePreview} alt="preview" style={{ width: 48, height: 48, objectFit: "cover", borderRadius: 8 }} />
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: bg.accent }}>📷 Image ready</div>
            <div style={{ fontSize: 11, color: bg.muted, marginTop: 2 }}>Click Send to analyse</div>
          </div>
          <button onClick={() => { setChatImageFile(null); setChatImagePreview(null); }} style={{ background: "none", border: "none", cursor: "pointer", fontSize: 18, color: bg.muted }}>✕</button>
        </div>
      )}

      {/* Input row */}
      <div style={{ display: "flex", gap: 8, marginTop: 10, alignItems: "center" }}>
        <button onClick={() => chatFileInputRef.current?.click()} title="Upload from gallery" style={{ ...s.btn("outline"), padding: "10px 12px", fontSize: 18, flexShrink: 0 }}>📁</button>
        <button onClick={() => chatCameraInputRef.current?.click()} title="Take photo" style={{ ...s.btn("outline"), padding: "10px 12px", fontSize: 18, flexShrink: 0 }}>📷</button>
        <input
          value={input}
          onChange={(e) => { if (window.speechSynthesis) window.speechSynthesis.cancel(); setInput(e.target.value); }}
          onKeyDown={(e) => e.key === "Enter" && sendChatWithImage()}
          placeholder={listening ? "🎤 Listening..." : (chatImageFile ? "Image selected — press Send to analyse" : "Ask about crops, fertilizers, disease...")}
          style={{ ...s.input, flex: 1, border: listening ? "2px solid #f44336" : chatImageFile ? `2px solid ${bg.accent}` : undefined }}
        />
        <button onClick={startVoice} style={{ ...s.btn("outline"), padding: "10px 12px", fontSize: 20, background: listening ? "rgba(244,67,54,0.2)" : "transparent", border: listening ? "2px solid #f44336" : undefined, animation: listening ? "pulse 0.8s ease-in-out infinite" : "none", flexShrink: 0 }}>
          {listening ? "🔴" : "🎙️"}
        </button>
        <button onClick={sendChatWithImage} style={{ ...s.btn("primary"), minWidth: 70, flexShrink: 0 }} disabled={loading && !chatImageFile}>
          {chatImageFile ? "🔍 Analyse" : "Send"}
        </button>
      </div>
      {listening && (
        <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, color: "#f44336", fontSize: 13, fontWeight: 600 }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f44336", display: "inline-block", animation: "pulse 0.8s ease-in-out infinite" }} />
          Listening — speak now...
        </div>
      )}
    </div>
  );
}
