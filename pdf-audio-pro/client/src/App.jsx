import { useState } from "react";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Tabbar from "./components/Tabbar";
import PdfTOAudio from "./components/PdfTOAudio";
import OcrExtract from "./components/OcrExtract";
import TextToPdf from "./components/TextToPdf";
import TextToAudio from "./components/TextToAudio";

export default function App() {
  const [activeMode, setActiveMode] = useState("pdf"); 

  return (
    <div className="min-h-screen bg-ink-950 font-body text-white flex flex-col transition-colors duration-500">
      <Header />

      <main className="flex-1 flex flex-col items-center justify-center px-4 py-16 animate-fade-up">
        
       
        <div className="h-32 flex flex-col items-center justify-center mb-8 text-center">
          <p className="text-xs font-mono tracking-widest text-electric-400 uppercase mb-3">
            Hello World
          </p>
          
          <h1 className="font-display text-4xl md:text-5xl font-extrabold leading-tight">
            {activeMode === "pdf" && (
              <span className="animate-fade-in block">
                Turn any PDF into<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-electric-400 to-emerald-400">
                  crystal-clear audio
                </span>
              </span>
            )}
            
            {activeMode === "ocr" && (
              <span className="animate-fade-in block">
                Extract text from<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400">
                  images & scanned PDFs
                </span>
              </span>
            )}

            {activeMode === "text-pdf" && (
              <span className="animate-fade-in block">
                Generate instant PDFs<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-blue-400">
                  from raw text
                </span>
              </span>
            )}

            {activeMode === "text-audio" && (
              <span className="animate-fade-in block">
                Listen to any text<br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-orange-400">
                  with lifelike voices
                </span>
              </span>
            )}
          </h1>
        </div>
        {/* ---------------------------------- */}

        <Tabbar activeMode={activeMode} setActiveMode={setActiveMode} />

        <div className="w-full max-w-lg">
          {activeMode === "pdf" && <PdfTOAudio />}
          {activeMode === "ocr" && <OcrExtract />}
          {activeMode === "text-pdf" && <TextToPdf />}
          {activeMode === "text-audio" && <TextToAudio />}
        </div>

      </main>

      <Footer />
    </div>
  );
}