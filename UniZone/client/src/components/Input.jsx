export default function Input({ label, error, className = "", ...props }) {
  const baseClass = "w-full rounded-2xl border-2 px-4 py-3.5 text-sm text-white placeholder:text-slate-500 outline-none transition-all duration-300 shadow-inner";
  const stateClass = error 
    ? "border-red-500/50 bg-red-500/5 focus:border-red-500 focus:ring-4 focus:ring-red-500/10" 
    : "border-white/5 bg-white/5 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 hover:border-white/10 hover:bg-white/10";

  return (
    <label className="block mb-1">
      {label && <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">{label}</span>}
      <input
        {...props}
        className={`${baseClass} ${stateClass} ${className}`.trim()}
      />
      {error && <span className="mt-1.5 block text-xs font-semibold text-red-400 px-1">{error}</span>}
    </label>
  );
}
