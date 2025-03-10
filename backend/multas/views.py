from django.shortcuts import render
from rest_framework import viewsets, permissions, status, filters
from rest_framework.decorators import action
from rest_framework.response import Response
from django.utils import timezone
from django_filters.rest_framework import DjangoFilterBackend
from .models import Multa
from .serializers import MultaSerializer, MultaDetalleSerializer, MultaCreateUpdateSerializer
from usuarios.models import Usuario

class IsAdminUser(permissions.BasePermission):
    """
    Permiso personalizado para permitir solo a administradores.
    """
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated and request.user.rol == 'admin'

class IsResidenteForOwnMultas(permissions.BasePermission):
    """
    Permiso para permitir a residentes ver solo sus propias multas.
    """
    def has_permission(self, request, view):
        # Verificar que el usuario esté autenticado
        if not request.user.is_authenticated:
            return False
        
        # Administradores tienen acceso completo
        if request.user.rol == 'admin':
            return True
        
        # Residentes solo pueden ver sus propias multas y solo en métodos seguros (GET, HEAD, OPTIONS)
        if request.user.rol == 'residente' and request.method in permissions.SAFE_METHODS:
            return True
        
        return False
    
    def has_object_permission(self, request, view, obj):
        # Verificar que el usuario esté autenticado
        if not request.user.is_authenticated:
            return False
            
        # Administradores tienen acceso completo
        if request.user.rol == 'admin':
            return True
        
        # Residentes solo pueden ver sus propias multas
        if request.user.rol == 'residente':
            return obj.usuario == request.user
        
        return False

class MultaViewSet(viewsets.ModelViewSet):
    """
    API endpoint para gestionar multas.
    """
    queryset = Multa.objects.all().order_by('-fecha_creacion')
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['estado', 'usuario']
    search_fields = ['motivo', 'descripcion', 'usuario__username', 'usuario__first_name', 'usuario__last_name']
    ordering_fields = ['fecha_creacion', 'monto', 'estado']
    
    permission_classes = [permissions.IsAuthenticated]
    
    def get_permissions(self):
        """
        Asigna permisos según la acción:
        - Administradores: acceso completo
        - Residentes: solo pueden ver sus propias multas
        """
        if self.action in ['create', 'update', 'partial_update', 'destroy']:
            permission_classes = [IsAdminUser]
        else:
            permission_classes = [IsResidenteForOwnMultas]
        return [permission() for permission in permission_classes]
    
    def get_serializer_class(self):
        """
        Selecciona el serializer adecuado según la acción.
        """
        if self.action in ['create', 'update', 'partial_update']:
            return MultaCreateUpdateSerializer
        elif self.action == 'retrieve':
            return MultaDetalleSerializer
        return MultaSerializer
    
    def get_queryset(self):
        """
        Filtra las multas según el rol del usuario:
        - Administradores: todas las multas
        - Residentes: solo sus propias multas
        """
        queryset = super().get_queryset()
        user = self.request.user
        
        if user.rol == 'residente':
            return queryset.filter(usuario=user)
        
        return queryset
    
    @action(detail=True, methods=['post'], permission_classes=[IsResidenteForOwnMultas])
    def marcar_como_pagada(self, request, pk=None):
        """
        Marca una multa como pagada.
        - Administradores: pueden marcar cualquier multa como pagada
        - Residentes: solo pueden marcar sus propias multas como pagadas
        """
        multa = self.get_object()
        
        # Verificar permisos
        if request.user.rol == 'residente' and multa.usuario != request.user:
            return Response(
                {"detail": "No tienes permiso para marcar esta multa como pagada."},
                status=status.HTTP_403_FORBIDDEN
            )
        
        if multa.estado == 'pagado':
            return Response(
                {"detail": "Esta multa ya está marcada como pagada."},
                status=status.HTTP_400_BAD_REQUEST
            )
        
        multa.estado = 'pagado'
        multa.fecha_pago = timezone.now().date()
        multa.save()
        
        serializer = MultaDetalleSerializer(multa)
        return Response(serializer.data)
    
    @action(detail=False, methods=['get'], permission_classes=[IsAdminUser])
    def estadisticas(self, request):
        """
        Proporciona estadísticas sobre las multas (solo para administradores).
        """
        total_multas = Multa.objects.count()
        multas_pendientes = Multa.objects.filter(estado='pendiente').count()
        multas_pagadas = Multa.objects.filter(estado='pagado').count()
        
        # Calcular el monto total de multas pendientes y pagadas
        from django.db.models import Sum
        monto_pendiente = Multa.objects.filter(estado='pendiente').aggregate(Sum('monto'))['monto__sum'] or 0
        monto_pagado = Multa.objects.filter(estado='pagado').aggregate(Sum('monto'))['monto__sum'] or 0
        
        return Response({
            'total_multas': total_multas,
            'multas_pendientes': multas_pendientes,
            'multas_pagadas': multas_pagadas,
            'monto_pendiente': monto_pendiente,
            'monto_pagado': monto_pagado,
        })
