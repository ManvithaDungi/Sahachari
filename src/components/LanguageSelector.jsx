import { useTranslation } from 'react-i18next';
import { useState, useRef, useEffect } from 'react';

const languages = [
   { code: 'en', label: 'EN', native: 'English' },
   { code: 'hi', label: 'HI', native: 'हिंदी' },
   { code: 'ta', label: 'TA', native: 'தமிழ்' },
   { code: 'te', label: 'TE', native: 'తెలుగు' },
   { code: 'kn', label: 'KN', native: 'ಕನ್ನಡ' },
   { code: 'ml', label: 'ML', native: 'മലയാളം' }
];

const LanguageSelector = () => {
   const { i18n } = useTranslation();
   const [open, setOpen] = useState(false);
   const dropdownRef = useRef(null);
   const current = languages.find(l => l.code === i18n.language) || languages[0];

   // Close on outside click
   useEffect(() => {
      const handleClickOutside = (event) => {
         if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setOpen(false);
         }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
   }, []);

   const switchLanguage = (code) => {
      i18n.changeLanguage(code);
      localStorage.setItem('language', code);
      setOpen(false);
   };

   return (
      <div className="relative" ref={dropdownRef}>
         {/* Trigger button */}
         <button
            onClick={() => setOpen(!open)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full
          border border-[rgba(109,91,208,0.25)] text-[#6B6580] 
          text-sm font-medium hover:border-[#6D5BD0] transition-all bg-white/50 backdrop-blur-sm"
         >
            <span>{current.label}</span>
            <span className="text-xs opacity-60">▾</span>
         </button>

         {/* Dropdown */}
         {open && (
            <div className="absolute right-0 top-10 w-40 z-50
          bg-[rgba(255,255,255,0.95)] backdrop-blur-xl
          border border-[rgba(109,91,208,0.12)]
          rounded-2xl shadow-lg overflow-hidden animate-fade-in origin-top-right">
               <div className="py-1">
                  {languages.map((lang) => (
                     <button
                        key={lang.code}
                        onClick={() => switchLanguage(lang.code)}
                        className={`w-full flex items-center justify-between
                  px-4 py-2.5 text-sm transition-colors
                  ${i18n.language === lang.code ? 'bg-primary/5' : 'hover:bg-primary/5'}
                `}
                     >
                        <span className={`font-medium ${i18n.language === lang.code ? 'text-primary' : 'text-[#1E1B2E]'}`}>
                           {lang.native}
                        </span>

                        <div className="flex items-center gap-2">
                           <span className="text-[#6B6580] text-xs opacity-70">{lang.label}</span>
                           {i18n.language === lang.code && (
                              <span className="text-primary text-xs">✓</span>
                           )}
                        </div>
                     </button>
                  ))}
               </div>
            </div>
         )}
      </div>
   );
};

export default LanguageSelector;
