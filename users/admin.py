from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario

class UsuarioAdmin(UserAdmin):
    """
    Configuración del Admin para el modelo de Usuario personalizado.
    """
    list_display = ('username', 'email', 'first_name', 'last_name', 'telefono', 'is_staff')
    fieldsets = UserAdmin.fieldsets + (
        ('Información adicional', {'fields': ('telefono', 'fecha_nacimiento')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Información adicional', {'fields': ('telefono', 'fecha_nacimiento')}),
    )
    search_fields = ('username', 'email', 'first_name', 'last_name', 'telefono')
    list_filter = ('is_staff', 'is_superuser', 'is_active')

admin.site.register(Usuario, UsuarioAdmin)
