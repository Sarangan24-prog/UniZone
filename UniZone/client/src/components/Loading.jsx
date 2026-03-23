export default function Loading({ label = "Loading..." }) {
  return (
    <div className="rounded-2xl border border-gray-100 bg-white p-12 text-center">
      <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-gray-200 border-t-gray-900 mb-4"></div>
      <p className="text-sm font-medium text-gray-600">{label}</p>
    </div>
  );
}
