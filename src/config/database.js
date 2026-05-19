/**
 * database.js — Conexión a MongoDB Atlas
 *
 * ════════════════════════════════════════════════════════════
 * CÁLCULO DEL POOL DE CONEXIONES
 * ════════════════════════════════════════════════════════════
 *
 * MongoDB Atlas M0 (Free Tier) tiene un límite duro de 500 conexiones
 * simultáneas totales compartidas entre TODAS las instancias.
 *
 * maxPoolSize por instancia: 50
 * Max instancias Cloud Run:  10 (configurado con --max-instances=10)
 * Total conexiones máximas:  50 × 10 = 500 (límite exacto de Atlas M0)
 *
 * Si Cloud Run escala más allá de 10 instancias sin el flag --max-instances,
 * se superan las 500 conexiones y Atlas rechaza todas las nuevas conexiones.
 * Por eso --max-instances=10 es OBLIGATORIO en el comando de deploy.
 *
 * serverSelectionTimeoutMS: 5000
 *   Default de Mongoose es 30,000ms. Bajo carga masiva (1,200 usuarios),
 *   si no hay conexión disponible en el pool, esperar 30s acumula requests
 *   en memoria y provoca OOM en instancias de 512MB. Fallo rápido a 5s.
 *
 * socketTimeoutMS: 45000
 *   Timeout para operaciones individuales. 45s permite queries complejas
 *   sin mantener sockets zombies indefinidamente.
 * ════════════════════════════════════════════════════════════
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      maxPoolSize: 50,                   // 500 Atlas M0 / 10 instancias = 50
      serverSelectionTimeoutMS: 5000,    // Fallo rápido bajo carga masiva
      socketTimeoutMS: 45000,            // Evitar sockets zombies
    });
    console.log('[DATABASE] Conectado a MongoDB Atlas');
  } catch (error) {
    console.error('[DATABASE] Error de conexión:', error.message);
    throw error;
  }
};

module.exports = connectDB;
