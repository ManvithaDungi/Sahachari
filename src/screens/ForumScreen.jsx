
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import TopicFilter from '../components/forum/TopicFilter';
import PostCard from '../components/forum/PostCard';
import { getForumPosts, togglePostUpvote, getUserId } from '../services/firebaseService';

export default function ForumScreen() {
  const navigate = useNavigate();
  const { i18n, t } = useTranslation();
  const [activeTopic, setActiveTopic] = useState('all');
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Re-fetch whenever language or topic changes
  useEffect(() => {
    fetchPosts();
  }, [activeTopic, i18n.language]);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      // Pass language to getForumPosts
      const fetchedPosts = await getForumPosts(activeTopic, 'recent', i18n.language);
      setPosts(fetchedPosts);
    } catch (error) {
      console.error("Failed to load forum posts", error);
    } finally {
      setLoading(false);
    }
  };

  const currentUserId = getUserId() || 'anon';
  const affirmations = [
    "You are not alone here.",
    "Your voice is welcome.",
    "Softness is a strength.",
    "Share only what feels safe."
  ];
  const randomAffirmation = affirmations[Math.floor(Math.random() * affirmations.length)];

  // Empty state messages per language
  const emptyMessages = {
    en: "No posts yet in English. Be the first to share!",
    ta: "தமிழில் இன்னும் பதிவுகள் இல்லை. முதலில் பகிருங்கள்!",
    hi: "हिंदी में अभी कोई पोस्ट नहीं। पहले शेयर करें!",
    ml: "മലയാളത്തിൽ ഇതുവരെ പോസ്റ്റുകളില്ല. ആദ്യം പങ്കിടൂ!",
    te: "తెలుగులో ఇంకా పోస్టులు లేవు. మొదట షేర్ చేయండి!",
    kn: "ಕನ್ನಡದಲ್ಲಿ ಇನ್ನೂ ಪೋಸ್ಟ್‌ಗಳಿಲ್ಲ. ಮೊದಲು ಹಂಚಿಕೊಳ್ಳಿ!"
  };

  return (
    <div className="min-h-screen bg-[#F8F7FF] pb-24 font-sans animate-fade-in relative">
      <div className="max-w-2xl mx-auto px-4 py-6">
        <div className="flex justify-between items-start mb-6">
          <div>
            <h1 className="text-2xl font-bold text-primary tracking-tight">Community Circle</h1>
            <p className="text-sm text-text-secondary mt-1">A private, gentle space to share and listen</p>
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => navigate('/forum/new')}
              className="bg-primary text-white rounded-full px-4 py-2.5 shadow-lg hover:bg-[#5A4AB8] transition-all hover:scale-105 active:scale-95 text-sm font-semibold"
            >
              New Reflection
            </button>
          </div>
        </div>

        <div className="glass-card p-4 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="text-xs text-text-secondary uppercase tracking-wide">Circle tone</p>
              <p className="text-sm text-text-primary font-semibold">Soft, supportive, anonymous</p>
            </div>
            <div className="text-xs text-text-secondary/80">{randomAffirmation}</div>
          </div>
        </div>

        <div className="sticky top-[64px] z-30 bg-[#F8F7FF]/95 backdrop-blur-sm pt-2 pb-4 -mx-4 px-4 mb-2">
          <TopicFilter activeTopic={activeTopic} setActiveTopic={setActiveTopic} />
        </div>

        <div className="space-y-4">
          {loading ? (
            <div className="flex flex-col gap-4 mt-8">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-40 bg-white/50 rounded-2xl animate-pulse"></div>
              ))}
            </div>
          ) : posts.length > 0 ? (
            posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                currentUserId={currentUserId}
                onReact={async (id, liked) => {
                  setPosts((prev) =>
                    prev.map((item) => {
                      if (item.id !== id) return item;
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
                  await togglePostUpvote(id, currentUserId);
                }}
              />
            ))
          ) : (
            <div className="text-center py-20 opacity-70">
              <div className="text-4xl mb-4">🌿</div>
              <h3 className="font-semibold text-text-primary mb-2">
                {emptyMessages[i18n.language] || emptyMessages['en']}
              </h3>
              <p className="text-sm text-text-secondary">Be the first to share in {activeTopic === 'all' ? 'the circle' : activeTopic}</p>
              <button
                onClick={() => navigate('/forum/new')}
                className="mt-6 text-primary border border-primary/30 px-6 py-2 rounded-full text-sm font-medium hover:bg-primary/5 transition-colors"
              >
                Share gently
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

