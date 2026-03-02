
import { useNavigate } from 'react-router-dom';
import { formatDistanceToNow } from 'date-fns';
import ModerationBadge from './ModerationBadge';
import ReactionBar from './ReactionBar';

export default function PostCard({ post, onReact, currentUserId }) {
   const navigate = useNavigate();

   const getTopicColor = (topic) => {
      switch (topic) {
         case 'PCOS': return 'border-l-[#9B8EC4]';
         case 'Anemia': return 'border-l-[#C4956A]';
         case 'Menstrual Health': return 'border-l-[#B8D4BE]';
         case 'Home Remedies': return 'border-l-[#A8C5A0]';
         case 'General Wellness': return 'border-l-[#C5BFE0]';
         default: return 'border-l-[#6D5BD0]';
      }
   };

   const handleNavigate = () => {
      navigate(`/forum/${post.id}`, { state: { post } });
   };

   const getTimeAgo = (timestamp) => {
      if (!timestamp) return 'Just now';
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return formatDistanceToNow(date, { addSuffix: true }).replace('about ', '');
   };

   return (
      <div className={`glass-card border-l-[3px] ${getTopicColor(post.topic)} ${post.isPinned ? 'ring-1 ring-primary/20' : ''} p-5 mb-4`}>
         <div className="flex justify-between items-start mb-3">
            <div className="flex items-center gap-2">
               <span className="bg-primary/5 text-text-secondary text-xs font-medium px-2 py-1 rounded-md">
                  {post.anonName || 'Anon'}
               </span>
               {post.language && (
                  <span className="text-[10px] text-text-secondary/70 font-medium px-1.5 py-0.5 bg-gray-100 rounded border border-gray-200 uppercase tracking-tight">
                     {post.language === 'en' ? '🇬🇧 EN' : `🇮🇳 ${post.language.toUpperCase()}`}
                  </span>
               )}
               <span className="text-xs text-text-secondary font-medium px-2 py-1 bg-white/60 rounded-md border border-primary/10">
                  {post.topic}
               </span>
               {post.type === 'question' && <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">Question</span>}
               {post.isExpertAnswered && <span className="text-xs bg-white/70 text-text-secondary px-2 py-0.5 rounded-full border border-primary/10">Expert Replied</span>}
            </div>
            <span className="text-xs text-text-secondary/60 whitespace-nowrap ml-2">
               {getTimeAgo(post.createdAt)}
            </span>
         </div>

         <div
            onClick={handleNavigate}
            className="cursor-pointer group"
         >
            <h3 className="text-text-primary text-base font-bold mb-2 leading-snug group-hover:text-primary transition-colors line-clamp-2">
               {post.title || 'Shared reflection'}
            </h3>

            {post.content && (
               <p className="text-text-secondary text-sm leading-relaxed line-clamp-3 mb-3">
                  {post.content}
               </p>
            )}

            {post.imageUrl && (
               <div className="mb-3 overflow-hidden rounded-2xl border border-white/70">
                  <img src={post.imageUrl} alt="Post" className="w-full h-36 object-cover" />
               </div>
            )}

            <div className="mb-2">
               <ModerationBadge safetyScore={post.moderation?.safetyScore} approved={post.approved} />
            </div>
         </div>

         <ReactionBar
            post={post}
            currentUserId={currentUserId}
            onReact={onReact}
            onComment={handleNavigate}
            onShare={() => {
               navigator.clipboard.writeText(window.location.origin + `/forum/${post.id}`);
               alert("Link copied!");
            }}
         />
      </div>
   );
}
