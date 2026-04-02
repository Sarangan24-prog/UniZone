export default function Input({ label, className = "", ...props }) {
  const baseClass = "w-full rounded-2xl border-2 border-white/5 bg-white/5 px-4 py-3.5 text-sm text-white placeholder:text-slate-500 outline-none transition-all duration-300 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 hover:border-white/10 hover:bg-white/10 shadow-inner";

  return (
    <label className="block mb-1">
      {label && <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">{label}</span>}
      <input
        {...props}
        className={`${baseClass} ${className}`.trim()}
      />
    </label>
  );
}
