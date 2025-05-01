from django.urls import path
from . import views

urlpatterns = [
    # Vistas para renderizar páginas
    path('', views.home, name='home'),
    path('perfil/', views.perfil, name='perfil'),
    path('rutinas/', views.rutinas, name='rutinas'),
    path('rutinas/<int:rutina_id>/', views.detalle_rutina, name='detalle_rutina'),
    path('ejercicios/', views.ejercicios, name='ejercicios'),
    path('estadisticas/', views.estadisticas, name='estadisticas'),
    
    # Autenticación
    path('login/', views.login_view, name='login'),
    path('registro/', views.registro_view, name='registro'),
    path('logout/', views.logout_view, name='logout'),
    
    # API endpoints para AJAX
    path('api/rutinas/crear/', views.crear_rutina, name='api_crear_rutina'),
    path('api/rutinas/<int:rutina_id>/ejercicio/', views.agregar_ejercicio_rutina, name='api_agregar_ejercicio'),
    path('api/sesiones/registrar/', views.registrar_sesion, name='api_registrar_sesion'),
]
