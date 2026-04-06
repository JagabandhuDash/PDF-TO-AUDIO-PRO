import { useState, useRef } from "react";
import * as pdfjsLib from "pdfjs-dist";

// Setup PDF worker for scanning PDFs
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

export default function OcrExtract() {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState("idle");
  const [ocrResult, setOcrResult] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [ocrLang, setOcrLang] = useState("eng"); 
  const inputRef = useRef();

  const languages = [
    { code: "eng", name: "English" },
    { code: "spa", name: "Spanish" },
    { code: "fra", name: "French" },
    { code: "deu", name: "German" },
    { code: "ita", name: "Italian" },
  ];

  const handleFile = (f) => {
    if (f && (f.type.startsWith("image/") || f.type === "application/pdf")) {
      setFile(f);
      setStatus("idle");
      setOcrResult(null);
      setErrorMsg("");
    } else {
      setErrorMsg("Please upload a valid Image or Scanned PDF.");
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFile(e.dataTransfer.files[0]);
  };

  const handleConvert = async () => {
    if (!file) return;
    setStatus("loading");
    setErrorMsg("");
    const formData = new FormData();

    try {
      let payloadFile = file;

      if (file.type === "application/pdf") {
        setErrorMsg("Pre-processing PDF to image..."); 
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        const page = await pdf.getPage(1); 
        const viewport = page.getViewport({ scale: 2.0 }); 
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        canvas.height = viewport.height;
        canvas.width = viewport.width;
        
        await page.render({ canvasContext: ctx, viewport }).promise;
        const blob = await new Promise(resolve => canvas.toBlob(resolve, "image/jpeg", 0.95));
        payloadFile = new File([blob], "scanned_page.jpg", { type: "image/jpeg" });
        setErrorMsg(""); 
      }

      formData.append("imageFile", payloadFile);
      formData.append("ocrLang", ocrLang); 
      
      const res = await fetch("http://localhost:5000/convert/ocr", { method: "POST", body: formData });
      if (!res.ok) throw new Error("OCR failed. Ensure the document is clear.");
      
      const data = await res.json();
      setOcrResult(data);
      setStatus("done");
    } catch (err) {
      setErrorMsg(err.message || "Something went wrong.");
      setStatus("error");
    }
  };

  const copyToClipboard = () => {
    if (ocrResult?.text) {
      navigator.clipboard.writeText(ocrResult.text);
      alert("Text copied to clipboard!");
    }
  };

  return (
    <div className="w-full bg-ink-900 border border-ink-700 rounded-2xl p-8 shadow-2xl animate-fade-in">
      <div
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`cursor-pointer rounded-xl border-2 border-dashed transition-all duration-300 p-8 flex flex-col items-center gap-3 ${dragging ? "border-purple-400 bg-purple-400/5 scale-[1.02]" : "border-ink-700 hover:border-purple-500 hover:bg-ink-800"}`}
      >
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-purple-500/10 text-purple-400 transition-colors duration-300">
          {file ? (file.type === "application/pdf" ? "📄" : "🖼️") : "⬆️"}
        </div>
        {file ? (
          <div className="animate-fade-in text-center">
            <p className="text-sm font-medium text-white truncate max-w-xs">{file.name}</p>
            <p className="text-xs text-ink-600">{(file.size / 1024).toFixed(1)} KB</p>
          </div>
        ) : (
          <div className="animate-fade-in text-center">
            <p className="text-sm text-white font-medium">Drop Image or Scan</p>
            <p className="text-xs text-ink-600">or click to browse</p>
          </div>
        )}
        <input ref={inputRef} type="file" accept="image/*,application/pdf" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
      </div>

      <div className="mt-6">
        <label className="block text-xs font-mono text-ink-500 uppercase tracking-wider mb-2 ml-1">Document Language</label>
        <select value={ocrLang} onChange={(e) => setOcrLang(e.target.value)} disabled={status === "loading"} className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-purple-500 transition-colors">
          {languages.map((lang) => <option key={lang.code} value={lang.code}>{lang.name}</option>)}
        </select>
      </div>

      {errorMsg && <p className="mt-3 text-xs text-rose-400 text-center animate-fade-in">{errorMsg}</p>}

      <button
        onClick={handleConvert}
        disabled={!file || status === "loading"}
        className={`relative overflow-hidden mt-6 w-full py-3 rounded-xl font-semibold text-sm transition-all duration-500 ease-in-out
          ${!file || status === "loading" ? "bg-ink-800 text-ink-600 cursor-not-allowed" : "text-white shadow-lg hover:opacity-90"}
        `}
      >
        <div className={`absolute inset-0 transition-opacity duration-500 ${file && status !== 'loading' ? "opacity-100" : "opacity-0"} bg-gradient-to-r from-purple-500 to-pink-500`} />
        <span className="relative z-10">{status === "loading" ? "Scanning..." : "Extract Text"}</span>
      </button>

      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${status === "done" && ocrResult ? "max-h-[400px] opacity-100 mt-6" : "max-h-0 opacity-0 mt-0"}`}>
        {ocrResult && (
          <div className="space-y-4">
             <div className="flex justify-between items-center px-1">
                <p className="text-xs font-mono text-purple-400 tracking-wider uppercase font-semibold">Extraction complete</p>
                <div className="flex gap-3 text-xs font-mono text-ink-500">
                  <span>{ocrResult.wordCount} words</span>
                  <span>{ocrResult.confidence}% match</span>
                </div>
              </div>
            <textarea readOnly value={ocrResult.text} className="w-full h-40 bg-ink-950 border border-ink-800 rounded-lg p-4 text-sm text-ink-300 focus:outline-none resize-none" />
            <button onClick={copyToClipboard} className="w-full py-3 rounded-xl font-semibold text-sm bg-ink-800 hover:bg-ink-700 text-white border border-ink-700 transition-colors">
              Copy to Clipboard
            </button>
          </div>
        )}
      </div>
    </div>
  );
}