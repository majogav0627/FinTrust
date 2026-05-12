import "dotenv/config";
import express from "express";
import transactionsRouter from "./routes/transactions.routes.ts";
import businessesRouter from "./routes/businesses.routes.ts";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());

// CORS (para desarrollo)
app.use((_req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.header("Access-Control-Allow-Headers", "Content-Type");
  next();
});

// Health check
app.get("/health", (_req, res) => {
  res.status(200).json({ status: "ok", message: "FinTrust API is running" });
});

// API Routes
app.use("/api/transactions", transactionsRouter);
app.use("/api/businesses", businessesRouter);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handler
app.use(
  (
    err: Error,
    _req: express.Request,
    res: express.Response,
    _next: express.NextFunction
  ) => {
    console.error("Unhandled error:", err);
    res.status(500).json({
      error: "Internal server error",
      message: err.message,
    });
  }
);

app.listen(PORT, () => {
  console.log(`🚀 FinTrust API running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
});

export default app;
