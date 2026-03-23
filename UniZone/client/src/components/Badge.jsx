export default function Badge({ children }) {
  return (
    <span className="inline-flex items-center rounded-full bg-gradient-to-r from-gray-100 to-gray-50 px-3 py-1 text-xs font-semibold text-gray-700 border border-gray-200">
      {children}
    </span>
  );
}
