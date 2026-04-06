// client/src/components/PdfTOAudio.jsx
import { useState, useRef } from "react";

export default function PdfTOAudio() {
  const [file, setFile] = useState(null);
  const [dragging, setDragging] = useState(false);
  const [status, setStatus] = useState("idle");
  const [audioUrl, setAudioUrl] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");
  const inputRef = useRef();

  const handleFile = (f) => {
    if (f && f.type === "application/pdf") {
      setFile(f);
      setStatus("idle");
      setAudioUrl(null);
      setErrorMsg("");
    } else {
      setErrorMsg("Please upload a valid PDF file.");
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
    formData.append("pdfFile", file);

    try {
      const res = await fetch("http://localhost:5000/api/convert", { method: "POST", body: formData });
      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || "Conversion failed");
      }
      const blob = await res.blob();
      setAudioUrl(URL.createObjectURL(blob));
      setStatus("done");
    } catch (err) {
      setErrorMsg(err.message || "Something went wrong.");
      setStatus("error");
    }
  };

  return (
    <div className="w-full bg-ink-900 border border-ink-700 rounded-2xl p-8 shadow-2xl animate-fade-in">
      <div
        onClick={() => inputRef.current.click()}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        className={`cursor-pointer rounded-xl border-2 border-dashed transition-all duration-300 p-8 flex flex-col items-center gap-3 ${dragging ? "border-electric-400 bg-electric-400/5 scale-[1.02]" : "border-ink-700 hover:border-electric-500 hover:bg-ink-800"}`}
      >
        <div className="w-12 h-12 rounded-full flex items-center justify-center text-2xl bg-emerald-500/10 text-emerald-400 transition-colors duration-300">
          {file ? "📄" : "⬆️"}
        </div>
        {file ? (
          <div className="animate-fade-in text-center">
            <p className="text-sm font-medium text-white truncate max-w-xs">{file.name}</p>
            <p className="text-xs text-ink-600">{(file.size / 1024).toFixed(1)} KB · Click to change</p>
          </div>
        ) : (
          <div className="animate-fade-in text-center">
            <p className="text-sm text-white font-medium">Drop your standard PDF here</p>
            <p className="text-xs text-ink-600">or click to browse</p>
          </div>
        )}
        <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={(e) => handleFile(e.target.files[0])} />
      </div>

      {errorMsg && <p className="mt-3 text-xs text-rose-400 text-center animate-fade-in">{errorMsg}</p>}

      <button
        onClick={handleConvert}
        disabled={!file || status === "loading"}
        className={`relative overflow-hidden mt-6 w-full py-3 rounded-xl font-semibold text-sm transition-all duration-500 ease-in-out
          ${!file || status === "loading" ? "bg-ink-800 text-ink-600 cursor-not-allowed" : "text-white shadow-lg hover:opacity-90"}
        `}
      >
        <div className={`absolute inset-0 transition-opacity duration-500 ${file && status !== 'loading' ? "opacity-100" : "opacity-0"} bg-gradient-to-r from-electric-500 to-emerald-500`} />
        <span className="relative z-10">
          {status === "loading" ? "Converting..." : "Convert to Audio"}
        </span>
      </button>

      {/* Success UI */}
      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${status === "done" && audioUrl ? "max-h-64 opacity-100 mt-6" : "max-h-0 opacity-0 mt-0"}`}>
        <p className="text-xs font-mono text-emerald-400 text-center tracking-wider uppercase rounded-xl font-semibold mb-3">Conversion complete</p>
        <audio controls src={audioUrl || ""} className="w-full rounded-lg" />
        <button
          onClick={() => {
            const link = document.createElement("a");
            link.href = audioUrl;
            link.download = "converted_audio.mp3";
            link.click();
          }}
          className="w-full py-3 rounded-xl font-semibold text-sm tracking-wide transition-all duration-200 bg-ink-800 hover:bg-ink-700 text-white mt-4 border border-ink-700"
        >
          Download MP3
        </button>
      </div>
    </div>
  );
}