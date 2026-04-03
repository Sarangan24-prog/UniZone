export default function Select({ label, error, children, className = "", ...props }) {
  const baseClass = "w-full rounded-2xl border-2 px-4 py-3.5 text-sm text-white outline-none transition-all duration-300 cursor-pointer appearance-none shadow-inner [&>option]:bg-slate-800 [&>option]:text-white";
  const stateClass = error 
    ? "border-red-500/50 bg-red-500/5 focus:border-red-500 focus:ring-4 focus:ring-red-500/10" 
    : "border-white/5 bg-white/5 focus:border-blue-500/50 focus:ring-4 focus:ring-blue-500/10 hover:border-white/10 hover:bg-white/10";

  return (
    <label className="block mb-1">
      {label && <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">{label}</span>}
      <div className="relative">
        <select
          {...props}
          className={`${baseClass} ${stateClass} ${className}`.trim()}
        >
          {children}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-3 text-slate-400">
          <svg className="h-4 w-4 fill-current" viewBox="0 0 20 20">
            <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
          </svg>
        </div>
      </div>
      {error && <span className="mt-1.5 block text-xs font-semibold text-red-400 px-1">{error}</span>}
    </label>
  );
}
