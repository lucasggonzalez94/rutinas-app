from django.db import models
from django.conf import settings

# Create your models here.

class Ejercicio(models.Model):
    """
    Modelo para representar los ejercicios disponibles en el sistema.
    """
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True, null=True)
    grupo_muscular = models.CharField(max_length=50, blank=True, null=True)
    imagen = models.URLField(blank=True, null=True)
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        verbose_name = "Ejercicio"
        verbose_name_plural = "Ejercicios"
        ordering = ['nombre']
    
    def __str__(self):
        return self.nombre

class Rutina(models.Model):
    """
    Modelo para representar las rutinas de ejercicio de los usuarios.
    """
    DIAS_SEMANA = (
        ('L', 'Lunes'),
        ('M', 'Martes'),
        ('X', 'Miércoles'),
        ('J', 'Jueves'),
        ('V', 'Viernes'),
        ('S', 'Sábado'),
        ('D', 'Domingo'),
    )
    
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE, related_name='rutinas')
    nombre = models.CharField(max_length=100)
    descripcion = models.TextField(blank=True, null=True)
    dias = models.CharField(max_length=7, blank=True, null=True, help_text="Días de la semana (L,M,X,J,V,S,D)")
    hora = models.TimeField(blank=True, null=True)
    ejercicios = models.ManyToManyField(Ejercicio, through='RutinaEjercicio')
    fecha_creacion = models.DateTimeField(auto_now_add=True)
    fecha_actualizacion = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name = "Rutina"
        verbose_name_plural = "Rutinas"
        ordering = ['usuario', 'nombre']
    
    def __str__(self):
        return f"{self.nombre} - {self.usuario.username}"

class RutinaEjercicio(models.Model):
    """
    Modelo para representar la relación entre rutinas y ejercicios,
    incluyendo detalles específicos como series, repeticiones, etc.
    """
    rutina = models.ForeignKey(Rutina, on_delete=models.CASCADE)
    ejercicio = models.ForeignKey(Ejercicio, on_delete=models.CASCADE)
    series = models.PositiveIntegerField(default=3)
    repeticiones = models.PositiveIntegerField(default=12)
    peso = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    duracion = models.DurationField(blank=True, null=True)
    notas = models.TextField(blank=True, null=True)
    orden = models.PositiveIntegerField(default=1)
    
    class Meta:
        verbose_name = "Ejercicio de Rutina"
        verbose_name_plural = "Ejercicios de Rutina"
        ordering = ['rutina', 'orden']
        unique_together = ['rutina', 'ejercicio', 'orden']
    
    def __str__(self):
        return f"{self.ejercicio.nombre} ({self.series}x{self.repeticiones}) - {self.rutina.nombre}"

class SesionEjercicio(models.Model):
    """
    Modelo para registrar cada vez que un usuario completa una rutina o ejercicio.
    Útil para análisis y estadísticas.
    """
    usuario = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    rutina = models.ForeignKey(Rutina, on_delete=models.CASCADE)
    ejercicio = models.ForeignKey(Ejercicio, on_delete=models.CASCADE)
    fecha = models.DateTimeField(auto_now_add=True)
    series_completadas = models.PositiveIntegerField()
    repeticiones_completadas = models.PositiveIntegerField()
    peso_utilizado = models.DecimalField(max_digits=5, decimal_places=2, blank=True, null=True)
    duracion = models.DurationField(blank=True, null=True)
    notas = models.TextField(blank=True, null=True)
    
    class Meta:
        verbose_name = "Sesión de Ejercicio"
        verbose_name_plural = "Sesiones de Ejercicio"
        ordering = ['-fecha']
    
    def __str__(self):
        return f"{self.ejercicio.nombre} - {self.usuario.username} - {self.fecha.strftime('%d/%m/%Y %H:%M')}"
