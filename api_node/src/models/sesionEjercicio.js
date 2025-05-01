const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Usuario = require('./usuario');
const Rutina = require('./rutina');
const Ejercicio = require('./ejercicio');

// Modelo SesionEjercicio - mapea a la tabla rutinas_sesionejercicio de Django
const SesionEjercicio = sequelize.define('rutinas_sesionejercicio', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  fecha: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  series_completadas: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  repeticiones_completadas: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  peso_utilizado: {
    type: DataTypes.DECIMAL(5, 2),
    allowNull: true
  },
  duracion: {
    type: DataTypes.INTEGER, // Guardado en segundos
    allowNull: true
  },
  notas: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users_usuario',
      key: 'id'
    }
  },
  rutina_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'rutinas_rutina',
      key: 'id'
    }
  },
  ejercicio_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'rutinas_ejercicio',
      key: 'id'
    }
  }
}, {
  tableName: 'rutinas_sesionejercicio',
  timestamps: false
});

// Definir las relaciones
SesionEjercicio.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
SesionEjercicio.belongsTo(Rutina, { foreignKey: 'rutina_id', as: 'rutina' });
SesionEjercicio.belongsTo(Ejercicio, { foreignKey: 'ejercicio_id', as: 'ejercicio' });

module.exports = SesionEjercicio;
