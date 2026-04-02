import React from 'react';

export default function Tabs({ tabs, activeTab, onChange }) {
  return (
    <div className="flex space-x-2 overflow-x-auto pb-4 mb-6 hidden-scrollbar border-b border-white/10">
      {tabs.map((tab, idx) => {
        const isActive = activeTab === idx;
        return (
          <button
            key={idx}
            onClick={() => onChange(idx)}
            className={`px-5 py-2.5 text-sm font-bold rounded-xl transition-all duration-300 ease-out whitespace-nowrap ${
              isActive 
                ? 'bg-blue-600 text-white shadow-[0_0_20px_rgba(37,99,235,0.4)] ring-1 ring-white/20 scale-105' 
                : 'text-slate-400 bg-white/5 hover:text-white hover:bg-white/10'
            }`}
          >
            {tab}
          </button>
        );
      })}
    </div>
  );
}
