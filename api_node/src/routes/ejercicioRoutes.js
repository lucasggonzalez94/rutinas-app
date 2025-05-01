const express = require('express');
const { 
  obtenerEjercicios, 
  obtenerEjercicioPorId, 
  crearEjercicio, 
  actualizarEjercicio, 
  eliminarEjercicio 
} = require('../controllers/ejercicioController');
const { verificarToken, esAdmin } = require('../middleware/auth');

const router = express.Router();

// Rutas protegidas
router.get('/', verificarToken, obtenerEjercicios);
router.get('/:id', verificarToken, obtenerEjercicioPorId);

// Rutas protegidas y solo para administradores
router.post('/', [verificarToken, esAdmin], crearEjercicio);
router.put('/:id', [verificarToken, esAdmin], actualizarEjercicio);
router.delete('/:id', [verificarToken, esAdmin], eliminarEjercicio);

module.exports = router;
