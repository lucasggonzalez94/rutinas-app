const { DataTypes } = require('sequelize');
const { sequelize } = require('../config/database');
const Usuario = require('./usuario');

// Modelo Rutina - mapea a la tabla rutinas_rutina de Django
const Rutina = sequelize.define('rutinas_rutina', {
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
  dias: {
    type: DataTypes.STRING,
    allowNull: true
  },
  hora: {
    type: DataTypes.TIME,
    allowNull: true
  },
  fecha_creacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  fecha_actualizacion: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  usuario_id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'users_usuario',
      key: 'id'
    }
  }
}, {
  tableName: 'rutinas_rutina',
  timestamps: false
});

// Definir la relación con Usuario
Rutina.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });
Usuario.hasMany(Rutina, { foreignKey: 'usuario_id', as: 'rutinas' });

module.exports = Rutina;
