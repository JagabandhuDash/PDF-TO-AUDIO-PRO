export default function Header() {
  return (
    
    <nav className="border-b border-ink-700 bg-ink-950 px-8 py-4 flex items-center justify-between fixed w-full z-10">
      <span className="font-display text-xl font-extrabold tracking-tight text-white">
        PDF<span className="text-electric-400">Audio</span>
        <span className="ml-1 text-xs font-mono text-ink-600 align-top">PRO</span>
      </span>
      <span className="text-xs font-mono text-ink-600">v2</span>
    </nav>
 
  );
}