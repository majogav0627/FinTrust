/**
 * FinCore Configuration
 * Configuración centralizada para el SDK de FinCore
 */

export const fincoreConfig = {
  baseUrl: process.env.FINCORE_BASE_URL || "https://api.fincore.io",
  apiKey: process.env.FINCORE_API_KEY,
  deploymentId:
    process.env.FINCORE_DEPLOYMENT_ID ||
    "official-rail-v0-anvil-individual-vault",
};

/**
 * Valida que las variables de entorno necesarias estén configuradas
 */
export function validateFincoreConfig(): boolean {
  if (!fincoreConfig.apiKey) {
    console.error("❌ FINCORE_API_KEY no está configurado en .env");
    return false;
  }

  if (!fincoreConfig.baseUrl) {
    console.error("❌ FINCORE_BASE_URL no está configurado en .env");
    return false;
  }

  return true;
}
