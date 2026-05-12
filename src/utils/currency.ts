/**
 * Utilidades para manejo de moneda con precisión decimal
 * Evita problemas de precisión de punto flotante
 */

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
 * Valida que un monto tenga máximo 2 decimales y sea positivo
 */
export const isValidAmount = (amount: string | number): boolean => {
  const str = typeof amount === 'string' ? amount : String(amount)
  const num = parseFloat(str)
  
  if (isNaN(num) || num <= 0) return false
  
  // Verificar máximo 2 decimales
  const decimalParts = str.split('.')
  if (decimalParts.length > 2) return false
  if (decimalParts.length === 2 && decimalParts[1].length > 2) return false
  
  return true
}

/**
 * Convierte un monto a centavos (entero) para cálculos sin decimales
 */
export const toCents = (amount: number | string): number => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  return Math.round(num * 100)
}

/**
 * Convierte centavos a monto decimal
 */
export const fromCents = (cents: number): string => {
  return (cents / 100).toFixed(2)
}
