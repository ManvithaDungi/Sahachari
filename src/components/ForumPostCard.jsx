import { useState } from 'react';

export default function ForumPostCard({ post }) {
  const [hearts, setHearts] = useState(post.hearts || 0);
  const [liked, setLiked] = useState(false);

  const handleHeart = () => {
    setLiked(!liked);
    setHearts(liked ? hearts - 1 : hearts + 1);
  };

  const getTopicColor = (topic) => {
    const colors = {
      'PCOS': 'bg-blue-100/50 text-blue-800 border-blue-200',
      'Anemia': 'bg-red-100/50 text-red-800 border-red-200',
      'Menstrual Health': 'bg-pink-100/50 text-pink-800 border-pink-200',
      'Remedies': 'bg-green-100/50 text-green-800 border-green-200',
    };
    return colors[topic] || 'bg-gray-100/50 text-gray-800 border-gray-200';
  };

  const formatTime = (timestamp) => {
    if (!timestamp) return 'Recently';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'Now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="glass-card p-5 mb-4 border-l-[3px] border-l-primary group hover:bg-white/80 transition-all duration-300">
      <div className="flex justify-between items-start gap-3 mb-4">
        <div className="flex items-center gap-3">
          <span className="px-2.5 py-1 rounded-md bg-surface border border-primary/10 text-xs font-bold text-text-secondary uppercase tracking-tight">
            Anon#{Math.floor(Math.random() * 9000) + 1000}
          </span>
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getTopicColor(post.topic)}`}>
            {post.topic}
          </span>
        </div>
        <span className="text-xs text-text-secondary font-medium">{formatTime(post.timestamp)}</span>
      </div>
      <p className="text-text-primary text-base mb-4 leading-relaxed font-medium">{post.content}</p>
      <button
        onClick={handleHeart}
        className={`flex items-center gap-1.5 text-sm font-bold transition-all px-3 py-1.5 rounded-full ${liked ? 'text-danger bg-danger/10' : 'text-text-secondary hover:bg-danger/5 hover:text-danger'
          }`}
      >
        {liked ? '❤️' : '🤍'} {hearts}
      </button>
    </div>
  );
}
