from django.shortcuts import render, redirect
from django.contrib.auth import authenticate, login, logout
from django.contrib.auth.decorators import login_required
from django.http import JsonResponse
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
from .utils import obtener_datos_api
import json

# Vistas para renderizar templates

def home(request):
    """Vista principal que renderiza la página de inicio."""
    return render(request, 'home.html')

@login_required
def perfil(request):
    """Vista que renderiza el perfil del usuario."""
    # Obtener token del usuario desde la sesión
    token = request.session.get('token')
    
    # Obtener datos del usuario desde la API
    datos_usuario = obtener_datos_api('auth/perfil', token=token)
    
    if 'error' in datos_usuario:
        # Error al obtener datos del usuario
        return render(request, 'error.html', {'mensaje': 'No se pudieron obtener los datos del usuario'})
    
    return render(request, 'perfil.html', {'usuario': datos_usuario.get('usuario', {})})

@login_required
def rutinas(request):
    """Vista que renderiza la lista de rutinas del usuario."""
    # Obtener token del usuario desde la sesión
    token = request.session.get('token')
    
    # Obtener rutinas del usuario desde la API
    datos_rutinas = obtener_datos_api('rutinas', token=token)
    
    if 'error' in datos_rutinas:
        # Error al obtener rutinas
        return render(request, 'error.html', {'mensaje': 'No se pudieron obtener las rutinas'})
    
    return render(request, 'rutinas.html', {
        'rutinas': datos_rutinas.get('rutinas', []),
        'cantidad': datos_rutinas.get('cantidad', 0)
    })

@login_required
def detalle_rutina(request, rutina_id):
    """Vista que renderiza los detalles de una rutina específica."""
    # Obtener token del usuario desde la sesión
    token = request.session.get('token')
    
    # Obtener detalles de la rutina desde la API
    datos_rutina = obtener_datos_api(f'rutinas/{rutina_id}', token=token)
    
    if 'error' in datos_rutina:
        # Error al obtener detalles de la rutina
        return render(request, 'error.html', {'mensaje': 'No se pudieron obtener los detalles de la rutina'})
    
    return render(request, 'detalle_rutina.html', {'rutina': datos_rutina.get('rutina', {})})

@login_required
def ejercicios(request):
    """Vista que renderiza la lista de ejercicios disponibles."""
    # Obtener token del usuario desde la sesión
    token = request.session.get('token')
    
    # Obtener ejercicios desde la API
    datos_ejercicios = obtener_datos_api('ejercicios', token=token)
    
    if 'error' in datos_ejercicios:
        # Error al obtener ejercicios
        return render(request, 'error.html', {'mensaje': 'No se pudieron obtener los ejercicios'})
    
    return render(request, 'ejercicios.html', {
        'ejercicios': datos_ejercicios.get('ejercicios', []),
        'cantidad': datos_ejercicios.get('cantidad', 0)
    })

@login_required
def estadisticas(request):
    """Vista que renderiza las estadísticas del usuario."""
    # Obtener token del usuario desde la sesión
    token = request.session.get('token')
    
    # Obtener período de la URL o usar 'semana' por defecto
    periodo = request.GET.get('periodo', 'semana')
    
    # Obtener estadísticas desde la API
    datos_estadisticas = obtener_datos_api(f'sesiones/estadisticas?periodo={periodo}', token=token)
    
    if 'error' in datos_estadisticas:
        # Error al obtener estadísticas
        return render(request, 'error.html', {'mensaje': 'No se pudieron obtener las estadísticas'})
    
    return render(request, 'estadisticas.html', {'estadisticas': datos_estadisticas})

# Vistas para autenticación

def login_view(request):
    """Vista para el inicio de sesión."""
    if request.method == 'POST':
        username = request.POST.get('username')
        password = request.POST.get('password')
        
        # Realizar petición de login a la API
        datos_login = obtener_datos_api('auth/login', metodo='POST', datos={
            'username': username,
            'password': password
        })
        
        if 'error' in datos_login or not datos_login.get('token'):
            # Error en el login
            return render(request, 'login.html', {'error': 'Credenciales inválidas'})
        
        # Guardar el token en la sesión
        request.session['token'] = datos_login.get('token')
        
        # También autenticamos al usuario en Django para mantener la sesión
        user = authenticate(request, username=username, password=password)
        if user:
            login(request, user)
        
        return redirect('home')
    
    return render(request, 'login.html')

def registro_view(request):
    """Vista para el registro de nuevos usuarios."""
    if request.method == 'POST':
        # Obtener datos del formulario
        datos_usuario = {
            'username': request.POST.get('username'),
            'email': request.POST.get('email'),
            'password': request.POST.get('password'),
            'first_name': request.POST.get('first_name', ''),
            'last_name': request.POST.get('last_name', ''),
            'telefono': request.POST.get('telefono', ''),
            'fecha_nacimiento': request.POST.get('fecha_nacimiento', None)
        }
        
        # Realizar petición de registro a la API
        respuesta = obtener_datos_api('auth/registro', metodo='POST', datos=datos_usuario)
        
        if 'error' in respuesta or not respuesta.get('token'):
            # Error en el registro
            return render(request, 'registro.html', {'error': 'No se pudo registrar el usuario'})
        
        # Guardar el token en la sesión
        request.session['token'] = respuesta.get('token')
        
        # También creamos y autenticamos al usuario en Django para mantener la sesión
        # (Esto es necesario para usar el decorador @login_required)
        user = authenticate(request, username=datos_usuario['username'], password=datos_usuario['password'])
        if user:
            login(request, user)
        
        return redirect('home')
    
    return render(request, 'registro.html')

@login_required
def logout_view(request):
    """Vista para cerrar sesión."""
    # Eliminar el token de la sesión
    if 'token' in request.session:
        del request.session['token']
    
    # Cerrar sesión en Django
    logout(request)
    
    return redirect('login')

# API endpoints para consumir desde las plantillas con AJAX

@csrf_exempt
@login_required
def crear_rutina(request):
    """Vista para crear una nueva rutina."""
    if request.method == 'POST':
        try:
            # Obtener datos de la petición
            datos = json.loads(request.body)
            
            # Obtener token del usuario desde la sesión
            token = request.session.get('token')
            
            # Realizar petición a la API
            respuesta = obtener_datos_api('rutinas', metodo='POST', datos=datos, token=token)
            
            if 'error' in respuesta:
                return JsonResponse({'error': respuesta['error']}, status=400)
            
            return JsonResponse(respuesta)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    return JsonResponse({'error': 'Método no permitido'}, status=405)

@csrf_exempt
@login_required
def agregar_ejercicio_rutina(request, rutina_id):
    """Vista para agregar un ejercicio a una rutina."""
    if request.method == 'POST':
        try:
            # Obtener datos de la petición
            datos = json.loads(request.body)
            
            # Obtener token del usuario desde la sesión
            token = request.session.get('token')
            
            # Realizar petición a la API
            respuesta = obtener_datos_api(f'rutinas/{rutina_id}/ejercicio', metodo='POST', datos=datos, token=token)
            
            if 'error' in respuesta:
                return JsonResponse({'error': respuesta['error']}, status=400)
            
            return JsonResponse(respuesta)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    return JsonResponse({'error': 'Método no permitido'}, status=405)

@csrf_exempt
@login_required
def registrar_sesion(request):
    """Vista para registrar una nueva sesión de ejercicio."""
    if request.method == 'POST':
        try:
            # Obtener datos de la petición
            datos = json.loads(request.body)
            
            # Obtener token del usuario desde la sesión
            token = request.session.get('token')
            
            # Realizar petición a la API
            respuesta = obtener_datos_api('sesiones', metodo='POST', datos=datos, token=token)
            
            if 'error' in respuesta:
                return JsonResponse({'error': respuesta['error']}, status=400)
            
            return JsonResponse(respuesta)
        except Exception as e:
            return JsonResponse({'error': str(e)}, status=400)
    
    return JsonResponse({'error': 'Método no permitido'}, status=405)
