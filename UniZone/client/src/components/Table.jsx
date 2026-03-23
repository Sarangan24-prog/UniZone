export default function Table({ columns, rows }) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-gray-100 bg-white shadow-sm">
      <table className="min-w-full text-left text-sm">
        <thead className="bg-gradient-to-r from-gray-50 to-gray-50/50">
          <tr>
            {columns.map((c) => (
              <th key={c.key} className="px-6 py-4 text-xs font-bold uppercase tracking-wider text-gray-700">{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {rows.map((r, idx) => (
            <tr key={r._id || idx} className="hover:bg-gray-50/50 transition-colors duration-150">
              {columns.map((c) => (
                <td key={c.key} className="px-6 py-4 text-gray-800 font-medium">
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
