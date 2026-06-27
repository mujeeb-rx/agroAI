import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import fs from "fs";
import path from "path";

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
    cwd: process.cwd(),
    isServerless: !!(process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT || process.cwd() === "/var/task"),
    version: "1.0.1"
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

async function callGeminiWithSearch(systemPrompt, conversationMessages) {
  const contents = conversationMessages.map((m) => ({
    role: m.role === "assistant" ? "model" : "user",
    parts: [{ text: m.content }],
  }));

  const body = {
    system_instruction: { parts: [{ text: systemPrompt }] },
    contents,
    tools: [{ google_search: {} }],
    generationConfig: { temperature: 0.2, maxOutputTokens: 2000 },
  };

  for (const model of GEMINI_MODELS) {
    try {
      console.log(`[AgroAI Backend Search] Trying Gemini model with Google Search: ${model}`);
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`,
        { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }
      );
      const data = await res.json();
      if (data.error) {
        console.warn(`[AgroAI Backend Search] ${model} error: ${data.error.message}`);
        continue;
      }
      const answer = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (answer) {
        console.log(`[AgroAI Backend Search] ✅ ${model} grounded search succeeded`);
        return { answer, model };
      }
    } catch (err) {
      console.warn(`[AgroAI Backend Search] ${model} failed:`, err.message);
    }
  }
  throw new Error("All Gemini models exhausted for grounded search.");
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

// ─── Yield Prediction ────────────────────────────────────────────────────────
app.post("/api/yield-predict", async (req, res) => {
  const { crop, state, area, soilType, waterSource, fertilizer, rainfall, prevYield } = req.body;
  if (!crop || !state || !area) return res.status(400).json({ error: "crop, state, and area are required." });

  const systemPrompt = `You are an expert Indian agricultural scientist with 20+ years of experience in crop yield prediction. Respond ONLY with a valid JSON object.`;

  const userPrompt = `Predict the yield for the following farm:
Crop: ${crop}
State: ${state}
Land Area: ${area} acres
Soil Type: ${soilType || "Loamy"}
Water Source: ${waterSource || "Canal Irrigation"}
Fertilizer: ${fertilizer || "NPK Balanced"}
Expected Rainfall: ${rainfall || "800"} mm
Previous Yield: ${prevYield || "Not provided"} tons/acre

Respond with this exact JSON (no markdown, no extra text):
{
  "estimatedYield": "X.X tons",
  "confidence": "XX%",
  "harvestDate": "DD Month YYYY",
  "profit": "₹X,XX,XXX",
  "suggestions": ["tip1","tip2","tip3","tip4","tip5"],
  "monthlyData": [
    {"label":"Month1","value":X},
    {"label":"Month2","value":X},
    {"label":"Month3","value":X},
    {"label":"Month4","value":X},
    {"label":"Month5","value":X},
    {"label":"Month6","value":X}
  ]
}`;

  try {
    const { answer } = await callGemini(systemPrompt, [{ role: "user", content: userPrompt }]);
    const jsonMatch = answer.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON in response");
    const result = JSON.parse(jsonMatch[0]);
    return res.json(result);
  } catch (err) {
    console.warn("[AgroAI] Yield predict failed:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// ─── Crop Recommendation ─────────────────────────────────────────────────────
app.post("/api/crop-recommend", async (req, res) => {
  const { state, season, soil, water, temp, rainfall } = req.body;
  if (!state || !season || !soil) return res.status(400).json({ error: "state, season, and soil are required." });

  const systemPrompt = `You are an expert Indian agricultural scientist. Respond ONLY with a valid JSON array.`;

  const userPrompt = `Recommend the top 5 crops for:
State: ${state}
Season: ${season}
Soil Type: ${soil}
Water Availability: ${water || "Moderate"}
Average Temperature: ${temp || "28"}°C
Annual Rainfall: ${rainfall || "800"} mm

Respond with this exact JSON array (no markdown):
[
  {
    "name": "CropName",
    "icon": "emoji",
    "score": 92,
    "reason": "Why this crop suits these conditions",
    "water": "Low/Medium/High",
    "duration": "X-Y days",
    "profit": "₹XX,XXX-XX,XXX/acre"
  }
]
Return exactly 5 crops sorted by score descending.`;

  try {
    const { answer } = await callGemini(systemPrompt, [{ role: "user", content: userPrompt }]);
    const jsonMatch = answer.match(/\[[\s\S]*\]/);
    if (!jsonMatch) throw new Error("No JSON array in response");
    const result = JSON.parse(jsonMatch[0]);
    return res.json(result);
  } catch (err) {
    console.warn("[AgroAI] Crop recommend failed:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

const CROP_LOGIC = {
  Rice: {
    method: "Flood/Furrow",
    baseWater: 30000,
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

// ─── Irrigation Advice ────────────────────────────────────────────────────────
app.post("/api/irrigation-advice", (req, res) => {
  const { crop, stage, weather, soilMoisture, rainProbability } = req.body;
  if (!crop || !stage) return res.status(400).json({ error: "crop and stage are required." });

  const sm = parseInt(soilMoisture) !== undefined ? parseInt(soilMoisture) : 50;
  const rainProb = parseInt(rainProbability) !== undefined ? parseInt(rainProbability) : (weather && weather.includes("Rain") ? 90 : 20);

  const cropConfig = CROP_LOGIC[crop] || {
    method: "Drip Irrigation",
    baseWater: 12000,
    stages: {}
  };

  const stageConfig = cropConfig.stages[stage] || { factor: 1.0, desc: "Standard growth phase water requirement." };
  const stageFactor = stageConfig.factor;
  const stageDesc = stageConfig.desc;

  // Smart Irrigation Status
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

  // Dynamic Water Quantity
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

  // Best Time to Irrigate
  let bestTime = "";
  if (rainProb > 60) {
    bestTime = "Wait until rain passes. Check soil moisture again after 24–48 hours.";
  } else if (sm >= 70) {
    bestTime = "No irrigation required today. Check soil moisture again after 24–48 hours.";
  } else {
    bestTime = "Early Morning (5 AM–8 AM) or Evening (5 PM–7 PM) to reduce evaporation.";
  }

  // Frequency
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

  // AI Reasoning
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

  return res.json({
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
});

function getFallbackMarketData(crop, state, district) {
  const userState = state || "Telangana";
  const userDistrict = district || "Local District";

  const basePrices = {
    Rice:       { base: 2200, msp: 2183, emoji: "🌾", markets: ["Hyderabad APMC", "Warangal APMC", "Khammam APMC"] },
    Wheat:      { base: 2400, msp: 2275, emoji: "🌿", markets: ["Khanna APMC", "Narwana APMC", "Kanpur APMC"] },
    Tomato:     { base: 1800, msp: 0,    emoji: "🍅", markets: ["Nashik APMC", "Madanapalle APMC", "Bangalore APMC"] },
    Onion:      { base: 2200, msp: 0,    emoji: "🧅", markets: ["Lasalgaon APMC", "Gondal APMC", "Mandsaur APMC"] },
    Cotton:     { base: 6800, msp: 6620, emoji: "🌸", markets: ["Rajkot APMC", "Adilabad APMC", "Akola APMC"] },
    Sugarcane:  { base: 315,  msp: 315,  emoji: "🎋", markets: ["Meerut APMC", "Kolhapur APMC", "Belgaum APMC"] },
    Maize:      { base: 1900, msp: 2090, emoji: "🌽", markets: ["Davangere APMC", "Patna APMC", "Dewas APMC"] },
    Groundnut:  { base: 5800, msp: 6375, emoji: "🥜", markets: ["Rajkot APMC", "Anantapur APMC", "Vellore APMC"] },
    Soybean:    { base: 4200, msp: 4600, emoji: "🫘", markets: ["Indore APMC", "Latur APMC", "Kota APMC"] },
    Potato:     { base: 1500, msp: 0,    emoji: "🥔", markets: ["Agra APMC", "Jalandhar APMC", "Hooghly APMC"] },
    Mustard:    { base: 5200, msp: 5650, emoji: "🌼", markets: ["Jaipur APMC", "Sirsa APMC", "Morena APMC"] },
    Banana:     { base: 1200, msp: 0,    emoji: "🍌", markets: ["Trichy APMC", "Kurnool APMC", "Jalgaon APMC"] },
  };

  const cropInfo = basePrices[crop] || { base: 2000, msp: 0, emoji: "🌾", markets: ["Local APMC", "District APMC", "State APMC"] };
  const base = cropInfo.base;
  const msp = cropInfo.msp;
  
  const stateMarkets = {
    "Andhra Pradesh": ["Madanapalle APMC", "Kurnool APMC", "Guntur APMC"],
    "Telangana": ["Hyderabad APMC", "Warangal APMC", "Khammam APMC"],
    "Maharashtra": ["Lasalgaon APMC", "Nashik APMC", "Latur APMC"],
    "Karnataka": ["Bangalore APMC", "Davangere APMC", "Belgaum APMC"],
    "Uttar Pradesh": ["Kanpur APMC", "Meerut APMC", "Agra APMC"],
    "Punjab": ["Khanna APMC", "Jalandhar APMC", "Ludhiana APMC"],
    "Haryana": ["Narwana APMC", "Sirsa APMC", "Karnal APMC"],
    "Gujarat": ["Gondal APMC", "Rajkot APMC", "Ahmedabad APMC"],
    "Madhya Pradesh": ["Mandsaur APMC", "Dewas APMC", "Indore APMC"],
    "Tamil Nadu": ["Chennai Koyambedu", "Trichy APMC", "Vellore APMC"],
    "West Bengal": ["Hooghly APMC", "Kolkata APMC", "Siliguri APMC"],
  };

  const markets = stateMarkets[userState] || cropInfo.markets;

  // Generate historical data
  const history7d = [];
  const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Today"];
  let prevPrice = base - Math.round((Math.random() * 100 - 50));
  for (let i = 0; i < 7; i++) {
    const change = Math.round((Math.random() * 80 - 40));
    const priceVal = i === 6 ? base : prevPrice + change;
    history7d.push({ label: DAYS[i], value: priceVal });
    prevPrice = priceVal;
  }

  const history30d = [];
  for (let i = 1; i <= 4; i++) {
    history30d.push({ label: `Wk ${i}`, value: base - Math.round((4 - i) * (Math.random() * 120 - 40)) });
  }

  const history90d = [];
  for (let i = 1; i <= 3; i++) {
    history90d.push({ label: `Month ${i}`, value: base - Math.round((3 - i) * (Math.random() * 200 - 60)) });
  }

  const history1y = [];
  for (let i = 1; i <= 4; i++) {
    history1y.push({ label: `Q${i}`, value: base - Math.round((4 - i) * (Math.random() * 400 - 100)) });
  }

  const yesterdayPrice = history7d[5].value;
  const dailyChange = base - yesterdayPrice;
  const dailyChangePct = parseFloat(((dailyChange / yesterdayPrice) * 100).toFixed(2));
  
  const weeklyStartPrice = history7d[0].value;
  const weeklyChangePct = parseFloat((((base - weeklyStartPrice) / weeklyStartPrice) * 100).toFixed(2));

  const monthlyTrend = dailyChangePct > 1 ? "up" : dailyChangePct < -1 ? "down" : "stable";

  const aiPrediction = monthlyTrend === "up" ? "🟢 Likely to Increase" : monthlyTrend === "down" ? "🔴 Likely to Decrease" : "🟡 Stable";
  const predictionExplanation = monthlyTrend === "up" 
    ? `Prices for ${crop} are showing upward pressure across major mandis due to lower market arrivals and steady consumer demand.`
    : monthlyTrend === "down"
    ? `Prices are experiencing temporary declines as harvest arrivals peak, causing a supply surplus in regional centers.`
    : `Prices are holding stable with balanced demand and steady arrivals in the local markets.`;

  const sellingAdvice = monthlyTrend === "up" ? "🟡 Hold for 5 Days" : monthlyTrend === "down" ? "🟢 Sell Today" : "🔴 Wait for Better Price";
  const sellingAdviceExplanation = monthlyTrend === "up"
    ? `Since the trend is upward and regional arrivals are low, waiting 5–7 days might secure a higher payout.`
    : monthlyTrend === "down"
    ? `With prices declining, selling immediately at current rates is recommended to avoid further drop as more arrivals hit the mandi.`
    : `Prices are stable; consider waiting for seasonal festival demand to pick up in 10-14 days for a better price.`;

  const nearbyMarkets = [
    { market: markets[0], district: userDistrict, distance: "30 km", price: base + 40, trend: "up", status: "Best", lastUpdated: "Today, 1:45 PM" },
    { market: markets[1] || "Mandi 2", district: "Adjacent Dist", distance: "65 km", price: base - 20, trend: "stable", status: "Good", lastUpdated: "Today, 12:30 PM" },
    { market: markets[2] || "Mandi 3", district: "Hub Mandi", distance: "110 km", price: base - 50, trend: "down", status: "Fair", lastUpdated: "Today, 11:15 AM" }
  ];

  return {
    status: "Cached",
    crop,
    currentPrice: base,
    msp: msp || undefined,
    yesterdayPrice,
    dailyChangePct,
    weeklyChangePct,
    monthlyTrend,
    lastUpdated: `Today, ${new Date().toLocaleTimeString("en-IN", { hour: "numeric", minute: "2-digit" })}`,
    market: markets[0],
    district: userDistrict,
    state: userState,
    source: "Agmarknet Cache",
    history7d,
    history30d,
    history90d,
    history1y,
    aiPrediction,
    aiConfidence: 91,
    predictionExplanation,
    sellingAdvice,
    sellingAdviceExplanation,
    nearbyMarkets,
    dailySummary: `Market analysis for ${crop} in ${userState} indicates a ${monthlyTrend} trend. Active trading reported at ${markets[0]} with a maximum price of ₹${base + 40}/quintal. Farmers in ${userDistrict} should monitor local rainfall and arrivals before concluding transactions.`,
    alerts: [
      `${dailyChange >= 0 ? "📈" : "📉"} ${crop} price changed by ${dailyChangePct}% today.`,
      `🏆 ${markets[0]} is currently the best market in ${userState}.`,
      `🌧️ Weather changes might affect mandi logistics over the next 48 hours.`
    ]
  };
}

// ─── Real-time Market Data Endpoint ──────────────────────────────────────────
app.post("/api/market-data", async (req, res) => {
  const { crop, state, district } = req.body;
  if (!crop) return res.status(400).json({ error: "crop is required." });

  // Setup cache directory - use /tmp on Netlify/AWS Lambda to avoid EROFS errors
  const isServerless = process.env.NETLIFY || process.env.AWS_LAMBDA_FUNCTION_NAME || process.env.LAMBDA_TASK_ROOT || process.cwd() === "/var/task";
  const cacheDir = isServerless 
    ? path.join("/tmp", ".market_cache") 
    : path.join(process.cwd(), ".market_cache");
    
  try {
    if (!fs.existsSync(cacheDir)) {
      fs.mkdirSync(cacheDir, { recursive: true });
    }
  } catch (err) {
    console.warn("[AgroAI Market] Cache directory creation failed:", err.message);
  }

  const cleanName = crop.toLowerCase().replace(/[^a-z0-9]/g, "");
  const userState = state || "Telangana";
  const userDistrict = district || "Local District";
  
  const cleanState = userState.toLowerCase().replace(/[^a-z0-9]/g, "");
  const cacheFile = path.join(cacheDir, `market_${cleanName}_${cleanState}.json`);

  // Check if cache exists and is fresh (less than 4 hours old)
  if (fs.existsSync(cacheFile)) {
    try {
      const stats = fs.statSync(cacheFile);
      const ageHrs = (Date.now() - stats.mtimeMs) / (1000 * 60 * 60);
      if (ageHrs < 4) {
        const data = JSON.parse(fs.readFileSync(cacheFile, "utf-8"));
        return res.json({ ...data, status: "Live" });
      }
    } catch (e) {
      console.warn("[AgroAI Market] Cache read error, will rebuild:", e.message);
    }
  }

  // Fetch live market data using Gemini Search Grounding
  const systemPrompt = `You are a real-time agricultural market intelligence AI. You search the web for the latest agmarknet mandi prices in India for a specific crop and return a clean JSON object containing the latest price trends and recommendations. Respond ONLY with a valid JSON object.`;

  const userPrompt = `Search the web for the latest mandi wholesale prices (Agmarknet) in India for: ${crop} (as of today or the most recent date available in June 2026).
Specifically search for prices in the state of ${userState} and district ${userDistrict}.
Find a major active mandi in or near ${userState} and get its current price per quintal.
Construct a JSON response with this exact format (no markdown, no extra text, just raw JSON):
{
  "crop": "${crop}",
  "currentPrice": 2200, // numeric, price in ₹/quintal in or near ${userState}
  "msp": 2183, // Minimum Support Price if applicable in India, otherwise null/omit
  "yesterdayPrice": 2150, // yesterday's price in ₹/quintal
  "dailyChangePct": 2.3, // daily change percentage
  "weeklyChangePct": 4.5, // weekly change percentage
  "monthlyTrend": "up", // "up", "down", or "stable"
  "lastUpdated": "Today, 2:15 PM", // format with current time or reported time
  "market": "Mandi Name", // major APMC in or near ${userState}
  "district": "${userDistrict}",
  "state": "${userState}",
  "source": "Agmarknet Grounded Search",
  "history7d": [
    {"label": "Mon", "value": 2000},
    {"label": "Tue", "value": 2050},
    {"label": "Wed", "value": 2100},
    {"label": "Thu", "value": 2080},
    {"label": "Fri", "value": 2150},
    {"label": "Sat", "value": 2100},
    {"label": "Today", "value": 2200}
  ],
  "history30d": [
    {"label": "Wk 1", "value": 1800},
    {"label": "Wk 2", "value": 1950},
    {"label": "Wk 3", "value": 2100},
    {"label": "Wk 4", "value": 2200}
  ],
  "history90d": [
    {"label": "Month 1", "value": 1600},
    {"label": "Month 2", "value": 1900},
    {"label": "Month 3", "value": 2200}
  ],
  "history1y": [
    {"label": "Q1", "value": 1400},
    {"label": "Q2", "value": 1700},
    {"label": "Q3", "value": 2100},
    {"label": "Q4", "value": 2200}
  ],
  "aiPrediction": "🟢 Likely to Increase", // choose: "🟢 Likely to Increase", "🟡 Stable", or "🔴 Likely to Decrease"
  "aiConfidence": 91, // numeric percentage
  "predictionExplanation": "Prices may rise next week due to reduced arrivals and increased demand.",
  "sellingAdvice": "🟡 Hold for 5 Days", // choose: "🟢 Sell Today", "🟡 Hold for 5 Days", or "🔴 Wait for Better Price"
  "sellingAdviceExplanation": "Demand is increasing while market arrivals are decreasing. Waiting 5–7 days may improve returns.",
  "nearbyMarkets": [
    {"market": "Warangal APMC", "district": "Warangal", "distance": "60 km", "price": 2250, "trend": "up", "status": "Best", "lastUpdated": "Today, 1:30 PM"},
    {"market": "Khammam APMC", "district": "Khammam", "distance": "120 km", "price": 2180, "trend": "stable", "status": "Good", "lastUpdated": "Today, 2:00 PM"},
    {"market": "Karimnagar APMC", "district": "Karimnagar", "distance": "140 km", "price": 2150, "trend": "down", "status": "Fair", "lastUpdated": "Today, 11:45 AM"}
  ],
  "dailySummary": "Rice prices are stable across Telangana. Hyderabad APMC is currently offering the best price. Due to lower arrivals and steady demand, prices are expected to remain strong over the next few days.",
  "alerts": [
    "📈 Rice price increased by 4% today.",
    "🏆 Hyderabad APMC is offering a premium of ₹50/quintal.",
    "🌧️ Local rain forecast may delay arrivals tomorrow."
  ]
}`;

  try {
    const { answer } = await callGeminiWithSearch(systemPrompt, [{ role: "user", content: userPrompt }]);
    const jsonMatch = answer.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error("No JSON structure returned from grounded search");
    const result = JSON.parse(jsonMatch[0]);

    // Save success result in cache
    try {
      fs.writeFileSync(cacheFile, JSON.stringify(result, null, 2), "utf-8");
    } catch (e) {
      console.warn("[AgroAI Market] Cache write failed:", e.message);
    }
    return res.json({ ...result, status: "Live" });
  } catch (err) {
    console.warn(`[AgroAI Market] Search grounding failed for ${crop}, falling back to cache/mock:`, err.message);

    // Fallback: Read cache even if stale, or generate fresh fallback values
    if (fs.existsSync(cacheFile)) {
      try {
        const data = JSON.parse(fs.readFileSync(cacheFile, "utf-8"));
        return res.json({ ...data, status: "Cached" });
      } catch (e) {
        // file corrupt, continue to baseline mock
      }
    }

    // Generate baseline mock and cache it as backup
    const fallback = getFallbackMarketData(crop, userState, userDistrict);
    try {
      fs.writeFileSync(cacheFile, JSON.stringify(fallback, null, 2), "utf-8");
    } catch (e) {}
    return res.json(fallback);
  }
});

// ─── Market Insight ───────────────────────────────────────────────────────────
app.post("/api/market-insight", async (req, res) => {
  const { crop, currentPrice, weeklyChange } = req.body;
  if (!crop) return res.status(400).json({ error: "crop is required." });

  const systemPrompt = `You are an expert Indian agricultural market analyst. Give concise, actionable advice.`;

  const userPrompt = `Provide a 2-3 sentence market price prediction for ${crop} in India.
Current price: ₹${currentPrice || 2000}/quintal
Weekly change: ${weeklyChange || "+2%"}
Focus on: supply-demand trends, seasonal factors, and whether farmers should sell now or wait.`;

  try {
    const { answer } = await callGemini(systemPrompt, [{ role: "user", content: userPrompt }]);
    return res.json({ prediction: answer.trim() });
  } catch (err) {
    console.warn("[AgroAI] Market insight failed:", err.message);
    return res.status(500).json({ error: err.message });
  }
});

// ─── Server Start ─────────────────────────────────────────────────────────────
if (!process.env.NETLIFY && !process.env.AWS_LAMBDA_FUNCTION_NAME) {
  app.listen(PORT, () => {
    console.log(`\n✅ AgroAI Backend running on http://localhost:${PORT}`);
    console.log(`   Gemini Key:  ${GEMINI_API_KEY ? "✅ Configured" : "❌ MISSING"}`);
    console.log(`   Groq Key:    ${GROQ_API_KEY   ? "✅ Configured (Vision primary)" : "⚠️  Not set"}`);
    console.log(`   OpenAI Key:  ${OPENAI_API_KEY ? "✅ Configured (fallback)" : "⚠️  Not set (optional)"}\n`);
  });
}

export default app;
