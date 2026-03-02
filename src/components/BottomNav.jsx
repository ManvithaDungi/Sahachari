import { useNavigate, useLocation } from 'react-router-dom';

export default function BottomNav() {
   const navigate = useNavigate();
   const location = useLocation();

   const navItems = [
      { id: 1, icon: '💬', label: 'Forum', route: '/forum' },
      { id: 5, icon: '📍', label: 'Nearby', route: '/nearby' },
      { id: 2, icon: '🔍', label: 'Check', route: '/symptoms' },
      { id: 3, icon: '🌿', label: 'Remedies', route: '/remedy' },
      { id: 4, icon: '📔', label: 'Journal', route: '/journal' },
   ];

   return (
      <div className="md:hidden fixed bottom-0 left-0 right-0 h-20 bg-white/90 backdrop-blur-xl border-t border-primary/10 rounded-t-2xl flex justify-around items-center px-2 z-50 shadow-[0_-5px_20px_rgba(0,0,0,0.03)]">
         {navItems.map((item) => {
            const isActive = location.pathname === item.route;
            return (
               <button
                  key={item.id}
                  onClick={() => navigate(item.route)}
                  className={`flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-200 ${isActive ? 'text-primary scale-105' : 'text-text-secondary/60 hover:text-text-primary'
                     }`}
               >
                  <span className={`text-2xl mb-1 transition-transform duration-200 ${isActive ? '-translate-y-1' : ''}`}>
                     {item.icon}
                  </span>
                  <span className={`text-[10px] font-bold tracking-wide ${isActive ? 'opacity-100' : 'opacity-0 scale-0'} transition-all duration-200`}>
                     {item.label}
                  </span>
               </button>
            );
         })}
      </div>
   );
}
