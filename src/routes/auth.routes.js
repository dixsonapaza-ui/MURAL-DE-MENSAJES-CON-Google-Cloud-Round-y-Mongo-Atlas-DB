/**
 * auth.routes.js — Rutas de autenticación
 * Cero lógica de negocio aquí. Solo mapeo de rutas a controladores.
 */

const { Router } = require('express');
const { register, login } = require('../controllers/auth.controller');

const router = Router();

router.post('/register', register);
router.post('/login', login);

module.exports = router;
