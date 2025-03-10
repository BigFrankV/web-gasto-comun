from django.db import models
from django.utils.translation import gettext_lazy as _
from usuarios.models import Usuario

class Multa(models.Model):
    """
    Modelo para gestionar las multas aplicadas a los residentes.
    """
    ESTADOS = (
        ('pendiente', 'Pendiente'),
        ('pagado', 'Pagado'),
    )
    
    usuario = models.ForeignKey(
        Usuario, 
        on_delete=models.CASCADE, 
        related_name='multas',
        verbose_name=_("Usuario")
    )
    motivo = models.CharField(
        max_length=255, 
        verbose_name=_("Motivo")
    )
    descripcion = models.TextField(
        verbose_name=_("Descripción"), 
        blank=True, 
        null=True
    )
    monto = models.DecimalField(
        max_digits=10, 
        decimal_places=0, 
        verbose_name=_("Monto")
    )
    fecha_creacion = models.DateField(
        auto_now_add=True, 
        verbose_name=_("Fecha de creación")
    )
    fecha_pago = models.DateField(
        blank=True, 
        null=True, 
        verbose_name=_("Fecha de pago")
    )
    estado = models.CharField(
        max_length=10, 
        choices=ESTADOS, 
        default='pendiente', 
        verbose_name=_("Estado")
    )
    
    class Meta:
        verbose_name = _("Multa")
        verbose_name_plural = _("Multas")
        ordering = ['-fecha_creacion']
    
    def __str__(self):
        return f"Multa {self.id} - {self.usuario.username} - ${self.monto}"
    
    def marcar_como_pagada(self):
        """
        Marca la multa como pagada y registra la fecha de pago.
        """
        from django.utils import timezone
        self.estado = 'pagado'
        self.fecha_pago = timezone.now().date()
        self.save()
