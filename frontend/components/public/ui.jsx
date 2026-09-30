export function SectionHeading({ eyebrow, title, subtitle, center = false }) {
  return (
    <div className={`mb-10 ${center ? 'text-center' : ''}`}>
      {eyebrow && (
        <p className="mb-2 text-xs font-semibold uppercase tracking-[0.2em] text-gold-600">{eyebrow}</p>
      )}
      <h2 className="font-display text-3xl font-semibold text-navy-900 sm:text-4xl">{title}</h2>
      {subtitle && <p className={`mt-3 text-ink-600 ${center ? 'mx-auto max-w-2xl' : 'max-w-2xl'}`}>{subtitle}</p>}
    </div>
  );
}

export function StatBlock({ value, label }) {
  return (
    <div className="text-center">
      <p className="font-display text-3xl font-bold text-navy-900 sm:text-4xl">{value}</p>
      <p className="mt-1 text-xs uppercase tracking-wide text-ink-400 sm:text-sm">{label}</p>
    </div>
  );
}

/** Simple hand-drawn-style SVG illustration of a campus building — original, no external assets */
export function CampusIllustration({ className = '' }) {
  return (
    <svg viewBox="0 0 480 360" className={className} fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="240" cy="330" rx="200" ry="16" fill="#0c1526" opacity="0.08" />
      {/* Main building */}
      <rect x="110" y="140" width="260" height="170" rx="4" fill="#14213d" />
      <rect x="110" y="140" width="260" height="170" rx="4" stroke="#c9a227" strokeOpacity="0.4" />
      {/* Pediment / roof */}
      <path d="M90 140 L240 70 L390 140 Z" fill="#1c2d50" />
      <path d="M90 140 L240 70 L390 140 Z" stroke="#c9a227" strokeOpacity="0.5" />
      {/* Columns */}
      {[140, 180, 220, 260, 300, 340].map((x, i) => (
        <rect key={i} x={x} y="160" width="14" height="120" fill="#dcbc52" opacity="0.85" />
      ))}
      {/* Steps */}
      <rect x="80" y="300" width="320" height="10" fill="#0c1526" opacity="0.25" />
      <rect x="95" y="310" width="290" height="10" fill="#0c1526" opacity="0.18" />
      {/* Door */}
      <rect x="222" y="230" width="36" height="50" rx="2" fill="#0c1526" />
      {/* Emblem on pediment */}
      <circle cx="240" cy="115" r="14" fill="#c9a227" />
      <text x="240" y="120" fontSize="12" fontWeight="700" fill="#0c1526" textAnchor="middle" fontFamily="serif">CC</text>
      {/* Flag */}
      <line x1="240" y1="70" x2="240" y2="30" stroke="#14213d" strokeWidth="3" />
      <path d="M240 30 L272 38 L240 46 Z" fill="#b3261e" />
      {/* Trees */}
      <circle cx="60" cy="270" r="22" fill="#2f7a4d" opacity="0.85" />
      <rect x="56" y="285" width="8" height="20" fill="#5b3a1e" />
      <circle cx="420" cy="270" r="22" fill="#2f7a4d" opacity="0.85" />
      <rect x="416" y="285" width="8" height="20" fill="#5b3a1e" />
    </svg>
  );
}
