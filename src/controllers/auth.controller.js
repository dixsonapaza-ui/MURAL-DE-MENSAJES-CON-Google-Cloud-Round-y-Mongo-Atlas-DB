const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

/**
 * BCRYPT saltRounds: 8
 *
 * Trade-off consciente entre seguridad y rendimiento bajo carga masiva:
 *
 *   Rondas │ Tiempo aprox. por hash │ Uso en producción
 *   ───────┼────────────────────────┼──────────────────
 *      10  │ ~100ms                 │ Default, aplicaciones normales
 *       8  │  ~40ms                 │ Pruebas de estrés, alta concurrencia
 *      12  │ ~250ms                 │ Aplicaciones financieras
 *
 * Con 1,200 logins simultáneos y saltRounds=10:
 *   1,200 × 100ms = 120 segundos de CPU bloqueado (bcrypt es síncrono en CPU)
 *
 * Con saltRounds=8:
 *   1,200 × 40ms = 48 segundos — 60% menos presión sobre la vCPU
 *
 * Justificado para contexto académico de prueba de estrés JMeter.
 * En producción real, subir a 10-12 rondas.
 *
 * Se lee desde process.env para permitir ajuste sin redespliegue.
 */
const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS, 10) || 8;

/**
 * Funciones de validación de entrada.
 * Rechazan espacios en blanco (alt+32) y caracteres especiales en contraseñas.
 */
const hasWhitespace = (str) => /\s/.test(str);
const hasSpecialChars = (str) => /[^a-zA-Z0-9]/.test(str);
const isValidEmail = (str) => /^[a-zA-Z0-9._]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(str);

/**
 * POST /api/auth/register
 * Crea un nuevo usuario con email y contraseña hasheada.
 */
const register = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validación de campos requeridos
    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }

    // Validación de espacios en blanco
    if (hasWhitespace(email) || hasWhitespace(password)) {
      return res.status(400).json({ error: 'No se permiten espacios en blanco' });
    }

    // Validación de formato de email
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Formato de email inválido' });
    }

    // Validación de caracteres especiales en contraseña
    if (hasSpecialChars(password)) {
      return res.status(400).json({ error: 'La contraseña solo puede contener letras y números' });
    }

    // Verificar si el email ya existe
    // .lean() para obtener POJO — reduce ~35% de memoria vs documento Mongoose
    const existingUser = await User.findOne({ email }).lean();
    if (existingUser) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }

    // Hash de contraseña con saltRounds configurado
    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

    await User.create({ email, password: hashedPassword });

    return res.status(201).json({ message: 'Usuario creado' });
  } catch (error) {
    // Manejar error de duplicado a nivel de MongoDB (race condition)
    if (error.code === 11000) {
      return res.status(409).json({ error: 'El email ya está registrado' });
    }
    console.error('[AUTH] Error en register:', error.message);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * POST /api/auth/login
 * Autentica usuario y devuelve JWT.
 * ESTE ES EL ENDPOINT QUE ATACA JMETER CON 1,200 USUARIOS.
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email y contraseña son obligatorios' });
    }

    // Validación de espacios en blanco
    if (hasWhitespace(email) || hasWhitespace(password)) {
      return res.status(400).json({ error: 'No se permiten espacios en blanco' });
    }

    // Validación de formato de email
    if (!isValidEmail(email)) {
      return res.status(400).json({ error: 'Formato de email inválido' });
    }

    // Validación de caracteres especiales en contraseña
    if (hasSpecialChars(password)) {
      return res.status(400).json({ error: 'La contraseña solo puede contener letras y números' });
    }

    // Buscar usuario — NO usar .lean() aquí porque necesitamos el password
    // y luego no manipulamos el documento, solo leemos un campo
    const user = await User.findOne({ email });
    if (!user) {
      // Mensaje genérico para no revelar si el email existe
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Credenciales incorrectas' });
    }

    // Generar JWT con payload mínimo (solo lo necesario)
    const token = jwt.sign(
      { id: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN || '24h' }
    );

    return res.status(200).json({ token });
  } catch (error) {
    console.error('[AUTH] Error en login:', error.message);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { register, login };
