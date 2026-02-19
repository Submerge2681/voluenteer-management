'use client';

export default function PrintButton() {
  return (
    <button 
      onClick={() => window.print()} 
      className="px-6 py-2 bg-slate-800 text-white rounded hover:bg-slate-900 shadow-lg"
    >
      Print / Save as PDF
    </button>
  );
}