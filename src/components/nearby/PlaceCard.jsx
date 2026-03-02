
import React from 'react';

const PlaceCard = ({ place, index, isSelected, onClick, onDirections, onCall }) => {
   const { name, rating, types, address, isOpen, distance, photo, phoneNumber } = place;

   // Determine type label and emoji
   let typeLabel = 'Place';
   if (types.includes('pharmacy')) typeLabel = 'Pharmacy';
   else if (types.includes('dentist')) typeLabel = 'Dentist';
   else if (types.includes('hospital')) typeLabel = 'Hospital';
   else if (types.includes('doctor')) typeLabel = 'Doctor';
   else if (types.includes('spa')) typeLabel = 'Wellness';

   // Format open status
   const openStatus = isOpen === true ? (
      <span className="text-green-600 font-medium text-xs">🟢 Open now</span>
   ) : isOpen === false ? (
      <span className="text-red-400 font-medium text-xs">🔴 Closed</span>
   ) : null;

   return (
      <div
         className={`
        relative overflow-hidden transition-all duration-200 cursor-pointer
        rounded-2xl border px-4 py-4 mb-3 select-none
        ${isSelected
               ? 'bg-primary/5 border-primary shadow-sm'
               : 'bg-white/70 backdrop-blur-sm border-primary/10 hover:border-primary/30 hover:bg-white/80'}
      `}
         onClick={onClick}
      >
         {/* Top Row: Badge + Name + Rating */}
         <div className="flex items-start justify-between gap-2 mb-1">
            <div className="flex items-center gap-2 overflow-hidden">
               <div className="flex-shrink-0 w-[22px] h-[22px] rounded-full bg-primary text-white text-xs font-bold flex items-center justify-center">
                  {index + 1}
               </div>
               <h3 className="text-sm font-semibold text-text-primary truncate" title={name}>
                  {name}
               </h3>
            </div>
            {rating && (
               <span className="text-xs font-medium text-text-secondary whitespace-nowrap">
                  ⭐ {rating}
               </span>
            )}
         </div>

         {/* Second Row: Type + Distance */}
         <div className="flex items-center gap-2 mb-2 pl-[30px]">
            <span className="bg-primary/10 text-primary text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide">
               {typeLabel}
            </span>
            {distance && (
               <span className="text-xs text-text-secondary">• {distance} km away</span>
            )}
         </div>

         {/* Address */}
         <div className="flex items-start gap-1.5 pl-[30px] mb-2">
            <span className="text-text-secondary text-xs mt-0.5">📍</span>
            <p className="text-xs text-text-secondary line-clamp-2 leading-snug">
               {address}
            </p>
         </div>

         {/* Open Status & Buttons */}
         <div className="flex items-center justify-between pl-[30px] mt-3">
            <div className="flex-1">
               {openStatus}
            </div>

            <div className="flex items-center gap-2">
               {/* Directions Button */}
               <button
                  onClick={(e) => {
                     e.stopPropagation();
                     onDirections(place);
                  }}
                  className="flex items-center gap-1.5 bg-primary hover:bg-primary-dark text-white text-xs font-medium px-4 py-1.5 rounded-full transition-transform active:scale-95"
               >
                  <span>→</span> Directions
               </button>

               {/* Call Button (if phone expected, though cloud API usually returns it in details, we might not have it in listing) */}
               {phoneNumber && (
                  <button
                     onClick={(e) => {
                        e.stopPropagation();
                        onCall(phoneNumber);
                     }}
                     className="flex items-center gap-1.5 border border-primary text-primary hover:bg-primary/5 text-xs font-medium px-4 py-1.5 rounded-full transition-transform active:scale-95"
                  >
                     <span>📞</span> Call
                  </button>
               )}
            </div>
         </div>
      </div>
   );
};

export default PlaceCard;
