export default function EmptyState({ title="No data", subtitle="Try adjusting filters or add a new item.", glass = false }) {
  const wrapperStyle = glass
    ? "glass border-white/10"
    : "rounded-2xl border-2 border-dashed border-gray-200 bg-gradient-to-br from-gray-50 to-white";
    
  const titleStyle = glass ? "text-white" : "text-gray-900";
  const subStyle = glass ? "text-slate-400" : "text-gray-500";
  const iconBg = glass ? "bg-white/5" : "bg-gray-100";
  const iconStyle = glass ? "text-slate-500" : "text-gray-400";

  return (
    <div className="rounded-2xl glass-dark p-12 text-center flex flex-col items-center justify-center">
      <div className="mx-auto w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-4 shadow-inner">
        <svg className="w-8 h-8 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
        </svg>
      </div>
      <p className="text-lg font-bold text-white">{title}</p>
      <p className="mt-2 text-sm text-slate-400">{subtitle}</p>
    </div>
  );
}
