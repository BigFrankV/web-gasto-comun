from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CustomTokenObtainPairView,
    LoginView,
    PrimerLoginPasswordView,
    CambioPasswordView,
    UsuarioViewSet,
    AdminDashboardView,
    ResidenteDashboardView
)

# Configuración del router para el ViewSet
router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet)

urlpatterns = [
    # Rutas para autenticación
    path('login/', LoginView.as_view(), name='login'),
    path('token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('primer-login-password/', PrimerLoginPasswordView.as_view(), name='primer_login_password'),
    path('cambio-password/', CambioPasswordView.as_view(), name='cambio_password'),
    
    # Dashboards
    path('admin-dashboard/', AdminDashboardView.as_view(), name='admin_dashboard'),
    path('residente-dashboard/', ResidenteDashboardView.as_view(), name='residente_dashboard'),
    
    # Incluir rutas del router
    path('', include(router.urls)),
]
