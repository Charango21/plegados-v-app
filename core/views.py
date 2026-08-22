from rest_framework import generics, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken
from .models import User, SheetMaterial, Order, OrderItem
from .permissions import (
    IsPublicReadOrStaffWrite,
    IsOrderOwnerOrStaff,
)
from .serializers import (
    RegisterSerializer,
    UserSerializer,
    SheetMaterialSerializer,
    OrderSerializer,
    OrderCreateSerializer,
    OrderItemSerializer,
)


class RegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = RegisterSerializer
    permission_classes = [AllowAny]


class ProfileView(generics.RetrieveAPIView):
    serializer_class = UserSerializer
    permission_classes = [IsAuthenticated]

    def get_object(self):
        return self.request.user


class LogoutView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        try:
            refresh_token = request.data['refresh']
            token = RefreshToken(refresh_token)
            token.blacklist()
            return Response({'detail': 'Sesión cerrada correctamente'}, status=205)
        except KeyError:
            return Response({'detail': 'El campo refresh es obligatorio'}, status=400)
        except Exception:
            return Response({'detail': 'Token inválido o ya utilizado'}, status=400)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class SheetMaterialViewSet(viewsets.ModelViewSet):
    queryset = SheetMaterial.objects.all()
    serializer_class = SheetMaterialSerializer
    permission_classes = [IsPublicReadOrStaffWrite]


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().prefetch_related('items')
    permission_classes = [IsOrderOwnerOrStaff]

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return OrderCreateSerializer
        return OrderSerializer

    def perform_create(self, serializer):
        serializer.save(customer=self.request.user)

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.request.user.role in ('jefe', 'empleado'):
            return queryset
        return queryset.filter(customer=self.request.user)


class OrderItemViewSet(viewsets.ModelViewSet):
    queryset = OrderItem.objects.all()
    serializer_class = OrderItemSerializer
    permission_classes = [IsAuthenticated]

    def perform_create(self, serializer):
        item = serializer.save()
        sheet_material = item.sheet_material
        if sheet_material.stock > 0:
            sheet_material.stock -= 1
            sheet_material.save(update_fields=['stock'])
