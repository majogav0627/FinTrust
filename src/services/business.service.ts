import { query } from "../db/connection.ts";

export interface BusinessData {
  businessName: string;
}

/**
 * Crea un nuevo negocio
 */
export async function createBusiness(data: BusinessData) {
  try {
    const result = await query(
      `INSERT INTO businesses (business_name)
       VALUES ($1)
       RETURNING id, business_name, created_at`,
      [data.businessName]
    );

    const row = result.rows[0];

    // Crear registro de balance inicial
    await query(
      `INSERT INTO balances (business_id, current_balance)
       VALUES ($1, 0.00)`,
      [row.id]
    );

    return {
      id: row.id,
      business_name: row.business_name,
      current_balance: 0,
      total_income: 0,
      total_expenses: 0,
      created_at: row.created_at,
      updated_at: row.created_at,
    };
  } catch (error) {
    console.error("Error creating business:", error);
    throw error;
  }
}

/**
 * Obtiene un negocio por ID
 */
export async function getBusiness(businessId: number) {
  try {
    const result = await query(
      `SELECT 
        b.id, 
        b.business_name, 
        b.created_at, 
        b.updated_at,
        COALESCE(bal.current_balance, 0) as current_balance,
        COALESCE(SUM(CASE WHEN t.type = 'deposit' THEN t.amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN t.type = 'withdrawal' THEN t.amount ELSE 0 END), 0) as total_expenses
       FROM businesses b
       LEFT JOIN balances bal ON b.id = bal.business_id
       LEFT JOIN transactions t ON b.id = t.business_id
       WHERE b.id = $1
       GROUP BY b.id, b.business_name, b.created_at, b.updated_at, bal.current_balance`,
      [businessId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    const row = result.rows[0];
    return {
      id: row.id,
      business_name: row.business_name,
      current_balance: parseFloat(row.current_balance || 0),
      total_income: parseFloat(row.total_income || 0),
      total_expenses: parseFloat(row.total_expenses || 0),
      created_at: row.created_at,
      updated_at: row.updated_at,
    };
  } catch (error) {
    console.error("Error fetching business:", error);
    throw error;
  }
}

/**
 * Obtiene todos los negocios con su información de balance
 */
export async function getAllBusinesses() {
  try {
    const result = await query(
      `SELECT 
        b.id, 
        b.business_name, 
        b.created_at, 
        b.updated_at,
        COALESCE(bal.current_balance, 0) as current_balance,
        COALESCE(SUM(CASE WHEN t.type = 'deposit' THEN t.amount ELSE 0 END), 0) as total_income,
        COALESCE(SUM(CASE WHEN t.type = 'withdrawal' THEN t.amount ELSE 0 END), 0) as total_expenses
       FROM businesses b
       LEFT JOIN balances bal ON b.id = bal.business_id
       LEFT JOIN transactions t ON b.id = t.business_id
       GROUP BY b.id, b.business_name, b.created_at, b.updated_at, bal.current_balance
       ORDER BY b.created_at DESC`
    );

    return result.rows.map((row) => ({
      id: row.id,
      business_name: row.business_name,
      current_balance: parseFloat(row.current_balance || 0),
      total_income: parseFloat(row.total_income || 0),
      total_expenses: parseFloat(row.total_expenses || 0),
      created_at: row.created_at,
      updated_at: row.updated_at,
    }));
  } catch (error) {
    console.error("Error fetching businesses:", error);
    throw error;
  }
}

/**
 * Elimina un negocio por ID
 */
export async function deleteBusiness(businessId: number) {
  try {
    // Primero eliminar transacciones asociadas
    await query(
      `DELETE FROM transactions WHERE business_id = $1`,
      [businessId]
    );

    // Luego eliminar balance asociado
    await query(
      `DELETE FROM balances WHERE business_id = $1`,
      [businessId]
    );

    // Finalmente eliminar el negocio
    const result = await query(
      `DELETE FROM businesses WHERE id = $1 RETURNING id`,
      [businessId]
    );

    if (result.rows.length === 0) {
      return null;
    }

    return { id: result.rows[0].id, message: 'Business deleted successfully' };
  } catch (error) {
    console.error("Error deleting business:", error);
    throw error;
  }
}
