from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario

class UsuarioAdmin(UserAdmin):
    """
    Configuración personalizada para el modelo Usuario en el panel de administración.
    """
    list_display = ('username', 'email', 'first_name', 'last_name', 'numero_residencia', 'rol', 'is_active')
    list_filter = ('rol', 'is_active', 'first_login')
    fieldsets = (
        (None, {'fields': ('username', 'password')}),
        ('Información personal', {'fields': ('first_name', 'last_name', 'email', 'numero_residencia', 'telefono')}),
        ('Permisos', {'fields': ('rol', 'is_active', 'is_staff', 'is_superuser', 'first_login')}),
        ('Fechas importantes', {'fields': ('last_login', 'date_joined')}),
    )
    add_fieldsets = (
        (None, {
            'classes': ('wide',),
            'fields': ('username', 'email', 'password1', 'password2', 'first_name', 'last_name', 'numero_residencia', 'telefono', 'rol'),
        }),
    )
    search_fields = ('username', 'email', 'first_name', 'last_name', 'numero_residencia')
    ordering = ('username',)

# Registrar el modelo Usuario con la configuración personalizada
admin.site.register(Usuario, UsuarioAdmin)
