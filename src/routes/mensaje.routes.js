/**
 * mensaje.routes.js — Rutas de mensajes
 * Cero lógica de negocio aquí. Solo mapeo de rutas a controladores.
 *
 * GET  /api/mensajes  → Público (sin auth)
 * POST /api/mensajes  → Protegido (requiere JWT)
 */

const { Router } = require('express');
const { getAll, create } = require('../controllers/mensaje.controller');
const authMiddleware = require('../middleware/auth.middleware');

const router = Router();

router.get('/', getAll);
router.post('/', authMiddleware, create);

module.exports = router;
