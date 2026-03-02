
const API_KEY = import.meta.env.VITE_CLOUD_NATURAL_LANGUAGE_KEY;
const API_BASE = 'https://language.googleapis.com/v1/documents';

// Common helper for API calls
const callNL = async (endpoint, content, type = 'PLAIN_TEXT') => {
   if (!API_KEY) throw new Error("Missing Cloud Natural Language API Key");

   const response = await fetch(`${API_BASE}:${endpoint}?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
         document: {
            type,
            content,
            // language: 'en' // Optional: Auto-detect is better for mixed En/Ta
         },
         encodingType: 'UTF8'
      })
   });

   if (!response.ok) {
      const err = await response.json().catch(() => ({}));
      console.error(`Cloud NL ${endpoint} Error:`, err);
      throw new Error(`Cloud NL Error: ${response.statusText}`);
   }

   return response.json();
};

/**
 * 1. Moderation (Toxicity, Insult, etc.)
 * Replaces pure sentiment check for safety.
 */
export const moderateText = async (text) => {
   try {
      const data = await callNL('moderateText', text);
      // data.moderationCategories is an array of { name, confidence }
      // We map it to a simpler object
      const scores = {};
      (data.moderationCategories || []).forEach(cat => {
         scores[cat.name] = cat.confidence;
      });
      return scores; // e.g. { "Toxic": 0.8, "Insult": 0.5 }
   } catch (error) {
      console.error("Moderation failed:", error);
      return {}; // Fail open (or closed depending on policy, here open to avoid blocking valid posts on error)
   }
};

/**
 * 2. Entity Extraction (Symptoms)
 * Extracts key terms like "tired", "pain" from text.
 */
export const extractEntities = async (text) => {
   try {
      const data = await callNL('analyzeEntities', text);
      // Filter for salient entities or specific types?
      // For symptoms, we often look for 'OTHER', 'EVENT', 'CONSUMER_GOOD' (medicine)
      return (data.entities || []).map(e => ({
         name: e.name,
         type: e.type,
         salience: e.salience
      }));
   } catch (error) {
      console.error("Entity extraction failed:", error);
      return [];
   }
};

/**
 * 3. Content Classification (Auto-Tagging)
 * Suggests categories like /Health/Reproductive Health
 */
export const classifyContent = async (text) => {
   // Only works for longer text (20+ words usually)
   if (text.split(' ').length < 20) return [];

   try {
      const data = await callNL('classifyText', text);
      return (data.categories || []).map(c => c.name);
   } catch (error) {
      // 400 error is common if text is too short or not supported language
      console.warn("Classification skipped:", error.message);
      return [];
   }
};

/**
 * 4. Sentiment Analysis (Granular)
 * Returns { score: -1 to 1, magnitude: 0 to +inf }
 */
export const analyzeSentiment = async (text) => {
   try {
      const data = await callNL('analyzeSentiment', text);
      return data.documentSentiment || { score: 0, magnitude: 0 };
   } catch (error) {
      console.error("Sentiment analysis failed:", error);
      return { score: 0, magnitude: 0 };
   }
};
