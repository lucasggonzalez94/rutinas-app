const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Usuario } = require('../models');
const { JWT_SECRET } = require('../middleware/auth');

// Registrar un nuevo usuario
const registro = async (req, res) => {
  try {
    const { username, email, password, first_name, last_name, telefono, fecha_nacimiento } = req.body;
    
    // Verificar si el usuario ya existe
    const usuarioExistente = await Usuario.findOne({ where: { username } });
    if (usuarioExistente) {
      return res.status(400).json({ mensaje: 'El nombre de usuario ya está en uso' });
    }
    
    // Hash de la contraseña - Django usa un formato PBKDF2
    // Usaremos bcrypt para pruebas, pero en producción habría que adaptar al formato de Django
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Crear el nuevo usuario
    const nuevoUsuario = await Usuario.create({
      username,
      email,
      password: hashedPassword,
      first_name,
      last_name,
      telefono,
      fecha_nacimiento,
      date_joined: new Date(),
      is_active: true
    });
    
    // Crear un token JWT
    const token = jwt.sign(
      { id: nuevoUsuario.id, username: nuevoUsuario.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Responder con el usuario creado (sin contraseña) y el token
    const usuarioData = nuevoUsuario.toJSON();
    delete usuarioData.password;
    
    res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      usuario: usuarioData,
      token
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    res.status(500).json({ mensaje: 'Error al registrar usuario', error: error.message });
  }
};

// Iniciar sesión
const login = async (req, res) => {
  try {
    const { username, password } = req.body;
    
    // Buscar el usuario por username
    const usuario = await Usuario.findOne({ where: { username } });
    if (!usuario) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }
    
    // Verificar si la cuenta está activa
    if (!usuario.is_active) {
      return res.status(401).json({ mensaje: 'Esta cuenta ha sido desactivada' });
    }
    
    // En un entorno real, deberíamos verificar el formato de la contraseña de Django
    // Por ahora, usaremos bcrypt directamente para pruebas
    const passwordValida = await bcrypt.compare(password, usuario.password);
    if (!passwordValida) {
      return res.status(401).json({ mensaje: 'Credenciales inválidas' });
    }
    
    // Actualizar el último login
    usuario.last_login = new Date();
    await usuario.save();
    
    // Crear un token JWT
    const token = jwt.sign(
      { id: usuario.id, username: usuario.username },
      JWT_SECRET,
      { expiresIn: '24h' }
    );
    
    // Responder con los datos del usuario (sin contraseña) y el token
    const usuarioData = usuario.toJSON();
    delete usuarioData.password;
    
    res.status(200).json({
      mensaje: 'Inicio de sesión exitoso',
      usuario: usuarioData,
      token
    });
  } catch (error) {
    console.error('Error al iniciar sesión:', error);
    res.status(500).json({ mensaje: 'Error al iniciar sesión', error: error.message });
  }
};

// Obtener datos del usuario actual
const perfil = async (req, res) => {
  try {
    // El middleware de autenticación ya ha añadido el usuario al objeto request
    const usuario = req.usuario;
    
    // No enviar la contraseña
    const usuarioData = usuario.toJSON();
    delete usuarioData.password;
    
    res.status(200).json({
      usuario: usuarioData
    });
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ mensaje: 'Error al obtener perfil', error: error.message });
  }
};

module.exports = {
  registro,
  login,
  perfil
};
