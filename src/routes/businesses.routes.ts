import express from "express";
import type { Request, Response } from "express";
import {
  createBusiness,
  getBusiness,
  getAllBusinesses,
  deleteBusiness,
} from "../services/business.service.ts";

const router = express.Router();

/**
 * POST /api/businesses
 * Crea un nuevo negocio
 */
router.post("/", async (req: Request, res: Response) => {
  try {
    const { businessName } = req.body;

    if (!businessName) {
      return res.status(400).json({ error: "businessName is required" });
    }

    const business = await createBusiness({ businessName });

    res.status(201).json({
      success: true,
      data: business,
    });
  } catch (error) {
    console.error("Error in POST /:", error);
    res.status(500).json({
      error: "Failed to create business",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/businesses/:businessId
 * Obtiene un negocio específico
 */
router.get("/:businessId", async (req: Request, res: Response) => {
  try {
    const { businessId } = req.params;

    const business = await getBusiness(parseInt(businessId));

    if (!business) {
      return res.status(404).json({
        error: "Business not found",
      });
    }

    res.status(200).json({
      success: true,
      data: business,
    });
  } catch (error) {
    console.error("Error in GET /:businessId:", error);
    res.status(500).json({
      error: "Failed to fetch business",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * GET /api/businesses
 * Obtiene todos los negocios
 */
router.get("/", async (req: Request, res: Response) => {
  try {
    const businesses = await getAllBusinesses();

    res.status(200).json({
      success: true,
      data: businesses,
    });
  } catch (error) {
    console.error("Error in GET /:", error);
    res.status(500).json({
      error: "Failed to fetch businesses",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

/**
 * DELETE /api/businesses/:businessId
 * Elimina un negocio
 */
router.delete("/:businessId", async (req: Request, res: Response) => {
  try {
    const { businessId } = req.params;

    const result = await deleteBusiness(parseInt(businessId));

    if (!result) {
      return res.status(404).json({
        error: "Business not found",
      });
    }

    res.status(200).json({
      success: true,
      data: result,
      message: "Business deleted successfully",
    });
  } catch (error) {
    console.error("Error in DELETE /:businessId:", error);
    res.status(500).json({
      error: "Failed to delete business",
      details: error instanceof Error ? error.message : "Unknown error",
    });
  }
});

export default router;
