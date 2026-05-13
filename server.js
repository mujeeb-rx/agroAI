import express from "express";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const GROQ_API_KEY   = process.env.GROQ_API_KEY;   // ✅ Groq Vision key

app.use(cors());
app.use(express.json({ limit: "20mb" }));  // 20mb for high-res images

// ─── Health check ─────────────────────────────────────────────────────────────
app.get("/api/health", (_req, res) => {
  res.json({
    status: "ok",
    gemini: !!GEMINI_API_KEY,
    groq: !!GROQ_API_KEY,
    openai: !!OPENAI_API_KEY,

  });
});

// ─── Gemini chat helper (tries multiple models to avoid quota limits) ─────────
const GEMINI_MODELS = [
  "gemini-2.0-flash-lite",   // highest free-tier quota
  "gemini-2.5-flash",        // next best free tier
  "gemini-2.0-flash",        // standard model
  "gemini-flash-latest",     // alias fallback
];

async function callGemini(systemPrompt, conversationMessages) {
  const contents = conversationMessages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents,
    generationConfig: { temperature: 0.4, maxOutputTokens: 1800 },
  };

  for (const model of GEMINI_MODELS) {
    try {
      console.log(`[AgroAI Backend] Trying Gemini model: ${model}`);
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
      );
      const data = await res.json();
      if (data.error) {
        console.warn(`[AgroAI] ${model} error: ${data.error.message}`);
        continue; // try next model
      }
      const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
      if (answer) {
        console.log(`[AgroAI Backend] ✅ ${model} succeeded`);
        return { answer, model };
      }
    } catch (err) {
      console.warn(`[AgroAI] ${model} fetch error: ${err.message}`);
    }
  }
  throw new Error("All Gemini models exhausted.");
}


// ─── OpenAI chat helper (fallback) ───────────────────────────────────────────
async function callOpenAI(systemPrompt, conversationMessages) {
  const messages = [
    { role: "system", content: systemPrompt },
    ...conversationMessages,
  ];
  const res = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      messages,
      max_tokens: 1800,
      temperature: 0.4,
    }),
  });
  const data = await res.json();
  if (data.error) throw new Error(data.error.message);
  const answer = data?.choices?.[0]?.message?.content?.trim();
  if (!answer) throw new Error("Empty response from OpenAI");
  return answer;
}

// ─── Chat endpoint ────────────────────────────────────────────────────────────
app.post("/api/chat", async (req, res) => {
  const { messages, lang } = req.body;
  if (!messages || !Array.isArray(messages)) {
    return res.status(400).json({ error: "messages array is required." });
  }

  if (!GEMINI_API_KEY && !OPENAI_API_KEY) {
    return res.status(500).json({ error: "No AI API key configured. Add GEMINI_API_KEY to .env" });
  }

  // Language name + native script for maximum clarity
  const langMap = {
    en: { name: "English",  native: "English" },
    ta: { name: "Tamil",    native: "தமிழ்" },
    hi: { name: "Hindi",    native: "हिंदी" },
    te: { name: "Telugu",   native: "తెలుగు" },
    kn: { name: "Kannada",  native: "ಕನ್ನಡ" },
    mr: { name: "Marathi",  native: "मराठी" },
    bn: { name: "Bengali",  native: "বাংলা" },
    ml: { name: "Malayalam",native: "മലയാളം" },
  };
  const { name: promptLang, native: nativeName } = langMap[lang] || langMap.en;

  const SYSTEM_PROMPT = `You are AgroAI, an expert agronomist and crop scientist with 30+ years of experience in Indian agriculture.

🔴 RULE #1 — MOST IMPORTANT: You MUST respond ONLY in ${promptLang} (${nativeName}). 
Every single word of your response must be in ${promptLang}. 
Do NOT use English unless ${promptLang} IS English.
Do NOT mix languages. If the user writes in any language, ALWAYS reply in ${promptLang} (${nativeName}).

ADDITIONAL RULES:
2. ACCURACY: Only state facts you are confident about. Say so clearly if uncertain.
3. BE SPECIFIC: Give exact chemical names, NPK ratios, doses (kg/ha or g/L), timings, and Indian brand examples.
4. ANSWER PRECISELY: Answer what was asked. No generic tips.
5. STRUCTURE: Use **bold headings** and bullet points. Never write a wall of text.
6. SCOPE: Covers crops (rice, wheat, cotton, sugarcane, vegetables, fruits, pulses, spices), soil, fertilizers, pesticides, irrigation, post-harvest, PM-KISAN, e-NAM, market prices.

Response format (all text must be in ${promptLang}):
**🌱 [Heading in ${promptLang}]**
- Point 1 (specific data)
- Point 2
**💡 Pro Tip:** Actionable tip in ${promptLang}.

NEVER use English words in the response if ${promptLang} is not English.
Never fabricate pesticide doses. When unsure, say "consult your local KVK (Krishi Vigyan Kendra)."`;

  // Inject language reminder directly into the last user message for extra enforcement
  const messagesWithLangHint = messages.map((m, i) => {
    if (i === messages.length - 1 && m.role === "user") {
      return {
        ...m,
        content: `${m.content}\n\n[IMPORTANT: Reply ONLY in ${promptLang} (${nativeName}). Do not use English.]`,
      };
    }
    return m;
  });

  // Try Gemini first (auto-tries multiple models), then OpenAI as fallback
  if (GEMINI_API_KEY) {
    try {
      const { answer, model: usedModel } = await callGemini(SYSTEM_PROMPT, messagesWithLangHint);
      return res.json({ answer, model: usedModel });
    } catch (err) {
      console.warn("[AgroAI Backend] All Gemini models failed:", err.message);
    }
  }

  if (OPENAI_API_KEY) {
    try {
      console.log("[AgroAI Backend] Trying OpenAI fallback...");
      const answer = await callOpenAI(SYSTEM_PROMPT, messagesWithLangHint);
      console.log("[AgroAI Backend] OpenAI succeeded ✅");
      return res.json({ answer, model: "gpt-4o-mini" });
    } catch (err) {
      console.warn("[AgroAI Backend] OpenAI failed:", err.message);
    }
  }

  return res.status(503).json({ error: "AI service unavailable. Please check your GEMINI_API_KEY in .env" });
});


// ─── Weather tip endpoint ─────────────────────────────────────────────────────
app.post("/api/weather-tip", async (req, res) => {
  const { city, temp, humidity, wind, description, rain } = req.body;

  if (!GEMINI_API_KEY && !OPENAI_API_KEY) {
    return res.status(500).json({ error: "No API key configured." });
  }

  const prompt = `You are an expert Indian agriculture advisor. Given this live weather in ${city}:
- Temperature: ${temp}°C
- Humidity: ${humidity}%
- Wind: ${wind} km/h
- Condition: ${description}
- Rainfall: ${rain}mm

Write ONE short, specific farming advice sentence (max 20 words) for a farmer today. Be direct and practical.`;

  try {
    if (GEMINI_API_KEY) {
      const res2 = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [{ role: "user", parts: [{ text: prompt }] }],
            generationConfig: { temperature: 0.4, maxOutputTokens: 80 },
          }),
        }
      );
      const data = await res2.json();
      const tip = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";
      if (tip) return res.json({ tip });
    }
  } catch (_) {}

  // OpenAI fallback for weather tip
  try {
    if (OPENAI_API_KEY) {
      const r = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_API_KEY}` },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: prompt }],
          max_tokens: 80,
          temperature: 0.4,
        }),
      });
      const data = await r.json();
      const tip = data?.choices?.[0]?.message?.content?.trim() || "";
      return res.json({ tip });
    }
  } catch (_) {}

  return res.json({ tip: "" });
});

// ─── Groq Vision helper (fast Llama-4 Scout, high free quota) ────────────────
async function callGroqVision(base64, mimeType, analysisPrompt, systemMsg = null) {
  const messages = [];
  if (systemMsg) messages.push({ role: "system", content: systemMsg });
  messages.push({
    role: "user",
    content: [
      { type: "text",      text: analysisPrompt },
      { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64}` } },
    ],
  });

  const groqRes = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "meta-llama/llama-4-scout-17b-16e-instruct",
      messages,
      max_tokens: 1500,
      temperature: 0.1,
    }),
  });
  const data = await groqRes.json();
  if (data.error) throw new Error(data.error.message);
  const rawText = data?.choices?.[0]?.message?.content || "";
  if (!rawText) throw new Error("Empty Groq response");
  return rawText;
}

// ─── Disease analysis endpoint ────────────────────────────────────────────────
app.post("/api/analyze-disease", async (req, res) => {
  let { base64, mimeType, lang } = req.body;
  if (!base64) return res.status(400).json({ error: "Image base64 required." });

  // ─── Sanitize base64 ──────────────────────────────────────────────────────
  // Strip data-URL prefix if present (e.g. "data:image/jpeg;base64,XXXX")
  if (base64.includes(",")) {
    const parts = base64.split(",");
    // Extract mimeType from prefix if not provided
    if (!mimeType && parts[0].includes(":") && parts[0].includes(";")) {
      mimeType = parts[0].split(":")[1].split(";")[0];
    }
    base64 = parts[1];
  }
  // Normalize: remove whitespace, convert URL-safe chars, fix padding
  base64 = base64
    .replace(/\s/g, "")        // strip newlines, spaces
    .replace(/-/g, "+")        // URL-safe → standard
    .replace(/_/g, "/");       // URL-safe → standard
  // Add padding if needed
  const pad = base64.length % 4;
  if (pad === 2) base64 += "==";
  else if (pad === 3) base64 += "=";

  mimeType = mimeType || "image/jpeg";
  console.log(`[AgroAI Disease] Image: mimeType=${mimeType}, b64Length=${base64.length}`);


  if (!GEMINI_API_KEY && !OPENAI_API_KEY) {
    return res.status(500).json({ error: "No API key configured." });
  }


  // Language maps for the response
  const langMap = {
    en: { name: "English",   native: "English" },
    ta: { name: "Tamil",     native: "தமிழ்" },
    hi: { name: "Hindi",     native: "हिंदी" },
    te: { name: "Telugu",    native: "తెలుగు" },
    kn: { name: "Kannada",   native: "ಕನ್ನಡ" },
    mr: { name: "Marathi",   native: "मराठी" },
    bn: { name: "Bengali",   native: "বাংলা" },
    ml: { name: "Malayalam", native: "മലയാളം" },
  };
  const { name: promptLang, native: nativeName } = langMap[lang] || langMap.en;

  // ─── Build strong SYSTEM message to enforce language at model level ───────────
  const systemMsg = `You are Dr. AgroAI, an expert agricultural plant pathologist specializing in Indian farming.
Your ONLY job is to analyze plant disease images and respond in ${promptLang} (${nativeName}).

STRICT LANGUAGE RULES — VIOLATION IS NOT ALLOWED:
- Every sentence, phrase, and description MUST be written in ${promptLang} script (${nativeName}).
- Medicine/product names (e.g. "Mancozeb 75% WP") and scientific names (e.g. "Phytophthora infestans") MAY remain in English.
- Dose numbers (e.g. "2.5 g/L") MAY remain as numbers.
- Everything else — symptoms, instructions, advice, actions — MUST be in ${promptLang}.
- Do NOT write any explanations in English. Do NOT mix languages.
- If you write in English where ${promptLang} is required, you have FAILED your task.

You must respond ONLY with valid JSON. No markdown. No extra text.`;

  const analysisPrompt = `Analyze this crop/plant image carefully.

Respond ONLY with valid JSON. All descriptive text values MUST be in ${promptLang} (${nativeName}).
Medicine product names, scientific names, and numbers may stay in English.

JSON structure to return:
{
  "disease": "Scientific name + local name in ${promptLang}",
  "severity": "None or Low or Medium or High or Critical",
  "symptoms": "Write 2-3 sentences describing visible symptoms — ALL IN ${promptLang}",
  "quick_actions": [
    "Write immediate action step 1 — IN ${promptLang}",
    "Write step 2 — IN ${promptLang}",
    "Write step 3 — IN ${promptLang}",
    "Write step 4 — IN ${promptLang}"
  ],
  "medicines": [
    {
      "name": "Product name in English (e.g. Mancozeb 75% WP)",
      "type": "Fungicide or Bactericide or Insecticide or Biofungicide or Nematicide",
      "dose": "Numeric dose only (e.g. 2.5 g per litre water)",
      "frequency": "Write spray frequency — IN ${promptLang} (e.g. every 7-10 days)",
      "apply": "Write how and where to spray — ALL IN ${promptLang}",
      "brand": "Brand names in English (e.g. Dithane M-45, Indofil M-45)"
    }
  ],
  "prevention": "Write 3-4 sentences of prevention advice — ALL IN ${promptLang}",
  "fertilizer": "Write NPK ratio, dose kg/ha, timing — ALL IN ${promptLang}",
  "watering": "Write irrigation method, frequency, precautions — ALL IN ${promptLang}"
}

Rules:
- Include 2-3 medicines if disease detected. If healthy crop: severity="None", medicines=[].
- EVERY description, advice, instruction MUST be written in ${promptLang} (${nativeName}).
- NEVER write English sentences where ${promptLang} is required.`;


  // ─── 1. GROQ VISION (Primary — Llama-4 Scout, fast + high quota) ──────────
  if (GROQ_API_KEY) {
    try {
      console.log(`[AgroAI Disease] Trying Groq Vision in ${promptLang}...`);
      const rawText = await callGroqVision(base64, mimeType, analysisPrompt, systemMsg);
      const cleaned = rawText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        console.log("[AgroAI Disease] ✅ Groq succeeded (lang:", promptLang, ")");
        return res.json({ ...result, model: "llama-4-scout (Groq)", lang: promptLang });
      }
      console.warn("[AgroAI Disease] Groq: response not JSON — raw:", rawText.substring(0, 150));
    } catch (err) {
      console.warn("[AgroAI Disease] Groq failed:", err.message.substring(0, 100));
    }
  }

  // ─── 2. GEMINI VISION (Fallback — tries multiple models) ───────────────────
  // Only gemini-2.5-flash reliably supports vision for this API key
  const visionModels = [
    "gemini-2.5-flash",      // ✅ confirmed working with images
    "gemini-2.0-flash",      // fallback
    "gemini-2.0-flash-lite", // fallback
  ];

  // Try Gemini Vision models in sequence
  if (GEMINI_API_KEY) {
    for (const model of visionModels) {
      try {
        console.log(`[AgroAI Disease] Trying Gemini: ${model}`);
        // gemini-2.5-flash is a thinking model — disable thinking for JSON output & give it more budget
        const is25Flash = model === "gemini-2.5-flash";
        const geminiRes = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [
                {
                  role: "user",
                  parts: [
                    { text: analysisPrompt },
                    { inline_data: { mime_type: mimeType, data: base64 } },
                  ],
                },
              ],
              generationConfig: {
                temperature: 0.1,
                maxOutputTokens: is25Flash ? 8192 : 2048,
                ...(is25Flash && { thinkingConfig: { thinkingBudget: 0 } }),
              },
            }),
          }
        );
        const data = await geminiRes.json();
        if (data.error) {
          console.warn(`[AgroAI Disease] ${model}: ${data.error.message.substring(0, 100)}`);
          continue;
        }
        const candidate = data?.candidates?.[0];
        const finishReason = candidate?.finishReason;
        const rawText = candidate?.content?.parts?.[0]?.text || "";
        console.log(`[AgroAI Disease] ${model} finishReason=${finishReason} textLen=${rawText.length}`);
        if (!rawText) { console.warn(`[AgroAI Disease] ${model}: empty response`); continue; }
        if (finishReason === "MAX_TOKENS") {
          console.warn(`[AgroAI Disease] ${model}: response truncated (MAX_TOKENS), raw: ${rawText.substring(0, 100)}`);
          // Don't skip — try to parse what we got anyway
        }
        const cleaned = rawText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
        const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
        if (!jsonMatch) { console.warn(`[AgroAI Disease] ${model}: no JSON found`); continue; }
        const result = JSON.parse(jsonMatch[0]);
        console.log(`[AgroAI Disease] ✅ ${model} success (lang: ${promptLang})`);


        return res.json({ ...result, model, lang: promptLang });
      } catch (err) {
        console.warn(`[AgroAI Disease] ${model} failed: ${err.message}`);
      }
    }
  }

  // OpenAI Vision fallback
  if (OPENAI_API_KEY) {
    try {
      console.log("[AgroAI Disease] Trying OpenAI Vision fallback...");
      const openaiRes = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${OPENAI_API_KEY}` },
        body: JSON.stringify({
          model: "gpt-4o-mini",
          messages: [{ role: "user", content: [
            { type: "text", text: analysisPrompt },
            { type: "image_url", image_url: { url: `data:${mimeType};base64,${base64}` } },
          ]}],
          max_tokens: 800,
        }),
      });
      const data = await openaiRes.json();
      const rawText = data?.choices?.[0]?.message?.content || "";
      const cleaned = rawText.replace(/```json\n?/g, "").replace(/```\n?/g, "").trim();
      const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const result = JSON.parse(jsonMatch[0]);
        return res.json({ ...result, model: "gpt-4o-mini", lang: promptLang });
      }
    } catch (err) {
      console.warn("[AgroAI Disease] OpenAI Vision failed:", err.message);
    }
  }

  return res.status(503).json({ error: "Disease analysis failed. All AI models exhausted." });
});

app.listen(PORT, () => {
  console.log(`\n✅ AgroAI Backend running on http://localhost:${PORT}`);
  console.log(`   Gemini Key:  ${GEMINI_API_KEY ? "✅ Configured" : "❌ MISSING"}`);
  console.log(`   Groq Key:    ${GROQ_API_KEY   ? "✅ Configured (Vision primary)" : "⚠️  Not set"}`);
  console.log(`   OpenAI Key:  ${OPENAI_API_KEY ? "✅ Configured (fallback)" : "⚠️  Not set (optional)"}\n`);
});
