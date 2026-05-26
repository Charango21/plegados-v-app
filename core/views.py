from rest_framework import viewsets
from .models import User, SheetMaterial, Order, OrderItem
from .serializers import (
    UserSerializer,
    SheetMaterialSerializer,
    OrderSerializer,
    OrderCreateSerializer,
    OrderItemSerializer,
)


class UserViewSet(viewsets.ModelViewSet):
    queryset = User.objects.all()
    serializer_class = UserSerializer


class SheetMaterialViewSet(viewsets.ModelViewSet):
    queryset = SheetMaterial.objects.all()
    serializer_class = SheetMaterialSerializer


class OrderViewSet(viewsets.ModelViewSet):
    queryset = Order.objects.all().prefetch_related('items')

    def get_serializer_class(self):
        if self.action in ('create', 'update', 'partial_update'):
            return OrderCreateSerializer
        return OrderSerializer


class OrderItemViewSet(viewsets.ModelViewSet):
    queryset = OrderItem.objects.all()
    serializer_class = OrderItemSerializer
