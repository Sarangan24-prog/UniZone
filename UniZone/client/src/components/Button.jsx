export default function Button({ variant = "primary", className = "", ...props }) {
  const base = "inline-flex items-center justify-center rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  const styles = {
    primary: "bg-gradient-to-br from-blue-600 via-indigo-700 to-purple-800 text-white hover:from-blue-500 hover:to-indigo-600 shadow-[0_10px_40px_-10px_rgba(37,99,235,0.4)] focus:ring-blue-600",
    outline: "border-2 border-white/10 text-white hover:bg-white/10 active:scale-95",
    danger: "bg-gradient-to-br from-rose-600 via-red-700 to-orange-800 text-white hover:from-rose-500 hover:to-red-600 shadow-[0_10px_40px_-10px_rgba(225,29,72,0.4)] focus:ring-rose-500"
  };
  return <button className={`${base} ${styles[variant]} ${className}`} {...props} />;
}
