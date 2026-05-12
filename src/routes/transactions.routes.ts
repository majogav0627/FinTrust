import express from "express";
import type { Request, Response } from "express";
import {
  createTransaction,
  getTransactionHistory,
  getBalance,
} from "../services/transaction.service.ts";
import { normalizeAmount } from "../utils/currency.ts";

const router = express.Router();

/**
 * POST /api/transactions/deposit
 * Crea un depósito
 */
router.post("/deposit", async (req: Request, res: Response) => {
  try {
    const { businessId, amount, description } = req.body;

    if (!businessId || !amount) {
      return res
        .status(400)
        .json({ error: "businessId and amount are required" });
    }

    const normalizedAmount = normalizeAmount(amount);
    const amountNum = parseFloat(normalizedAmount);

    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({
        error: "Invalid amount",
        message: "Amount must be a positive number",
      });
    }

    const transaction = await createTransaction({
      businessId: parseInt(businessId),
      type: "deposit",
      amount: normalizedAmount,
      description,
    });

    res.status(201).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error("Error in POST /deposit:", error);
    res.status(500).json({
      error: "Failed to create deposit",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * POST /api/transactions/withdraw
 * Crea un retiro
 */
router.post("/withdraw", async (req: Request, res: Response) => {
  try {
    const { businessId, amount, description } = req.body;

    if (!businessId || !amount) {
      return res
        .status(400)
        .json({ error: "businessId and amount are required" });
    }

    const normalizedAmount = normalizeAmount(amount);
    const amountNum = parseFloat(normalizedAmount);

    if (isNaN(amountNum) || amountNum <= 0) {
      return res.status(400).json({
        error: "Invalid amount",
        message: "Amount must be a positive number",
      });
    }

    const transaction = await createTransaction({
      businessId: parseInt(businessId),
      type: "withdrawal",
      amount: normalizedAmount,
      description,
    });

    res.status(201).json({
      success: true,
      data: transaction,
    });
  } catch (error) {
    console.error("Error in POST /withdraw:", error);
    res.status(500).json({
      error: "Failed to create withdrawal",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/transactions/:businessId/balance
 * Obtiene el saldo actual
 */
router.get("/:businessId/balance", async (req: Request, res: Response) => {
  try {
    const { businessId } = req.params;

    const balance = await getBalance(parseInt(businessId));

    if (!balance) {
      return res.status(404).json({
        error: "Balance not found for this business",
      });
    }

    res.status(200).json({
      success: true,
      data: balance,
    });
  } catch (error) {
    console.error("Error in GET /:businessId/balance:", error);
    res.status(500).json({
      error: "Failed to fetch balance",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/transactions/:businessId
 * Obtiene el historial de transacciones
 */
router.get("/:businessId", async (req: Request, res: Response) => {
  try {
    const { businessId } = req.params;
    const { limit } = req.query;

    const transactions = await getTransactionHistory(
      parseInt(businessId),
      limit ? parseInt(limit as string) : 50
    );

    res.status(200).json({
      success: true,
      data: transactions,
    });
  } catch (error) {
    console.error("Error in GET /:businessId:", error);
    res.status(500).json({
      error: "Failed to fetch transactions",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
