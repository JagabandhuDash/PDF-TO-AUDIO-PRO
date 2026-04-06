import { useState } from "react";

export default function TextToAudio() {
  const [text, setText] = useState("");
  const [lang, setLang] = useState("en");
  const [status, setStatus] = useState("idle");
  const [audioUrl, setAudioUrl] = useState(null);
  const [errorMsg, setErrorMsg] = useState("");

  const handleConvert = async () => {
    if (!text.trim()) {
      setErrorMsg("Please enter some text to convert.");
      return;
    }
    
    setStatus("loading");
    setErrorMsg("");
    setAudioUrl(null);

    try {
      const res = await fetch("http://localhost:5000/convert/text-to-audio", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text, lang }),
      });

      if (!res.ok) throw new Error("Failed to generate audio");

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
      <div className="space-y-4">
        <div>
          <label className="block text-xs font-mono text-ink-500 uppercase tracking-wider mb-2 ml-1">Voice Accent / Language</label>
          <select 
            value={lang} 
            onChange={(e) => setLang(e.target.value)}
            disabled={status === "loading"}
            className="w-full bg-ink-950 border border-ink-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors"
          >
            <option value="en">English (US)</option>
            <option value="en-uk">English (UK)</option>
            <option value="en-au">English (Australia)</option>
            <option value="es">Spanish</option>
            <option value="fr">French</option>
            <option value="de">German</option>
            <option value="it">Italian</option>
            <option value="ja">Japanese</option>
          </select>
        </div>

        <div>
           <label className="block text-xs font-mono text-ink-500 uppercase tracking-wider mb-2 ml-1">Text to Read</label>
           <textarea 
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="Type or paste the text you want to listen to..."
            className="w-full h-48 bg-ink-950 border border-ink-800 rounded-xl p-4 text-sm text-white focus:outline-none focus:border-amber-500 transition-colors resize-none"
          />
        </div>
      </div>

      {errorMsg && <p className="mt-3 text-xs text-rose-400 text-center animate-fade-in">{errorMsg}</p>}

      <button
        onClick={handleConvert}
        disabled={!text.trim() || status === "loading"}
        className={`relative overflow-hidden mt-6 w-full py-3 rounded-xl font-semibold text-sm transition-all duration-500 ease-in-out
          ${!text.trim() || status === "loading" ? "bg-ink-800 text-ink-600 cursor-not-allowed" : "text-white shadow-lg hover:opacity-90"}
        `}
      >
        <div className={`absolute inset-0 transition-opacity duration-500 ${text.trim() && status !== 'loading' ? "opacity-100" : "opacity-0"} bg-gradient-to-r from-amber-500 to-orange-500`} />
        <span className="relative z-10">
          {status === "loading" ? "Generating Audio..." : "Read Text Aloud"}
        </span>
      </button>

      {/* Success UI */}
      <div className={`transition-all duration-500 ease-in-out overflow-hidden ${status === "done" && audioUrl ? "max-h-64 opacity-100 mt-6" : "max-h-0 opacity-0 mt-0"}`}>
        <p className="text-xs font-mono text-amber-400 text-center tracking-wider uppercase rounded-xl font-semibold mb-3">Audio Ready</p>
        <audio controls src={audioUrl || ""} className="w-full rounded-lg" />
        <button
          onClick={() => {
            const link = document.createElement("a");
            link.href = audioUrl;
            link.download = "text_audio.mp3";
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