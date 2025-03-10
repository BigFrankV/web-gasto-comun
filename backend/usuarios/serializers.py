from rest_framework import serializers
from django.contrib.auth.password_validation import validate_password
from .models import Usuario

class UsuarioSerializer(serializers.ModelSerializer):
    """
    Serializador para el modelo Usuario que incluye todos los campos.
    """
    class Meta:
        model = Usuario
        fields = ['id', 'username', 'email', 'first_name', 'last_name', 'numero_residencia', 
                  'telefono', 'rol', 'first_login', 'is_active']
        read_only_fields = ['id', 'first_login']

class UsuarioCreateSerializer(serializers.ModelSerializer):
    """
    Serializador para crear nuevos usuarios con contraseña temporal.
    Solo los administradores pueden crear usuarios.
    """
    password = serializers.CharField(write_only=True, required=True)
    
    class Meta:
        model = Usuario
        fields = ['username', 'email', 'password', 'first_name', 'last_name', 
                  'numero_residencia', 'telefono', 'rol']
    
    def create(self, validated_data):
        # Crear usuario con contraseña encriptada
        user = Usuario.objects.create(
            username=validated_data['username'],
            email=validated_data['email'],
            first_name=validated_data.get('first_name', ''),
            last_name=validated_data.get('last_name', ''),
            numero_residencia=validated_data.get('numero_residencia', ''),
            telefono=validated_data.get('telefono', ''),
            rol=validated_data.get('rol', 'residente'),
            first_login=True  # Forzar cambio de contraseña en primer inicio
        )
        
        user.set_password(validated_data['password'])
        user.save()
        
        return user

class CambioPasswordSerializer(serializers.Serializer):
    """
    Serializador para cambiar la contraseña del usuario.
    """
    old_password = serializers.CharField(required=True)
    new_password = serializers.CharField(required=True)
    
    def validate_new_password(self, value):
        # Validar que la contraseña cumpla con los requisitos de seguridad
        validate_password(value)
        return value

class PrimerLoginPasswordSerializer(serializers.Serializer):
    """
    Serializador para cambiar la contraseña en el primer inicio de sesión.
    """
    new_password = serializers.CharField(required=True)
    
    def validate_new_password(self, value):
        # Validar que la contraseña cumpla con los requisitos de seguridad
        validate_password(value)
        return value

class LoginSerializer(serializers.Serializer):
    """
    Serializador para el login de usuarios.
    """
    username = serializers.CharField(required=True)
    password = serializers.CharField(required=True, write_only=True)
