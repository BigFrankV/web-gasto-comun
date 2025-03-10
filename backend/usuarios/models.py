from django.db import models
from django.contrib.auth.models import AbstractUser
from django.utils.translation import gettext_lazy as _

class Usuario(AbstractUser):
    """
    Modelo personalizado de Usuario que extiende AbstractUser de Django
    para incluir campos adicionales necesarios para la gestión de gastos comunes.
    """
    ROLES = (
        ('admin', 'Administrador'),
        ('residente', 'Residente'),
    )
    
    # Campos personalizados
    numero_residencia = models.CharField(max_length=20, blank=True, null=True, verbose_name=_("Número de Residencia"))
    telefono = models.CharField(max_length=20, blank=True, null=True, verbose_name=_("Teléfono"))
    rol = models.CharField(max_length=10, choices=ROLES, default='residente', verbose_name=_("Rol"))
    first_login = models.BooleanField(default=True, verbose_name=_("Primer inicio de sesión"))
    
    # Campos para relacionar con otros modelos
    # Se agregarán relaciones con Gastos, Multas y Pagos
    
    class Meta:
        verbose_name = _("Usuario")
        verbose_name_plural = _("Usuarios")
    
    def __str__(self):
        return f"{self.first_name} {self.last_name} - {self.numero_residencia or 'Sin residencia'}"
    
    @property
    def nombre_completo(self):
        return f"{self.first_name} {self.last_name}"
    
    @property
    def es_admin(self):
        return self.rol == 'admin'
    
    @property
    def es_residente(self):
        return self.rol == 'residente'
