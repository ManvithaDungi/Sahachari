const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';

const callGemini = async (prompt) => {
  if (!API_KEY) throw new Error("Missing Gemini API Key in .env");

  try {
    const response = await fetch(`${API_URL}?key=${API_KEY}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }]
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Gemini API Error Details:", errorData);
      throw new Error(`Gemini API Error: ${response.status} ${response.statusText} - ${errorData.error?.message || 'Unknown error'}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!text) throw new Error("No response generated");

    // Clean up potential markdown code blocks if the model wraps JSON
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error("Gemini AI Error:", error);
    throw error;
  }
};

const getLanguageName = () => {
  const map = {
    en: 'English',
    ta: 'Tamil',
    hi: 'Hindi',
    ml: 'Malayalam',
    te: 'Telugu',
    kn: 'Kannada'
  };
  return map[localStorage.getItem('language')] || 'English';
};

export const analyzeSymptoms = async (symptoms, additionalNotes = "") => {
  const symptomList = Array.isArray(symptoms) ? symptoms.join(", ") : symptoms;
  const language = getLanguageName();

  const prompt = `
    You are a compassionate, expert women's health assistant for the Indian context.
    The user is experiencing these symptoms: ${symptomList}.
    Additional details: "${additionalNotes}".

    Analyze these symptoms carefully. Consider common conditions like PCOS, Anemia, Thyroid issues, PMS, Endometriosis, etc.
    Provide a JSON response with the following structure.
    Strictly output ONLY valid JSON.
    Respond entirely in ${language}. All text fields (name, description, tips, etc.) must be in ${language}.

    {
      "possible_conditions": [
        { "name": "Condition Name", "probability": "High/Medium/Low", "description": "Brief explanation in simple terms." }
      ],
      "see_doctor_urgency": "Immediately" | "Within a week" | "Monitor symptoms",
      "self_care_tips": ["Tip 1", "Tip 2", "Tip 3"],
      "local_foods": ["Food 1 (e.g. Ragi)", "Food 2 (e.g. Amla)"],
      "disclaimer": "Standard medical disclaimer."
    }
  `;
  return callGemini(prompt);
};

export const generateWeeklySummary = async (entries) => {
  if (!entries || entries.length === 0) return null;
  const language = getLanguageName();

  const entryText = entries.map(e =>
    `Date: ${e.date}, Mood: ${e.mood}, Period: ${e.period}, Symptoms: ${e.notes || 'None'}, Fatigue: ${e.fatigue}/5`
  ).join("\n");

  const prompt = `
    Analyze this user's weekly health log (journal entries):
    ${entryText}

    Identify patterns related to their menstrual cycle, mood, or energy.
    Provide a JSON response with the following structure.
    Strictly output ONLY valid JSON.
    Respond entirely in ${language}.

    {
      "summary": "2-3 sentence summary of their week.",
      "pattern": "Any noticeable pattern (e.g., 'Mood drops 2 days before period').",
      "suggestion": "One actionable wellness tip.",
      "anemia_risk": "Low" | "Moderate" | "High",
      "anemia_reason": "Why you think so (e.g., fatigue consistently high)."
    }
  `;
  return callGemini(prompt);
};

export const validateRemedy = async (remedyName) => {
  const language = getLanguageName();
  const prompt = `
    Evaluate the safety of this home remedy: "${remedyName}" for women's health.
    Context: Indian home remedies.
    Provide a JSON response with the following structure.
    Strictly output ONLY valid JSON.
    Respond entirely in ${language}.

    {
      "verdict": "Safe" | "Caution" | "Unsafe",
      "explanation": "Why?",
      "scientific_backing": "Supported" | "Mixed Evidence" | "Folklore",
      "tip": "How to use safely."
    }
  `;
  return callGemini(prompt);
};

export const detectPattern = async (logs) => {
  // Placeholder for complex pattern detection
  return "Keep logging to unlock detailed patterns!";
};
