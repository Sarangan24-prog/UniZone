export default function Table({ columns, rows, glass = false }) {
  const baseWrapper = "overflow-x-auto rounded-3xl shadow-2xl transition-all duration-300";
  const wrapperStyle = glass 
    ? "glass border-white/10" 
    : "border border-gray-100 bg-white";

  const theadStyle = glass
    ? "bg-slate-900/50"
    : "bg-gradient-to-r from-gray-50 to-gray-50/50";

  const thStyle = glass ? "text-slate-300" : "text-gray-700";
  const trHoverStyle = glass ? "hover:bg-white/5" : "hover:bg-gray-50/50";
  const tdStyle = glass ? "text-slate-200" : "text-gray-800";
  const divideStyle = glass ? "divide-white/5" : "divide-gray-100";

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
