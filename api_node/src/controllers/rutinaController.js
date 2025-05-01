const { Rutina, RutinaEjercicio, Ejercicio, Usuario } = require('../models');
const { Op } = require('sequelize');

// Obtener todas las rutinas del usuario autenticado
const obtenerRutinas = async (req, res) => {
  try {
    const usuarioId = req.usuario.id;
    
    // Verificar si el usuario es administrador
    const esAdmin = req.usuario.is_staff || req.usuario.is_superuser;
    
    // Construir condiciones de búsqueda
    const where = esAdmin ? {} : { usuario_id: usuarioId };
    
    // Buscar rutinas con las condiciones especificadas
    const rutinas = await Rutina.findAll({
      where,
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'username', 'first_name', 'last_name']
        }
      ],
      order: [['fecha_creacion', 'DESC']]
    });
    
    res.status(200).json({
      cantidad: rutinas.length,
      rutinas
    });
  } catch (error) {
    console.error('Error al obtener rutinas:', error);
    res.status(500).json({ mensaje: 'Error al obtener rutinas', error: error.message });
  }
};

// Obtener una rutina por ID con sus ejercicios
const obtenerRutinaPorId = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;
    
    // Verificar si el usuario es administrador
    const esAdmin = req.usuario.is_staff || req.usuario.is_superuser;
    
    // Buscar la rutina por ID
    const rutina = await Rutina.findByPk(id, {
      include: [
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'username', 'first_name', 'last_name']
        },
        {
          model: Ejercicio,
          as: 'ejercicios',
          through: {
            model: RutinaEjercicio,
            attributes: ['id', 'series', 'repeticiones', 'peso', 'duracion', 'notas', 'orden']
          }
        }
      ]
    });
    
    if (!rutina) {
      return res.status(404).json({ mensaje: 'Rutina no encontrada' });
    }
    
    // Verificar si el usuario tiene permiso para ver esta rutina
    if (!esAdmin && rutina.usuario_id !== usuarioId) {
      return res.status(403).json({ mensaje: 'No tienes permiso para ver esta rutina' });
    }
    
    res.status(200).json({ rutina });
  } catch (error) {
    console.error('Error al obtener rutina:', error);
    res.status(500).json({ mensaje: 'Error al obtener rutina', error: error.message });
  }
};

// Crear una nueva rutina
const crearRutina = async (req, res) => {
  try {
    const { nombre, descripcion, dias, hora } = req.body;
    const usuarioId = req.usuario.id;
    
    // Crear la nueva rutina
    const nuevaRutina = await Rutina.create({
      nombre,
      descripcion,
      dias,
      hora,
      usuario_id: usuarioId,
      fecha_creacion: new Date(),
      fecha_actualizacion: new Date()
    });
    
    res.status(201).json({
      mensaje: 'Rutina creada exitosamente',
      rutina: nuevaRutina
    });
  } catch (error) {
    console.error('Error al crear rutina:', error);
    res.status(500).json({ mensaje: 'Error al crear rutina', error: error.message });
  }
};

// Actualizar una rutina existente
const actualizarRutina = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, dias, hora } = req.body;
    const usuarioId = req.usuario.id;
    
    // Verificar si el usuario es administrador
    const esAdmin = req.usuario.is_staff || req.usuario.is_superuser;
    
    // Buscar la rutina por ID
    const rutina = await Rutina.findByPk(id);
    
    if (!rutina) {
      return res.status(404).json({ mensaje: 'Rutina no encontrada' });
    }
    
    // Verificar si el usuario tiene permiso para actualizar esta rutina
    if (!esAdmin && rutina.usuario_id !== usuarioId) {
      return res.status(403).json({ mensaje: 'No tienes permiso para actualizar esta rutina' });
    }
    
    // Actualizar la rutina
    await rutina.update({
      nombre: nombre || rutina.nombre,
      descripcion: descripcion !== undefined ? descripcion : rutina.descripcion,
      dias: dias || rutina.dias,
      hora: hora || rutina.hora,
      fecha_actualizacion: new Date()
    });
    
    res.status(200).json({
      mensaje: 'Rutina actualizada exitosamente',
      rutina
    });
  } catch (error) {
    console.error('Error al actualizar rutina:', error);
    res.status(500).json({ mensaje: 'Error al actualizar rutina', error: error.message });
  }
};

// Eliminar una rutina
const eliminarRutina = async (req, res) => {
  try {
    const { id } = req.params;
    const usuarioId = req.usuario.id;
    
    // Verificar si el usuario es administrador
    const esAdmin = req.usuario.is_staff || req.usuario.is_superuser;
    
    // Buscar la rutina por ID
    const rutina = await Rutina.findByPk(id);
    
    if (!rutina) {
      return res.status(404).json({ mensaje: 'Rutina no encontrada' });
    }
    
    // Verificar si el usuario tiene permiso para eliminar esta rutina
    if (!esAdmin && rutina.usuario_id !== usuarioId) {
      return res.status(403).json({ mensaje: 'No tienes permiso para eliminar esta rutina' });
    }
    
    // Eliminar la rutina (esto también elimina las relaciones en la tabla de unión gracias a las restricciones de clave foránea)
    await rutina.destroy();
    
    res.status(200).json({
      mensaje: 'Rutina eliminada exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar rutina:', error);
    res.status(500).json({ mensaje: 'Error al eliminar rutina', error: error.message });
  }
};

// Agregar un ejercicio a una rutina
const agregarEjercicioARutina = async (req, res) => {
  try {
    const { rutinaId } = req.params;
    const { ejercicioId, series, repeticiones, peso, duracion, notas, orden } = req.body;
    const usuarioId = req.usuario.id;
    
    // Verificar si el usuario es administrador
    const esAdmin = req.usuario.is_staff || req.usuario.is_superuser;
    
    // Buscar la rutina por ID
    const rutina = await Rutina.findByPk(rutinaId);
    
    if (!rutina) {
      return res.status(404).json({ mensaje: 'Rutina no encontrada' });
    }
    
    // Verificar si el usuario tiene permiso para modificar esta rutina
    if (!esAdmin && rutina.usuario_id !== usuarioId) {
      return res.status(403).json({ mensaje: 'No tienes permiso para modificar esta rutina' });
    }
    
    // Buscar el ejercicio por ID
    const ejercicio = await Ejercicio.findByPk(ejercicioId);
    
    if (!ejercicio) {
      return res.status(404).json({ mensaje: 'Ejercicio no encontrado' });
    }
    
    // Verificar si el ejercicio ya está en la rutina
    const ejercicioExistente = await RutinaEjercicio.findOne({
      where: {
        rutina_id: rutinaId,
        ejercicio_id: ejercicioId
      }
    });
    
    if (ejercicioExistente) {
      return res.status(400).json({ mensaje: 'Este ejercicio ya está en la rutina' });
    }
    
    // Determinar el orden si no se proporciona
    let ordenFinal = orden;
    if (!ordenFinal) {
      const ultimoEjercicio = await RutinaEjercicio.findOne({
        where: { rutina_id: rutinaId },
        order: [['orden', 'DESC']]
      });
      
      ordenFinal = ultimoEjercicio ? ultimoEjercicio.orden + 1 : 1;
    }
    
    // Crear la relación entre rutina y ejercicio
    const rutinaEjercicio = await RutinaEjercicio.create({
      rutina_id: rutinaId,
      ejercicio_id: ejercicioId,
      series: series || 3,
      repeticiones: repeticiones || 12,
      peso,
      duracion,
      notas,
      orden: ordenFinal
    });
    
    // Actualizar la fecha de actualización de la rutina
    await rutina.update({ fecha_actualizacion: new Date() });
    
    res.status(201).json({
      mensaje: 'Ejercicio agregado a la rutina exitosamente',
      rutinaEjercicio
    });
  } catch (error) {
    console.error('Error al agregar ejercicio a rutina:', error);
    res.status(500).json({ mensaje: 'Error al agregar ejercicio a rutina', error: error.message });
  }
};

// Eliminar un ejercicio de una rutina
const eliminarEjercicioDeRutina = async (req, res) => {
  try {
    const { rutinaId, ejercicioId } = req.params;
    const usuarioId = req.usuario.id;
    
    // Verificar si el usuario es administrador
    const esAdmin = req.usuario.is_staff || req.usuario.is_superuser;
    
    // Buscar la rutina por ID
    const rutina = await Rutina.findByPk(rutinaId);
    
    if (!rutina) {
      return res.status(404).json({ mensaje: 'Rutina no encontrada' });
    }
    
    // Verificar si el usuario tiene permiso para modificar esta rutina
    if (!esAdmin && rutina.usuario_id !== usuarioId) {
      return res.status(403).json({ mensaje: 'No tienes permiso para modificar esta rutina' });
    }
    
    // Buscar la relación entre rutina y ejercicio
    const rutinaEjercicio = await RutinaEjercicio.findOne({
      where: {
        rutina_id: rutinaId,
        ejercicio_id: ejercicioId
      }
    });
    
    if (!rutinaEjercicio) {
      return res.status(404).json({ mensaje: 'Este ejercicio no está en la rutina' });
    }
    
    // Eliminar la relación
    await rutinaEjercicio.destroy();
    
    // Actualizar la fecha de actualización de la rutina
    await rutina.update({ fecha_actualizacion: new Date() });
    
    res.status(200).json({
      mensaje: 'Ejercicio eliminado de la rutina exitosamente'
    });
  } catch (error) {
    console.error('Error al eliminar ejercicio de rutina:', error);
    res.status(500).json({ mensaje: 'Error al eliminar ejercicio de rutina', error: error.message });
  }
};

// Obtener todas las rutinas de un usuario específico
const obtenerRutinasUsuario = async (req, res) => {
  try {
    const { usuarioId } = req.params;
    const usuarioActualId = req.usuario.id;
    
    // Verificar si el usuario es administrador
    const esAdmin = req.usuario.is_staff || req.usuario.is_superuser;
    
    // Verificar si el usuario tiene permiso para ver las rutinas de este usuario
    if (!esAdmin && usuarioActualId != usuarioId) {
      return res.status(403).json({ mensaje: 'No tienes permiso para ver las rutinas de este usuario' });
    }
    
    // Buscar el usuario por ID
    const usuario = await Usuario.findByPk(usuarioId);
    
    if (!usuario) {
      return res.status(404).json({ mensaje: 'Usuario no encontrado' });
    }
    
    // Buscar las rutinas del usuario
    const rutinas = await Rutina.findAll({
      where: { usuario_id: usuarioId },
      include: [
        {
          model: Ejercicio,
          as: 'ejercicios',
          through: {
            model: RutinaEjercicio,
            attributes: ['id', 'series', 'repeticiones', 'peso', 'duracion', 'notas', 'orden']
          }
        }
      ],
      order: [['fecha_creacion', 'DESC']]
    });
    
    res.status(200).json({
      usuario: {
        id: usuario.id,
        username: usuario.username,
        first_name: usuario.first_name,
        last_name: usuario.last_name
      },
      cantidad: rutinas.length,
      rutinas
    });
  } catch (error) {
    console.error('Error al obtener rutinas del usuario:', error);
    res.status(500).json({ mensaje: 'Error al obtener rutinas del usuario', error: error.message });
  }
};

module.exports = {
  obtenerRutinas,
  obtenerRutinaPorId,
  crearRutina,
  actualizarRutina,
  eliminarRutina,
  agregarEjercicioARutina,
  eliminarEjercicioDeRutina,
  obtenerRutinasUsuario
};
