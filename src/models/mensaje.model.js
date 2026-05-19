const mongoose = require('mongoose');

const mensajeSchema = new mongoose.Schema(
  {
    texto: {
      type: String,
      required: [true, 'El texto del mensaje es obligatorio'],
      trim: true,
      maxlength: [500, 'El mensaje no puede superar los 500 caracteres'],
    },
    autor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true, // createdAt para ordenar, updatedAt para auditoría
  }
);

/**
 * Índice en createdAt descendente para optimizar la query principal:
 * .find().sort({ createdAt: -1 }).limit(50)
 * Sin este índice, MongoDB ordena en memoria — ineficiente bajo carga.
 */
mensajeSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Mensaje', mensajeSchema);
