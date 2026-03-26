export default function Input({ label, className = "", ...props }) {
  const baseClass = "w-full rounded-xl border-2 border-gray-200 bg-white px-4 py-3 text-sm text-gray-900 outline-none transition-all duration-200 focus:border-gray-900 focus:ring-2 focus:ring-gray-900/10 hover:border-gray-300";

  return (
    <label className="block">
      {label && <span className="mb-2 block text-sm font-semibold text-gray-700">{label}</span>}
      <input
        {...props}
        className={`${baseClass} ${className}`.trim()}
      />
    </label>
  );
}
