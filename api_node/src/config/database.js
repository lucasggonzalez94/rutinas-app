const { Sequelize } = require('sequelize');

// Configuración para MySQL
const sequelize = new Sequelize(
  process.env.DB_NAME || 'rutinas',
  process.env.DB_USER || 'root',
  process.env.DB_PASSWORD || 'password',
  {
    host: process.env.DB_HOST || 'mysql',
    dialect: 'mysql',
    logging: false, // Desactivar logging SQL
    define: {
      // Para trabajar con tablas Django
      underscored: true,
      timestamps: false, // Django no usa timestamps por defecto
      freezeTableName: true, // Evitar que Sequelize pluralice nombres de tablas
    }
  }
);

// Probar la conexión
const testConnection = async () => {
  try {
    await sequelize.authenticate();
    console.log('Conexión a la base de datos MySQL establecida correctamente.');
    return true;
  } catch (error) {
    console.error('No se pudo conectar a la base de datos:', error);
    return false;
  }
};

module.exports = { sequelize, testConnection };
