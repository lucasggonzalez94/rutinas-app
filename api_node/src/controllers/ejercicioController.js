const { Ejercicio } = require('../models');
const { Op } = require('sequelize');

// Obtener todos los ejercicios
const obtenerEjercicios = async (req, res) => {
  try {
    // Parámetros de búsqueda opcionales
    const { nombre, grupo_muscular } = req.query;
    
    // Construir condiciones de búsqueda
    const where = {};
    
    if (nombre) {
      where.nombre = { [Op.like]: `%${nombre}%` };
    }
    
    if (grupo_muscular) {
      where.grupo_muscular = grupo_muscular;
    }
    
    // Buscar ejercicios con las condiciones especificadas
    const ejercicios = await Ejercicio.findAll({ where });
    
    res.status(200).json({
      cantidad: ejercicios.length,
      ejercicios
    });
  } catch (error) {
    console.error('Error al obtener ejercicios:', error);
    res.status(500).json({ mensaje: 'Error al obtener ejercicios', error: error.message });
  }
};

// Obtener un ejercicio por ID
const obtenerEjercicioPorId = async (req, res) => {
  try {
    const { id } = req.params;
    
    const ejercicio = await Ejercicio.findByPk(id);
    
    if (!ejercicio) {
      return res.status(404).json({ mensaje: 'Ejercicio no encontrado' });
    }
    
    res.status(200).json({ ejercicio });
  } catch (error) {
    console.error('Error al obtener ejercicio:', error);
    res.status(500).json({ mensaje: 'Error al obtener ejercicio', error: error.message });
  }
};

// Crear un nuevo ejercicio
const crearEjercicio = async (req, res) => {
  try {
    const { nombre, descripcion, grupo_muscular, imagen } = req.body;
    
    // Verificar si el ejercicio ya existe
    const ejercicioExistente = await Ejercicio.findOne({ where: { nombre } });
    if (ejercicioExistente) {
      return res.status(400).json({ mensaje: 'Ya existe un ejercicio con ese nombre' });
    }
    
    // Crear el nuevo ejercicio
    const nuevoEjercicio = await Ejercicio.create({
      nombre,
      descripcion,
      grupo_muscular,
      imagen,
      fecha_creacion: new Date()
    });
    
    res.status(201).json({
      mensaje: 'Ejercicio creado exitosamente',
      ejercicio: nuevoEjercicio
    });
  } catch (error) {
    console.error('Error al crear ejercicio:', error);
    res.status(500).json({ mensaje: 'Error al crear ejercicio', error: error.message });
  }
};

// Actualizar un ejercicio existente
const actualizarEjercicio = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, grupo_muscular, imagen } = req.body;
    
    // Buscar el ejercicio por ID
    const ejercicio = await Ejercicio.findByPk(id);
    
    if (!ejercicio) {
      return res.status(404).json({ mensaje: 'Ejercicio no encontrado' });
    }
    
    // Si se proporciona un nuevo nombre, verificar que no exista otro ejercicio con ese nombre
    if (nombre && nombre !== ejercicio.nombre) {
      const ejercicioExistente = await Ejercicio.findOne({ where: { nombre } });
      if (ejercicioExistente) {
        return res.status(400).json({ mensaje: 'Ya existe un ejercicio con ese nombre' });
      }
    }
    
    // Actualizar el ejercicio
    await ejercicio.update({
      nombre: nombre || ejercicio.nombre,
      descripcion: descripcion !== undefined ? descripcion : ejercicio.descripcion,
      grupo_muscular: grupo_muscular || ejercicio.grupo_muscular,
      imagen: imagen !== undefined ? imagen : ejercicio.imagen
    });
    
    res.status(200).json({
      mensaje: 'Ejercicio actualizado exitosamente',
      ejercicio
    });
  } catch (error) {
    console.error('Error al actualizar ejercicio:', error);
    res.status(500).json({ mensaje: 'Error al actualizar ejercicio', error: error.message });
  }
};

// Eliminar un ejercicio
const eliminarEjercicio = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Buscar el ejercicio por ID
    const ejercicio = await Ejercicio.findByPk(id);
    
    if (!ejercicio) {
      return res.status(404).json({ mensaje: 'Ejercicio no encontrado' });
    }
    
    // Eliminar el ejercicio
    await ejercicio.destroy();
    
    res.status(200).json({
      mensaje: 'Ejercicio eliminado exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar ejercicio:', error);
    res.status(500).json({ mensaje: 'Error al eliminar ejercicio', error: error.message });
  }
};

module.exports = {
  obtenerEjercicios,
  obtenerEjercicioPorId,
  crearEjercicio,
  actualizarEjercicio,
  eliminarEjercicio
};
