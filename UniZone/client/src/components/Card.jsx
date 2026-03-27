export default function Card({ children, className = "", glass = false }) {
  const base = "rounded-2xl p-6 transition-all duration-300";
  const styles = glass
    ? "glass animate-in fade-in zoom-in-95"
    : "bg-white border border-slate-200 shadow-sm hover:shadow-xl";

  return (
    <div className={`${base} ${styles} ${className}`}>
      {children}
    </div>
  );
}
