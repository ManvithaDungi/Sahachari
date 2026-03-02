// src/screens/ResultsScreen.jsx
import { useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import DisclaimerBanner from '../components/DisclaimerBanner';
import { analyzeSymptoms } from '../services/geminiService';
import { saveSymptomLog, getUserId } from '../services/firebaseService';

function ConditionCard({ condition }) {
  const probColor = {
    High: 'bg-red-50 border-red-200 text-red-700',
    Medium: 'bg-amber-50 border-amber-200 text-amber-700',
    Low: 'bg-emerald-50 border-emerald-200 text-emerald-700',
  }[condition.probability] || 'bg-gray-50 border-gray-200 text-gray-600';

  const probBar = { High: 'w-4/5', Medium: 'w-1/2', Low: 'w-1/4' }[condition.probability] || 'w-1/4';
  const barColor = { High: 'bg-red-400', Medium: 'bg-amber-400', Low: 'bg-emerald-400' }[condition.probability] || 'bg-gray-400';

  return (
    <div className="glass-card p-6 border border-primary/10">
      <div className="flex items-start justify-between mb-3">
        <h3 className="text-lg font-bold text-text-primary">{condition.name}</h3>
        <span className={`text-xs font-bold px-3 py-1 rounded-full border ${probColor}`}>
          {condition.probability} likelihood
        </span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-1.5 mb-4">
        <div className={`h-1.5 rounded-full transition-all duration-1000 ${probBar} ${barColor}`} />
      </div>
      <p className="text-text-secondary text-sm leading-relaxed">{condition.description}</p>
    </div>
  );
}

export default function ResultsScreen() {
  const location = useLocation();
  const navigate = useNavigate();
  const { symptoms = [], additional = '' } = location.state || {};

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (!symptoms.length && !additional.trim()) {
      navigate('/symptoms');
      return;
    }
    fetchResults();
  }, []);

  const fetchResults = async () => {
    setLoading(true);
    setError('');
    try {
      const analysisResult = await analyzeSymptoms(symptoms, additional);
      setResult(analysisResult);

      // Auto-save to Firebase
      const userId = getUserId();
      if (userId) {
        await saveSymptomLog(userId, symptoms, analysisResult);
        setSaved(true);
      }
    } catch (err) {
      console.error('Analysis error:', err);
      setError(err.message || 'Failed to analyze symptoms. Please check your Gemini API key in .env');
    } finally {
      setLoading(false);
    }
  };

  const urgencyConfig = {
    'Immediately': {
      icon: '🚨',
      bg: 'bg-red-50 border-red-200',
      text: 'text-red-700',
      title: 'Seek medical attention immediately',
      sub: 'Your symptoms may need urgent care. Please see a doctor today.',
    },
    'Within a week': {
      icon: '⚠️',
      bg: 'bg-amber-50 border-amber-200',
      text: 'text-amber-700',
      title: 'Consult a doctor within a week',
      sub: 'Your symptoms warrant a medical consultation soon.',
    },
    'Monitor symptoms': {
      icon: '✅',
      bg: 'bg-emerald-50 border-emerald-200',
      text: 'text-emerald-700',
      title: 'Monitor your symptoms',
      sub: 'Continue self-care and track any changes.',
    },
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center animate-fade-in">
        <div className="text-center px-6">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-6" />
          <p className="text-text-primary text-xl font-bold mb-2">Analyzing with AI...</p>
          <p className="text-text-secondary text-sm">Gemini is processing your symptoms</p>
          <div className="mt-4 flex justify-center gap-1">
            {[0, 1, 2].map(i => (
              <div
                key={i}
                className="w-2 h-2 bg-primary rounded-full animate-bounce"
                style={{ animationDelay: `${i * 0.15}s` }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-md">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-text-primary mb-2">Analysis Failed</h2>
          <p className="text-text-secondary text-sm mb-2">{error}</p>
          <p className="text-text-secondary text-xs mb-6 bg-gray-50 p-3 rounded-xl font-mono">
            Make sure VITE_GEMINI_API_KEY is set in your .env file
          </p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={fetchResults}
              className="px-6 py-3 bg-primary text-white rounded-full font-bold hover:bg-primary/80 transition-all"
            >
              Retry
            </button>
            <button
              onClick={() => navigate('/symptoms')}
              className="px-6 py-3 border border-primary/30 text-primary rounded-full font-bold hover:bg-primary/5 transition-all"
            >
              Go Back
            </button>
          </div>
        </div>
      </div>
    );
  }

  const urgency = result?.see_doctor_urgency;
  const uc = urgencyConfig[urgency] || urgencyConfig['Monitor symptoms'];

  return (
    <div className="min-h-full pb-24 pt-8 animate-fade-in">
      <div className="max-w-3xl mx-auto px-4">

        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-extrabold text-text-primary">AI Analysis Results</h2>
            <p className="text-text-secondary text-sm mt-0.5">
              Based on: {symptoms.slice(0, 3).join(', ')}{symptoms.length > 3 ? ` +${symptoms.length - 3} more` : ''}
            </p>
          </div>
          {saved && (
            <span className="text-xs bg-emerald-50 border border-emerald-200 text-emerald-700 px-3 py-1 rounded-full font-semibold">
              ✓ Saved
            </span>
          )}
        </div>

        {/* Urgency Banner */}
        {urgency && (
          <div className={`border rounded-2xl p-5 mb-8 flex items-start gap-4 ${uc.bg}`}>
            <span className="text-2xl mt-0.5">{uc.icon}</span>
            <div>
              <h3 className={`font-bold text-lg mb-1 ${uc.text}`}>{uc.title}</h3>
              <p className={`text-sm opacity-80 ${uc.text}`}>{uc.sub}</p>
            </div>
          </div>
        )}

        {/* Conditions */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-text-primary mb-4">Possible Conditions</h3>
          <div className="grid gap-4">
            {result?.possible_conditions?.map((condition, idx) => (
              <ConditionCard key={idx} condition={condition} />
            ))}
          </div>
        </div>

        {/* Self Care Tips */}
        {result?.self_care_tips?.length > 0 && (
          <div className="glass-card p-6 mb-6">
            <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
              <span>🧘‍♀️</span> Self-Care Tips
            </h3>
            <ul className="space-y-3">
              {result.self_care_tips.map((tip, idx) => (
                <li key={idx} className="flex items-start gap-3">
                  <span className="w-5 h-5 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                    ✓
                  </span>
                  <span className="text-text-primary text-sm leading-relaxed">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Local Foods */}
        {result?.local_foods?.length > 0 && (
          <div className="glass-card p-6 mb-6">
            <h3 className="text-lg font-bold text-text-primary mb-4 flex items-center gap-2">
              <span>🥗</span> Helpful Local Foods
            </h3>
            <div className="flex flex-wrap gap-2">
              {result.local_foods.map((food, idx) => (
                <span
                  key={idx}
                  className="bg-emerald-50 border border-emerald-200 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold"
                >
                  {food}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <button
            onClick={() => navigate('/journal')}
            className="flex-1 bg-primary text-white py-4 rounded-full font-bold shadow-lg shadow-primary/25 hover:bg-primary/80 hover:translate-y-[-2px] transition-all"
          >
            📔 Save to Journal
          </button>
          <button
            onClick={() => navigate('/symptoms')}
            className="flex-1 bg-transparent border-2 border-primary text-primary py-4 rounded-full font-bold hover:bg-primary/5 transition-all"
          >
            ← Analyze Again
          </button>
        </div>

        <DisclaimerBanner />
      </div>
    </div>
  );
}