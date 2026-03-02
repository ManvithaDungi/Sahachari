// src/screens/SymptomScreen.jsx
import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DisclaimerBanner from '../components/DisclaimerBanner';
import { analyzeSymptoms } from '../services/geminiService';
import { extractEntities } from '../services/nlpService';
import { saveSymptomLog, getUserId } from '../services/firebaseService';
import VoiceInputButton from '../components/VoiceInputButton';

const SYMPTOMS = [
  'Irregular Periods', 'Acne', 'Weight Gain',
  'Hair Loss', 'Fatigue', 'Mood Swings',
  'Pelvic Pain', 'Heavy Bleeding', 'Cramps',
  'Headache', 'Nausea', 'Bloating', 'Back Pain', 'Dizziness',
  'Breast Tenderness', 'Insomnia', 'Anxiety',
];

export default function SymptomScreen() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [selected, setSelected] = useState([]);
  const [additional, setAdditional] = useState('');
  const [loading, setLoading] = useState(false);
  const [analyzingText, setAnalyzingText] = useState(t('common.analyzing'));

  const toggleSymptom = (symptom) => {
    setSelected(prev =>
      prev.includes(symptom) ? prev.filter(s => s !== symptom) : [...prev, symptom]
    );
  };

  const handleAnalyze = async () => {
    if (selected.length === 0 && !additional.trim()) {
      alert("Please select at least one symptom or describe your problem.");
      return;
    }

    setLoading(true);
    setAnalyzingText(t('common.analyzing'));

    try {
      // Step 1: Extract entities using Cloud NL (if any text provided)
      let finalSymptoms = [...selected];

      if (additional.trim().length > 3) {
        try {
          const entities = await extractEntities(additional);
          // Filter out generic entities (e.g. 'Person') if needed, for now include relevant types
          // Cloud NL Types: EVENT, OTHER, PERSON, LOCATION, ORGANIZATION, CONSUMER_GOOD, WORK_OF_ART
          const relevantEntities = entities
            .filter(e => ['OTHER', 'EVENT', 'CONSUMER_GOOD'].includes(e.type) && e.salience > 0.02)
            .map(e => e.name); // Entity name (e.g. "headache")

          // Add unique entities to symptoms list
          relevantEntities.forEach(e => {
            if (!finalSymptoms.some(s => s.toLowerCase() === e.toLowerCase())) {
              finalSymptoms.push(e);
            }
          });

          if (relevantEntities.length > 0) {
            // setAnalyzingText(`Found: ${relevantEntities.slice(0, 2).join(", ")}...`);
            await new Promise(r => setTimeout(r, 500));
          }
        } catch (nlpError) {
          console.warn("Entity extraction skipped:", nlpError);
          // Continue without extracted entities
        }
      }

      setAnalyzingText(t('common.analyzing'));
      // Step 2: Analyze with Gemini
      const analysisResult = await analyzeSymptoms(finalSymptoms, additional);

      // Step 3: Save and Navigate
      const userId = getUserId();
      if (userId) {
        await saveSymptomLog(userId, finalSymptoms, analysisResult);
      }

      navigate('/results', { state: { result: analysisResult, symptoms: finalSymptoms } });

    } catch (err) {
      console.error(err);
      alert(t('common.error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-full pb-24 pt-8 animate-fade-in">
      <div className="max-w-2xl mx-auto px-4">
        <h2 className="text-3xl font-extrabold text-text-primary mb-1 tracking-tight">
          {t('symptoms.title')}
        </h2>
        <p className="text-text-secondary mb-6 text-lg">
          {t('symptoms.subtitle')}
        </p>

        <DisclaimerBanner />

        {/* Symptom Chips */}
        <div className="glass-card p-6 mb-6 mt-6">
          <p className="text-xs font-bold uppercase tracking-widest text-text-secondary mb-4">
            {t('symptoms.common_label')}
          </p>
          <div className="flex flex-wrap gap-3">
            {SYMPTOMS.map(symptom => (
              <button
                key={symptom}
                onClick={() => toggleSymptom(symptom)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 border ${selected.includes(symptom)
                  ? 'bg-primary text-white border-primary shadow-lg shadow-primary/20 scale-[1.04]'
                  : 'bg-white text-text-secondary border-primary/20 hover:border-primary hover:text-primary'
                  }`}
              >
                {symptom}
              </button>
            ))}
          </div>
          {selected.length > 0 && (
            <p className="text-xs text-primary font-semibold mt-4">
              ✓ {selected.length} {t('symptoms.selected')}
            </p>
          )}
        </div>

        {/* Voice Input Section */}
        <div className="glass-card p-5 mb-6">
          <div className="flex items-center justify-between mb-4">
            <label className="block text-sm font-semibold text-text-primary uppercase tracking-wide">
              {t('symptoms.describe_label')}
            </label>
          </div>
          <textarea
            value={additional}
            onChange={e => setAdditional(e.target.value)}
            placeholder={t('symptoms.placeholder')}
            className="w-full px-4 py-3 bg-white/60 border border-primary/20 rounded-xl focus:outline-none focus:border-primary focus:bg-white/90 transition-all resize-none text-text-primary placeholder:text-text-secondary/50 text-sm mb-4"
            rows="3"
          />
          <VoiceInputButton
            onTranscript={(text) => {
              setAdditional(prev => (prev + ' ' + text).trim());
            }}
          />
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-4">
          {/* Analyze Button */}
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="flex-1 py-4 bg-primary text-white font-bold rounded-full text-lg shadow-lg shadow-primary/25 hover:bg-primary/80 hover:shadow-xl hover:translate-y-[-2px] active:scale-[0.98] transition-all disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                {analyzingText}
              </>
            ) : (
              <>
                {t('symptoms.analyze')} →
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}