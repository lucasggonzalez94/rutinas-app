const { Sequelize } = require('sequelize');
const path = require('path');

// Ruta a la base de datos SQLite de Django
const dbPath = path.join(__dirname, '../../../db.sqlite3');

// Configurar instancia de Sequelize
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: dbPath,
  logging: false, // Desactivar logging SQL
  define: {
    // Para trabajar con tablas Django
    underscored: true,
    timestamps: false, // Django no usa timestamps por defecto
    freezeTableName: true, // Evitar que Sequelize pluralice nombres de tablas
  }
});

// Probar la conexión
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos establecida correctamente.');
    return true;
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
    return false;
  }
};

module.exports = { sequelize, testConnection };
