import { X, AlertCircle, Loader2, ChevronDown } from 'lucide-react'

// ── Modal ─────────────────────────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, size = 'md' }) {
  if (!open) return null
  const widths = { sm: 'max-w-md', md: 'max-w-lg', lg: 'max-w-2xl', xl: 'max-w-3xl' }
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className={`relative w-full ${widths[size]} card animate-slide-up max-h-[90vh] flex flex-col`}>
        <div className="flex items-center justify-between p-5 border-b border-surface-600">
          <h2 className="font-display font-semibold text-lg text-white">{title}</h2>
          <button onClick={onClose} className="text-surface-300 hover:text-white transition-colors p-1 rounded-lg hover:bg-surface-600">
            <X size={18} />
          </button>
        </div>
        <div className="overflow-y-auto p-5 flex-1">{children}</div>
      </div>
    </div>
  )
}

// ── Confirm Dialog ────────────────────────────────────────────────────────────
export function ConfirmDialog({ open, onClose, onConfirm, title, message, loading }) {
  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-sm card animate-slide-up p-6 flex flex-col gap-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-xl bg-red-900/40 flex items-center justify-center flex-shrink-0">
            <AlertCircle size={20} className="text-red-400" />
          </div>
          <div>
            <h3 className="font-display font-semibold text-white">{title}</h3>
            <p className="text-surface-200 text-sm mt-1">{message}</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={onClose} className="btn-secondary">Cancel</button>
          <button onClick={onConfirm} disabled={loading}
            className="bg-red-700 hover:bg-red-600 text-white font-display font-semibold
                       px-4 py-2.5 rounded-xl transition-all duration-150 text-sm active:scale-95
                       disabled:opacity-50 flex items-center gap-2">
            {loading && <Loader2 size={14} className="animate-spin" />}
            Confirm
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Spinner ───────────────────────────────────────────────────────────────────
export function Spinner({ size = 20, className = '' }) {
  return <Loader2 size={size} className={`animate-spin text-brand-500 ${className}`} />
}

// ── Empty State ───────────────────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
      <div className="w-16 h-16 rounded-2xl bg-surface-700 border border-surface-600 flex items-center justify-center">
        {Icon && <Icon size={28} className="text-surface-300" />}
      </div>
      <div>
        <p className="font-display font-semibold text-white text-lg">{title}</p>
        {description && <p className="text-surface-200 text-sm mt-1">{description}</p>}
      </div>
      {action}
    </div>
  )
}

// ── Badge ─────────────────────────────────────────────────────────────────────
export function Badge({ label, className = '' }) {
  return <span className={`badge ${className}`}>{label}</span>
}

// ── FormField ─────────────────────────────────────────────────────────────────
export function FormField({ label, error, children, required }) {
  return (
    <div className="flex flex-col gap-1.5">
      {label && (
        <label className="label">
          {label}{required && <span className="text-brand-400 ml-0.5">*</span>}
        </label>
      )}
      {children}
      {error && <p className="text-red-400 text-xs mt-0.5">{error}</p>}
    </div>
  )
}

// ── Select ────────────────────────────────────────────────────────────────────
export function Select({ className = '', children, ...props }) {
  return (
    <div className="relative">
      <select
        className={`input appearance-none pr-9 cursor-pointer ${className}`}
        {...props}
      >
        {children}
      </select>
      <ChevronDown size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-300 pointer-events-none" />
    </div>
  )
}

// ── Page Header ───────────────────────────────────────────────────────────────
export function PageHeader({ title, subtitle, action }) {
  return (
    <div className="flex items-start justify-between gap-4 mb-6">
      <div>
        <h1 className="font-display font-bold text-2xl text-white">{title}</h1>
        {subtitle && <p className="text-surface-200 text-sm mt-1">{subtitle}</p>}
      </div>
      {action && <div className="flex-shrink-0">{action}</div>}
    </div>
  )
}

// ── Stats Card ────────────────────────────────────────────────────────────────
export function StatCard({ label, value, icon: Icon, color = 'brand', trend }) {
  const colors = {
    brand:  'bg-brand-500/15 text-brand-400',
    green:  'bg-green-500/15 text-green-400',
    blue:   'bg-blue-500/15 text-blue-400',
    purple: 'bg-purple-500/15 text-purple-400',
  }
  return (
    <div className="stat-card animate-slide-up">
      <div className="flex items-center justify-between">
        <span className="text-surface-200 text-sm font-body">{label}</span>
        {Icon && (
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${colors[color]}`}>
            <Icon size={16} />
          </div>
        )}
      </div>
      <div>
        <p className="font-display font-bold text-3xl text-white">{value}</p>
        {trend && <p className="text-surface-300 text-xs mt-1">{trend}</p>}
      </div>
    </div>
  )
}

// ── Table Wrapper ─────────────────────────────────────────────────────────────
export function Table({ headers, children, loading, empty }) {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-surface-700/50 border-b border-surface-600">
            <tr>
              {headers.map((h) => <th key={h} className="th">{h}</th>)}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={headers.length} className="td text-center py-12">
                <Spinner className="mx-auto" />
              </td></tr>
            ) : children}
          </tbody>
        </table>
        {empty}
      </div>
    </div>
  )
}
