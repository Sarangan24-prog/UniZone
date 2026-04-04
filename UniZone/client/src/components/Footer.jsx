export default function Footer() {
  const socials = [
    { 
      name: "Facebook", 
      href: "#", 
      svg: <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />,
      color: "hover:text-blue-500 hover:shadow-[0_0_20px_-5px_rgba(59,130,246,0.6)]" 
    },
    { 
      name: "Instagram", 
      href: "#", 
      svg: <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />,
      extraSvg: <><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" /><line x1="17.5" x2="17.51" y1="6.5" y2="6.5" /></>,
      color: "hover:text-pink-500 hover:shadow-[0_0_20px_-5px_rgba(236,72,153,0.6)]" 
    },
    { 
      name: "Youtube", 
      href: "#", 
      svg: <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.42a2.78 2.78 0 0 0-1.94 2C1 8.11 1 12 1 12s0 3.89.42 5.58a2.78 2.78 0 0 0 1.94 2C5.12 20 12 20 12 20s6.88 0 8.6-.42a2.78 2.78 0 0 0 1.94-2C23 15.89 23 12 23 12s0-3.89-.42-5.58z" />,
      extraSvg: <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" />,
      color: "hover:text-red-500 hover:shadow-[0_0_20px_-5px_rgba(239,68,68,0.6)]" 
    },
    { 
      name: "X", 
      href: "#", 
      svg: <path d="M4 4l11.733 16h4.267l-11.733 -16z" />,
      extraSvg: <path d="M4 20l6.768 -6.768m2.46 -2.46l6.772 -6.772" />,
      color: "hover:text-white hover:shadow-[0_0_20px_-5px_rgba(255,255,255,0.4)]" 
    },
  ];

  return (
    <footer className="relative w-full border-t border-slate-800/50 bg-[#0a0f1c] text-slate-300">
      {/* Premium top glow effect */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent"></div>

      <div className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-4 lg:gap-8">
          {/* Section 1: Brand Identity */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left space-y-4">
            <h2 className="text-3xl font-black text-white tracking-tighter flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-sm shadow-xl shadow-blue-900/20">
                UZ
              </div>
              UniZone
            </h2>
            <p className="max-w-xs text-sm text-slate-400 font-medium leading-relaxed italic">
              "The smarter way to manage your university life and thrive in your academic journey."
            </p>
            <div className="pt-2">
              <span className="inline-flex items-center px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] font-black uppercase tracking-widest text-emerald-400">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-2"></span>
                System Operational
              </span>
            </div>
          </div>

          {/* Section 2: Quick Navigation */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <h3 className="mb-6 text-xs font-black text-white uppercase tracking-[0.2em]">
              Navigation
            </h3>
            <ul className="space-y-4">
              {["Courses", "Events", "Sports", "Services"].map((item) => (
                <li key={item}>
                  <a
                    href={`/${item.toLowerCase()}`}
                    className="text-sm text-slate-400 hover:text-blue-400 transition-colors duration-300 font-bold group flex items-center gap-2"
                  >
                    <span className="w-0 group-hover:w-2 h-0.5 bg-blue-500 transition-all duration-300"></span>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Section 3: Social & Community */}
          <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
            <h3 className="mb-6 text-xs font-black text-white uppercase tracking-[0.2em]">
              Connect With Us
            </h3>
            <div className="flex items-center gap-4">
              {socials.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  className={`w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center transition-all duration-500 group relative ${social.color}`}
                  aria-label={social.name}
                >
                  <svg 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2" 
                    strokeLinecap="round" 
                    strokeLinejoin="round" 
                    className="w-5 h-5 transition-transform duration-500 group-hover:scale-110"
                  >
                    {social.svg}
                    {social.extraSvg}
                  </svg>
                  <span className="absolute -top-10 left-1/2 -translate-x-1/2 px-2 py-1 bg-slate-900 border border-white/10 rounded-lg text-[10px] font-black opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap">
                    {social.name}
                  </span>
                </a>
              ))}
            </div>
            <p className="mt-6 text-xs text-slate-500 font-medium">
              Join our growing community of 5000+ students.
            </p>
          </div>

          {/* Section 4: Support & Legal */}
          <div className="flex flex-col items-center text-center lg:items-end lg:text-right">
            <h3 className="mb-6 text-xs font-black text-white uppercase tracking-[0.2em]">
              Legal
            </h3>
            <ul className="space-y-4">
              {["Privacy Policy", "Terms of Service", "Help Center"].map((item) => (
                <li key={item}>
                  <a
                    href="#"
                    className="text-sm text-slate-400 hover:text-white transition-colors duration-300"
                  >
                    {item}
                  </a>
                </li>
              ))}
            </ul>
            <div className="mt-8 pt-8 border-t border-white/5 w-full lg:w-auto">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest leading-relaxed">
                © 2025 UniZone Platform<br />
                All Rights Reserved
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Extreme bottom accent line */}
      <div className="h-1 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 opacity-20"></div>
    </footer>
  );
}
