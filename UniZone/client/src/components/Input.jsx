export default function Input({ label, className = "", ...props }) {
  const baseClass = "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 outline-none transition-all duration-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 hover:border-slate-300 shadow-sm";

  return (
    <label className="block mb-1">
      {label && <span className="mb-1.5 block text-xs font-bold uppercase tracking-wider text-slate-500">{label}</span>}
      <input
        {...props}
        className={`${baseClass} ${className}`.trim()}
      />
    </label>
  );
}
