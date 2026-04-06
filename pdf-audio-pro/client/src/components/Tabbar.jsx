export default function Tabbar({ activeMode, setActiveMode }) {
  return (
    <div className="relative flex bg-ink-900 rounded-xl p-1 mb-8 border border-ink-800 shadow-inner w-full max-w-2xl mx-auto hidden sm:flex">
      {/* Animated Sliding Background Pill - Now 1/4th width */}
      <div 
        className={`absolute top-1 bottom-1 w-1/4 bg-ink-800 rounded-lg shadow-sm border border-ink-700 transition-transform duration-300 ease-in-out
          ${activeMode === "pdf" ? "translate-x-0" : 
            activeMode === "ocr" ? "translate-x-[100%]" : 
            activeMode === "text-pdf" ? "translate-x-[200%]" : 
            "translate-x-[300%]"}
        `}
      />
      
      <button onClick={() => setActiveMode("pdf")} className={`relative z-10 flex-1 py-2 rounded-lg text-sm font-semibold transition-colors duration-300 ${activeMode === "pdf" ? "text-white" : "text-ink-500 hover:text-ink-300"}`}>
        PDF to Audio
      </button>
      
      <button onClick={() => setActiveMode("ocr")} className={`relative z-10 flex-1 py-2 rounded-lg text-sm font-semibold transition-colors duration-300 ${activeMode === "ocr" ? "text-white" : "text-ink-500 hover:text-ink-300"}`}>
        OCR Scanner
      </button>

      <button onClick={() => setActiveMode("text-pdf")} className={`relative z-10 flex-1 py-2 rounded-lg text-sm font-semibold transition-colors duration-300 ${activeMode === "text-pdf" ? "text-white" : "text-ink-500 hover:text-ink-300"}`}>
        Text to PDF
      </button>

      <button onClick={() => setActiveMode("text-audio")} className={`relative z-10 flex-1 py-2 rounded-lg text-sm font-semibold transition-colors duration-300 ${activeMode === "text-audio" ? "text-white" : "text-ink-500 hover:text-ink-300"}`}>
        Text to Audio
      </button>
    </div>
  );
}