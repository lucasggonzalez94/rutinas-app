const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');

// Modelo Ejercicio - mapea a la tabla rutinas_ejercicio de Django
const Ejercicio = sequelize.define('rutinas_ejercicio', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  nombre: {
    type: DataTypes.STRING,
    allowNull: false
  },
  descripcion: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  grupo_muscular: {
    type: DataTypes.STRING,
    allowNull: true
  },
  imagen: {
    type: DataTypes.STRING,
    allowNull: true
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  tableName: 'rutinas_ejercicio',
  timestamps: false
});

module.exports = Ejercicio;
