import { formatDistanceToNow } from 'date-fns';

export default function CommentCard({ comment, onReact, currentUserId }) {
   const isReacted = (comment.upvotedBy || []).includes(currentUserId);
   const timeLabel = comment.createdAt
      ? formatDistanceToNow(comment.createdAt.toDate ? comment.createdAt.toDate() : new Date(comment.createdAt), { addSuffix: true }).replace('about ', '')
      : 'Just now';

   return (
      <div className="glass-card p-4">
         <div className="flex items-start justify-between mb-2">
            <div className="flex items-center gap-2">
               <span className="bg-primary/5 text-text-secondary text-xs font-medium px-2 py-1 rounded-md">
                  {comment.anonName || 'Anon'}
               </span>
               {comment.isExpertComment && (
                  <span className="text-xs bg-white/70 text-text-secondary px-2 py-0.5 rounded-full border border-primary/10">
                     Expert
                  </span>
               )}
            </div>
            <span className="text-xs text-text-secondary/60 whitespace-nowrap">{timeLabel}</span>
         </div>
         <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">{comment.content}</p>
         <div className="flex items-center justify-between mt-3">
            <button
               onClick={() => onReact(comment.id, !isReacted)}
               className={`flex items-center gap-1.5 text-xs font-medium transition-all duration-200 ${isReacted ? 'text-primary' : 'text-text-secondary hover:text-primary'}`}
            >
               <span className={`text-base transition-transform duration-300 ${isReacted ? 'scale-110' : ''}`}>
                  {isReacted ? '💜' : '🤍'}
               </span>
               <span>{comment.upvotes || 0}</span>
               <span className="hidden sm:inline ml-1 font-normal opacity-70">
                  {isReacted ? 'Supported' : 'Support'}
               </span>
            </button>
         </div>
      </div>
   );
}
