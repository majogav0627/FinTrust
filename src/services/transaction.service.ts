import { query } from "../db/connection.ts";
import FinCoreAdapter from "../adapters/fincore/fincore-adapter.ts";
import { normalizeAmount, toCents } from "../utils/currency.ts";

export interface TransactionData {
  businessId: number;
  type: "deposit" | "withdrawal";
  amount: string;
  description?: string;
}

export interface TransactionResponse {
  id: number;
  businessId: number;
  type: string;
  amount: string;
  description?: string;
  fincoreTxId?: string;
  fincoreStatus?: string;
  createdAt: string;
}

/**
 * Crea un depósito o retiro
 */
export async function createTransaction(
  data: TransactionData
): Promise<TransactionResponse> {
  try {
    // Normalizar el monto a 2 decimales para DB
    const normalizedAmount = normalizeAmount(data.amount);

    // Convertir a centavos (uint256) para Fin-Core
    const amountInCents = String(toCents(data.amount));

    // Ejecutar la intención en FinCore
    const finCoreAdapter = new FinCoreAdapter(
      process.env.FINCORE_BASE_URL!,
      process.env.FINCORE_API_KEY!
    );

    const intentType = data.type === "deposit" ? "vaultDeposit" : "vaultWithdraw";
    const fincoreResult = await finCoreAdapter.executeIntent(
      intentType,
      process.env.FINCORE_DEPLOYMENT_ID || "official-rail-v0-anvil-individual-vault",
      { amount: amountInCents }
    );

    // Guardar en PostgreSQL
    const result = await query(
      `INSERT INTO transactions (business_id, type, amount, description, fincore_tx_id, fincore_status)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING id, business_id, type, amount, description, fincore_tx_id, fincore_status, created_at`,
      [
        data.businessId,
        data.type,
        normalizedAmount,
        data.description || null,
        fincoreResult.executionId,
        fincoreResult.status,
      ]
    );

    // Actualizar saldo
    await updateBalance(data.businessId, data.type, normalizedAmount);

    const row = result.rows[0];
    return {
      id: row.id,
      businessId: row.business_id,
      type: row.type,
      amount: row.amount,
      description: row.description,
      fincoreTxId: row.fincore_tx_id,
      fincoreStatus: row.fincore_status,
      createdAt: row.created_at,
    };
  } catch (error) {
    console.error("Error creating transaction:", error);
    throw error;
  }
}

/**
 * Obtiene el historial de transacciones
 */
export async function getTransactionHistory(
  businessId: number,
  limit: number = 50
): Promise<TransactionResponse[]> {
  try {
    const result = await query(
      `SELECT id, business_id, type, amount, description, fincore_tx_id, fincore_status, created_at
       FROM transactions
       WHERE business_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [businessId, limit]
    );

    return result.rows.map((row) => ({
      id: row.id,
      businessId: row.business_id,
      type: row.type,
      amount: row.amount,
      description: row.description,
      fincoreTxId: row.fincore_tx_id,
      fincoreStatus: row.fincore_status,
      createdAt: row.created_at,
    }));
  } catch (error) {
    console.error("Error fetching transaction history:", error);
    throw error;
  }
}

/**
 * Obtiene el saldo actual del negocio
 */
export async function getBalance(businessId: number) {
  try {
    const result = await query(
      `SELECT current_balance, total_income, total_expenses, updated_at
       FROM balances
       WHERE business_id = $1`,
      [businessId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return result.rows[0];
  } catch (error) {
    console.error("Error fetching balance:", error);
    throw error;
  }
}

/**
 * Actualiza el saldo después de una transacción
 */
async function updateBalance(
  businessId: number,
  type: string,
  amount: string
): Promise<void> {
  const normalizedAmount = normalizeAmount(amount);
  const amountNum = parseFloat(normalizedAmount);

  try {
    const existing = await query(
      `SELECT id FROM balances WHERE business_id = $1`,
      [businessId]
    );

    if (existing.rows.length === 0) {
      const initialBalance = type === "deposit" ? amountNum : -amountNum;
      const totalIncome = type === "deposit" ? amountNum : 0;
      const totalExpenses = type === "withdrawal" ? amountNum : 0;

      await query(
        `INSERT INTO balances (business_id, current_balance, total_income, total_expenses)
         VALUES ($1, $2, $3, $4)`,
        [businessId, initialBalance, totalIncome, totalExpenses]
      );
    } else {
      if (type === "deposit") {
        await query(
          `UPDATE balances
           SET current_balance = current_balance + $1,
               total_income = total_income + $1,
               updated_at = CURRENT_TIMESTAMP
           WHERE business_id = $2`,
          [amountNum, businessId]
        );
      } else {
        await query(
          `UPDATE balances
           SET current_balance = current_balance - $1,
               total_expenses = total_expenses + $1,
               updated_at = CURRENT_TIMESTAMP
           WHERE business_id = $2`,
          [amountNum, businessId]
        );
      }
    }
  } catch (error) {
    console.error("Error updating balance:", error);
    throw error;
  }
}