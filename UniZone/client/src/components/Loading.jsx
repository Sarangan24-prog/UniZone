export default function Loading({ label = "Loading..." }) {
  return (
    <div className="rounded-3xl border border-white/5 bg-slate-900/40 p-12 text-center backdrop-blur-xl shadow-2xl animate-in fade-in duration-700">
      <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-white/10 border-t-blue-500 mb-6 drop-shadow-[0_0_15px_rgba(59,130,246,0.5)]"></div>
      <p className="text-sm font-black tracking-widest uppercase text-slate-400">{label}</p>
    </div>
  );
}
