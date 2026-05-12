/**
 * FinCore SDK Types
 * Tipos para interacción con el SDK de FinCore
 */

export interface FincoreExecutionResult {
  executionId: string;
  status: string;
  transactionHash?: string;
  error?: string;
}

export interface FincoreIntentParameters {
  amount: string;
  [key: string]: string | number | boolean;
}

export interface FincoreClientConfig {
  baseUrl: string;
  apiKey: string;
}

export interface FinCoreDemoResult {
  success: boolean;
  message: string;
}
