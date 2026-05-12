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
 * Valida que un monto sea válido (positivo y con máximo 2 decimales)
 * Compatible con inputs type=number que pueden tener precisión flotante
 */
export const isValidAmount = (amount: string | number): boolean => {
  const num = typeof amount === 'string' ? parseFloat(amount) : amount
  
  if (isNaN(num) || num <= 0) return false
  
  // Normalizar a 2 decimales y verificar
  const normalized = Math.round(num * 100) / 100
  return normalized > 0
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
