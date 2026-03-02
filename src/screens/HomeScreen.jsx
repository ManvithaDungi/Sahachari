import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import DisclaimerBanner from '../components/DisclaimerBanner';

export default function HomeScreen() {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const navCards = [
    {
      id: 1,
      icon: '🔍',
      title: t('home.check_symptoms'),
      description: 'Analyze symptoms & get AI insights',
      route: '/symptoms',
      color: 'bg-primary/10 text-primary'
    },
    {
      id: 2,
      icon: '💬',
      title: t('home.community'),
      description: 'Connect anonymously with others',
      route: '/forum',
      color: 'bg-secondary/10 text-secondary'
    },
    {
      id: 3,
      icon: '🌿',
      title: t('home.remedies'),
      description: 'Traditional wisdom backed by science',
      route: '/remedy',
      color: 'bg-accent/20 text-[#4A7C59]'
    },
    {
      id: 4,
      icon: '📔',
      title: t('home.journal'),
      description: 'Track your personal health journey',
      route: '/journal',
      color: 'bg-warning/10 text-warning'
    }
  ];

  return (
    <div className="min-h-[calc(100vh-64px)] w-full flex flex-col items-center animate-fade-in relative z-10">
      <div className="w-full max-w-5xl mx-auto px-6 py-12 md:py-20 flex flex-col items-center text-center">

        {/* Hero Section */}
        <div className="max-w-2xl mb-16">
          <div className="inline-block px-4 py-1.5 rounded-full bg-primary/5 text-primary text-sm font-semibold tracking-wide mb-6">
            WOMEN'S HEALTH COMPANION
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-text-primary mb-6 tracking-tight leading-tight">
            {t('home.title')} <br />
            <span className="text-primary transparent bg-clip-text bg-gradient-to-r from-primary to-secondary">Sahachari</span>
          </h1>
          <p className="text-lg md:text-xl text-text-secondary leading-relaxed mb-10 max-w-lg mx-auto">
            {t('home.subtitle')}
          </p>
          <button
            onClick={() => navigate('/symptoms')}
            className="bg-primary text-white rounded-full px-8 py-4 font-semibold text-lg hover:bg-[#5A4AB8] transition-all transform hover:scale-[1.02] active:scale-95 shadow-lg shadow-primary/25"
          >
            {t('home.check_symptoms')}
          </button>
        </div>

        {/* Divider */}
        <div className="w-full h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent mb-16"></div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 w-full">
          {navCards.map((card) => (
            <button
              key={card.id}
              onClick={() => navigate(card.route)}
              className="glass-card p-6 text-left group hover:bg-white/80"
            >
              <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl mb-4 ${card.color} group-hover:scale-110 transition-transform duration-300`}>
                {card.icon}
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2">{card.title}</h3>
              <p className="text-sm text-text-secondary leading-normal">{card.description}</p>
            </button>
          ))}
        </div>

        <div className="w-full max-w-4xl mt-12">
          <DisclaimerBanner />
        </div>

        <footer className="mt-20 text-text-secondary/60 text-sm">
          <p>Built with 🤍 for women everywhere</p>
        </footer>
      </div>
    </div>
  );
}

