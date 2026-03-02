
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveForumPost, getUserId, getAnonName } from '../services/firebaseService';
import { moderateContent } from '../services/moderationService';
import { classifyContent } from '../services/nlpService';

export default function NewPostScreen() {
   const navigate = useNavigate();
   const [loading, setLoading] = useState(false);
   const [tagging, setTagging] = useState(false);
   const [title, setTitle] = useState('');
   const [content, setContent] = useState('');
   const [topic, setTopic] = useState('');
   const [postType, setPostType] = useState('text');
   const [imageUrl, setImageUrl] = useState('');

   const handleAutoTag = async () => {
      if (!content || content.length < 10) {
         alert("Please write a bit more first.");
         return;
      }
      setTagging(true);
      try {
         const fullText = `${title} ${content}`;
         // Call Cloud NL Classify
         const categories = await classifyContent(fullText);

         const lowerText = fullText.toLowerCase();
         let suggested = '';

         // Simple mapping logic
         if (lowerText.includes('pcos') || lowerText.includes('ovary')) suggested = 'PCOS';
         else if (lowerText.includes('anemia') || lowerText.includes('iron')) suggested = 'Anemia';
         else if (lowerText.includes('period') || lowerText.includes('bleed')) suggested = 'Menstrual Health';
         else if (lowerText.includes('remedy') || lowerText.includes('ginger')) suggested = 'Home Remedies';

         if (suggested) {
            setTopic(suggested);
         } else {
            // Fallback if no keyword match
            if (categories.some(c => c.includes('Women') || c.includes('Reproductive'))) setTopic('Menstrual Health');
            else alert("Couldn't detect a specific topic. Please choose one.");
         }
      } catch (e) {
         console.error(e);
      } finally {
         setTagging(false);
      }
   };

   const topics = [
      { id: 'PCOS', label: 'PCOS' },
      { id: 'Anemia', label: 'Anemia' },
      { id: 'Menstrual Health', label: 'Menstrual Health' },
      { id: 'Home Remedies', label: 'Home Remedies' },
      { id: 'General Wellness', label: 'General Wellness' }
   ];

   const handleSubmit = async () => {
      if (!title.trim() || !content.trim() || !topic) return;
      if (postType === 'image' && !imageUrl.trim()) {
         alert('Please add an image URL.');
         return;
      }

      setLoading(true);
      try {
         const moderationResult = await moderateContent(`${title}\n${content}`);
         if (!moderationResult.approved) {
            alert(moderationResult.reason || 'This post may not be appropriate for the community.');
            return;
         }
         const userId = getUserId();
         const anonName = getAnonName();
         const postData = {
            title,
            content,
            topic,
            type: postType,
            imageUrl: postType === 'image' ? imageUrl.trim() : null,
            approved: moderationResult.approved,
            moderation: moderationResult,
            userId,
            anonName,
            upvotes: 0,
            upvotedBy: [],
            commentCount: 0
         };

         await saveForumPost(postData);
         alert('Post published.');
         navigate('/forum');

      } catch (error) {
         console.error("Error creating post:", error);
         alert("Failed to create post. Please try again.");
      } finally {
         setLoading(false);
      }
   };

   return (
      <div className="min-h-screen bg-[#F8F7FF] font-sans animate-fade-in pb-20">
         <div className="sticky top-0 bg-[#F8F7FF]/90 backdrop-blur-md border-b border-white/50 z-10 px-4 py-4 flex justify-between items-center">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 text-text-secondary hover:text-text-primary">
               ← Back
            </button>
            <h1 className="font-semibold text-text-primary">New Reflection</h1>
            <button
               onClick={handleSubmit}
               disabled={!title || !content || !topic || loading}
               className="bg-primary text-white text-sm font-semibold px-5 py-2 rounded-full disabled:opacity-40 hover:bg-[#5A4AB8] transition-all"
            >
               {loading ? 'Posting...' : 'Share'}
            </button>
         </div>

         <div className="max-w-xl mx-auto px-4 py-6 space-y-6">
            <div className="glass-card p-4">
               <p className="text-sm text-text-secondary leading-relaxed">
                  This is a private, anonymous space. Share only what feels safe and nourishing.
               </p>
            </div>

            <div className="grid grid-cols-3 gap-3">
               {[
                  { id: 'text', icon: '📝', label: 'Share' },
                  { id: 'question', icon: '❔', label: 'Ask' },
                  { id: 'image', icon: '🖼️', label: 'Image' }
               ].map((type) => (
                  <button
                     key={type.id}
                     onClick={() => setPostType(type.id)}
                     className={`flex flex-col items-center justify-center p-3 rounded-2xl border transition-all ${postType === type.id
                        ? 'border-primary bg-primary/5 text-primary'
                        : 'border-white/60 bg-white/60 text-text-secondary hover:bg-white'}`}
                  >
                     <span className="text-xl mb-1">{type.icon}</span>
                     <span className="text-xs font-medium">{type.label}</span>
                  </button>
               ))}
            </div>

            <div className="glass-card p-4 space-y-4">
               <div>
                  <div className="flex justify-between items-center mb-3">
                     <label className="block text-xs font-bold text-text-secondary uppercase tracking-wide">
                        Choose a topic
                     </label>
                     <button
                        onClick={handleAutoTag}
                        disabled={tagging || !content}
                        className="text-xs text-primary font-bold hover:underline disabled:opacity-50"
                     >
                        {tagging ? '✨ Analyzing...' : '✨ Auto-suggest'}
                     </button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                     {topics.map((t) => (
                        <button
                           key={t.id}
                           onClick={() => setTopic(t.id)}
                           className={`px-4 py-2 rounded-full text-sm transition-all border ${topic === t.id
                              ? 'bg-primary text-white border-primary shadow-md shadow-primary/20'
                              : 'bg-white/70 text-text-secondary border-white/60 hover:border-primary/30'}`}
                        >
                           {t.label}
                        </button>
                     ))}
                  </div>
               </div>

               <div>
                  <input
                     type="text"
                     placeholder="A gentle title to hold your thought"
                     value={title}
                     onChange={(e) => setTitle(e.target.value)}
                     maxLength={80}
                     className="w-full text-lg font-semibold text-text-primary placeholder:text-text-secondary/50 border-none focus:ring-0 p-0 bg-transparent"
                  />
                  <div className="text-right text-xs text-text-secondary/60 mt-1">{title.length}/80</div>
               </div>

               <textarea
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  placeholder={
                     postType === 'question'
                        ? 'What would you like to ask the circle?'
                        : postType === 'image'
                           ? 'Add a gentle caption for your image'
                           : 'Share your experience, feelings, or a small win'
                  }
                  className="w-full h-44 text-base text-text-secondary placeholder:text-text-secondary/50 border-none focus:ring-0 p-0 bg-transparent resize-none leading-relaxed"
               ></textarea>

               {postType === 'image' && (
                  <input
                     type="url"
                     placeholder="Paste a secure image URL"
                     value={imageUrl}
                     onChange={(e) => setImageUrl(e.target.value)}
                     className="w-full text-sm text-text-secondary placeholder:text-text-secondary/50 border border-white/70 rounded-2xl px-4 py-3 bg-white/70 focus:outline-none focus:ring-4 focus:ring-primary/10"
                  />
               )}
            </div>
         </div>
      </div>
   );
}
