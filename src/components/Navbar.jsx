import { signOut } from 'firebase/auth';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { auth } from '../services/firebaseService';
import LanguageSelector from './LanguageSelector';

export default function Navbar() {
  const { t } = useTranslation();
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  const navLinks = [
    { name: t('home.community'), path: '/forum' },
    { name: t('home.check_symptoms'), path: '/symptoms' },
    { name: t('home.remedies'), path: '/remedy' },
    { name: t('home.journal'), path: '/journal' },
    { name: t('home.nearby'), path: '/nearby' }
  ];

  return (
    <nav className="sticky top-0 z-50 w-full h-16 bg-[#F8F7FF]/85 backdrop-blur-lg border-b border-primary/10 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-6 h-full flex justify-between items-center">
        <div className="flex items-center gap-8">
          <div className="flex items-baseline gap-2 cursor-pointer" onClick={() => navigate('/forum')}>
            <h1 className="text-2xl font-bold text-primary tracking-tight">Sahachari</h1>
            <span className="text-sm font-medium text-text-secondary">సహచరి</span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className={`text-sm font-semibold transition-colors duration-200 ${location.pathname === link.path
                  ? 'text-primary'
                  : 'text-text-secondary hover:text-primary'
                  }`}
              >
                {link.name}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <LanguageSelector />

          <button
            onClick={handleLogout}
            className="text-text-secondary hover:text-danger p-2 transition-colors text-sm font-medium"
            title={t('common.logout')}
          >
            {t('common.logout')}
          </button>
        </div>
      </div>
    </nav>
  );
}

