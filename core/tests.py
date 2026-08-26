from django.contrib.auth import get_user_model
from rest_framework import status
from rest_framework.test import APITestCase, APIClient

from core.models import SheetMaterial, Order, OrderItem

User = get_user_model()


def get_tokens(user):
    from rest_framework_simplejwt.tokens import RefreshToken
    refresh = RefreshToken.for_user(user)
    return str(refresh.access_token)


class UserViewSetPermissionTest(APITestCase):
    """B1: UserViewSet requiere permisos de jefe/empleado."""

    def setUp(self):
        self.url = "/api/users/"
        self.jefe = User.objects.create_user(
            username="jefe_test", password="test1234", role="jefe", email="jefe@test.cl"
        )
        self.empleado = User.objects.create_user(
            username="emp_test", password="test1234", role="empleado", email="emp@test.cl"
        )
        self.cliente = User.objects.create_user(
            username="cli_test", password="test1234", role="cliente", email="cli@test.cl"
        )

    def test_sin_token_devuelve_401(self):
        r = self.client.get(self.url)
        self.assertEqual(r.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_cliente_devuelve_403(self):
        token = get_tokens(self.cliente)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        r = self.client.get(self.url)
        self.assertEqual(r.status_code, status.HTTP_403_FORBIDDEN)

    def test_empleado_devuelve_200(self):
        token = get_tokens(self.empleado)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        r = self.client.get(self.url)
        self.assertEqual(r.status_code, status.HTTP_200_OK)

    def test_jefe_devuelve_200(self):
        token = get_tokens(self.jefe)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")
        r = self.client.get(self.url)
        self.assertEqual(r.status_code, status.HTTP_200_OK)


class RegisterValidationTest(APITestCase):
    """B2: Email unique en registro."""

    def setUp(self):
        self.url = "/api/register/"
        User.objects.create_user(
            username="existente", password="test1234", email="dup@test.cl"
        )

    def test_email_duplicado_devuelve_400(self):
        r = self.client.post(self.url, {
            "username": "nuevo",
            "email": "dup@test.cl",
            "password": "testpass123",
        })
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_email_valido_devuelve_201(self):
        r = self.client.post(self.url, {
            "username": "nuevo_ok",
            "email": "nuevo@test.cl",
            "password": "testpass123",
        })
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)


class OrderItemStockTest(APITestCase):
    """B3: Validacion de stock en OrderItem."""

    def setUp(self):
        self.jefe = User.objects.create_user(
            username="jefe_stock", password="test1234", role="jefe", email="jefe.s@test.cl"
        )
        self.material = SheetMaterial.objects.create(
            name="Chapa Test", thickness_mm="0.50",
            max_width_mm="1000", max_length_mm="2000", stock=2
        )
        self.token = get_tokens(self.jefe)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")
        self.order = Order.objects.create(
            customer=self.jefe, notes="Pedido test stock"
        )

    def test_crear_item_con_stock_devuelve_201(self):
        r = self.client.post("/api/order-items/", {
            "order": self.order.id,
            "sheet_material": self.material.id,
            "width_mm": "100.00", "length_mm": "200.00",
            "thickness_mm": "0.50", "shape": "rectangular",
        })
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        self.material.refresh_from_db()
        self.assertEqual(self.material.stock, 1)

    def test_crear_item_sin_stock_devuelve_400(self):
        self.material.stock = 0
        self.material.save(update_fields=["stock"])
        r = self.client.post("/api/order-items/", {
            "order": self.order.id,
            "sheet_material": self.material.id,
            "width_mm": "100.00", "length_mm": "200.00",
            "thickness_mm": "0.50", "shape": "rectangular",
        })
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)


class OrderValidationTest(APITestCase):
    """B4: No confirmar pedido sin items."""

    def setUp(self):
        self.cliente = User.objects.create_user(
            username="cli_order", password="test1234", role="cliente", email="cli.o@test.cl"
        )
        self.material = SheetMaterial.objects.create(
            name="Chapa B4", thickness_mm="0.50",
            max_width_mm="1000", max_length_mm="2000", stock=10
        )
        self.token = get_tokens(self.cliente)
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")

    def test_crear_pedido_devuelve_201(self):
        r = self.client.post("/api/orders/", {"notes": "Pedido vacio"})
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        self.assertEqual(r.json()["status"], "pendiente")

    def test_confirmar_pedido_sin_items_devuelve_400(self):
        r = self.client.post("/api/orders/", {"notes": "Sin items"})
        order_id = r.json()["id"]
        r = self.client.patch(f"/api/orders/{order_id}/", {"status": "confirmado"})
        self.assertEqual(r.status_code, status.HTTP_400_BAD_REQUEST)

    def test_confirmar_pedido_con_items_devuelve_200(self):
        r = self.client.post("/api/orders/", {"notes": "Con items"})
        order_id = r.json()["id"]
        jefe = User.objects.create_user(
            username="jefe_b4", password="test1234", role="jefe", email="jefe.b4@test.cl"
        )
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {get_tokens(jefe)}")
        self.client.post("/api/order-items/", {
            "order": order_id, "sheet_material": self.material.id,
            "width_mm": "50.00", "length_mm": "100.00",
            "thickness_mm": "0.50", "shape": "cuadrado",
        })
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {self.token}")
        r = self.client.patch(f"/api/orders/{order_id}/", {"status": "confirmado"})
        self.assertEqual(r.status_code, status.HTTP_200_OK)


class FullFlowTest(APITestCase):
    """Flujo completo: login -> materiales -> pedido -> item -> verificar."""

    def test_flujo_completo(self):
        user = User.objects.create_user(
            username="flow_user", password="test1234", role="cliente", email="flow@test.cl"
        )
        mat = SheetMaterial.objects.create(
            name="Chapa Flow", thickness_mm="1.00",
            max_width_mm="500", max_length_mm="1000", stock=50
        )

        # 1. Login
        r = self.client.post("/api/token/", {"username": "flow_user", "password": "test1234"})
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        token = r.json()["access"]
        self.client.credentials(HTTP_AUTHORIZATION=f"Bearer {token}")

        # 2. Ver materiales (publico)
        r = self.client.get("/api/sheet-materials/")
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertGreaterEqual(len(r.json()), 1)

        # 3. Crear pedido
        r = self.client.post("/api/orders/", {"notes": "Pedido flujo"})
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)
        order_id = r.json()["id"]

        # 4. Agregar item
        r = self.client.post("/api/order-items/", {
            "order": order_id, "sheet_material": mat.id,
            "width_mm": "200.00", "length_mm": "300.00",
            "thickness_mm": "1.00", "shape": "personalizado",
        })
        self.assertEqual(r.status_code, status.HTTP_201_CREATED)

        # 5. Verificar pedido
        r = self.client.get(f"/api/orders/{order_id}/")
        self.assertEqual(r.status_code, status.HTTP_200_OK)
        self.assertEqual(len(r.json()["items"]), 1)

        # 6. Verificar stock decrementado
        mat.refresh_from_db()
        self.assertEqual(mat.stock, 49)
