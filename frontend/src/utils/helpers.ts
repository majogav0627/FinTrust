export const formatCurrency = (amount: string | number): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return new Intl.NumberFormat('es-SV', {
    style: 'currency',
    currency: 'USD',
  }).format(num)
}

export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('es-SV', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(d)
}

export const formatDateTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date
  return new Intl.DateTimeFormat('es-SV', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

export const getRiskLevel = (balance: number, monthlyExpenses: number): 'low' | 'medium' | 'high' => {
  const monthsOfCoverage = balance / (monthlyExpenses || 1)
  if (monthsOfCoverage >= 3) return 'low'
  if (monthsOfCoverage >= 1) return 'medium'
  return 'high'
}

export const getPercentageChange = (current: number, previous: number): number => {
  if (previous === 0) return current > 0 ? 100 : 0
  return ((current - previous) / Math.abs(previous)) * 100
}

export const truncateText = (text: string, length: number): string => {
  return text.length > length ? `${text.substring(0, length)}...` : text
}

/**
 * Normaliza montos a exactamente 2 decimales
 * Resuelve problemas de precisión de punto flotante (ej: 1.99 * 3 = 5.97)
 */
export const normalizeAmount = (amount: number | string): string => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  if (isNaN(num)) return '0.00'
  return (Math.round(num * 100) / 100).toFixed(2)
}

/**
 * Valida que un monto tenga máximo 2 decimales
 */
export const isValidAmount = (amount: string | number): boolean => {
  const str = typeof amount === 'string' ? amount : String(amount)
  const decimalParts = str.split('.')
  if (decimalParts.length > 2) return false
  if (decimalParts.length === 2 && decimalParts[1].length > 2) return false
  return !isNaN(parseFloat(str)) && parseFloat(str) > 0
}
