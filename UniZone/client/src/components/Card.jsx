export default function Card({ children, className = "", glass = false }) {
  const base = "rounded-2xl p-6 transition-all duration-300";
  const styles = glass
    ? "glass animate-in fade-in zoom-in-95"
    : "glass-dark border border-white/5 shadow-2xl";

  return (
    <div className={`${base} ${styles} ${className}`}>
      {children}
    </div>
  );
}
