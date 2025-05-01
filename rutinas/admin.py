from django.contrib import admin
from .models import Ejercicio, Rutina, RutinaEjercicio, SesionEjercicio

class RutinaEjercicioInline(admin.TabularInline):
    """
    Inline para mostrar los ejercicios de una rutina dentro del admin de Rutina.
    """
    model = RutinaEjercicio
    extra = 1
    autocomplete_fields = ['ejercicio']

@admin.register(Ejercicio)
class EjercicioAdmin(admin.ModelAdmin):
    """
    Admin para el modelo Ejercicio.
    """
    list_display = ('nombre', 'grupo_muscular', 'fecha_creacion')
    list_filter = ('grupo_muscular',)
    search_fields = ('nombre', 'descripcion', 'grupo_muscular')
    ordering = ('nombre',)

@admin.register(Rutina)
class RutinaAdmin(admin.ModelAdmin):
    """
    Admin para el modelo Rutina.
    """
    list_display = ('nombre', 'usuario', 'dias', 'hora', 'fecha_creacion')
    list_filter = ('usuario', 'dias')
    search_fields = ('nombre', 'descripcion', 'usuario__username')
    inlines = [RutinaEjercicioInline]
    autocomplete_fields = ['usuario']

@admin.register(RutinaEjercicio)
class RutinaEjercicioAdmin(admin.ModelAdmin):
    """
    Admin para el modelo RutinaEjercicio.
    """
    list_display = ('rutina', 'ejercicio', 'series', 'repeticiones', 'orden')
    list_filter = ('rutina', 'ejercicio')
    search_fields = ('rutina__nombre', 'ejercicio__nombre')
    autocomplete_fields = ['rutina', 'ejercicio']

@admin.register(SesionEjercicio)
class SesionEjercicioAdmin(admin.ModelAdmin):
    """
    Admin para el modelo SesionEjercicio.
    """
    list_display = ('usuario', 'rutina', 'ejercicio', 'fecha', 'series_completadas', 'repeticiones_completadas')
    list_filter = ('usuario', 'rutina', 'ejercicio', 'fecha')
    search_fields = ('usuario__username', 'rutina__nombre', 'ejercicio__nombre')
    date_hierarchy = 'fecha'
    autocomplete_fields = ['usuario', 'rutina', 'ejercicio']
