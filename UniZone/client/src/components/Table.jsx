export default function Table({ columns, rows, glass = false }) {
  const baseWrapper = "overflow-x-auto rounded-3xl shadow-2xl transition-all duration-300";
  const wrapperStyle = glass 
    ? "glass border-white/10" 
    : "glass-dark border border-white/5 shadow-2xl";

  const theadStyle = "bg-slate-950/40 border-b border-white/5";

  const thStyle = "text-slate-400";
  const trHoverStyle = "hover:bg-white/5";
  const tdStyle = "text-slate-200";
  const divideStyle = "divide-white/5";

  return (
    <div className={`${baseWrapper} ${wrapperStyle}`}>
      <table className="min-w-full text-left text-sm">
        <thead className={theadStyle}>
          <tr>
            {columns.map((c) => (
              <th key={c.key} className={`px-6 py-4 text-xs font-bold uppercase tracking-wider ${thStyle}`}>
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className={`divide-y ${divideStyle}`}>
          {rows.map((r, idx) => (
            <tr key={r._id || idx} className={`transition-colors duration-150 ${trHoverStyle}`}>
              {columns.map((c) => (
                <td key={c.key} className={`px-6 py-4 font-medium ${tdStyle}`}>
                  {c.render ? c.render(r) : r[c.key]}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
