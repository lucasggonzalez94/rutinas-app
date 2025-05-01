const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Rutina = require('./rutina');
const Ejercicio = require('./ejercicio');

// Modelo RutinaEjercicio - mapea a la tabla rutinas_rutinaejercicio de Django
const RutinaEjercicio = sequelize.define('rutinas_rutinaejercicio', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  series: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 3
  },
  repeticiones: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 12
  },
  peso: {
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
  orden: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 1
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
  tableName: 'rutinas_rutinaejercicio',
  timestamps: false
});

// Definir las relaciones
RutinaEjercicio.belongsTo(Rutina, { foreignKey: 'rutina_id', as: 'rutina' });
RutinaEjercicio.belongsTo(Ejercicio, { foreignKey: 'ejercicio_id', as: 'ejercicio' });

Rutina.belongsToMany(Ejercicio, { 
  through: RutinaEjercicio, 
  foreignKey: 'rutina_id', 
  otherKey: 'ejercicio_id',
  as: 'ejercicios'
});

Ejercicio.belongsToMany(Rutina, { 
  through: RutinaEjercicio, 
  foreignKey: 'ejercicio_id', 
  otherKey: 'rutina_id',
  as: 'rutinas'
});

module.exports = RutinaEjercicio;
