from django.contrib import admin
from .models import Multa

# Register your models here.

@admin.register(Multa)
class MultaAdmin(admin.ModelAdmin):
    list_display = ('id', 'usuario', 'motivo', 'monto', 'fecha_creacion', 'estado')
    list_filter = ('estado', 'fecha_creacion')
    search_fields = ('usuario__username', 'usuario__first_name', 'usuario__last_name', 'motivo')
    readonly_fields = ('fecha_creacion',)
    list_per_page = 20
    
    fieldsets = (
        ('Información de la Multa', {
            'fields': ('usuario', 'motivo', 'descripcion', 'monto')
        }),
        ('Estado', {
            'fields': ('estado', 'fecha_creacion', 'fecha_pago')
        }),
    )
    
    def get_readonly_fields(self, request, obj=None):
        if obj and obj.estado == 'pagado':
            return self.readonly_fields + ('usuario', 'motivo', 'descripcion', 'monto', 'estado', 'fecha_pago')
        return self.readonly_fields
