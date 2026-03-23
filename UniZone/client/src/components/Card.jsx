export default function Card({ children }) {
  return <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm hover:shadow-md transition-shadow duration-200">{children}</div>;
}
