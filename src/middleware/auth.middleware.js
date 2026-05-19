const jwt = require('jsonwebtoken');

/**
 * Middleware de autenticación JWT
 *
 * Verifica el header Authorization: Bearer <token>
 * Si es válido, inyecta el payload decodificado en req.user
 * Si falta o es inválido, responde 401 sin revelar detalles internos.
 *
 * Preparado para Fase 2:
 * Si se añade Redis como caché de sesiones, solo se necesita agregar
 * una verificación adicional contra Redis aquí, sin modificar controladores.
 */
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de autenticación requerido' });
    }

    // Extraer token después de "Bearer "
    const token = authHeader.split(' ')[1];

    // Verificar y decodificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    return next();
  } catch (error) {
    // jwt.verify lanza error si el token expiró, fue manipulado, o es inválido.
    // Mensaje genérico para no exponer detalles del fallo al cliente.
    return res.status(401).json({ error: 'Token inválido o expirado' });
  }
};

module.exports = authMiddleware;
