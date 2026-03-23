export default function Button({ variant = "primary", className = "", ...props }) {
  const base = "inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const styles = {
    primary: "bg-gradient-to-r from-gray-900 to-gray-800 text-white hover:from-gray-800 hover:to-gray-700 shadow-md hover:shadow-lg focus:ring-gray-900",
    outline: "border-2 border-gray-200 text-gray-700 hover:border-gray-300 hover:bg-gray-50 focus:ring-gray-500",
    danger: "bg-gradient-to-r from-red-600 to-red-500 text-white hover:from-red-500 hover:to-red-400 shadow-md hover:shadow-lg focus:ring-red-500"
  };
  return <button className={`${base} ${styles[variant]} ${className}`} {...props} />;
}
