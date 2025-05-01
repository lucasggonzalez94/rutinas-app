const { SesionEjercicio, Rutina, Ejercicio, Usuario } = require('../models');
const { Op } = require('sequelize');
const { Sequelize } = require('sequelize');

// Registrar una nueva sesión de ejercicio
const registrarSesion = async (req, res) => {
  try {
    const { rutina_id, ejercicio_id, series_completadas, repeticiones_completadas, peso_utilizado, duracion, notas } = req.body;
    const usuario_id = req.usuario.id;
    
    // Verificar que la rutina existe y pertenece al usuario
    const rutina = await Rutina.findByPk(rutina_id);
    
    if (!rutina) {
      return res.status(404).json({ mensaje: 'Rutina no encontrada' });
    }
    
    // Verificar si el usuario tiene permiso para registrar sesiones en esta rutina
    const esAdmin = req.usuario.is_staff || req.usuario.is_superuser;
    if (!esAdmin && rutina.usuario_id !== usuario_id) {
      return res.status(403).json({ mensaje: 'No tienes permiso para registrar sesiones en esta rutina' });
    }
    
    // Verificar que el ejercicio existe
    const ejercicio = await Ejercicio.findByPk(ejercicio_id);
    
    if (!ejercicio) {
      return res.status(404).json({ mensaje: 'Ejercicio no encontrado' });
    }
    
    // Crear la nueva sesión
    const nuevaSesion = await SesionEjercicio.create({
      rutina_id,
      ejercicio_id,
      usuario_id,
      series_completadas,
      repeticiones_completadas,
      peso_utilizado,
      duracion,
      notas,
      fecha: new Date()
    });
    
    res.status(201).json({
      mensaje: 'Sesión de ejercicio registrada exitosamente',
      sesion: nuevaSesion
    });
  } catch (error) {
    console.error('Error al registrar sesión:', error);
    res.status(500).json({ mensaje: 'Error al registrar sesión', error: error.message });
  }
};

// Obtener sesiones del usuario
const obtenerSesiones = async (req, res) => {
  try {
    const usuario_id = req.usuario.id;
    const { fecha_inicio, fecha_fin, rutina_id, ejercicio_id } = req.query;
    
    // Construir condiciones de búsqueda
    const where = { usuario_id };
    
    if (fecha_inicio && fecha_fin) {
      where.fecha = {
        [Op.between]: [new Date(fecha_inicio), new Date(fecha_fin)]
      };
    } else if (fecha_inicio) {
      where.fecha = {
        [Op.gte]: new Date(fecha_inicio)
      };
    } else if (fecha_fin) {
      where.fecha = {
        [Op.lte]: new Date(fecha_fin)
      };
    }
    
    if (rutina_id) {
      where.rutina_id = rutina_id;
    }
    
    if (ejercicio_id) {
      where.ejercicio_id = ejercicio_id;
    }
    
    // Verificar si el usuario es administrador
    const esAdmin = req.usuario.is_staff || req.usuario.is_superuser;
    if (esAdmin && req.query.usuario_id) {
      // Si es admin y se proporciona un usuario_id, buscar sesiones de ese usuario
      where.usuario_id = req.query.usuario_id;
    }
    
    // Buscar sesiones
    const sesiones = await SesionEjercicio.findAll({
      where,
      include: [
        {
          model: Rutina,
          as: 'rutina',
          attributes: ['id', 'nombre']
        },
        {
          model: Ejercicio,
          as: 'ejercicio',
          attributes: ['id', 'nombre', 'grupo_muscular']
        }
      ],
      order: [['fecha', 'DESC']]
    });
    
    res.status(200).json({
      cantidad: sesiones.length,
      sesiones
    });
  } catch (error) {
    console.error('Error al obtener sesiones:', error);
    res.status(500).json({ mensaje: 'Error al obtener sesiones', error: error.message });
  }
};

// Obtener estadísticas de ejercicios
const obtenerEstadisticas = async (req, res) => {
  try {
    const usuario_id = req.usuario.id;
    const { periodo, fecha_inicio, fecha_fin } = req.query;
    
    // Verificar si se proporcionó un período válido
    const periodos_validos = ['dia', 'semana', 'mes', 'año', 'personalizado'];
    if (!periodos_validos.includes(periodo)) {
      return res.status(400).json({ mensaje: 'Período no válido. Usar: dia, semana, mes, año o personalizado' });
    }
    
    // Establecer fechas de inicio y fin según el período
    let fechaInicio, fechaFin;
    const hoy = new Date();
    
    if (periodo === 'personalizado') {
      if (!fecha_inicio || !fecha_fin) {
        return res.status(400).json({ mensaje: 'Para el período personalizado, se deben proporcionar fecha_inicio y fecha_fin' });
      }
      fechaInicio = new Date(fecha_inicio);
      fechaFin = new Date(fecha_fin);
    } else if (periodo === 'dia') {
      fechaInicio = new Date(hoy.setHours(0, 0, 0, 0));
      fechaFin = new Date(hoy.setHours(23, 59, 59, 999));
    } else if (periodo === 'semana') {
      const primerDiaSemana = new Date(hoy);
      primerDiaSemana.setDate(hoy.getDate() - hoy.getDay()); // Domingo
      primerDiaSemana.setHours(0, 0, 0, 0);
      
      const ultimoDiaSemana = new Date(primerDiaSemana);
      ultimoDiaSemana.setDate(primerDiaSemana.getDate() + 6); // Sábado
      ultimoDiaSemana.setHours(23, 59, 59, 999);
      
      fechaInicio = primerDiaSemana;
      fechaFin = ultimoDiaSemana;
    } else if (periodo === 'mes') {
      const primerDiaMes = new Date(hoy.getFullYear(), hoy.getMonth(), 1);
      const ultimoDiaMes = new Date(hoy.getFullYear(), hoy.getMonth() + 1, 0);
      
      fechaInicio = new Date(primerDiaMes.setHours(0, 0, 0, 0));
      fechaFin = new Date(ultimoDiaMes.setHours(23, 59, 59, 999));
    } else if (periodo === 'año') {
      fechaInicio = new Date(hoy.getFullYear(), 0, 1, 0, 0, 0, 0);
      fechaFin = new Date(hoy.getFullYear(), 11, 31, 23, 59, 59, 999);
    }
    
    // Construir condiciones de búsqueda
    const where = {
      usuario_id,
      fecha: {
        [Op.between]: [fechaInicio, fechaFin]
      }
    };
    
    // Verificar si el usuario es administrador
    const esAdmin = req.usuario.is_staff || req.usuario.is_superuser;
    if (esAdmin && req.query.usuario_id) {
      // Si es admin y se proporciona un usuario_id, buscar sesiones de ese usuario
      where.usuario_id = req.query.usuario_id;
    }
    
    // Obtener total de ejercicios realizados
    const totalEjercicios = await SesionEjercicio.count({ where });
    
    // Obtener ejercicios agrupados por tipo
    const ejerciciosPorTipo = await SesionEjercicio.findAll({
      attributes: [
        [Sequelize.literal('ejercicio.grupo_muscular'), 'grupo_muscular'],
        [Sequelize.fn('COUNT', Sequelize.col('ejercicio_id')), 'total']
      ],
      include: [
        {
          model: Ejercicio,
          as: 'ejercicio',
          attributes: []
        }
      ],
      where,
      group: [Sequelize.literal('ejercicio.grupo_muscular')],
      raw: true
    });
    
    // Calcular series y repeticiones totales
    const totales = await SesionEjercicio.findOne({
      attributes: [
        [Sequelize.fn('SUM', Sequelize.col('series_completadas')), 'series_totales'],
        [Sequelize.fn('SUM', Sequelize.col('repeticiones_completadas')), 'repeticiones_totales']
      ],
      where,
      raw: true
    });
    
    // Formatear los datos para la respuesta
    const ejerciciosPorTipoFormateado = {};
    ejerciciosPorTipo.forEach(item => {
      const grupo = item.grupo_muscular || 'Sin categoría';
      ejerciciosPorTipoFormateado[grupo] = parseInt(item.total);
    });
    
    res.status(200).json({
      periodo,
      fecha_inicio: fechaInicio,
      fecha_fin: fechaFin,
      total_ejercicios: totalEjercicios,
      ejercicios_por_tipo: ejerciciosPorTipoFormateado,
      series_totales: parseInt(totales.series_totales) || 0,
      repeticiones_totales: parseInt(totales.repeticiones_totales) || 0
    });
  } catch (error) {
    console.error('Error al obtener estadísticas:', error);
    res.status(500).json({ mensaje: 'Error al obtener estadísticas', error: error.message });
  }
};

module.exports = {
  registrarSesion,
  obtenerSesiones,
  obtenerEstadisticas
};
