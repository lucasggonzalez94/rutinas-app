const express = require('express');
const { 
  obtenerRutinas, 
  obtenerRutinaPorId, 
  crearRutina, 
  actualizarRutina, 
  eliminarRutina,
  agregarEjercicioARutina,
  eliminarEjercicioDeRutina,
  obtenerRutinasUsuario
} = require('../controllers/rutinaController');
const { verificarToken } = require('../middleware/auth');

const router = express.Router();

// Rutas protegidas - necesitan autenticación
router.get('/', verificarToken, obtenerRutinas);
router.get('/:id', verificarToken, obtenerRutinaPorId);
router.post('/', verificarToken, crearRutina);
router.put('/:id', verificarToken, actualizarRutina);
router.delete('/:id', verificarToken, eliminarRutina);

// Rutas para gestionar ejercicios en una rutina
router.post('/:rutinaId/ejercicio', verificarToken, agregarEjercicioARutina);
router.delete('/:rutinaId/ejercicio/:ejercicioId', verificarToken, eliminarEjercicioDeRutina);

// Ruta para obtener todas las rutinas de un usuario
router.get('/usuario/:usuarioId', verificarToken, obtenerRutinasUsuario);

module.exports = router;
