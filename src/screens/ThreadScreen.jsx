import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ModerationBadge from '../components/forum/ModerationBadge';
import ReactionBar from '../components/forum/ReactionBar';
import CommentCard from '../components/forum/CommentCard';
import { addPostComment, getAnonName, getForumPostById, getPostComments, getUserId, toggleCommentUpvote, togglePostUpvote } from '../services/firebaseService';
import { moderateContent } from '../services/moderationService';

export default function ThreadScreen() {
   const navigate = useNavigate();
   const { postId } = useParams();
   const location = useLocation();
   const [post, setPost] = useState(location.state?.post || null);
   const [comments, setComments] = useState([]);
   const [loading, setLoading] = useState(true);
   const [comment, setComment] = useState('');
   const [submitting, setSubmitting] = useState(false);
   const currentUserId = useMemo(() => getUserId(), []);

   useEffect(() => {
      const load = async () => {
         setLoading(true);
         try {
            const [postData, commentData] = await Promise.all([
               post ? Promise.resolve(post) : getForumPostById(postId),
               getPostComments(postId)
            ]);
            setPost(postData);
            setComments(commentData);
         } catch (error) {
            console.error('Failed to load thread', error);
         } finally {
            setLoading(false);
         }
      };
      load();
   }, [postId]);

   const handleSubmitComment = async () => {
      if (!comment.trim()) return;
      setSubmitting(true);
      try {
         const moderationResult = await moderateContent(comment);
         if (!moderationResult.approved) {
            alert(moderationResult.reason || 'This comment may not be appropriate for the community.');
            return;
         }
         const userId = getUserId();
         const anonName = getAnonName();
         await addPostComment(postId, {
            userId,
            anonName,
            content: comment.trim(),
            approved: moderationResult.approved,
            moderation: {
               sentiment: moderationResult.sentiment,
               safetyScore: moderationResult.safetyScore,
               flags: moderationResult.flags
            },
            upvotes: 0,
            upvotedBy: [],
            isExpertComment: false
         });
         const updatedComments = await getPostComments(postId);
         setComments(updatedComments);
         setComment('');
      } catch (error) {
         console.error('Failed to add comment', error);
         alert('Failed to add comment. Please try again.');
      } finally {
         setSubmitting(false);
      }
   };

   const handlePostReact = async (liked) => {
      setPost((prev) => {
         if (!prev) return prev;
         const nextUpvotedBy = liked
            ? [...(prev.upvotedBy || []), currentUserId]
            : (prev.upvotedBy || []).filter((entry) => entry !== currentUserId);
         return {
            ...prev,
            upvotes: (prev.upvotes || 0) + (liked ? 1 : -1),
            upvotedBy: nextUpvotedBy
         };
      });
      await togglePostUpvote(postId, currentUserId);
   };

   const handleCommentReact = async (commentId, liked) => {
      setComments((prev) =>
         prev.map((item) => {
            if (item.id !== commentId) return item;
            const nextUpvotedBy = liked
               ? [...(item.upvotedBy || []), currentUserId]
               : (item.upvotedBy || []).filter((entry) => entry !== currentUserId);
            return {
               ...item,
               upvotes: (item.upvotes || 0) + (liked ? 1 : -1),
               upvotedBy: nextUpvotedBy
            };
         })
      );
      await toggleCommentUpvote(postId, commentId, currentUserId);
   };

   if (loading) {
      return (
         <div className="min-h-screen bg-[#F8F7FF] pb-24 font-sans animate-fade-in">
            <div className="max-w-2xl mx-auto px-4 py-6 space-y-4">
               <div className="h-40 bg-white/50 rounded-2xl animate-pulse"></div>
               <div className="h-24 bg-white/50 rounded-2xl animate-pulse"></div>
            </div>
         </div>
      );
   }

   if (!post) {
      return (
         <div className="min-h-screen bg-[#F8F7FF] pb-24 font-sans animate-fade-in">
            <div className="max-w-2xl mx-auto px-4 py-20 text-center">
               <p className="text-text-secondary">This reflection is not available.</p>
               <button
                  onClick={() => navigate('/forum')}
                  className="mt-6 text-primary border border-primary/30 px-6 py-2 rounded-full text-sm font-medium hover:bg-primary/5 transition-colors"
               >
                  Back to circle
               </button>
            </div>
         </div>
      );
   }

   return (
      <div className="min-h-screen bg-[#F8F7FF] pb-24 font-sans animate-fade-in">
         <div className="sticky top-0 bg-[#F8F7FF]/90 backdrop-blur-md border-b border-white/50 z-10 px-4 py-4 flex items-center gap-2">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-text-secondary hover:text-text-primary">
               ← Back
            </button>
            <div>
               <p className="text-xs text-text-secondary">Reflection</p>
               <h1 className="text-sm font-semibold text-text-primary">{post.topic}</h1>
            </div>
         </div>

         <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
            <div className="glass-card p-5">
               <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                     <span className="bg-primary/5 text-text-secondary text-xs font-medium px-2 py-1 rounded-md">
                        {post.anonName || 'Anon'}
                     </span>
                     {post.isExpertAnswered && (
                        <span className="text-xs bg-white/70 text-text-secondary px-2 py-0.5 rounded-full border border-primary/10">
                           Expert Replied
                        </span>
                     )}
                  </div>
                  <ModerationBadge safetyScore={post.moderation?.safetyScore} approved={post.approved} />
               </div>
               <h2 className="text-lg font-semibold text-text-primary mb-3">{post.title}</h2>
               <p className="text-sm text-text-secondary leading-relaxed whitespace-pre-line">{post.content}</p>
               {post.imageUrl && (
                  <div className="mt-4 overflow-hidden rounded-2xl border border-white/70">
                     <img src={post.imageUrl} alt="Post" className="w-full max-h-72 object-cover" />
                  </div>
               )}
               <ReactionBar
                  post={post}
                  currentUserId={currentUserId}
                  onReact={(id, liked) => handlePostReact(liked)}
                  onComment={() => {}}
                  onShare={() => {
                     navigator.clipboard.writeText(window.location.origin + `/forum/${post.id}`);
                     alert('Link copied!');
                  }}
               />
            </div>

            <div className="glass-card p-5 space-y-4">
               <h3 className="text-sm font-semibold text-text-primary">Leave a gentle note</h3>
               <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Offer support, ask a kind question, or share a small tip"
                  className="w-full h-28 text-sm text-text-secondary placeholder:text-text-secondary/50 border border-white/70 rounded-2xl px-4 py-3 bg-white/70 focus:outline-none focus:ring-4 focus:ring-primary/10 resize-none"
               ></textarea>
               <div className="flex justify-end">
                  <button
                     onClick={handleSubmitComment}
                     disabled={!comment.trim() || submitting}
                     className="bg-primary text-white text-sm font-semibold px-5 py-2 rounded-full disabled:opacity-50 hover:bg-[#5A4AB8] transition-all"
                  >
                     {submitting ? 'Sending...' : 'Post comment'}
                  </button>
               </div>
            </div>

            <div className="space-y-4">
               <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-text-primary">Supportive replies</h3>
                  <span className="text-xs text-text-secondary">{comments.length} notes</span>
               </div>
               {comments.length === 0 ? (
                  <div className="glass-card p-6 text-center text-sm text-text-secondary">
                     Be the first to leave a warm note.
                  </div>
               ) : (
                  comments.map((commentItem) => (
                     <CommentCard
                        key={commentItem.id}
                        comment={commentItem}
                        currentUserId={currentUserId}
                        onReact={(id, liked) => handleCommentReact(id, liked)}
                     />
                  ))
               )}
            </div>
         </div>
      </div>
   );
}
