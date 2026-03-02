
export default function ModerationBadge({ safetyScore, approved }) {
   if (!approved || !safetyScore) return null;

   // Low score but approved (Community Reviewed)
   if (safetyScore < 75 && safetyScore > 40) {
      return (
         <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-yellow-100/50 border border-yellow-200 text-yellow-700 text-[10px] font-medium" title="This content was reviewed by our community safety tools">
            <span className="w-1.5 h-1.5 rounded-full bg-yellow-500"></span>
            Community Reviewed
         </div>
      );
   }

   // High score (Trusted) - only if score > 90
   if (safetyScore >= 90) {
      return (
         <div className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-green-100/50 border border-green-200 text-green-700 text-[10px] font-medium" title="High safety score">
            <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
            Trusted Post
         </div>
      );
   }

   return null;
}
