const express = require('express');
const { 
  registrarSesion, 
  obtenerSesiones, 
  obtenerEstadisticas 
} = require('../controllers/sesionController');
const { verificarToken } = require('../middleware/auth');

const router = express.Router();

// Rutas protegidas - necesitan autenticación
router.post('/', verificarToken, registrarSesion);
router.get('/', verificarToken, obtenerSesiones);
router.get('/estadisticas', verificarToken, obtenerEstadisticas);

module.exports = router;
