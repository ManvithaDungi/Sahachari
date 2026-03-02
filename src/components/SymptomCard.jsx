export default function SymptomCard({ condition }) {
  const getProbabilityColor = (probability) => {
    // High: dusty rose
    if (probability === 'High') return 'bg-[#B5756B]/10 text-danger border border-[#B5756B]/25';
    // Medium: warm amber
    if (probability === 'Medium') return 'bg-[#C4956A]/10 text-warning border border-[#C4956A]/25';
    // Low: sage green
    if (probability === 'Low') return 'bg-[#B8D4BE]/20 text-[#4A7C59] border border-[#B8D4BE]/40';
    return 'bg-primary/5 text-primary border border-primary/10';
  };

  return (
    <div className="glass-card p-6 mb-4 group hover:bg-white/90">
      <div className="flex justify-between items-start gap-4">
        <div className="flex-1">
          <h3 className="text-xl font-bold text-text-primary mb-2 group-hover:text-primary transition-colors">{condition.name}</h3>
          <p className="text-text-secondary text-sm mb-3 leading-relaxed">{condition.description}</p>
        </div>
        <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${getProbabilityColor(condition.probability)} whitespace-nowrap`}>
          {condition.probability}
        </span>
      </div>
    </div>
  );
}
