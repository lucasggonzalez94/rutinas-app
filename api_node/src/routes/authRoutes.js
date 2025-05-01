const express = require('express');
const { registro, login, perfil } = require('../controllers/authController');
const { verificarToken } = require('../middleware/auth');

const router = express.Router();

// Rutas públicas
router.post('/registro', registro);
router.post('/login', login);

// Rutas protegidas
router.get('/perfil', verificarToken, perfil);

module.exports = router;
