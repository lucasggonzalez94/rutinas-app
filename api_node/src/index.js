const express = require('express');
const cors = require('cors');
const { sequelize, testConnection } = require('./config/database');

// Importación de rutas
const authRoutes = require('./routes/authRoutes');
const ejercicioRoutes = require('./routes/ejercicioRoutes');
const rutinaRoutes = require('./routes/rutinaRoutes');
const sesionRoutes = require('./routes/sesionRoutes');

// Crear aplicación Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rutas base
app.use('/api/auth', authRoutes);
app.use('/api/ejercicios', ejercicioRoutes);
app.use('/api/rutinas', rutinaRoutes);
app.use('/api/sesiones', sesionRoutes);

// Ruta principal
app.get('/', (req, res) => {
  res.json({
    mensaje: 'API de Rutinas de Ejercicio',
    endpoints: {
      auth: '/api/auth',
      ejercicios: '/api/ejercicios',
      rutinas: '/api/rutinas',
      sesiones: '/api/sesiones'
    },
    estado: 'online',
    version: '1.0.0'
  });
});

// Ruta para verificar estado
app.get('/api/status', async (req, res) => {
  try {
    await sequelize.authenticate();
    res.json({
      mensaje: 'API funcionando correctamente',
      database: 'conectada',
      estado: 'online'
    });
  } catch (error) {
    res.status(500).json({
      mensaje: 'Error en el servidor',
      database: 'error de conexión',
      error: error.message
    });
  }
});

// Manejar rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    mensaje: 'Ruta no encontrada',
    url: req.originalUrl
  });
});

// Función para esperar un tiempo determinado
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Función para intentar conectarse a la base de datos con reintentos
const conectarBaseDatos = async (intentos = 5, tiempoEspera = 5000) => {
  for (let intento = 1; intento <= intentos; intento++) {
    try {
      console.log(`Intento ${intento} de ${intentos} para conectar a la base de datos...`);
      const resultado = await testConnection();
      if (resultado) {
        return true;
      }
    } catch (error) {
      console.error(`Error en el intento ${intento}:`, error.message);
    }
    
    if (intento < intentos) {
      console.log(`Esperando ${tiempoEspera/1000} segundos antes del siguiente intento...`);
      await sleep(tiempoEspera);
    }
  }
  
  return false;
};

// Iniciar el servidor
const iniciarServidor = async () => {
  try {
    // Intentar conectar a la base de datos con reintentos
    const conexionExitosa = await conectarBaseDatos();
    
    if (!conexionExitosa) {
      console.error('No se pudo conectar a la base de datos después de varios intentos.');
    }
    
    // Iniciar el servidor incluso si la conexión a la base de datos falló
    app.listen(PORT, () => {
      console.log(`Servidor iniciado en http://localhost:${PORT}`);
      console.log('Presiona CTRL+C para detener');
    });
  } catch (error) {
    console.error('Error al iniciar el servidor:', error);
  }
};

// Iniciar servidor
iniciarServidor();
