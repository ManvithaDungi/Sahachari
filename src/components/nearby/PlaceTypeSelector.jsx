
import { useState, useRef, useEffect } from 'react';

const PLACE_TYPES = [
   { label: 'Gynecologist', icon: '🏥' },
   { label: 'Pharmacy', icon: '💊' },
   { label: 'General Physician', icon: '🩺' },
   { label: 'Diagnostic Lab', icon: '🔬' },
   { label: 'Women\'s Clinic', icon: '🏨' },
   { label: 'Wellness Center', icon: '🧘' },
   { label: 'Dentist', icon: '🦷' },
   { label: 'Eye Care', icon: '👁️' }
];

export default function PlaceTypeSelector({ selectedType, onSelect }) {
   const [isOpen, setIsOpen] = useState(false);
   const dropdownRef = useRef(null);

   // Close on outside click
   useEffect(() => {
      const handleClickOutside = (event) => {
         if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
            setIsOpen(false);
         }
      };
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
   }, []);

   const selectedOption = PLACE_TYPES.find(t => t.label === selectedType) || PLACE_TYPES[0];

   return (
      <div className="relative w-full" ref={dropdownRef}>
         <p className="text-text-secondary text-sm font-medium mb-2 pl-1">
            I'm looking for
         </p>

         {/* Trigger Button */}
         <button
            onClick={() => setIsOpen(!isOpen)}
            className={`w-full flex items-center justify-between px-4 py-3 rounded-2xl transition-all duration-200
        bg-white/80 backdrop-blur-sm border-1.5 
        ${isOpen ? 'border-primary shadow-lg shadow-primary/10' : 'border-primary/20 hover:border-primary'}
        `}
         >
            <div className="flex items-center gap-3">
               <span className="text-xl">{selectedOption.icon}</span>
               <span className="text-text-primary font-medium text-sm">
                  {selectedOption.label}
               </span>
            </div>
            <svg
               className={`w-5 h-5 text-primary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
               fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
         </button>

         {/* Dropdown Menu */}
         {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 z-50 animate-fade-in-up origin-top">
               <div className="bg-white/95 backdrop-blur-xl border border-primary/10 rounded-2xl shadow-xl shadow-primary/10 overflow-hidden py-1 max-h-64 overflow-y-auto">
                  {PLACE_TYPES.map((type) => (
                     <button
                        key={type.label}
                        onClick={() => {
                           onSelect(type.label);
                           setIsOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-4 py-3 text-left transition-colors
                  ${selectedType === type.label ? 'bg-primary/5' : 'hover:bg-primary/5'}
                `}
                     >
                        <div className="flex items-center gap-3">
                           <span className="text-lg">{type.icon}</span>
                           <span className={`text-sm font-medium ${selectedType === type.label ? 'text-primary' : 'text-text-primary'}`}>
                              {type.label}
                           </span>
                        </div>
                        {selectedType === type.label && (
                           <span className="text-primary text-sm font-bold">✓</span>
                        )}
                     </button>
                  ))}
               </div>
            </div>
         )}
      </div>
   );
}
