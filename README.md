# Aplicación de Rutinas de Ejercicio

Esta aplicación permite a los usuarios registrarse y crear rutinas de ejercicio personalizadas. Cada rutina puede contener múltiples ejercicios con información detallada como series, repeticiones, peso, etc.

## Características

- Registro y autenticación de usuarios
- Creación, modificación y eliminación de rutinas de ejercicio
- Asignación de ejercicios a rutinas con detalles personalizables
- Seguimiento de sesiones de ejercicio completadas
- Estadísticas de ejercicios realizados por día, semana, mes o año
- Panel de administración de Django para gestión de datos
- API RESTful para integración con otras aplicaciones

## Tecnologías utilizadas

- Django 5.2
- Django Rest Framework (DRF)
- SQLite (Base de datos)
- Docker y Docker Compose (para despliegue)

## Estructura del proyecto

```
rutinas-app/
├── rutinas_project/     # Proyecto principal
├── users/               # Aplicación para gestión de usuarios
├── rutinas/             # Aplicación para rutinas y ejercicios
├── api/                 # Aplicación para la API
├── docker-compose.yml   # Configuración de Docker Compose
└── Dockerfile           # Definición de imagen Docker
```

## Instalación y ejecución

### Método 1: Entorno local

1. Clonar el repositorio
2. Crear un entorno virtual: `python -m venv venv`
3. Activar el entorno virtual:
   - Windows: `venv\Scripts\activate`
   - Linux/Mac: `source venv/bin/activate`
4. Instalar dependencias: `pip install -r requirements.txt`
5. Realizar migraciones: 
   - `python manage.py makemigrations`
   - `python manage.py migrate`
6. Crear un superusuario: `python manage.py createsuperuser`
7. Ejecutar el servidor: `python manage.py runserver`

### Método 2: Docker Compose

1. Clonar el repositorio
2. Ejecutar `docker-compose up -d`
3. Crear un superusuario: `docker-compose exec web python manage.py createsuperuser`

## Uso de la API

### Autenticación

- Registro: `POST /api/auth/registro/`
  ```json
  {
    "username": "usuario",
    "password": "contraseña",
    "email": "usuario@ejemplo.com"
  }
  ```

- Login: `POST /api/auth/login/`
  ```json
  {
    "username": "usuario",
    "password": "contraseña"
  }
  ```

### Endpoints principales

- Obtener rutinas del usuario: `GET /api/rutinas/`
- Crear rutina: `POST /api/rutinas/`
- Obtener ejercicios: `GET /api/ejercicios/`
- Agregar ejercicio a rutina: `POST /api/rutinas/{rutina_id}/agregar_ejercicio/`
- Obtener estadísticas: `GET /api/estadisticas/?periodo=semana`

## Autor

Desarrollado como parte de un ejercicio de programación.
