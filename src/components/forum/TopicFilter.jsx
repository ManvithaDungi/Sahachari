
export default function TopicFilter({ activeTopic, setActiveTopic }) {
   const topics = [
      { id: 'all', label: 'All' },
      { id: 'PCOS', label: 'PCOS' },
      { id: 'Anemia', label: 'Anemia' },
      { id: 'Menstrual Health', label: 'Menstrual Health' },
      { id: 'Home Remedies', label: 'Home Remedies' },
      { id: 'General Wellness', label: 'General Wellness' }
   ];

   return (
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide py-1">
         {topics.map((topic) => (
            <button
               key={topic.id}
               onClick={() => setActiveTopic(topic.id)}
               className={`px-4 py-1.5 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${activeTopic === topic.id
                     ? 'bg-primary text-white shadow-md shadow-primary/20'
                     : 'bg-[#F8F7FF] text-text-secondary border border-primary/10 hover:border-primary/30 hover:bg-white'
                  }`}
            >
               {topic.label}
            </button>
         ))}
      </div>
   );
}
