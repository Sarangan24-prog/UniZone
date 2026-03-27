export default function PageShell({ title, subtitle, right, children }) {
  return (
    <div className="min-h-[calc(100vh-64px)] premium-bg">
      <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between mb-10 animate-in fade-in slide-in-from-top-4 duration-700">
          <div className="space-y-1">
            <h1 className="text-4xl font-extrabold text-white tracking-tight sm:text-5xl bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-slate-400">
              {title}
            </h1>
            {subtitle && (
              <p className="text-lg text-slate-400 font-medium max-w-2xl">
                {subtitle}
              </p>
            )}
          </div>
          {right && (
            <div className="flex flex-wrap gap-4 items-center animate-in fade-in zoom-in-95 duration-500 delay-150">
              {right}
            </div>
          )}
        </div>
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 delay-300">
          {children}
        </div>
      </div>
    </div>
  );
}
