export default function Modal({ open, title, onClose, children, footer, className = "" }) {
  if (!open) return null;
  return (
    <div onClick={onClose} className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-2xl rounded-[32px] bg-slate-900/80 border border-white/10 shadow-[0_0_100px_rgba(0,0,0,0.8)] backdrop-blur-2xl animate-in zoom-in-95 duration-300 overflow-hidden ${className}`}
      >
        <div className="flex items-center justify-between border-b border-white/5 px-8 py-6 bg-white/5">
          <h3 className="text-xl font-black text-white uppercase tracking-tight">{title}</h3>
          <button
            onClick={onClose}
            className="rounded-xl p-2.5 text-slate-400 hover:text-white hover:bg-white/10 transition-all duration-300"
          >
            ✕
          </button>
        </div>
        <div className="p-8 font-medium text-slate-300">{children}</div>
        {footer && <div className="border-t border-white/5 px-8 py-6 bg-black/20">{footer}</div>}
      </div>
    </div>
  );
}
