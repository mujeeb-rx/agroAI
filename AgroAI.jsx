import { useState, useEffect, useRef } from "react";

// API keys are stored securely in .env and used only by the backend (server.js)
const WEATHER_API_KEY = "cf8cc0f5d240207ed8400595532e66dc";

const translations = {
  en: {
    nav: ["Home", "AI Chat", "Weather", "Crop Advisor", "Disease Detector", "About"],
    heroTitle: "Smart Farming with AI",
    heroSub: "Get instant crop advice, weather alerts, and AI-powered farming assistance.",
    startChat: "Start Chat",
    checkWeather: "Check Weather",
    chatTitle: "AgroAI Chat Assistant",
    chatPlaceholder: "Ask about crops, fertilizers, disease...",
    send: "Send",
    weatherTitle: "Weather Dashboard",
    weatherSearch: "Search village or city...",
    cropTitle: "Crop Advisor",
    diseaseTitle: "Disease Detector",
    uploadImage: "Upload Leaf / Crop Image",
    analyze: "Analyze Disease",
    dashTitle: "Farmer Dashboard",
    soilType: "Soil Type",
    season: "Season",
    waterAvail: "Water Availability",
    getAdvice: "Get AI Advice",
    light: "Light",
    dark: "Dark",
    suggestedPrompts: [
      "Best fertilizer for rice?",
      "How to prevent leaf disease?",
      "Today weather for farming?",
      "Best crop for summer?",
    ],
    soilOptions: ["Clay", "Sandy", "Loamy", "Black Cotton", "Red Soil"],
    seasonOptions: ["Kharif (Jun-Sep)", "Rabi (Oct-Mar)", "Zaid (Mar-Jun)"],
    waterOptions: ["High Irrigation", "Moderate", "Rain-fed Only"],
  },
  ta: {
    nav: ["முகப்பு", "AI அரட்டை", "வானிலை", "பயிர் ஆலோசகர்", "நோய் கண்டறிதல்", "பற்றி"],
    heroTitle: "AI உடன் திட்டமிட்ட விவசாயம்",
    heroSub: "உடனடி பயிர் ஆலோசனை, வானிலை எச்சரிக்கை மற்றும் AI விவசாய உதவி பெறுங்கள்.",
    startChat: "அரட்டை தொடங்கு",
    checkWeather: "வானிலை பார்",
    chatTitle: "AgroAI அரட்டை உதவியாளர்",
    chatPlaceholder: "பயிர்கள், உரங்கள், நோய் பற்றி கேளுங்கள்...",
    send: "அனுப்பு",
    weatherTitle: "வானிலை டாஷ்போர்டு",
    weatherSearch: "கிராமம் அல்லது நகரம் தேடுங்கள்...",
    cropTitle: "பயிர் ஆலோசகர்",
    diseaseTitle: "நோய் கண்டறிதல்",
    uploadImage: "இலை / பயிர் படம் பதிவேற்றுக",
    analyze: "நோய் பகுப்பாய்வு",
    dashTitle: "விவசாயி டாஷ்போர்டு",
    soilType: "மண் வகை",
    season: "பருவம்",
    waterAvail: "நீர் கிடைக்கும் தன்மை",
    getAdvice: "AI ஆலோசனை பெறு",
    light: "வெளிர்",
    dark: "இருள்",
    suggestedPrompts: ["நெல்லுக்கு சிறந்த உரம்?", "இலை நோயை தடுப்பது எப்படி?", "இன்றைய வானிலை?", "கோடைக்கு சிறந்த பயிர்?"],
    soilOptions: ["களிமண்", "மணல் மண்", "கலப்பு மண்", "கருப்பு மண்", "சிவப்பு மண்"],
    seasonOptions: ["காரிஃப் (ஜூன்-செப்)", "ராபி (அக்-மார்)", "ஜைத் (மார்-ஜூன்)"],
    waterOptions: ["அதிக நீர்ப்பாசனம்", "மிதமான", "மழையை மட்டும் நம்பி"],
  },
  hi: {
    nav: ["होम", "एआई चैट", "मौसम", "फसल सलाहकार", "रोग डिटेक्टर", "हमारे बारे में"],
    heroTitle: "एआई के साथ स्मार्ट खेती",
    heroSub: "त्वरित फसल सलाह, मौसम अलर्ट और एआई खेती सहायता प्राप्त करें।",
    startChat: "चैट शुरू करें",
    checkWeather: "मौसम जांचें",
    chatTitle: "AgroAI चैट असिस्टेंट",
    chatPlaceholder: "फसलों, उर्वरकों, बीमारी के बारे में पूछें...",
    send: "भेजें",
    weatherTitle: "मौसम डैशबोर्ड",
    weatherSearch: "गांव या शहर खोजें...",
    cropTitle: "फसल सलाहकार",
    diseaseTitle: "रोग डिटेक्टर",
    uploadImage: "पत्ते/फसल की छवि अपलोड करें",
    analyze: "रोग का विश्लेषण करें",
    dashTitle: "किसान डैशबोर्ड",
    soilType: "मिट्टी का प्रकार",
    season: "मौसम",
    waterAvail: "पानी की उपलब्धता",
    getAdvice: "एआई सलाह लें",
    light: "हल्का",
    dark: "गहरा",
    suggestedPrompts: ["चावल के लिए सबसे अच्छा उर्वरक?", "पत्ती की बीमारी को कैसे रोकें?", "खेती के लिए आज का मौसम?", "गर्मियों के लिए सबसे अच्छी फसल?"],
    soilOptions: ["चिकनी मिट्टी", "रेतीली", "दोमट", "काली कपास", "लाल मिट्टी"],
    seasonOptions: ["खरीफ (जून-सितंबर)", "रबी (अक्टूबर-मार्च)", "जायद (मार्च-जून)"],
    waterOptions: ["उच्च सिंचाई", "मध्यम", "केवल वर्षा आधारित"],
  },
  te: {
    nav: ["హోమ్", "AI చాట్", "వాతావరణం", "పంట సలహాదారు", "వ్యాధి డిటెక్టర్", "గురించి"],
    heroTitle: "AI తో స్మార్ట్ వ్యవసాయం",
    heroSub: "తక్షణ పంట సలహా, వాతావరణ హెచ్చరికలు మరియు AI వ్యవసాయ సహాయం పొందండి.",
    startChat: "చాట్ ప్రారంభించండి",
    checkWeather: "వాతావరణం తనిఖీ చేయండి",
    chatTitle: "AgroAI చాట్ అసిస్టెంట్",
    chatPlaceholder: "పంటలు, ఎరువులు, వ్యాధుల గురించి అడగండి...",
    send: "పంపండి",
    weatherTitle: "వాతావరణ డాష్‌బోర్డ్",
    weatherSearch: "గ్రామం లేదా నగరాన్ని శోధించండి...",
    cropTitle: "పంట సలహాదారు",
    diseaseTitle: "వ్యాధి డిటెక్టర్",
    uploadImage: "ఆకు/పంట చిత్రాన్ని అప్‌లోడ్ చేయండి",
    analyze: "వ్యాధిని విశ్లేషించండి",
    dashTitle: "రైతు డాష్‌బోర్డ్",
    soilType: "నేల రకం",
    season: "సీజన్",
    waterAvail: "నీటి లభ్యత",
    getAdvice: "AI సలహా పొందండి",
    light: "కాంతి",
    dark: "చీకటి",
    suggestedPrompts: ["వరికి ఉత్తమ ఎరువులు?", "ఆకు వ్యాధిని ఎలా నివారించాలి?", "వ్యవసాయం కోసం నేటి వాతావరణం?", "వేసవికి ఉత్తమ పంట?"],
    soilOptions: ["బంకమట్టి", "ఇసుక", "లోమీ", "నలుపు పత్తి", "ఎర్ర నేల"],
    seasonOptions: ["ఖరీఫ్ (జూన్-సెప్టెంబర్)", "రబీ (అక్టోబర్-మార్చి)", "జైద్ (మార్చి-జూన్)"],
    waterOptions: ["అధిక నీటిపారుదల", "మోడరేట్", "వర్షాధారితం"],
  },
  kn: {
    nav: ["ಮುಖಪುಟ", "AI ಚಾಟ್", "ಹವಾಮಾನ", "ಬೆಳೆ ಸಲಹೆಗಾರ", "ರೋಗ ಪತ್ತೆಕಾರಕ", "ಬಗ್ಗೆ"],
    heroTitle: "AI ನೊಂದಿಗೆ ಸ್ಮಾರ್ಟ್ ಕೃಷಿ",
    heroSub: "ತ್ವರಿತ ಬೆಳೆ ಸಲಹೆ, ಹವಾಮಾನ ಎಚ್ಚರಿಕೆಗಳು ಮತ್ತು AI-ಚಾಲಿತ ಕೃಷಿ ಸಹಾಯವನ್ನು ಪಡೆಯಿರಿ.",
    startChat: "ಚಾಟ್ ಪ್ರಾರಂಭಿಸಿ",
    checkWeather: "ಹವಾಮಾನ ಪರಿಶೀಲಿಸಿ",
    chatTitle: "AgroAI ಚಾಟ್ ಅಸಿಸ್ಟೆಂಟ್",
    chatPlaceholder: "ಬೆಳೆಗಳು, ರಸಗೊಬ್ಬರಗಳು, ರೋಗಗಳ ಬಗ್ಗೆ ಕೇಳಿ...",
    send: "ಕಳುಹಿಸಿ",
    weatherTitle: "ಹವಾಮಾನ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    weatherSearch: "ಗ್ರಾಮ ಅಥವಾ ನಗರವನ್ನು ಹುಡುಕಿ...",
    cropTitle: "ಬೆಳೆ ಸಲಹೆಗಾರ",
    diseaseTitle: "ರೋಗ ಪತ್ತೆಕಾರಕ",
    uploadImage: "ಎಲೆ / ಬೆಳೆ ಚಿತ್ರವನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    analyze: "ರೋಗವನ್ನು ವಿಶ್ಲೇಷಿಸಿ",
    dashTitle: "ರೈತ ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    soilType: "ಮಣ್ಣಿನ ಪ್ರಕಾರ",
    season: "ಋತು",
    waterAvail: "ನೀರಿನ ಲಭ್ಯತೆ",
    getAdvice: "AI ಸಲಹೆ ಪಡೆಯಿರಿ",
    light: "ಬೆಳಕು",
    dark: "ಕತ್ತಲೆ",
    suggestedPrompts: ["ಭತ್ತಕ್ಕೆ ಉತ್ತಮ ರಸಗೊಬ್ಬರ ಯಾವುದು?", "ಎಲೆ ರೋಗವನ್ನು ತಡೆಗಟ್ಟುವುದು ಹೇಗೆ?", "ಕೃಷಿಗೆ ಇಂದಿನ ಹವಾಮಾನ?", "ಬೇಸಿಗೆಗೆ ಉತ್ತಮ ಬೆಳೆ ಯಾವುದು?"],
    soilOptions: ["ಜೇಡಿಮಣ್ಣು", "ಮರಳು", "ಗೋಡುಮಣ್ಣು", "ಕಪ್ಪು ಹತ್ತಿ", "ಕೆಂಪು ಮಣ್ಣು"],
    seasonOptions: ["ಖಾರಿಫ್ (ಜೂನ್-ಸೆಪ್ಟೆಂಬರ್)", "ರಬಿ (ಅಕ್ಟೋಬರ್-ಮಾರ್ಚ್)", "ಜೈದ್ (ಮಾರ್ಚ್-ಜೂನ್)"],
    waterOptions: ["ಹೆಚ್ಚಿನ ನೀರಾವರಿ", "ಮಧ್ಯಮ", "ಮಳೆಯಾಶ್ರಿತ ಮಾತ್ರ"],
  },
  mr: {
    nav: ["मुख्यपृष्ठ", "AI चॅट", "हवामान", "पीक सल्लागार", "रोग शोधक", "बद्दल"],
    heroTitle: "AI सोबत स्मार्ट शेती",
    heroSub: "झटपट पीक सल्ला, हवामान अलर्ट आणि AI-संचलित शेती मदत मिळवा.",
    startChat: "चॅट सुरू करा",
    checkWeather: "हवामान तपासा",
    chatTitle: "AgroAI चॅट असिस्टंट",
    chatPlaceholder: "पिके, खते, आजारांबद्दल विचारा...",
    send: "पाठवा",
    weatherTitle: "हवामान डॅशबोर्ड",
    weatherSearch: "गाव किंवा शहर शोधा...",
    cropTitle: "पीक सल्लागार",
    diseaseTitle: "रोग शोधक",
    uploadImage: "पान / पिकाचा फोटो अपलोड करा",
    analyze: "रोगाचे विश्लेषण करा",
    dashTitle: "शेतकरी डॅशबोर्ड",
    soilType: "मातीचा प्रकार",
    season: "हंगाम",
    waterAvail: "पाण्याची उपलब्धता",
    getAdvice: "AI सल्ला मिळवा",
    light: "प्रकाश",
    dark: "अंधार",
    suggestedPrompts: ["भातासाठी उत्तम खत?", "पानांचा आजार कसा टाळायचा?", "शेतीसाठी आजचे हवामान?", "उन्हाळ्यासाठी सर्वोत्तम पीक?"],
    soilOptions: ["चिकणमाती", "वाळू", "लोम", "काळा कापूस", "लाल माती"],
    seasonOptions: ["खरीप (जून-सप्टें)", "रब्बी (ऑक्टो-मार्च)", "जायद (मार्च-जून)"],
    waterOptions: ["उच्च सिंचन", "मध्यम", "केवळ पावसावर अवलंबून"],
  },
  bn: {
    nav: ["হোম", "এআই চ্যাট", "আবহাওয়া", "ফসল উপদেষ্টা", "রোগ শনাক্তকারী", "সম্পর্কে"],
    heroTitle: "এআই-এর সাথে স্মার্ট ফার্মিং",
    heroSub: "তাত্ক্ষণিক ফসল পরামর্শ, আবহাওয়া সতর্কতা এবং এআই-চালিত কৃষিকাজ সহায়তা পান।",
    startChat: "চ্যাট শুরু করুন",
    checkWeather: "আবহাওয়া দেখুন",
    chatTitle: "AgroAI চ্যাট সহকারী",
    chatPlaceholder: "ফসল, সার, রোগ সম্পর্কে জিজ্ঞাসা করুন...",
    send: "পাঠান",
    weatherTitle: "আবহাওয়া ড্যাশবোর্ড",
    weatherSearch: "গ্রাম বা শহর অনুসন্ধান করুন...",
    cropTitle: "ফসল উপদেষ্টা",
    diseaseTitle: "রোগ শনাক্তকারী",
    uploadImage: "পাতা/ফসলের ছবি আপলোড করুন",
    analyze: "রোগ বিশ্লেষণ করুন",
    dashTitle: "কৃষক ড্যাশবোর্ড",
    soilType: "মাটির ধরন",
    season: "ঋতু",
    waterAvail: "জলের প্রাপ্যতা",
    getAdvice: "এআই পরামর্শ পান",
    light: "আলো",
    dark: "অন্ধকার",
    suggestedPrompts: ["ধানের জন্য সেরা সার?", "পাতার রোগ কীভাবে প্রতিরোধ করবেন?", "চাষের জন্য আজকের আবহাওয়া?", "গ্রীষ্মের জন্য সেরা ফসল?"],
    soilOptions: ["কাদামাটি", "বেলে", "দোঁয়াশ", "কালো তুলা", "লাল মাটি"],
    seasonOptions: ["খরিফ (জুন-সেপ্টে)", "রবি (অক্টো-মার্চ)", "জায়েদ (মার্চ-জুন)"],
    waterOptions: ["উচ্চ সেচ", "মাঝারি", "শুধুমাত্র বৃষ্টি নির্ভর"],
  },
  ml: {
    nav: ["ഹോം", "AI ചാറ്റ്", "കാലാവസ്ഥ", "വിള ഉപദേഷ്ടാവ്", "രോഗം കണ്ടെത്തുന്ന ഉപകരണം", "കുറിച്ച്"],
    heroTitle: "AI ഉപയോഗിച്ചുള്ള സ്മാർട്ട് കൃഷി",
    heroSub: "തൽക്ഷണ വിള ഉപദേശം, കാലാവസ്ഥാ മുന്നറിയിപ്പുകൾ, AI- പവർഡ് കൃഷി സഹായം എന്നിവ നേടുക.",
    startChat: "ചാറ്റ് ആരംഭിക്കുക",
    checkWeather: "കാലാവസ്ഥ പരിശോധിക്കുക",
    chatTitle: "AgroAI ചാറ്റ് അസിസ്റ്റന്റ്",
    chatPlaceholder: "വിളകൾ, രാസവളങ്ങൾ, രോഗം എന്നിവയെക്കുറിച്ച് ചോദിക്കുക...",
    send: "അയക്കുക",
    weatherTitle: "കാലാവസ്ഥാ ഡാഷ്‌ബോർഡ്",
    weatherSearch: "ഗ്രാമം അല്ലെങ്കിൽ നഗരം തിരയുക...",
    cropTitle: "വിള ഉപദേഷ്ടാവ്",
    diseaseTitle: "രോഗം കണ്ടെത്തുന്ന ഉപകരണം",
    uploadImage: "ഇല / വിള ചിത്രം അപ്‌ലോഡ് ചെയ്യുക",
    analyze: "രോഗം വിശകലനം ചെയ്യുക",
    dashTitle: "കർഷക ഡാഷ്‌ബോർഡ്",
    soilType: "മണ്ണിന്റെ തരം",
    season: "സീസൺ",
    waterAvail: "ജല ലഭ്യത",
    getAdvice: "AI ഉപദേശം നേടുക",
    light: "വെളിച്ചം",
    dark: "ഇരുട്ട്",
    suggestedPrompts: ["നെല്ലിന് ഏറ്റവും മികച്ച വളം?", "ഇലരോഗം എങ്ങനെ തടയാം?", "കൃഷിക്കുള്ള ഇന്നത്തെ കാലാവസ്ഥ?", "വേനൽക്കാലത്തിന് ഏറ്റവും മികച്ച വിള?"],
    soilOptions: ["കളിമണ്ണ്", "മണൽ", "ലോമി", "കറുത്ത പരുത്തി", "ചെമ്മണ്ണ്"],
    seasonOptions: ["ഖാരിഫ് (ജൂൺ-സെപ്റ്റം)", "റാബി (ഒക്ടോ-മാർച്ച്)", "സെയ്ദ് (മാർച്ച്-ജൂൺ)"],
    waterOptions: ["ഉയർന്ന ജലസേചനം", "മിതമായത്", "മഴയെ മാത്രം ആശ്രയിക്കുന്നവ"],
  }
};

const mockWeatherData = {
  temp: 32,
  humidity: 68,
  rain: 20,
  wind: 14,
  condition: "Partly Cloudy",
  advice: "Good day for irrigation. Avoid chemical spraying due to mild wind.",
  icon: "⛅",
};

const mockDiseaseResults = [
  { disease: "Early Blight (Alternaria solani)", prevention: "Apply Mancozeb 75% WP @ 2g/L. Remove infected leaves. Avoid overhead irrigation.", fertilizer: "Reduce Nitrogen, increase Potassium (K). Apply 13:0:45 foliar spray.", watering: "Water at base only. Maintain 5-7 day irrigation interval." },
  { disease: "Powdery Mildew", prevention: "Spray Sulfur 80% WP @ 3g/L. Ensure proper air circulation between plants.", fertilizer: "Avoid excess Nitrogen. Use balanced NPK 10:26:26.", watering: "Reduce overhead irrigation. Allow foliage to dry quickly." },
  { disease: "Leaf Rust", prevention: "Apply Propiconazole 25 EC @ 1ml/L. Rotate crops annually.", fertilizer: "Apply Zinc Sulfate foliar spray @ 0.5%. Maintain balanced nutrition.", watering: "Drip irrigation recommended. Avoid wetting leaves." },
];

const dashCards = [
  { icon: "🌤️", title: "Today Weather", value: "32°C", sub: "Partly Cloudy", color: "#1a6b3a" },
  { icon: "🌿", title: "Crop Health", value: "Good", sub: "3 crops monitored", color: "#2d8a4e" },
  { icon: "🤖", title: "AI Suggestions", value: "5 New", sub: "Check advisor", color: "#1a6b3a" },
  { icon: "💧", title: "Water Alert", value: "Normal", sub: "Next: Tomorrow 6AM", color: "#2d8a4e" },
  { icon: "🧪", title: "Fertilizer", value: "Due", sub: "NPK spray in 2 days", color: "#1a6b3a" },
];

const cropData = {
  "Clay-Kharif (Jun-Sep)-High Irrigation": { crop: "Paddy (Rice)", yield: "4-5 tons/ha", tip: "Use IR-64 or Swarna variety. Transplant at 21 days.", fertilizer: "NPK 120:60:60 kg/ha. Apply Zinc Sulfate 25 kg/ha at planting." },
  "Sandy-Zaid (Mar-Jun)-Rain-fed Only": { crop: "Watermelon / Muskmelon", yield: "15-20 tons/ha", tip: "Sandy soil ideal. Needs minimal water once established.", fertilizer: "NPK 80:40:60 kg/ha. Weekly foliar 19:19:19 spray." },
  "Loamy-Rabi (Oct-Mar)-Moderate": { crop: "Wheat", yield: "3-4 tons/ha", tip: "Sow HD-2967 or PBW-343. Irrigate at CRI & flowering stages.", fertilizer: "NPK 120:60:40 kg/ha. Top dress Urea at tillering." },
  "Black Cotton-Kharif (Jun-Sep)-Rain-fed Only": { crop: "Soybean / Cotton", yield: "1.5-2 tons/ha", tip: "Black cotton soil retains moisture well. Ideal for Bt Cotton.", fertilizer: "NPK 25:50:25 kg/ha. Apply DAP at sowing." },
  "Red Soil-Zaid (Mar-Jun)-High Irrigation": { crop: "Groundnut", yield: "2-2.5 tons/ha", tip: "Red soil with good drainage suits groundnut perfectly.", fertilizer: "NPK 25:50:25 kg/ha. Apply Gypsum 200 kg/ha at pegging." },
};

const defaultCropResult = {
  crop: "Millet / Bajra",
  yield: "1.5-2 tons/ha",
  tip: "Drought-tolerant crop. Suitable for most Indian soil types.",
  fertilizer: "NPK 40:20:20 kg/ha. Urea top-dressing after 30 days.",
};

// Greeting message per language
  const greetings = {
    en: "🌾 Hello! I'm AgroAI, your smart farming assistant. Ask me anything about crops, weather, fertilizers, or plant diseases!",
    ta: "🌾 வணக்கம்! நான் AgroAI, உங்கள் விவசாய உதவியாளர். பயிர்கள், வானிலை, உரங்கள் அல்லது தாவர நோய்கள் பற்றி எதையும் கேளுங்கள்!",
    hi: "🌾 नमस्ते! मैं AgroAI हूँ, आपका स्मार्ट कृषि सहायक। फसलों, मौसम, उर्वरकों या पौधों की बीमारियों के बारे में कुछ भी पूछें!",
    te: "🌾 నమస్కారం! నేను AgroAI, మీ స్మార్ట్ వ్యవసాయ సహాయకుడిని. పంటలు, వాతావరణం, ఎరువులు లేదా మొక్కల వ్యాధుల గురించి ఏదైనా అడగండి!",
    kn: "🌾 ನಮಸ್ಕಾರ! ನಾನು AgroAI, ನಿಮ್ಮ ಸ್ಮಾರ್ಟ್ ಕೃಷಿ ಸಹಾಯಕ. ಬೆಳೆಗಳು, ಹವಾಮಾನ, ರಸಗೊಬ್ಬರಗಳು ಅಥವಾ ಸಸ್ಯ ರೋಗಗಳ ಬಗ್ಗೆ ಏನಾದರೂ ಕೇಳಿ!",
    mr: "🌾 नमस्कार! मी AgroAI आहे, तुमचा स्मार्ट शेती सहाय्यक. पिके, हवामान, खते किंवा वनस्पती रोगांबद्दल काहीही विचारा!",
    bn: "🌾 নমস্কার! আমি AgroAI, আপনার স্মার্ট কৃষি সহকারী। ফসল, আবহাওয়া, সার বা গাছের রোগ সম্পর্কে যেকোনো প্রশ্ন করুন!",
    ml: "🌾 നമസ്കാരം! ഞാൻ AgroAI, നിങ്ങളുടെ സ്മാർട്ട് കൃഷി സഹായി. വിളകൾ, കാലാവസ്ഥ, വളങ്ങൾ അല്ലെങ്കിൽ സസ്യ രോഗങ്ങളെക്കുറിച്ച് എന്തും ചോദിക്കൂ!",
  };

  const langLabels = {
    en: "🇬🇧 English", ta: "🇮🇳 தமிழ்", hi: "🇮🇳 हिंदी",
    te: "🇮🇳 తెలుగు", kn: "🇮🇳 ಕನ್ನಡ", mr: "🇮🇳 मराठी",
    bn: "🇮🇳 বাংলা", ml: "🇮🇳 മലയാളം",
  };

export default function AgroAI() {
  const [lang, setLang] = useState("en");
  const [dark, setDark] = useState(true);
  const [page, setPage] = useState("home");
  const [messages, setMessages] = useState([
    { role: "assistant", text: greetings.en },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [weatherCity, setWeatherCity] = useState("");
  const [weatherData, setWeatherData] = useState(null);
  const [weatherLoading, setWeatherLoading] = useState(false);
  const [diseaseImage, setDiseaseImage] = useState(null);
  const [diseaseResult, setDiseaseResult] = useState(null);
  const [diseaseLoading, setDiseaseLoading] = useState(false);
  const [soil, setSoil] = useState("");
  const [season, setSeason] = useState("");
  const [water, setWater] = useState("");
  const [cropResult, setCropResult] = useState(null);
  const [cropLoading, setCropLoading] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  // Location autocomplete
  const [locationSuggestions, setLocationSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const suggestionsRef = useRef(null);
  const chatEndRef = useRef(null);
  const recognitionRef = useRef(null);   // track active SpeechRecognition instance
  const t = translations[lang];

  // When language changes, reset chat with greeting in new language
  function changeLang(newLang) {
    setLang(newLang);
    setMessages([{ role: "assistant", text: greetings[newLang] || greetings.en }]);
    setInput("");
  }

  function clearChat() {
    setMessages([{ role: "assistant", text: greetings[lang] || greetings.en }]);
    setInput("");
  }

  // Click outside → close location suggestions
  useEffect(() => {
    function handleOutsideClick(e) {
      if (suggestionsRef.current && !suggestionsRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, []);

  // Debounced location suggestions via OpenWeatherMap Geocoding API
  const suggestionTimer = useRef(null);
  function handleWeatherInput(value) {
    setWeatherCity(value);
    clearTimeout(suggestionTimer.current);
    if (value.trim().length < 2) { setLocationSuggestions([]); setShowSuggestions(false); return; }
    suggestionTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(
          `https://api.openweathermap.org/geo/1.0/direct?q=${encodeURIComponent(value)}&limit=6&appid=${WEATHER_API_KEY}`
        );
        const data = await res.json();
        if (Array.isArray(data) && data.length > 0) {
          setLocationSuggestions(data);
          setShowSuggestions(true);
        } else {
          setLocationSuggestions([]);
          setShowSuggestions(false);
        }
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


  const bg = dark
    ? { bg: "#0a1a0f", card: "#0f2318", border: "#1a4028", text: "#e8f5e9", muted: "#81c784", accent: "#4caf50", grad: "linear-gradient(135deg,#0a1a0f 0%,#0d2b19 50%,#0a1a0f 100%)" }
    : { bg: "#f0f7f1", card: "#ffffff", border: "#c8e6c9", text: "#1b2e1c", muted: "#4a7c59", accent: "#2e7d32", grad: "linear-gradient(135deg,#e8f5e9 0%,#f0f7f1 50%,#e8f5e9 100%)" };

  // Auto-scroll chat to bottom
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function sendMessage(text) {
    const userMsg = text || input;
    if (!userMsg.trim()) return;

    // Build conversation history for the backend (user + assistant turns only)
    const historyForBackend = messages
      .filter((m) => m.role === "user" || m.role === "assistant")
      .map((m) => ({ role: m.role, content: m.text }));

    setMessages((m) => [...m, { role: "user", text: userMsg }]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lang,
          messages: [...historyForBackend, { role: "user", content: userMsg }],
        }),
      });

      let data;
      try {
        data = await res.json();
      } catch (e) {
        throw new Error(`Server connection failed (Status: ${res.status}). Ensure the backend is running.`);
      }

      if (!res.ok || data.error) throw new Error(data.error || "Backend error");

      const aiText = data.answer || "⚠️ No response received. Please try again.";
      setMessages((m) => [...m, { role: "assistant", text: aiText }]);

      if (window.speechSynthesis && aiText) {
        // Stop any previous speech before starting new one
        window.speechSynthesis.cancel();
        const utter = new SpeechSynthesisUtterance(
          aiText.replace(/[*#\-•]/g, "").replace(/[\u{1F300}-\u{1FAFF}]/gu, "")
        );
        utter.lang = speechLangMap[lang] || "en-IN";
        utter.rate = 0.9;
        // Small delay needed after cancel() before speak() works reliably
        setTimeout(() => window.speechSynthesis.speak(utter), 120);
      }
    } catch (err) {
      console.error("[AgroAI] Chat error:", err.message);
      setMessages((m) => [...m, {
        role: "assistant",
        text: `⚠️ **Could not reach AI backend.**\n\n${err.message}\n\nMake sure the backend server is running (\`npm run server\`).`,
      }]);
    }
    setLoading(false);
  }

  // ── Speech language map – must be defined before startVoice & sendMessage ──
  const speechLangMap = {
    en: "en-IN",  hi: "hi-IN",  ta: "ta-IN",  te: "te-IN",
    kn: "kn-IN",  mr: "mr-IN",  bn: "bn-IN",  ml: "ml-IN",
  };

  function startVoice() {
    // ── TOGGLE: if already listening, stop and return ──
    if (listening) {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
        recognitionRef.current = null;
      }
      setListening(false);
      return;
    }

    // ── Stop AI from talking before we start listening ──
    if (window.speechSynthesis) window.speechSynthesis.cancel();

    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) {
      alert("⚠️ Voice input is not supported in this browser.\nPlease use Google Chrome or Microsoft Edge.");
      return;
    }

    const recog = new SR();
    recognitionRef.current = recog;
    recog.lang          = speechLangMap[lang] || "en-IN";
    recog.continuous    = false;
    recog.interimResults = false;
    recog.maxAlternatives = 1;

    recog.onstart  = () => setListening(true);
    recog.onend    = () => { setListening(false); recognitionRef.current = null; };
    recog.onerror  = (e) => {
      setListening(false);
      recognitionRef.current = null;
      if (e.error === "no-speech")   return;  // silently ignore
      if (e.error === "aborted")     return;  // user cancelled
      if (e.error === "not-allowed") {
        alert("🎤 Microphone permission denied.\nPlease click the lock icon in your browser address bar and allow microphone access, then try again.");
      } else if (e.error === "network") {
        alert("⚠️ Network error during voice recognition. Please check your internet connection.");
      } else {
        console.warn("[AgroAI Voice] recognition error:", e.error);
      }
    };
    recog.onresult = (e) => {
      const transcript = e.results[0][0].transcript.trim();
      if (!transcript) return;
      setInput(transcript);
      setTimeout(() => sendMessage(transcript), 200);
    };

    try {
      recog.start();
    } catch (err) {
      console.error("[AgroAI Voice] start error:", err.message);
      setListening(false);
      recognitionRef.current = null;
    }
  }

  async function fetchWeather(cityOverride) {
    const city = cityOverride || weatherCity;
    if (!city.trim()) return;
    setWeatherLoading(true);
    setWeatherData(null);
    try {
      // Fetch real weather from OpenWeatherMap
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(city)}&appid=${WEATHER_API_KEY}&units=metric`
      );
      if (!res.ok) throw new Error("City not found");
      const data = await res.json();

      const temp = Math.round(data.main.temp);
      const humidity = data.main.humidity;
      const wind = Math.round(data.wind.speed * 3.6); // m/s to km/h
      const condition = data.weather[0].main;
      const description = data.weather[0].description;
      const rain = data.rain ? Math.round(data.rain["1h"] || 0) : 0;

      // Map condition to icon
      const iconMap = {
        Clear: "☀️", Clouds: "⛅", Rain: "🌧️", Drizzle: "🌦️",
        Thunderstorm: "⛈️", Snow: "❄️", Mist: "🌫️", Haze: "🌫️", Fog: "🌫️",
      };
      const icon = iconMap[condition] || "🌤️";

      // Use backend to generate a custom farming tip based on real weather
      let advice = "";
      try {
        const tipRes = await fetch("/api/weather-tip", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ city, temp, humidity, wind, description, rain }),
        });
        const tipData = await tipRes.json();
        advice = tipData?.tip || "";
      } catch (_) {}

      if (!advice) {
        if (temp > 38) advice = "Extreme heat! Water crops early morning and evening. Avoid field work midday.";
        else if (rain > 5) advice = "Rain detected. Skip irrigation today. Watch for waterlogging in low-lying fields.";
        else if (humidity > 80) advice = "High humidity increases fungal risk. Consider preventive fungicide spray.";
        else if (wind > 30) advice = "Strong winds! Avoid spraying pesticides or fertilizers today.";
        else advice = "Good farming conditions today. Ideal for field inspection and light irrigation.";
      }

      setWeatherData({
        temp, humidity, wind, rain,
        condition: `${condition} — ${description}`,
        icon, advice, city: data.name + ", " + data.sys.country,
      });
    } catch (err) {
      alert(`⚠️ Could not find weather for "${city}". Please check the city name and try again.`);
    }
    setWeatherLoading(false);
  }

  async function fetchWeatherByLocation() {
    setWeatherLoading(true);

    // Try GPS first (with 10-second timeout), then fall back to IP location
    const tryGPS = () => new Promise((resolve, reject) => {
      if (!navigator.geolocation) return reject(new Error("no_geo"));
      const timer = setTimeout(() => reject(new Error("timeout")), 10000);
      navigator.geolocation.getCurrentPosition(
        (pos) => { clearTimeout(timer); resolve(pos.coords); },
        (err) => { clearTimeout(timer); reject(err); },
        { enableHighAccuracy: true, timeout: 9000, maximumAge: 60000 }
      );
    });

    // IP-based location fallback (completely free, no key needed)
    const tryIPLocation = async () => {
      const res = await fetch("http://ip-api.com/json/?fields=lat,lon,city,status");
      const data = await res.json();
      if (data.status !== "success") throw new Error("IP location failed");
      return { latitude: data.lat, longitude: data.lon, city: data.city };
    };

    try {
      let latitude, longitude, cityHint = null;

      try {
        // Attempt GPS
        const coords = await tryGPS();
        latitude = coords.latitude;
        longitude = coords.longitude;
      } catch (gpsErr) {
        console.warn("GPS failed, trying IP location:", gpsErr.message);
        // Fallback: IP-based location
        try {
          const ipLoc = await tryIPLocation();
          latitude = ipLoc.latitude;
          longitude = ipLoc.longitude;
          cityHint = ipLoc.city;
        } catch {
          setWeatherLoading(false);
          alert("⚠️ Could not detect your location automatically.\nPlease type your city name in the search box.");
          return;
        }
      }

      // Fetch real weather using the detected coordinates
      const res = await fetch(
        `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric`
      );
      const data = await res.json();
      const detectedCity = data.name || cityHint || "Your Location";
      setWeatherCity(detectedCity);
      await fetchWeather(detectedCity);

    } catch (err) {
      console.error("Location fetch error:", err);
      setWeatherLoading(false);
      alert("⚠️ Could not detect your location. Please type your city name manually.");
    }
  }

  async function analyzeDisease(e) {
    const file = e.target.files[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setDiseaseImage(url);
    setDiseaseLoading(true);
    setDiseaseResult(null);
    try {
      const base64 = await new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result.split(",")[1]);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
      const mimeType = file.type || "image/jpeg";

      const res = await fetch("/api/analyze-disease", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ base64, mimeType, lang }),  // ✅ pass selected language
      });
      let result;
      try {
        result = await res.json();
      } catch (e) {
        throw new Error(`Server connection failed (Status: ${res.status}). Ensure the backend is running.`);
      }
      if (!res.ok || result.error) throw new Error(result.error || "Analysis failed");
      setDiseaseResult(result);
    } catch (err) {
      console.error("[AgroAI] Disease analysis failed:", err.message);
      setDiseaseResult({ error: err.message });
    }
    setDiseaseLoading(false);
  }

  function getCropAdvice() {
    if (!soil || !season || !water) return;
    setCropLoading(true);
    setTimeout(() => {
      const key = `${soil}-${season}-${water}`;
      setCropResult(cropData[key] || defaultCropResult);
      setCropLoading(false);
    }, 1200);
  }

  const navItems = t.nav;

  const styles = {
    root: { fontFamily: "'Outfit', 'Segoe UI', sans-serif", minHeight: "100vh", background: bg.grad, color: bg.text, transition: "all 0.3s" },
    navbar: { position: "sticky", top: 0, zIndex: 100, background: dark ? "rgba(10,26,15,0.95)" : "rgba(255,255,255,0.95)", backdropFilter: "blur(12px)", borderBottom: `1px solid ${bg.border}`, padding: "10px 1.5rem", display: "flex", alignItems: "center", justifyContent: "space-between", minHeight: 64, flexWrap: "wrap", gap: 10 },
    logo: { fontSize: 22, fontWeight: 800, color: bg.accent, letterSpacing: -0.5, cursor: "pointer" },
    navLink: (active) => ({ cursor: "pointer", fontSize: 14, fontWeight: 500, color: active ? bg.accent : bg.muted, padding: "6px 14px", borderRadius: 8, background: active ? (dark ? "rgba(76,175,80,0.15)" : "rgba(46,125,50,0.1)") : "transparent", transition: "all 0.2s", border: "none" }),
    btn: (variant = "primary") => ({
      cursor: "pointer", fontFamily: "inherit", fontWeight: 600, fontSize: 14, borderRadius: 10, padding: "10px 22px", border: variant === "outline" ? `1.5px solid ${bg.accent}` : "none",
      background: variant === "primary" ? bg.accent : "transparent", color: variant === "primary" ? "#fff" : bg.accent, transition: "all 0.2s",
    }),
    card: { background: bg.card, border: `1px solid ${bg.border}`, borderRadius: 16, padding: "1.5rem", transition: "all 0.3s" },
    section: { maxWidth: 1100, margin: "0 auto", padding: "3rem 1.5rem" },
    input: { width: "100%", background: dark ? "rgba(255,255,255,0.05)" : "#f8faf8", border: `1px solid ${bg.border}`, borderRadius: 10, padding: "10px 14px", color: bg.text, fontFamily: "inherit", fontSize: 14, outline: "none", boxSizing: "border-box" },
    select: { background: dark ? "rgba(255,255,255,0.05)" : "#f8faf8", border: `1px solid ${bg.border}`, borderRadius: 10, padding: "10px 14px", color: bg.text, fontFamily: "inherit", fontSize: 14, outline: "none", width: "100%", cursor: "pointer" },
    tag: { display: "inline-block", background: dark ? "rgba(76,175,80,0.15)" : "rgba(46,125,50,0.1)", color: bg.accent, borderRadius: 20, padding: "4px 12px", fontSize: 12, fontWeight: 600 },
  };

  const pages = {
    home: (
      <div>
        {/* Hero */}
        <div style={{ textAlign: "center", padding: "5rem 1.5rem 3rem", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, background: dark ? "radial-gradient(ellipse at 50% 0%, rgba(76,175,80,0.12) 0%, transparent 70%)" : "radial-gradient(ellipse at 50% 0%, rgba(46,125,50,0.08) 0%, transparent 70%)", pointerEvents: "none" }} />
          <div style={{ display: "inline-block", ...styles.tag, marginBottom: 16, fontSize: 13 }}>🌿 AI-Powered Agriculture</div>
          <h1 style={{ fontSize: "clamp(2.2rem,5vw,3.8rem)", fontWeight: 900, lineHeight: 1.1, marginBottom: 20, letterSpacing: -1.5, background: dark ? "linear-gradient(135deg,#81c784,#4caf50,#a5d6a7)" : "linear-gradient(135deg,#1b5e20,#2e7d32,#388e3c)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
            {t.heroTitle}
          </h1>
          <p style={{ fontSize: "clamp(1rem,2.5vw,1.2rem)", color: bg.muted, maxWidth: 600, margin: "0 auto 2.5rem", lineHeight: 1.7 }}>{t.heroSub}</p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center", flexWrap: "wrap" }}>
            <button style={styles.btn("primary")} onClick={() => setPage("chat")}>🤖 {t.startChat}</button>
            <button style={styles.btn("outline")} onClick={() => setPage("weather")}>🌤️ {t.checkWeather}</button>
          </div>
          {/* Animated Illustration */}
          <div style={{ marginTop: 48, display: "flex", justifyContent: "center" }}>
            <div style={{ fontSize: 80, animation: "float 3s ease-in-out infinite", display: "inline-block" }}>🌾</div>
          </div>
          <div style={{ display: "flex", gap: 16, justifyContent: "center", marginTop: 24, flexWrap: "wrap" }}>
            {["🌱 Crop Advisory", "🌧️ Weather Alerts", "🧪 Fertilizer Guide", "🔬 Disease Detection"].map((f) => (
              <div key={f} style={{ ...styles.tag, padding: "8px 16px", fontSize: 13 }}>{f}</div>
            ))}
          </div>
        </div>

        {/* Features Grid */}
        <div style={styles.section}>
          <h2 style={{ textAlign: "center", fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 700, marginBottom: 36, color: bg.text }}>Everything a Farmer Needs</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))", gap: 20 }}>
            {[
              { icon: "🤖", title: "AI Chat Assistant", desc: "Ask any farming question in Tamil or English. Get instant expert answers 24/7.", page: "chat" },
              { icon: "🌦️", title: "Weather Dashboard", desc: "Real-time weather data with farming recommendations for your village.", page: "weather" },
              { icon: "🌾", title: "Crop Advisor", desc: "Input soil type and season to get personalized crop and fertilizer recommendations.", page: "crop" },
              { icon: "🔬", title: "Disease Detector", desc: "Upload a leaf photo and get instant disease identification with treatment advice.", page: "disease" },
            ].map((f) => (
              <div key={f.title} style={{ ...styles.card, cursor: "pointer", transition: "transform 0.2s, box-shadow 0.2s" }}
                onClick={() => setPage(f.page)}
                onMouseEnter={(e) => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = `0 12px 32px ${dark ? "rgba(76,175,80,0.15)" : "rgba(46,125,50,0.12)"}`; }}
                onMouseLeave={(e) => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}>
                <div style={{ fontSize: 40, marginBottom: 12 }}>{f.icon}</div>
                <h3 style={{ fontWeight: 700, fontSize: 17, marginBottom: 8, color: bg.text }}>{f.title}</h3>
                <p style={{ color: bg.muted, fontSize: 14, lineHeight: 1.6 }}>{f.desc}</p>
                <div style={{ marginTop: 14, color: bg.accent, fontSize: 13, fontWeight: 600 }}>Learn more →</div>
              </div>
            ))}
          </div>
        </div>

        {/* Dashboard Preview */}
        <div style={{ ...styles.section, paddingTop: 0 }}>
          <h2 style={{ textAlign: "center", fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 700, marginBottom: 36, color: bg.text }}>{t.dashTitle}</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16 }}>
            {dashCards.map((c) => (
              <div key={c.title} style={{ ...styles.card, textAlign: "center" }}>
                <div style={{ fontSize: 32, marginBottom: 8 }}>{c.icon}</div>
                <div style={{ fontSize: 22, fontWeight: 800, color: bg.accent }}>{c.value}</div>
                <div style={{ fontSize: 13, fontWeight: 600, marginTop: 2, color: bg.text }}>{c.title}</div>
                <div style={{ fontSize: 12, color: bg.muted, marginTop: 4 }}>{c.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),

    chat: (
      <div style={styles.section}>
        {/* Chat header */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 16 }}>
          <div>
            <h2 style={{ fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 700, marginBottom: 6, color: bg.text }}>{t.chatTitle}</h2>
            <p style={{ color: bg.muted, fontSize: 13 }}>🤖 Powered by Gemini AI — Replies in your language</p>
          </div>
          {/* Language picker inside chat */}
          <div style={{ display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
            <span style={{ fontSize: 13, color: bg.muted, fontWeight: 600 }}>Reply language:</span>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
              {Object.entries(langLabels).map(([code, label]) => (
                <button key={code}
                  onClick={() => changeLang(code)}
                  style={{
                    ...styles.btn(lang === code ? "primary" : "outline"),
                    padding: "5px 11px", fontSize: 12, fontWeight: lang === code ? 700 : 500,
                    opacity: lang === code ? 1 : 0.7,
                  }}>
                  {label}
                </button>
              ))}
            </div>
            <button onClick={clearChat} title="Clear chat" style={{ ...styles.btn("outline"), padding: "5px 12px", fontSize: 13 }}>🗑️ Clear</button>
          </div>
        </div>

        {/* Active language badge */}
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, background: dark ? "rgba(76,175,80,0.15)" : "rgba(46,125,50,0.08)", border: `1px solid ${bg.accent}`, borderRadius: 20, padding: "4px 14px", fontSize: 12, fontWeight: 700, color: bg.accent, marginBottom: 16 }}>
          🗣️ AI will reply in: {langLabels[lang]}
        </div>

        {/* Suggested prompts — in selected language */}
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 20 }}>
          {t.suggestedPrompts.map((p) => (
            <button key={p} style={{ ...styles.btn("outline"), padding: "7px 14px", fontSize: 13 }} onClick={() => sendMessage(p)}>{p}</button>
          ))}
        </div>

        {/* Chat window */}
        <div style={{ ...styles.card, height: 440, overflowY: "auto", display: "flex", flexDirection: "column", gap: 14, padding: "1.2rem" }}>
          {messages.map((m, i) => (
            <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start", alignItems: "flex-end", gap: 8 }}>
              {m.role === "assistant" && <div style={{ fontSize: 20, flexShrink: 0 }}>🌿</div>}
              <div style={{
                maxWidth: "80%", padding: "11px 15px", borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                background: m.role === "user" ? bg.accent : (dark ? "rgba(255,255,255,0.07)" : "#f1f8f2"),
                color: m.role === "user" ? "#fff" : bg.text, fontSize: 14, lineHeight: 1.75, whiteSpace: "pre-wrap",
                boxShadow: m.role === "user" ? "none" : `0 2px 8px ${dark ? "rgba(0,0,0,0.2)" : "rgba(0,0,0,0.06)"}`,
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

        {/* Input row */}
        <div style={{ display: "flex", gap: 10, marginTop: 14, alignItems: "center" }}>
          <input
            value={input}
            onChange={(e) => { if (window.speechSynthesis) window.speechSynthesis.cancel(); setInput(e.target.value); }}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
            placeholder={listening
              ? (lang==="te" ? "🎤 వినడం..."
                : lang==="hi" ? "🎤 सुन रहा हूँ..."
                : lang==="ta" ? "🎤 கேட்கிறேன்..."
                : lang==="kn" ? "🎤 ಕೇಳುತ್ತಿದ್ದೇನೆ..."
                : lang==="mr" ? "🎤 ऐकतोय..."
                : lang==="bn" ? "🎤 শুনছি..."
                : lang==="ml" ? "🎤 കേൾക്കുന്നു..."
                : "🎤 Listening...")
              : t.chatPlaceholder
            }
            style={{ ...styles.input, flex: 1, border: listening ? `2px solid #f44336` : undefined }}
          />
          <button
            onClick={startVoice}
            title={listening ? "Click to stop listening" : `Speak in ${langLabels[lang]}`}
            style={{
              ...styles.btn("outline"),
              padding: "10px 14px",
              fontSize: 20,
              background: listening ? "rgba(244,67,54,0.2)" : "transparent",
              border: listening ? "2px solid #f44336" : undefined,
              animation: listening ? "pulse 0.8s ease-in-out infinite" : "none",
              position: "relative",
            }}
          >
            {listening ? "🔴" : "🎙️"}
          </button>
          <button onClick={() => sendMessage()} style={{ ...styles.btn("primary"), minWidth: 70 }} disabled={loading}>{t.send}</button>
        </div>
        {listening && (
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 8, color: "#f44336", fontSize: 13, fontWeight: 600 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: "#f44336", display: "inline-block", animation: "pulse 0.8s ease-in-out infinite" }} />
            {lang==="te" ? "మీరు మాట్లాడుతున్నారు..."
              : lang==="hi" ? "आप बोल रहे हैं..."
              : lang==="ta" ? "நீங்கள் பேசுகிறீர்கள்..."
              : lang==="kn" ? "ನೀವು ಮಾತನಾಡುತ್ತಿದ್ದೀರಿ..."
              : lang==="mr" ? "तुम्ही बोलत आहात..."
              : lang==="bn" ? "আপনি বলছেন..."
              : lang==="ml" ? "നിങ്ങൾ സംസാരിക്കുന്നു..."
              : "Listening — speak now..."}
          </div>
        )}
      </div>
    ),



    weather: (
      <div style={styles.section}>
        <h2 style={{ fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 700, marginBottom: 8, color: bg.text }}>{t.weatherTitle}</h2>
        <p style={{ color: bg.muted, marginBottom: 24, fontSize: 14 }}>Get real-time weather data with AI-powered farming advice for your location</p>

        {/* ─── Search bar with Autocomplete ─── */}
        <div style={{ display: "flex", gap: 10, marginBottom: 12, maxWidth: 600, flexWrap: "wrap", alignItems: "flex-start" }}>
          {/* Autocomplete wrapper */}
          <div ref={suggestionsRef} style={{ position: "relative", flex: 1, minWidth: 200 }}>
            <input
              value={weatherCity}
              onChange={(e) => handleWeatherInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") { setShowSuggestions(false); fetchWeather(); }
                if (e.key === "Escape") setShowSuggestions(false);
              }}
              onFocus={() => locationSuggestions.length > 0 && setShowSuggestions(true)}
              placeholder={t.weatherSearch}
              style={{ ...styles.input, width: "100%" }}
              autoComplete="off"
            />

            {/* ─── Suggestions Dropdown ─── */}
            {showSuggestions && locationSuggestions.length > 0 && (
              <div style={{
                position: "absolute", top: "calc(100% + 6px)", left: 0, right: 0,
                background: dark ? "#0f2318" : "#fff",
                border: `1px solid ${bg.accent}`,
                borderRadius: 12,
                boxShadow: `0 8px 32px ${dark ? "rgba(0,0,0,0.5)" : "rgba(46,125,50,0.15)"}`,
                zIndex: 999,
                overflow: "hidden",
              }}>
                {locationSuggestions.map((item, i) => {
                  // Country code → flag emoji
                  const flag = item.country
                    ? String.fromCodePoint(...[...item.country.toUpperCase()].map(c => 0x1F1E6 - 65 + c.charCodeAt(0)))
                    : "🌍";
                  const primary = item.name;
                  const secondary = [item.state, item.country].filter(Boolean).join(", ");
                  return (
                    <div
                      key={i}
                      onMouseDown={() => selectSuggestion(item)}
                      style={{
                        padding: "12px 16px",
                        cursor: "pointer",
                        borderBottom: i < locationSuggestions.length - 1 ? `1px solid ${dark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}` : "none",
                        display: "flex", alignItems: "center", gap: 12,
                        transition: "background 0.15s",
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = dark ? "rgba(76,175,80,0.15)" : "rgba(46,125,50,0.08)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      <span style={{ fontSize: 22, flexShrink: 0 }}>{flag}</span>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontWeight: 700, fontSize: 14, color: bg.text, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                          📍 {primary}
                        </div>
                        <div style={{ fontSize: 12, color: bg.muted, marginTop: 2 }}>{secondary}</div>
                      </div>
                      <span style={{ marginLeft: "auto", fontSize: 11, color: bg.accent, fontWeight: 600, flexShrink: 0 }}>Select →</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <button onClick={() => { setShowSuggestions(false); fetchWeather(); }} style={styles.btn("primary")} disabled={weatherLoading}>
            {weatherLoading ? "⏳" : "🔍 Search"}
          </button>
          <button onClick={fetchWeatherByLocation} style={{ ...styles.btn("outline") }} disabled={weatherLoading} title="Use my GPS location">📍 My Location</button>
        </div>

        {weatherData && (
          <div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: 16, marginBottom: 20 }}>
              {[
                { icon: "🌡️", label: "Temperature", value: `${weatherData.temp}°C` },
                { icon: "💧", label: "Humidity", value: `${weatherData.humidity}%` },
                { icon: "🌧️", label: "Rainfall", value: `${weatherData.rain} mm` },
                { icon: "💨", label: "Wind Speed", value: `${weatherData.wind} km/h` },
              ].map((w) => (
                <div key={w.label} style={{ ...styles.card, textAlign: "center" }}>
                  <div style={{ fontSize: 32 }}>{w.icon}</div>
                  <div style={{ fontSize: 24, fontWeight: 800, color: bg.accent, marginTop: 8 }}>{w.value}</div>
                  <div style={{ fontSize: 13, color: bg.muted, marginTop: 4 }}>{w.label}</div>
                </div>
              ))}
            </div>
            <div style={{ ...styles.card, borderLeft: `4px solid ${bg.accent}` }}>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{ fontSize: 40 }}>{weatherData.icon}</span>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 16, color: bg.text }}>📍 {weatherData.city}</div>
                  <div style={{ fontSize: 14, color: bg.muted, marginTop: 2 }}>{weatherData.condition}</div>
                  <div style={{ color: bg.accent, fontSize: 14, marginTop: 6, fontWeight: 500 }}>🌾 AI Farming Tip: {weatherData.advice}</div>
                </div>
              </div>
            </div>
          </div>
        )}
        {!weatherData && !weatherLoading && (
          <div style={{ textAlign: "center", padding: "3rem", color: bg.muted }}>
            <div style={{ fontSize: 64, marginBottom: 16 }}>🌤️</div>
            <p style={{ marginBottom: 8 }}>Search your village/city <strong>or</strong> click 📍 My Location</p>
            <p style={{ fontSize: 13 }}>Powered by OpenWeatherMap + Gemini AI farming advice</p>
          </div>
        )}
        {weatherLoading && (
          <div style={{ textAlign: "center", padding: "2rem", color: bg.muted }}>
            <div style={{ fontSize: 48, animation: "spin 1.5s linear infinite", display: "inline-block" }}>🌍</div>
            <p style={{ marginTop: 12 }}>Fetching live weather data...</p>
          </div>
        )}
      </div>
    ),

    crop: (
      <div style={styles.section}>
        <h2 style={{ fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 700, marginBottom: 8, color: bg.text }}>{t.cropTitle}</h2>
        <p style={{ color: bg.muted, marginBottom: 28, fontSize: 14 }}>Tell us about your land and we'll recommend the best crops</p>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16, marginBottom: 24 }}>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8, color: bg.muted }}>{t.soilType}</label>
            <select value={soil} onChange={(e) => setSoil(e.target.value)} style={styles.select}>
              <option value="">— Select Soil —</option>
              {t.soilOptions.map((s, i) => <option key={s} value={translations.en.soilOptions[i]}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8, color: bg.muted }}>{t.season}</label>
            <select value={season} onChange={(e) => setSeason(e.target.value)} style={styles.select}>
              <option value="">— Select Season —</option>
              {t.seasonOptions.map((s, i) => <option key={s} value={translations.en.seasonOptions[i]}>{s}</option>)}
            </select>
          </div>
          <div>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, marginBottom: 8, color: bg.muted }}>{t.waterAvail}</label>
            <select value={water} onChange={(e) => setWater(e.target.value)} style={styles.select}>
              <option value="">— Select Water —</option>
              {t.waterOptions.map((s, i) => <option key={s} value={translations.en.waterOptions[i]}>{s}</option>)}
            </select>
          </div>
        </div>
        <button onClick={getCropAdvice} style={styles.btn("primary")} disabled={cropLoading || !soil || !season || !water}>
          {cropLoading ? "⏳ Analyzing..." : `🌱 ${t.getAdvice}`}
        </button>
        {cropResult && (
          <div style={{ ...styles.card, marginTop: 28, borderLeft: `4px solid ${bg.accent}` }}>
            <h3 style={{ color: bg.accent, fontSize: 20, fontWeight: 700, marginBottom: 16 }}>🌾 Recommended: {cropResult.crop}</h3>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 16 }}>
              {[
                { icon: "📊", label: "Expected Yield", value: cropResult.yield },
                { icon: "💡", label: "Growing Tip", value: cropResult.tip },
                { icon: "🧪", label: "Fertilizer Plan", value: cropResult.fertilizer },
              ].map((item) => (
                <div key={item.label} style={{ ...styles.card, background: dark ? "rgba(76,175,80,0.05)" : "#f8fef9" }}>
                  <div style={{ fontSize: 22, marginBottom: 8 }}>{item.icon}</div>
                  <div style={{ fontSize: 12, fontWeight: 700, color: bg.muted, marginBottom: 6 }}>{item.label}</div>
                  <div style={{ fontSize: 14, color: bg.text, lineHeight: 1.6 }}>{item.value}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    ),

    disease: (
      <div style={styles.section}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 12, marginBottom: 20 }}>
          <div>
            <h2 style={{ fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 700, marginBottom: 6, color: bg.text }}>{t.diseaseTitle}</h2>
            <p style={{ color: bg.muted, fontSize: 13 }}>
              Upload a leaf/crop photo — AI will diagnose in <strong style={{ color: bg.accent }}>{langLabels[lang]}</strong>
            </p>
          </div>

          {/* ── Inline Language Picker ── */}
          <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: 6 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: bg.muted, textTransform: "uppercase", letterSpacing: 0.8 }}>
              🌐 Result Language
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
              {Object.entries(langLabels).map(([code, label]) => (
                <button
                  key={code}
                  onClick={() => changeLang(code)}
                  style={{
                    ...styles.btn(lang === code ? "primary" : "outline"),
                    padding: "5px 11px",
                    fontSize: 12,
                    fontWeight: lang === code ? 700 : 500,
                    opacity: lang === code ? 1 : 0.7,
                    borderRadius: 20,
                  }}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <label style={{ display: "block", cursor: "pointer" }}>
          <div style={{
            ...styles.card,
            border: `2px dashed ${diseaseImage ? bg.accent : bg.border}`,
            textAlign: "center",
            padding: diseaseImage ? "1.5rem" : "3rem",
            transition: "border-color 0.3s",
            position: "relative",
            overflow: "hidden",
          }}
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = bg.accent; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = diseaseImage ? bg.accent : bg.border; }}
          >
            {diseaseImage ? (
              <div>
                <img src={diseaseImage} alt="Uploaded crop"
                  style={{ maxHeight: 300, maxWidth: "100%", width: "auto", borderRadius: 12, display: "block", margin: "0 auto", boxShadow: `0 8px 32px ${dark ? "rgba(0,0,0,0.4)" : "rgba(0,0,0,0.15)"}`, objectFit: "contain" }}
                  onError={(e) => { e.target.style.display = "none"; e.target.nextSibling.style.display = "block"; }}
                />
                <div style={{ display: "none", fontSize: 48 }}>🖼️</div>
                <div style={{ marginTop: 14, display: "inline-flex", alignItems: "center", gap: 6, background: dark ? "rgba(76,175,80,0.15)" : "rgba(46,125,50,0.1)", color: bg.accent, borderRadius: 20, padding: "5px 14px", fontSize: 13, fontWeight: 600 }}>
                  📷 Click to change photo
                </div>
              </div>
            ) : (
              <>
                <div style={{ fontSize: 56, marginBottom: 12 }}>🔬</div>
                <div style={{ color: bg.muted, fontWeight: 600 }}>{t.uploadImage}</div>
                <div style={{ color: bg.muted, fontSize: 13, marginTop: 6 }}>PNG, JPG, WEBP supported</div>
                <div style={{ marginTop: 16, display: "inline-block", background: bg.accent, color: "#fff", borderRadius: 10, padding: "8px 20px", fontSize: 14, fontWeight: 600 }}>📁 Choose File</div>
              </>
            )}
          </div>
          <input type="file" accept="image/*" style={{ display: "none" }} onChange={analyzeDisease} />
        </label>

        {diseaseLoading && (
          <div style={{ textAlign: "center", padding: "2.5rem", color: bg.muted }}>
            <div style={{ fontSize: 48, animation: "spin 1s linear infinite", display: "inline-block" }}>🔬</div>
            <p style={{ marginTop: 14, fontWeight: 600, fontSize: 16 }}>Analyzing with AI Vision...</p>
            <p style={{ fontSize: 13, marginTop: 6 }}>Detailed report will appear in {langLabels[lang]}</p>
          </div>
        )}

        {/* ─── Rich Disease Result ─── */}
        {diseaseResult && !diseaseResult.error && (() => {
          const dr = diseaseResult;
          const medicines = Array.isArray(dr.medicines) ? dr.medicines : [];
          const quickActions = Array.isArray(dr.quick_actions) ? dr.quick_actions : [];

          // Severity styling
          const severityConfig = {
            None:     { color: "#4caf50", bg: "rgba(76,175,80,0.15)",  icon: "✅", label: lang==="hi"?"स्वस्थ":lang==="te"?"ఆరోగ్యకర":lang==="ta"?"ஆரோக்கியமான":"Healthy" },
            Low:      { color: "#8bc34a", bg: "rgba(139,195,74,0.15)", icon: "🟡", label: lang==="hi"?"कम":lang==="te"?"తక్కువ":lang==="ta"?"குறைவு":"Low" },
            Medium:   { color: "#ff9800", bg: "rgba(255,152,0,0.15)",  icon: "🟠", label: lang==="hi"?"मध्यम":lang==="te"?"మధ్యమ":lang==="ta"?"நடுத்தர":"Medium" },
            High:     { color: "#f44336", bg: "rgba(244,67,54,0.15)",  icon: "🔴", label: lang==="hi"?"अधिक":lang==="te"?"అధిక":lang==="ta"?"அதிக":"High" },
            Critical: { color: "#b71c1c", bg: "rgba(183,28,28,0.2)",   icon: "🚨", label: lang==="hi"?"गंभीर":lang==="te"?"తీవ్రమైన":lang==="ta"?"தீவிர":"Critical" },
          };
          const sev = severityConfig[dr.severity] || severityConfig.Medium;

          // Medicine type styling
          const medTypeConfig = {
            Fungicide:    { gradient: "linear-gradient(135deg,#1565c0,#0288d1)", icon: "🔵", emoji: "🍄", bg: "rgba(21,101,192,0.12)" },
            Bactericide:  { gradient: "linear-gradient(135deg,#b71c1c,#e53935)", icon: "🔴", emoji: "🦠", bg: "rgba(183,28,28,0.12)" },
            Insecticide:  { gradient: "linear-gradient(135deg,#e65100,#f57c00)", icon: "🟠", emoji: "🐛", bg: "rgba(230,81,0,0.12)" },
            Biofungicide: { gradient: "linear-gradient(135deg,#1b5e20,#388e3c)", icon: "🟢", emoji: "🌿", bg: "rgba(27,94,32,0.12)" },
            Nematicide:   { gradient: "linear-gradient(135deg,#4a148c,#7b1fa2)", icon: "🟣", emoji: "🪱", bg: "rgba(74,20,140,0.12)" },
            default:      { gradient: "linear-gradient(135deg,#37474f,#546e7a)", icon: "⚪", emoji: "💊", bg: "rgba(55,71,79,0.12)" },
          };

          // Multilingual section labels
          const labels = {
            symptoms:     { en:"Symptoms Observed", ta:"அறிகுறிகள்", hi:"रोग के लक्षण", te:"వ్యాధి లక్షణాలు", kn:"ರೋಗ ಲಕ್ಷಣಗಳು", mr:"रोग लक्षणे", bn:"রোগের লক্ষণ", ml:"രോഗ ലക്ഷണങ്ങൾ" },
            quickAct:     { en:"Immediate Actions", ta:"உடனடி நடவடிக்கைகள்", hi:"तुरंत करें", te:"వెంటనే చేయవలసినవి", kn:"ತಕ್ಷಣದ ಕ್ರಮಗಳು", mr:"त्वरित कृती", bn:"তাৎক্ষণিক পদক্ষেপ", ml:"ഉടനടി നടപടികൾ" },
            medicines:    { en:"Recommended Medicines", ta:"பரிந்துரைக்கப்பட்ட மருந்துகள்", hi:"सुझाई गई दवाइयाँ", te:"సిఫార్సు చేసిన మందులు", kn:"ಶಿಫಾರಸು ಮಾಡಿದ ಔಷಧಿಗಳು", mr:"शिफारस केलेली औषधे", bn:"প্রস্তাবিত ওষুধ", ml:"ശുപാർശ ചെയ്ത ഔഷധങ്ങൾ" },
            dose:         { en:"Dose", ta:"அளவு", hi:"मात्रा", te:"మోతాదు", kn:"ಪ್ರಮಾಣ", mr:"डोस", bn:"ডোজ", ml:"അളവ്" },
            frequency:    { en:"Frequency", ta:"அதிர்வெண்", hi:"कितनी बार", te:"ఎంత తరచుగా", kn:"ಎಷ್ಟು ಬಾರಿ", mr:"किती वेळा", bn:"কতবার", ml:"എത്ര തവണ" },
            howApply:     { en:"How to Apply", ta:"எவ்வாறு தெளிக்கவும்", hi:"कैसे लगाएं", te:"ఎలా వేయాలి", kn:"ಹೇಗೆ ಅನ್ವಯಿಸಬೇಕು", mr:"कसे वापरावे", bn:"কিভাবে প্রয়োগ করবেন", ml:"എങ്ങനെ ഉപയോഗിക്കാം" },
            brands:       { en:"Available as", ta:"கிடைக்கும் பெயர்கள்", hi:"ब्रांड नाम", te:"బ్రాండ్ పేర్లు", kn:"ಬ್ರ್ಯಾಂಡ್ ಹೆಸರು", mr:"ब्रँड नावे", bn:"ব্র্যান্ড নাম", ml:"ബ്രാൻഡ് നാമങ്ങൾ" },
            searchImg:    { en:"🔍 Search Product", ta:"🔍 தேடு", hi:"🔍 खोजें", te:"🔍 వెతుకు", kn:"🔍 ಹುಡುಕು", mr:"🔍 शोधा", bn:"🔍 খুঁজুন", ml:"🔍 തിരയുക" },
            prevention:   { en:"Prevention", ta:"தடுப்பு", hi:"रोकथाम", te:"నివారణ", kn:"ತಡೆಗಟ್ಟುವಿಕೆ", mr:"प्रतिबंध", bn:"প্রতিরোধ", ml:"പ്രതിരോധം" },
            fertilizer:   { en:"Fertilizer Advice", ta:"உர ஆலோசனை", hi:"उर्वरक सलाह", te:"ఎరువుల సలహా", kn:"ರಸಗೊಬ್ಬರ ಸಲಹೆ", mr:"खत सल्ला", bn:"সার পরামর্শ", ml:"വള നിർദ്ദേശം" },
            watering:     { en:"Watering Advice", ta:"நீர்ப்பாசன ஆலோசனை", hi:"सिंचाई सलाह", te:"నీటిపారుదల సూచన", kn:"ನೀರಾವರಿ ಸಲಹೆ", mr:"सिंचन सल्ला", bn:"সেচ পরামর্শ", ml:"ജലസേചന നിർദ്ദേശം" },
          };
          const L = (key) => labels[key]?.[lang] || labels[key]?.en || key;

          return (
            <div style={{ marginTop: 28 }}>
              {/* ─── Disease Header ─── */}
              <div style={{ ...styles.card, borderLeft: `4px solid ${sev.color}`, marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: 10 }}>
                  <div>
                    <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 20 }}>⚠️</span>
                      <h3 style={{ color: sev.color, fontSize: "clamp(1.1rem,3vw,1.4rem)", fontWeight: 800 }}>{dr.disease}</h3>
                    </div>
                    {dr.severity && dr.severity !== "None" && (
                      <span style={{ display: "inline-flex", alignItems: "center", gap: 6, background: sev.bg, color: sev.color, borderRadius: 20, padding: "4px 14px", fontSize: 12, fontWeight: 700, border: `1px solid ${sev.color}` }}>
                        {sev.icon} {lang==="hi"?"गंभीरता":lang==="te"?"తీవ్రత":lang==="ta"?"தீவிரம்":"Severity"}: {sev.label}
                      </span>
                    )}
                  </div>
                  {dr.model && (
                    <span style={{ ...styles.tag, fontSize: 11 }}>🤖 {dr.model} · {langLabels[lang]}</span>
                  )}
                </div>

                {/* Symptoms */}
                {dr.symptoms && (
                  <div style={{ marginTop: 14, padding: "12px 16px", background: dark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)", borderRadius: 10 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: bg.muted, textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 6 }}>👁️ {L("symptoms")}</div>
                    <p style={{ fontSize: 14, color: bg.text, lineHeight: 1.75 }}>{dr.symptoms}</p>
                  </div>
                )}
              </div>

              {/* ─── Quick Actions ─── */}
              {quickActions.length > 0 && (
                <div style={{ ...styles.card, marginBottom: 16, borderLeft: `3px solid #ff9800` }}>
                  <div style={{ fontSize: 12, fontWeight: 700, color: "#ff9800", textTransform: "uppercase", letterSpacing: 0.8, marginBottom: 12 }}>⚡ {L("quickAct")}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    {quickActions.map((action, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "flex-start", gap: 10 }}>
                        <span style={{ width: 24, height: 24, borderRadius: "50%", background: "#ff9800", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 12, fontWeight: 800, flexShrink: 0, marginTop: 1 }}>{i + 1}</span>
                        <span style={{ fontSize: 14, color: bg.text, lineHeight: 1.6 }}>{action}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ─── Medicines Grid ─── */}
              {medicines.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: bg.text, marginBottom: 12, display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontSize: 18 }}>💊</span> {L("medicines")}
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 14 }}>
                    {medicines.map((med, i) => {
                      const mt = medTypeConfig[med.type] || medTypeConfig.default;
                      return (
                        <div key={i} style={{ ...styles.card, background: dark ? mt.bg : `${mt.bg}`, border: "none", overflow: "hidden" }}>
                          {/* Medicine Type Header */}
                          <div style={{ background: mt.gradient, margin: "-1.5rem -1.5rem 14px -1.5rem", padding: "14px 18px", display: "flex", alignItems: "center", gap: 10 }}>
                            <span style={{ fontSize: 28 }}>{mt.emoji}</span>
                            <div>
                              <div style={{ fontSize: 10, fontWeight: 700, color: "rgba(255,255,255,0.8)", letterSpacing: 1, textTransform: "uppercase" }}>{med.type}</div>
                              <div style={{ fontSize: 15, fontWeight: 800, color: "#fff", lineHeight: 1.2, marginTop: 2 }}>{med.name}</div>
                            </div>
                          </div>

                          {/* Medicine Details */}
                          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                            {med.dose && (
                              <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                                <span style={{ fontSize: 14, flexShrink: 0 }}>⚗️</span>
                                <div><span style={{ fontSize: 11, fontWeight: 700, color: bg.muted, display: "block" }}>{L("dose")}</span><span style={{ fontSize: 13, color: bg.text }}>{med.dose}</span></div>
                              </div>
                            )}
                            {med.frequency && (
                              <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                                <span style={{ fontSize: 14, flexShrink: 0 }}>🗓️</span>
                                <div><span style={{ fontSize: 11, fontWeight: 700, color: bg.muted, display: "block" }}>{L("frequency")}</span><span style={{ fontSize: 13, color: bg.text }}>{med.frequency}</span></div>
                              </div>
                            )}
                            {med.apply && (
                              <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                                <span style={{ fontSize: 14, flexShrink: 0 }}>🌿</span>
                                <div><span style={{ fontSize: 11, fontWeight: 700, color: bg.muted, display: "block" }}>{L("howApply")}</span><span style={{ fontSize: 13, color: bg.text }}>{med.apply}</span></div>
                              </div>
                            )}
                            {med.brand && (
                              <div style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                                <span style={{ fontSize: 14, flexShrink: 0 }}>🏷️</span>
                                <div><span style={{ fontSize: 11, fontWeight: 700, color: bg.muted, display: "block" }}>{L("brands")}</span><span style={{ fontSize: 13, color: bg.text }}>{med.brand}</span></div>
                              </div>
                            )}
                          </div>

                          {/* Search Product Button */}
                          <a
                            href={`https://www.google.com/search?q=${encodeURIComponent(med.name + " pesticide india")}&tbm=isch`}
                            target="_blank" rel="noopener noreferrer"
                            style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 14, padding: "8px 0", background: dark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)", borderRadius: 8, color: bg.accent, fontSize: 12, fontWeight: 700, textDecoration: "none", cursor: "pointer", transition: "background 0.2s" }}
                          >
                            {L("searchImg")} &rarr;
                          </a>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* ─── Prevention / Fertilizer / Watering ─── */}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
                {[
                  { icon: "🛡️", key: "prevention", value: dr.prevention },
                  { icon: "🌾", key: "fertilizer",  value: dr.fertilizer },
                  { icon: "💧", key: "watering",    value: dr.watering },
                ].filter(item => item.value).map((item) => (
                  <div key={item.key} style={{ ...styles.card, background: dark ? "rgba(255,255,255,0.03)" : "#f8fdf8" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 20 }}>{item.icon}</span>
                      <span style={{ fontSize: 11, fontWeight: 700, color: bg.accent, textTransform: "uppercase", letterSpacing: 0.8 }}>{L(item.key)}</span>
                    </div>
                    <p style={{ fontSize: 13, color: bg.text, lineHeight: 1.75 }}>{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          );
        })()}

        {diseaseResult?.error && (
          <div style={{ ...styles.card, marginTop: 24, borderLeft: `4px solid #ef5350`, background: dark ? "rgba(239,83,80,0.05)" : "#fff5f5" }}>
            <p style={{ color: "#ef5350", fontWeight: 600 }}>⚠️ Analysis Failed</p>
            <p style={{ color: bg.muted, fontSize: 13, marginTop: 6 }}>{diseaseResult.error}</p>
            <p style={{ color: bg.muted, fontSize: 13, marginTop: 4 }}>Make sure the backend server is running (<code>npm run server</code>).</p>
          </div>
        )}
      </div>
    ),




    about: (
      <div style={styles.section}>
        <div style={{ maxWidth: 700 }}>
          <h2 style={{ fontSize: "clamp(1.4rem,3vw,2rem)", fontWeight: 700, marginBottom: 16, color: bg.text }}>About AgroAI</h2>
          <p style={{ color: bg.muted, lineHeight: 1.8, fontSize: 15, marginBottom: 20 }}>
            AgroAI Assistant is an AI-powered smart agriculture platform built to empower Indian farmers with cutting-edge technology. We combine Google Gemini AI, real-time weather data, and expert agricultural knowledge to provide instant, actionable guidance.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16 }}>
            {[
              { v: "10K+", l: "Farmers Helped" },
              { v: "50K+", l: "Queries Answered" },
              { v: "15+", l: "Crop Types" },
              { v: "99%", l: "Uptime" },
            ].map((s) => (
              <div key={s.l} style={{ ...styles.card, textAlign: "center" }}>
                <div style={{ fontSize: 26, fontWeight: 800, color: bg.accent }}>{s.v}</div>
                <div style={{ fontSize: 13, color: bg.muted, marginTop: 4 }}>{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
  };

  return (
    <div style={styles.root}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@400;500;600;700;800;900&display=swap');
        * { margin: 0; padding: 0; box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: ${bg.border}; border-radius: 3px; }
        @keyframes float { 0%,100%{transform:translateY(0)} 50%{transform:translateY(-12px)} }
        @keyframes bounce { 0%,80%,100%{transform:translateY(0)} 40%{transform:translateY(-8px)} }
        @keyframes spin { from{transform:rotate(0deg)} to{transform:rotate(360deg)} }
        @keyframes pulse { 0%,100%{opacity:1;transform:scale(1)} 50%{opacity:0.5;transform:scale(1.3)} }
        select option { background: ${dark ? "#0f2318" : "#fff"}; color: ${bg.text}; }
      `}</style>

      {/* Navbar */}
      <nav style={styles.navbar}>
        <div style={styles.logo} onClick={() => setPage("home")}>🌿 AgroAI</div>

        {/* Nav links — hidden on tiny screens, shown as row */}
        <div style={{ display: "flex", gap: 2, alignItems: "center", flexWrap: "wrap", flex: 1, justifyContent: "center" }}>
          {[
            ["home", navItems[0]], ["chat", navItems[1]], ["weather", navItems[2]],
            ["crop", navItems[3]], ["disease", navItems[4]], ["about", navItems[5]],
          ].map(([key, label]) => (
            <button key={key} style={styles.navLink(page === key)} onClick={() => setPage(key)}>{label}</button>
          ))}
        </div>

        {/* Right controls — language + dark mode — always visible */}
        <div style={{ display: "flex", gap: 6, alignItems: "center", flexShrink: 0 }}>
          {/* Language selector — prominent globe + select */}
          <div style={{ display: "flex", alignItems: "center", gap: 4, background: dark ? "rgba(76,175,80,0.12)" : "rgba(46,125,50,0.08)", border: `1px solid ${bg.accent}`, borderRadius: 20, padding: "4px 10px 4px 8px" }}>
            <span style={{ fontSize: 14 }}>🌐</span>
            <select
              value={lang}
              onChange={(e) => changeLang(e.target.value)}
              style={{
                background: "transparent",
                border: "none",
                color: bg.accent,
                fontSize: 12,
                fontWeight: 700,
                cursor: "pointer",
                outline: "none",
                fontFamily: "inherit",
                maxWidth: 130,
              }}
            >
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
          {/* Dark/Light toggle */}
          <button style={{ ...styles.btn("outline"), padding: "5px 10px", fontSize: 14, borderRadius: 20 }} onClick={() => setDark(!dark)}>
            {dark ? "☀️" : "🌙"}
          </button>
        </div>
      </nav>


      {/* Page Content */}
      {pages[page] || pages.home}

      {/* Footer */}
      <footer style={{ borderTop: `1px solid ${bg.border}`, padding: "2rem 1.5rem", textAlign: "center", color: bg.muted, fontSize: 13 }}>
        <div style={{ fontWeight: 700, fontSize: 16, color: bg.accent, marginBottom: 8 }}>🌿 AgroAI Assistant</div>
        <p>Smart Farming with AI — Empowering every farmer with technology</p>
        <p style={{ marginTop: 8 }}>Built with ❤️ for Indian farmers · Tamil Nadu · {new Date().getFullYear()}</p>
      </footer>

      {/* Floating chat button */}
      {page !== "chat" && (
        <button onClick={() => setPage("chat")} style={{
          position: "fixed", bottom: 24, right: 24, width: 56, height: 56, borderRadius: "50%",
          background: bg.accent, border: "none", cursor: "pointer", fontSize: 24,
          boxShadow: `0 4px 20px ${dark ? "rgba(76,175,80,0.4)" : "rgba(46,125,50,0.3)"}`,
          zIndex: 999, display: "flex", alignItems: "center", justifyContent: "center",
          animation: "float 3s ease-in-out infinite"
        }}>🤖</button>
      )}
    </div>
  );
}
