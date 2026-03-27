export default function Footer() {
  return (
    <footer className="relative w-full border-t border-slate-700/50 bg-gradient-to-b from-slate-900 to-slate-950 text-slate-300">
      {/* Subtle top glow effect */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-slate-600/30 to-transparent"></div>

      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3 lg:gap-12">
          {/* Left Section - Brand */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <h2 className="text-2xl font-bold text-white tracking-tight">UniZone</h2>
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              Smart university management platform
            </p>
            <p className="mt-3 text-xs text-slate-500 font-medium">
              Built for students and admins
            </p>
          </div>

          {/* Middle Section - Navigation */}
          <div className="flex flex-col items-center text-center lg:items-center">
            <h3 className="mb-4 text-sm font-semibold text-slate-200 uppercase tracking-wider">
              Quick Links
            </h3>
            <nav className="flex flex-wrap justify-center gap-x-6 gap-y-3">
              <a
                href="/courses"
                className="text-sm text-slate-400 hover:text-white hover:underline hover:underline-offset-4 transition-all duration-200 font-medium"
              >
                Courses
              </a>
              <a
                href="/events"
                className="text-sm text-slate-400 hover:text-white hover:underline hover:underline-offset-4 transition-all duration-200 font-medium"
              >
                Events
              </a>
              <a
                href="/sports"
                className="text-sm text-slate-400 hover:text-white hover:underline hover:underline-offset-4 transition-all duration-200 font-medium"
              >
                Sports
              </a>
              <a
                href="/services"
                className="text-sm text-slate-400 hover:text-white hover:underline hover:underline-offset-4 transition-all duration-200 font-medium"
              >
                Services
              </a>
            </nav>
          </div>

          {/* Right Section - Copyright */}
          <div className="flex flex-col items-center text-center lg:items-end lg:text-right">
            <div className="text-sm text-slate-400">
              <p className="font-medium">© 2025 UniZone</p>
              <p className="mt-1 text-slate-500">All rights reserved</p>
            </div>
          </div>
        </div>

        {/* Bottom accent line */}
        <div className="mt-8 pt-6 border-t border-slate-800/50">
          <div className="flex items-center justify-center">
            <div className="h-px w-24 bg-gradient-to-r from-transparent via-slate-600/50 to-transparent"></div>
          </div>
        </div>
      </div>
    </footer>
  );
}
