export default function PageShell({ title, subtitle, right, children }) {
  return (
    <div className="min-h-[calc(100vh-56px)] bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 tracking-tight">{title}</h1>
            {subtitle && <p className="mt-2 text-sm text-gray-500 font-medium">{subtitle}</p>}
          </div>
          {right && <div className="flex flex-wrap gap-3">{right}</div>}
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
