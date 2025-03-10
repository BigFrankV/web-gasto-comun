from rest_framework import serializers
from .models import Multa
from usuarios.models import Usuario
from usuarios.serializers import UsuarioSerializer

class MultaSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Multa con información básica.
    """
    usuario_nombre = serializers.SerializerMethodField()
    
    class Meta:
        model = Multa
        fields = [
            'id', 'usuario', 'usuario_nombre', 'motivo', 'descripcion', 
            'monto', 'fecha_creacion', 'fecha_pago', 'estado'
        ]
        read_only_fields = ['fecha_creacion']
    
    def get_usuario_nombre(self, obj):
        return f"{obj.usuario.first_name} {obj.usuario.last_name}"

class MultaDetalleSerializer(serializers.ModelSerializer):
    """
    Serializer para el modelo Multa con información detallada, incluyendo datos del usuario.
    """
    usuario_detalle = serializers.SerializerMethodField()
    
    class Meta:
        model = Multa
        fields = [
            'id', 'usuario', 'usuario_detalle', 'motivo', 'descripcion', 
            'monto', 'fecha_creacion', 'fecha_pago', 'estado'
        ]
        read_only_fields = ['fecha_creacion']
    
    def get_usuario_detalle(self, obj):
        return {
            'id': obj.usuario.id,
            'username': obj.usuario.username,
            'nombre': f"{obj.usuario.first_name} {obj.usuario.last_name}",
            'numero_residencia': obj.usuario.numero_residencia,
            'rol': obj.usuario.rol
        }

class MultaCreateUpdateSerializer(serializers.ModelSerializer):
    """
    Serializer para crear y actualizar multas.
    """
    class Meta:
        model = Multa
        fields = [
            'usuario', 'motivo', 'descripcion', 'monto', 'estado', 'fecha_pago'
        ]
    
    def validate_usuario(self, value):
        # Verificar que el usuario sea un residente
        if value.rol != 'residente':
            raise serializers.ValidationError("Solo se pueden asignar multas a residentes.")
        return value
    
    def validate(self, data):
        # Si el estado es pagado, debe tener fecha de pago
        if data.get('estado') == 'pagado' and not data.get('fecha_pago'):
            from django.utils import timezone
            data['fecha_pago'] = timezone.now().date()
        return data
