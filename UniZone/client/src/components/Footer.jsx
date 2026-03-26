export default function Footer() {
  return (
    <footer className="w-full border-t border-gray-800 bg-gray-900 text-gray-100 shadow-inner shadow-black/20">
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex min-h-[220px] flex-col justify-between gap-6 py-8 sm:min-h-[200px] sm:py-10 lg:flex-row lg:items-start lg:gap-12">
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <p className="text-2xl font-bold text-white">UniZone</p>
            <p className="mt-1 text-sm font-light text-gray-300">Smart university management platform</p>
          </div>

          <div className="flex flex-col items-center gap-4 text-center lg:items-center lg:text-center">
            <nav className="flex flex-wrap justify-center gap-4 text-sm font-medium">
              <a href="/courses" className="text-gray-300 hover:text-white hover:underline transition-colors duration-200">Courses</a>
              <a href="/events" className="text-gray-300 hover:text-white hover:underline transition-colors duration-200">Events</a>
              <a href="/sports" className="text-gray-300 hover:text-white hover:underline transition-colors duration-200">Sports</a>
              <a href="/services" className="text-gray-300 hover:text-white hover:underline transition-colors duration-200">Services</a>
            </nav>

            <div className="flex items-center gap-3 text-gray-400">
              <span className="h-8 w-8 rounded-full bg-gray-700/60 text-center leading-8 text-xs font-semibold">GH</span>
              <span className="h-8 w-8 rounded-full bg-gray-700/60 text-center leading-8 text-xs font-semibold">IN</span>
            </div>
          </div>

          <div className="flex flex-col items-center text-center text-sm text-gray-400 lg:items-end lg:text-right">
            <span>© 2025 UniZone. All rights reserved.</span>
            <span className="mt-1 text-gray-500">Built for modern campus experiences.</span>
          </div>
        </div>

        <div className="hidden border-t border-gray-800 py-3 text-center text-xs text-gray-500 lg:block">
          Design aligned with UniZone style, responsive layout, and consistent spacing.
        </div>
      </div>
    </footer>
  );
}
