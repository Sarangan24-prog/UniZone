export default function TextArea({ label, error, className = "", ...props }) {
  const baseClass = "w-full rounded-2xl border-2 px-4 py-4 text-sm placeholder:text-slate-500 outline-none transition-all duration-300 shadow-inner resize-none";
  const errorClass = error 
    ? "border-red-500/50 bg-red-500/5 text-red-100 focus:border-red-500 focus:ring-4 focus:ring-red-500/20" 
    : "border-white/5 bg-white/5 text-white focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 hover:border-white/10 hover:bg-white/10";

  return (
    <label className="block mb-1">
      {label && <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">{label}</span>}
      <textarea
        {...props}
        className={`${baseClass} ${errorClass} ${className}`.trim()}
      />
      {error && <span className="mt-1.5 block text-[11px] font-bold text-red-400 px-1 animate-in slide-in-from-top-1">{error}</span>}
    </label>
  );
}
