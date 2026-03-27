export default function Modal({ open, title, onClose, children, footer }) {
  if (!open) return null;
  return (
    <div onClick={onClose} className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-2xl rounded-2xl bg-white shadow-2xl animate-in zoom-in-95 duration-200">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
          <button onClick={onClose} className="rounded-xl p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-50 transition-colors duration-200">✕</button>
        </div>
        <div className="p-6">{children}</div>
        {footer && <div className="border-t border-gray-100 px-6 py-4 bg-gray-50/50 rounded-b-2xl">{footer}</div>}
      </div>
    </div>
  );
}
