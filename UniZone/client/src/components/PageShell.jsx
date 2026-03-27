export default function PageShell({ title, subtitle, right, children }) {
  return (
    <div className="premium-bg min-h-screen text-slate-100 selection:bg-blue-500/40">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative z-10">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-10 animate-in fade-in slide-in-from-top-4 duration-1000">
          <div className="space-y-2">
            <h1 className="text-5xl font-black tracking-tighter text-white drop-shadow-2xl">
              {title}
            </h1>
            {subtitle && (
              <p className="text-lg font-bold text-slate-400 max-w-2xl leading-relaxed">
                {subtitle}
              </p>
            )}
          </div>
          {right && (
            <div className="flex flex-wrap gap-4 items-center animate-in fade-in zoom-in-95 duration-500 delay-200">
              {right}
            </div>
          )}
        </div>

        <div className="animate-in fade-in slide-in-from-bottom-6 duration-800 delay-300">
          {children}
        </div>
      </main>
    </div>
  );
}
