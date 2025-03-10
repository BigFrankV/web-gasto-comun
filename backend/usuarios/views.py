from django.shortcuts import render
from rest_framework import viewsets, status, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.decorators import action
from rest_framework_simplejwt.tokens import RefreshToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import authenticate
from .models import Usuario
from .serializers import (
    UsuarioSerializer, 
    UsuarioCreateSerializer, 
    CambioPasswordSerializer, 
    PrimerLoginPasswordSerializer,
    LoginSerializer
)

# Create your views here.

class IsAdminUser(permissions.BasePermission):
    """
    Permiso personalizado para verificar si el usuario es administrador.
    """
    def has_permission(self, request, view):
        return request.user and request.user.es_admin

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    """
    Serializador personalizado para incluir información adicional en el token JWT.
    """
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        
        # Agregar datos personalizados al token
        token['username'] = user.username
        token['rol'] = user.rol
        token['first_login'] = user.first_login
        token['nombre_completo'] = f"{user.first_name} {user.last_name}"
        
        return token

class CustomTokenObtainPairView(TokenObtainPairView):
    """
    Vista personalizada para obtener el token JWT con información adicional.
    """
    serializer_class = CustomTokenObtainPairSerializer

class LoginView(APIView):
    """
    Vista para manejar el login de usuarios.
    """
    permission_classes = [permissions.AllowAny]
    
    def post(self, request):
        serializer = LoginSerializer(data=request.data)
        if serializer.is_valid():
            username = serializer.validated_data['username']
            password = serializer.validated_data['password']
            
            user = authenticate(username=username, password=password)
            
            if user:
                refresh = RefreshToken.for_user(user)
                
                # Agregar datos personalizados al token
                refresh['username'] = user.username
                refresh['rol'] = user.rol
                refresh['first_login'] = user.first_login
                refresh['nombre_completo'] = f"{user.first_name} {user.last_name}"
                
                return Response({
                    'refresh': str(refresh),
                    'access': str(refresh.access_token),
                    'user': {
                        'id': user.id,
                        'username': user.username,
                        'email': user.email,
                        'first_name': user.first_name,
                        'last_name': user.last_name,
                        'rol': user.rol,
                        'first_login': user.first_login,
                    }
                })
            
            return Response(
                {'error': 'Credenciales inválidas'}, 
                status=status.HTTP_401_UNAUTHORIZED
            )
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class PrimerLoginPasswordView(APIView):
    """
    Vista para cambiar la contraseña en el primer inicio de sesión.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        # Verificar si es el primer inicio de sesión
        if not request.user.first_login:
            return Response(
                {'error': 'No es el primer inicio de sesión'}, 
                status=status.HTTP_400_BAD_REQUEST
            )
        
        serializer = PrimerLoginPasswordSerializer(data=request.data)
        if serializer.is_valid():
            # Cambiar la contraseña
            request.user.set_password(serializer.validated_data['new_password'])
            request.user.first_login = False
            request.user.save()
            
            # Generar nuevo token
            refresh = RefreshToken.for_user(request.user)
            
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'message': 'Contraseña cambiada correctamente'
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CambioPasswordView(APIView):
    """
    Vista para cambiar la contraseña del usuario.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def post(self, request):
        serializer = CambioPasswordSerializer(data=request.data)
        if serializer.is_valid():
            # Verificar contraseña actual
            if not request.user.check_password(serializer.validated_data['old_password']):
                return Response(
                    {'error': 'Contraseña actual incorrecta'}, 
                    status=status.HTTP_400_BAD_REQUEST
                )
            
            # Cambiar la contraseña
            request.user.set_password(serializer.validated_data['new_password'])
            request.user.save()
            
            # Generar nuevo token
            refresh = RefreshToken.for_user(request.user)
            
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'message': 'Contraseña cambiada correctamente'
            })
        
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UsuarioViewSet(viewsets.ModelViewSet):
    """
    ViewSet para gestionar usuarios.
    Solo los administradores pueden crear, actualizar y eliminar usuarios.
    """
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer
    
    def get_permissions(self):
        """
        Asignar permisos según la acción.
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminUser]
        else:
            permission_classes = [permissions.IsAuthenticated]
        
        return [permission() for permission in permission_classes]
    
    def get_serializer_class(self):
        """
        Seleccionar el serializador según la acción.
        """
        if self.action == 'create':
            return UsuarioCreateSerializer
        return UsuarioSerializer
    
    def get_queryset(self):
        """
        Filtrar usuarios según el rol del usuario autenticado.
        Los administradores pueden ver todos los usuarios.
        Los residentes solo pueden verse a sí mismos.
        """
        user = self.request.user
        
        if user.es_admin:
            return Usuario.objects.all()
        
        return Usuario.objects.filter(id=user.id)
    
    @action(detail=False, methods=['get'], url_path='mi-perfil')
    def mi_perfil(self, request):
        """
        Endpoint para obtener el perfil del usuario autenticado.
        """
        serializer = self.get_serializer(request.user)
        return Response(serializer.data)

class AdminDashboardView(APIView):
    """
    Vista para el dashboard de administradores.
    """
    permission_classes = [IsAdminUser]
    
    def get(self, request):
        # Datos para el dashboard de administradores
        total_residentes = Usuario.objects.filter(rol='residente').count()
        
        return Response({
            'total_residentes': total_residentes,
            # Aquí se pueden agregar más estadísticas
        })

class ResidenteDashboardView(APIView):
    """
    Vista para el dashboard de residentes.
    """
    permission_classes = [permissions.IsAuthenticated]
    
    def get(self, request):
        # Verificar que el usuario sea residente
        if not request.user.es_residente:
            return Response(
                {'error': 'No tiene permiso para acceder a esta vista'}, 
                status=status.HTTP_403_FORBIDDEN
            )
        
        # Datos para el dashboard de residentes
        return Response({
            'usuario': {
                'id': request.user.id,
                'nombre': request.user.nombre_completo,
                'residencia': request.user.numero_residencia,
            },
            # Aquí se pueden agregar más datos específicos del residente
        })
