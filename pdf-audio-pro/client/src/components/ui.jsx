import { useRef, useState } from 'react'

/* ── DropZone ─────────────────────────────────────────────── */
export function DropZone({ accept, onFile, fileName, icon, hint, maxMB }) {
  const inputRef = useRef()
  const [active, setActive] = useState(false)

  function handleDrop(e) {
    e.preventDefault()
    setActive(false)
    const file = e.dataTransfer.files[0]
    if (file) onFile(file)
  }

  function handleChange(e) {
    const file = e.target.files[0]
    if (file) onFile(file)
  }

  return (
    <div
      className={`drop-zone rounded-xl p-8 text-center cursor-pointer ${active ? 'active' : ''}`}
      onClick={() => inputRef.current.click()}
      onDragOver={(e) => { e.preventDefault(); setActive(true) }}
      onDragLeave={() => setActive(false)}
      onDrop={handleDrop}
    >
      <input ref={inputRef} type="file" accept={accept} className="hidden" onChange={handleChange} />
      <div className="text-3xl mb-3">{icon}</div>
      <p className={`font-mono text-sm font-bold mb-1 ${fileName ? 'text-electric-400' : 'text-slate-400'}`}>
        {fileName || 'Drop file here or click to browse'}
      </p>
      <p className="text-xs text-slate-600">{hint} · Max {maxMB}MB</p>
    </div>
  )
}

/* ── StatusBadge ──────────────────────────────────────────── */
export function StatusBadge({ type, message }) {
  if (!message) return null
  const styles = {
    loading: 'text-electric-400 border-electric-400/20 bg-electric-400/5',
    success: 'text-emerald-400 border-emerald-400/20 bg-emerald-400/5',
    error:   'text-rose-400   border-rose-400/20   bg-rose-400/5',
  }
  return (
    <div className={`mt-4 px-4 py-2.5 rounded-lg border text-sm font-mono animate-fade-up ${styles[type] || styles.loading}`}>
      {type === 'loading' && <span className="mr-2 animate-spin-slow inline-block">◌</span>}
      {type === 'success' && <span className="mr-2">✓</span>}
      {type === 'error'   && <span className="mr-2">✗</span>}
      {message}
    </div>
  )
}

/* ── ProgressBar ──────────────────────────────────────────── */
export function ProgressBar({ active, label }) {
  if (!active) return null
  return (
    <div className="mt-3 mb-1 animate-fade-up">
      <p className="text-xs font-mono text-slate-500 mb-1.5">{label || 'Processing...'}</p>
      <div className="h-0.5 bg-ink-700 rounded-full overflow-hidden">
        <div className="shimmer-bar h-full w-full rounded-full animate-pulse-bar" />
      </div>
    </div>
  )
}

/* ── SectionLabel ─────────────────────────────────────────── */
export function SectionLabel({ children }) {
  return (
    <label className="block text-xs font-mono font-bold text-slate-500 uppercase tracking-widest mb-2">
      {children}
    </label>
  )
}

/* ── ActionButton ─────────────────────────────────────────── */
export function ActionButton({ onClick, disabled, loading, children, color = 'electric' }) {
  const colors = {
    electric: 'border-electric-400/40 text-electric-400 hover:bg-electric-400/10',
    amber:    'border-amber-400/40    text-amber-400    hover:bg-amber-400/10',
    emerald:  'border-emerald-400/40  text-emerald-400  hover:bg-emerald-400/10',
    rose:     'border-rose-400/40     text-rose-400     hover:bg-rose-400/10',
  }
  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`
        btn w-full py-3 rounded-xl border font-mono text-sm font-bold
        tracking-wide transition-all duration-200
        ${colors[color]}
      `}
    >
      {loading ? (
        <span className="flex items-center justify-center gap-2">
          <span className="animate-spin-slow">◌</span>
          {typeof children === 'string' ? children.replace(/^.+?(?=\s)/, 'Working...') : 'Working...'}
        </span>
      ) : children}
    </button>
  )
}