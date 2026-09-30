'use client';

export function Card({ children, className = '' }) {
  return (
    <div className={`bg-white rounded-xl border border-navy-900/10 shadow-sm ${className}`}>
      {children}
    </div>
  );
}

export function Button({ children, variant = 'primary', className = '', ...props }) {
  const variants = {
    primary: 'bg-navy-900 text-white hover:bg-navy-800',
    gold: 'bg-gold-500 text-navy-950 hover:bg-gold-400',
    outline: 'bg-white text-navy-900 border border-navy-900/20 hover:bg-navy-900/5',
    danger: 'bg-danger-600 text-white hover:opacity-90',
    ghost: 'text-navy-900 hover:bg-navy-900/5',
  };
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function Badge({ children, tone = 'neutral' }) {
  const tones = {
    neutral: 'bg-navy-900/8 text-navy-900',
    success: 'bg-success-100 text-success-600',
    danger: 'bg-danger-100 text-danger-600',
    warn: 'bg-warn-100 text-warn-600',
    gold: 'bg-gold-100 text-gold-600',
  };
  return (
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${tones[tone]}`}>
      {children}
    </span>
  );
}

export function StatCard({ label, value, sub, icon: Icon }) {
  return (
    <Card className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-ink-400">{label}</p>
          <p className="mt-2 font-display text-3xl font-semibold text-navy-900">{value}</p>
          {sub && <p className="mt-1 text-xs text-ink-600">{sub}</p>}
        </div>
        {Icon && (
          <div className="rounded-lg bg-navy-900/5 p-2.5 text-navy-700">
            <Icon size={20} />
          </div>
        )}
      </div>
    </Card>
  );
}

export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="mb-6 flex flex-wrap items-end justify-between gap-3 border-b border-navy-900/10 pb-4">
      <div>
        <h1 className="font-display text-2xl font-semibold text-navy-900">{title}</h1>
        {subtitle && <p className="mt-1 text-sm text-ink-600">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function Modal({ open, onClose, title, children, wide = false }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/50 p-4" onClick={onClose}>
      <div
        className={`max-h-[90vh] w-full ${wide ? 'max-w-2xl' : 'max-w-md'} overflow-y-auto rounded-xl bg-white shadow-xl`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-navy-900/10 px-5 py-4">
          <h3 className="font-display text-lg font-semibold text-navy-900">{title}</h3>
          <button onClick={onClose} className="text-ink-400 hover:text-ink-900">✕</button>
        </div>
        <div className="p-5">{children}</div>
      </div>
    </div>
  );
}

export function Input({ label, className = '', ...props }) {
  return (
    <label className="block">
      {label && <span className="mb-1 block text-xs font-medium text-ink-600">{label}</span>}
      <input
        className={`w-full rounded-lg border border-navy-900/15 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-navy-700 focus:ring-2 focus:ring-navy-700/15 ${className}`}
        {...props}
      />
    </label>
  );
}

export function Select({ label, children, className = '', ...props }) {
  return (
    <label className="block">
      {label && <span className="mb-1 block text-xs font-medium text-ink-600">{label}</span>}
      <select
        className={`w-full rounded-lg border border-navy-900/15 bg-white px-3 py-2 text-sm text-ink-900 outline-none focus:border-navy-700 focus:ring-2 focus:ring-navy-700/15 ${className}`}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}

export function EmptyState({ title, subtitle }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-navy-900/15 py-14 text-center">
      <p className="font-display text-lg text-navy-900">{title}</p>
      {subtitle && <p className="mt-1 max-w-sm text-sm text-ink-600">{subtitle}</p>}
    </div>
  );
}
