from django.urls import include, path
from rest_framework.routers import DefaultRouter
from .views import UserViewSet, SheetMaterialViewSet, OrderViewSet, OrderItemViewSet

router = DefaultRouter()
router.register(r'users', UserViewSet)
router.register(r'sheet-materials', SheetMaterialViewSet)
router.register(r'orders', OrderViewSet)
router.register(r'order-items', OrderItemViewSet)

urlpatterns = [
    path('', include(router.urls)),
]
