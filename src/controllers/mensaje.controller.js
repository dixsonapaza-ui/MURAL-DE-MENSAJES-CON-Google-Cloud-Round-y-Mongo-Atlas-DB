const Mensaje = require('../models/mensaje.model');

/**
 * GET /api/mensajes
 * Retorna los últimos 50 mensajes ordenados por fecha descendente.
 * Endpoint público — no requiere autenticación.
 */
const getAll = async (_req, res) => {
  try {
    /**
     * .lean() — OBLIGATORIO en queries de lectura:
     * Retorna POJOs en lugar de documentos Mongoose completos.
     * Elimina el overhead de hidratación, change tracking y virtuals.
     * Reduce consumo de memoria por request entre 30% y 40%.
     * En instancias de 512MB RAM, esto es la diferencia entre
     * servir 200 o 300+ requests concurrentes sin OOM.
     */
    const mensajes = await Mensaje.find()
      .sort({ createdAt: -1 })
      .limit(50)
      .populate('autor', 'email')  // Solo email del autor, no el password
      .lean();

    return res.status(200).json(mensajes);
  } catch (error) {
    console.error('[MENSAJES] Error en getAll:', error.message);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

/**
 * POST /api/mensajes
 * Crea un nuevo mensaje. Requiere autenticación (JWT).
 * El id del usuario viene del middleware auth en req.user.
 */
const create = async (req, res) => {
  try {
    const { texto } = req.body;

    if (!texto) {
      return res.status(400).json({ error: 'El texto del mensaje es obligatorio' });
    }

    // req.user.id es inyectado por el middleware de autenticación
    const mensaje = await Mensaje.create({
      texto,
      autor: req.user.id,
    });

    return res.status(201).json(mensaje);
  } catch (error) {
    console.error('[MENSAJES] Error en create:', error.message);
    return res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { getAll, create };
