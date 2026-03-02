export default function DisclaimerBanner() {
  return (
    <div className="bg-primary/5 border border-primary/15 rounded-xl p-4 flex items-start gap-3 mt-8">
      <span className="text-xl">⚕️</span>
      <p className="text-sm text-text-secondary leading-relaxed">
        <strong>Disclaimer:</strong> This AI tool provides health information for educational purposes only. It is not a substitute for professional medical advice, diagnosis, or treatment. Always consult a qualified healthcare provider for any medical concerns.
      </p>
    </div>
  );
}
