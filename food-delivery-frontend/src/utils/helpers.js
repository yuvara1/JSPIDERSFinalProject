export const formatCurrency = (amount) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(amount ?? 0)

export const formatDate = (dt) => {
  if (!dt) return '—'
  return new Date(dt).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

export const formatDateShort = (dt) => {
  if (!dt) return '—'
  return new Date(dt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export const ORDER_STATUSES = ['PENDING','CONFIRMED','PREPARING','OUT_FOR_DELIVERY','DELIVERED','CANCELLED']
export const PAYMENT_METHODS = ['UPI','CREDIT_CARD','CASH_ON_DELIVERY']
export const PAYMENT_STATUSES = ['PENDING','SUCCESS','FAILED','REFUNDED']

export const statusColor = (status) => {
  const map = {
    PENDING:          'bg-yellow-500/15 text-yellow-400 border border-yellow-500/20',
    CONFIRMED:        'bg-blue-500/15 text-blue-400 border border-blue-500/20',
    PREPARING:        'bg-orange-500/15 text-orange-400 border border-orange-500/20',
    OUT_FOR_DELIVERY: 'bg-purple-500/15 text-purple-400 border border-purple-500/20',
    DELIVERED:        'bg-green-500/15 text-green-400 border border-green-500/20',
    CANCELLED:        'bg-red-500/15 text-red-400 border border-red-500/20',
    SUCCESS:          'bg-green-500/15 text-green-400 border border-green-500/20',
    FAILED:           'bg-red-500/15 text-red-400 border border-red-500/20',
    REFUNDED:         'bg-surface-500/50 text-surface-100 border border-surface-400/30',
  }
  return map[status] ?? 'bg-surface-600 text-surface-200'
}

export const paymentMethodLabel = (m) => {
  const map = { UPI: 'UPI', CREDIT_CARD: 'Credit Card', CASH_ON_DELIVERY: 'Cash on Delivery' }
  return map[m] ?? m
}

export const getErrorMessage = (err) =>
  err?.response?.data?.message || err?.response?.data?.error || err?.message || 'Something went wrong'
