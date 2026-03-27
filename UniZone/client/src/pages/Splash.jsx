import { useEffect } from "react";

export default function Splash({ onFinish }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 1800);

    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <div className="flex items-center justify-center h-screen bg-gradient-to-r from-blue-500 to-indigo-600">
      <div className="text-center text-white">
        
        {/* Main Title */}
        <h1 className="text-6xl font-extrabold tracking-wide animate-fadeIn">
          UniZone
        </h1>

        {/* Subtitle */}
        <p className="mt-4 text-xl animate-slideUp">
          Welcome to UniZone 🎓
        </p>

        {/* Icon */}
        <div className="text-5xl mt-6 animate-bounce">
          📚
        </div>

      </div>
    </div>
  );
}