import dotenv from "dotenv";
import pg from "pg";

dotenv.config();

const { Pool } = pg;

const pool = new Pool({
  user: process.env.DB_USER || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  database: process.env.DB_NAME || "fintrust",
});

(async () => {
  try {
    const res = await pool.query("SELECT NOW() as now");
    console.log("✅ Database connection OK:", res.rows[0]);
    await pool.end();
    process.exit(0);
  } catch (err) {
    console.error("❌ Database connection failed:", err.message || err);
    try { await pool.end(); } catch (e) {}
    process.exit(1);
  }
})();
