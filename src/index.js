/**
 * index.js — Punto de entrada de la API
 *
 * SIN CLUSTER DE NODE.JS:
 * Cloud Run escala horizontalmente creando múltiples instancias del contenedor.
 * Node.js cluster escala verticalmente con workers dentro de un solo proceso.
 * Usar cluster aquí desperdiciaría la vCPU asignada (1 core) y competiría
 * con el mecanismo de escalado de Cloud Run. Arranque directo.
 */

require('dotenv').config();

/**
 * Forzar DNS de Google para resolver registros SRV de MongoDB Atlas.
 * Muchos DNS locales/corporativos no soportan queries SRV,
 * lo que rompe las conexiones mongodb+srv://
 * En Cloud Run esto no es necesario (Google DNS por defecto),
 * pero no causa daño dejarlo.
 */
const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const cors = require('cors');
const connectDB = require('./config/database');
const authRoutes = require('./routes/auth.routes');
const mensajeRoutes = require('./routes/mensaje.routes');

const app = express();

// ── Middlewares globales ──────────────────────────────────
app.use(cors());
app.use(express.json());

// 4. Rate limits (Protección contra spam/DDoS)
const rateLimit = require('express-rate-limit');
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 1500, // Limite alto porque la app espera muchos usuarios
  message: { error: 'Demasiadas peticiones desde esta IP, por favor intenta de nuevo más tarde.' }
});
app.use(limiter);

// ── Health check ──────────────────────────────────────────
// Cloud Run envía requests a este endpoint para verificar que la instancia
// está viva. Sin él, Cloud Run puede reciclar instancias sanas innecesariamente.
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'ok' });
});

// ── Frontend estático ─────────────────────────────────────
// Servir archivos de public/ para que frontend y backend se desplieguen
// juntos en el mismo contenedor de Cloud Run. Un solo deploy.
const path = require('path');
app.use(express.static(path.join(__dirname, '..', 'public')));

// ── Rutas API ─────────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/mensajes', mensajeRoutes);

// 5. Vista 404 / Manejador de rutas inexistentes
app.use((req, res) => {
  res.status(404).json({
    error: 'Página o ruta no encontrada'
  });
});

// ── Conexión a DB y arranque del servidor ─────────────────
/**
 * PORT: Cloud Run inyecta PORT=8080 automáticamente.
 * Hardcodear otro puerto rompe el deploy en Cloud Run.
 * El fallback 8080 es para desarrollo local sin .env.
 */
const PORT = process.env.PORT || 8080;

connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`[SERVER] Instancia activa en puerto ${PORT}`);
  });
}).catch((err) => {
  console.error('[SERVER] Fallo crítico al conectar a MongoDB:', err.message);
  process.exit(1);
});
