import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import DisclaimerBanner from '../components/DisclaimerBanner';
import { validateRemedy } from '../services/geminiService';

export default function RemedyScreen() {
  const { t } = useTranslation();
  const [remedy, setRemedy] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const exampleRemedies = [
    t('remedy.example1'),
    t('remedy.example2'),
    t('remedy.example3')
  ];

  const getVerdictColor = (verdict) => {
    if (verdict === 'Safe') return 'bg-[#B8D4BE]/20 text-[#4A7C59] border-[#B8D4BE]/50';
    if (verdict === 'Partially Safe') return 'bg-warning/10 text-warning border-warning/30';
    if (verdict === 'Myth') return 'bg-danger/10 text-danger border-danger/30';
    if (verdict === 'Consult Doctor') return 'bg-primary/10 text-primary border-primary/30';
    return 'bg-gray-100 text-gray-800';
  };

  const handleCheck = async () => {
    if (!remedy.trim()) {
      alert('Please enter a remedy');
      return;
    }

    try {
      setLoading(true);
      const data = await validateRemedy(remedy);
      setResult(data);
    } catch (error) {
      console.error('Error validating remedy:', error);
      alert('Error checking remedy. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestion = (suggestion) => {
    setRemedy(suggestion);
  };

  return (
    <div className="min-h-full pb-20 pt-8 animate-fade-in">
      <div className="max-w-3xl mx-auto px-6">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-extrabold text-text-primary mb-3 text-center">{t('remedy.title')}</h2>
          <p className="text-text-secondary text-lg">{t('remedy.subtitle')}</p>
        </div>

        <DisclaimerBanner />

        {/* Remedy Input */}
        <div className="glass-card p-8 mb-8 mt-8">
          <label className="block text-sm font-bold text-text-primary mb-4 uppercase tracking-wide">
            {t('remedy.enter_remedy')}
          </label>
          <div className="relative">
            <input
              type="text"
              value={remedy}
              onChange={(e) => setRemedy(e.target.value)}
              placeholder={t('remedy.placeholder')}
              className="w-full px-5 py-4 bg-white/50 border border-primary/20 rounded-xl focus:outline-none focus:border-primary focus:bg-white/90 transition-all font-medium text-lg placeholder:text-text-secondary/50"
            />
            <button
              onClick={handleCheck}
              disabled={loading}
              className="absolute right-2 top-2 bottom-2 bg-primary text-white px-6 rounded-lg font-bold hover:bg-[#5A4AB8] transition-all disabled:opacity-70 disabled:cursor-not-allowed shadow-md"
            >
              {loading ? t('remedy.checking') : t('remedy.check')}
            </button>
          </div>
        </div>

        {/* Example Suggestions */}
        <div className="mb-10 text-center">
          <p className="text-sm font-semibold text-text-secondary mb-4 uppercase tracking-wide">{t('remedy.popular')}</p>
          <div className="flex flex-wrap justify-center gap-3">
            {exampleRemedies.map(suggestion => (
              <button
                key={suggestion}
                onClick={() => handleSuggestion(suggestion)}
                className="px-4 py-2 bg-white/60 border border-primary/10 text-text-primary rounded-full text-sm font-medium hover:bg-white hover:border-primary/30 hover:scale-105 transition-all shadow-sm"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>

        {/* Result */}
        {result && (
          <div className="glass-card p-8 animate-fade-in border-l-4 border-l-primary">
            <div className="mb-6 flex items-center justify-between">
              <h3 className="text-2xl font-bold text-text-primary">{t('remedy.verdict')}</h3>
              <span className={`px-4 py-1.5 rounded-full text-sm font-bold uppercase tracking-wide border ${getVerdictColor(result.verdict)}`}>
                {result.verdict}
              </span>
            </div>

            <div className="space-y-6">
              <div>
                <h4 className="font-bold text-text-primary mb-2 flex items-center gap-2">
                  <span className="text-lg">🧐</span> {t('remedy.explanation')}
                </h4>
                <p className="text-text-secondary leading-relaxed bg-white/40 p-4 rounded-xl">{result.explanation}</p>
              </div>

              <div>
                <h4 className="font-bold text-text-primary mb-2 flex items-center gap-2">
                  <span className="text-lg">🔬</span> {t('remedy.scientific')}
                </h4>
                <p className="text-text-secondary leading-relaxed bg-white/40 p-4 rounded-xl">{result.scientific_backing}</p>
              </div>

              <div className="bg-primary/5 border border-primary/10 p-5 rounded-xl flex gap-4 items-start">
                <span className="text-2xl">💡</span>
                <div>
                  <h4 className="font-bold text-primary mb-1">{t('remedy.tip')}</h4>
                  <p className="text-text-secondary text-sm">{result.tip}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {loading && (
          <div className="text-center py-12">
            <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-text-secondary animate-pulse">{t('remedy.consulting')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
