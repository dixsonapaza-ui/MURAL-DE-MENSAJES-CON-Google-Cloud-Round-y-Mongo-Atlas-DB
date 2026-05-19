/**
 * user.model.js — Modelo de usuario
 *
 * ÍNDICE EN EMAIL — CRÍTICO PARA JMETER:
 * Sin index:true en email, cada login ejecuta un full collection scan.
 * Con 1,200 logins simultáneos, esto satura la CPU de Atlas M0
 * y convierte un query O(log n) en O(n) por cada request.
 * unique:true crea un índice único implícitamente en MongoDB,
 * pero declaramos index:true explícitamente para dejar la intención clara.
 */

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: [true, 'El email es obligatorio'],
      unique: true,    // Índice único — previene duplicados a nivel de DB
      index: true,     // Declaración explícita del índice para queries de login
      lowercase: true, // Normalizar para evitar duplicados por capitalización
      trim: true,
    },
    password: {
      type: String,
      required: [true, 'La contraseña es obligatoria'],
    },
  },
  {
    timestamps: true, // createdAt, updatedAt automáticos
  }
);

module.exports = mongoose.model('User', userSchema);
