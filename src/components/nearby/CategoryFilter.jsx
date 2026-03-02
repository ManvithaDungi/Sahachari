
import React from 'react';

const categories = [
   { id: 'gynecologist', icon: '🩺', label: 'Doctors', sublabel: 'Gynecologists & clinics' },
   { id: 'pharmacy', icon: '💊', label: 'Pharmacies', sublabel: 'Medical stores nearby' },
   { id: 'hospital', icon: '🏥', label: 'Hospitals', sublabel: 'Women\'s hospitals' },
   { id: 'ngo', icon: '🤝', label: 'Support', sublabel: 'NGOs & Sakhi centres' },
   { id: 'counseling', icon: '💜', label: 'Counseling', sublabel: 'Mental health support' }
];

export default function CategoryFilter({ activeCategory, setActiveCategory }) {
   return (
      <div className="flex gap-3 overflow-x-auto pb-4 no-scrollbar px-4 -mx-4">
         {categories.map((cat) => (
            <button
               key={cat.id}
               onClick={() => setActiveCategory(cat.id)}
               className={`
            flex flex-col items-center justify-center 
            w-[100px] flex-shrink-0 p-3 rounded-2xl border transition-all duration-300
            ${activeCategory === cat.id
                     ? 'bg-[rgba(109,91,208,0.06)] border-primary shadow-sm'
                     : 'bg-white border-[rgba(109,91,208,0.12)] hover:bg-gray-50'
                  }
          `}
            >
               <div className="w-9 h-9 rounded-full bg-[rgba(109,91,208,0.08)] flex items-center justify-center text-xl relative">
                  {cat.icon}
                  {activeCategory === cat.id && (
                     <span className="absolute -top-1 -right-1 w-3 h-3 bg-primary rounded-full border-2 border-white"></span>
                  )}
               </div>
               <span className={`text-xs font-semibold mt-2 ${activeCategory === cat.id ? 'text-primary' : 'text-text-primary'}`}>
                  {cat.label}
               </span>
               <span className="text-[10px] text-text-secondary opacity-70 mt-0.5 leading-tight hidden sm:block">
                  {cat.sublabel}
               </span>
            </button>
         ))}
      </div>
   );
}
