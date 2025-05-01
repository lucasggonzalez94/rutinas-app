const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');

// Clave secreta para firmar los tokens JWT
const JWT_SECRET = process.env.JWT_SECRET || 'clave_secreta_para_desarrollo';

// Middleware para verificar token JWT
const verificarToken = async (req, res, next) => {
  try {
    // Obtener el token del header de autorización
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ mensaje: 'Acceso denegado. Token no proporcionado o formato incorrecto.' });
    }
    
    // Obtener solo el token (sin "Bearer ")
    const token = authHeader.split(' ')[1];
    
    // Verificar el token
    const decodificado = jwt.verify(token, JWT_SECRET);
    
    // Buscar al usuario en la base de datos
    const usuario = await Usuario.findByPk(decodificado.id);
    
    if (!usuario) {
      return res.status(401).json({ mensaje: 'Usuario no encontrado.' });
    }
    
    // Agregar el usuario al objeto request
    req.usuario = usuario;
    
    // Continuar con la siguiente función
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ mensaje: 'Token expirado. Inicie sesión nuevamente.' });
    }
    
    return res.status(401).json({ mensaje: 'Token inválido.' });
  }
};

// Middleware para verificar si el usuario es administrador
const esAdmin = (req, res, next) => {
  if (!req.usuario.is_staff && !req.usuario.is_superuser) {
    return res.status(403).json({ mensaje: 'Acceso denegado. Se requieren permisos de administrador.' });
  }
  
  next();
};

module.exports = { 
  verificarToken, 
  esAdmin, 
  JWT_SECRET 
};
