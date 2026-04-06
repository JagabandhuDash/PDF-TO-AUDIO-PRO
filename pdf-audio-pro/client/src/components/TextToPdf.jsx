import { useState } from "react";

export default function TextToPdf() {
  const [text, setText] = useState("");
  const [title, setTitle] = useState("");
  const [fontFamily, setFontFamily] = useState("sans");
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const handleGenerate = async () => {
    if (!text.trim()) {
      setErrorMsg("Please enter some text to convert.");
      return;
    }
    
    setStatus("loading");
    setErrorMsg("");

    try {
      const res = await fetch("http://localhost:5000/convert/text-to-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          text, 
          title, 
          fontFamily,
          fontSize: 12,
          lineSpacing: 4
        }),
      });

      if (!res.ok) throw new Error("Failed to generate PDF");

      // We expect a PDF file back, so we parse it as a blob
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      
      // Auto-trigger the download
      const link = document.createElement("a");
      link.href = url;
      link.download = `${title || "document"}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
      
      setStatus("done");
      setTimeout(() => setStatus("idle"), 3000); // Reset button after 3 seconds
      
    } catch (err) {
      setErrorMsg(err.message || "Something went wrong.");
      setStatus("error");
    }
  };

  return (
    <div className="w-full bg-ink-900 border border-ink-700 rounded-2xl p-8 shadow-2xl animate-fade-in">
      
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-mono text-ink-500 uppercase tracking-wider mb-2 ml-1">Document Title (Optional)</label>
          <input 
            type="text" 
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. My Notes"
            className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
          />
        </div>

        <div>
          <label className="block text-xs font-mono text-ink-500 uppercase tracking-wider mb-2 ml-1">Font Style</label>
          <select 
            value={fontFamily} 
            onChange={(e) => setFontFamily(e.target.value)}
            className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors"
          >
            <option value="sans">Modern (Helvetica)</option>
            <option value="serif">Classic (Times Roman)</option>
            <option value="mono">Code (Courier)</option>
          </select>
        </div>

        <div>
           <label className="block text-xs font-mono text-ink-500 uppercase tracking-wider mb-2 ml-1">Document Content</label>
           <textarea 
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste the text you want to turn into a PDF..."
            className="w-full h-48 bg-ink-950 border border-ink-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-cyan-500 transition-colors resize-none"
          />
        </div>
      </div>

      {errorMsg && <p className="mt-3 text-xs text-rose-400 text-center animate-fade-in">{errorMsg}</p>}

      <button
        onClick={handleGenerate}
        disabled={!text.trim() || status === "loading"}
        className={`relative overflow-hidden mt-6 w-full py-3 rounded-xl font-semibold text-sm transition-all duration-500 ease-in-out
          ${!text.trim() || status === "loading" ? "bg-ink-800 text-ink-600 cursor-not-allowed" : "text-white shadow-lg hover:opacity-90"}
        `}
      >
        <div className={`absolute inset-0 transition-opacity duration-500 ${text.trim() && status !== 'loading' ? "opacity-100" : "opacity-0"} bg-gradient-to-r from-cyan-500 to-blue-500`} />
        <span className="relative z-10">
          {status === "loading" ? "Generating..." : status === "done" ? "Downloaded!" : "Generate PDF"}
        </span>
      </button>

    </div>
  );
}