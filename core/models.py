from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    class Role(models.TextChoices):
        CLIENTE = 'cliente', 'Cliente'
        EMPLEADO = 'empleado', 'Empleado'
        JEFE = 'jefe', 'Jefe'

    role = models.CharField(
        max_length=10,
        choices=Role.choices,
        default=Role.CLIENTE,
    )
    email = models.EmailField(unique=True, verbose_name='correo electronico')
    phone = models.CharField(max_length=20, blank=True, null=True)
    address = models.CharField(max_length=255, blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.username} ({self.role})"


class SheetMaterial(models.Model):
    name = models.CharField(max_length=100)
    thickness_mm = models.DecimalField(max_digits=5, decimal_places=2)
    max_width_mm = models.DecimalField(max_digits=6, decimal_places=2)
    max_length_mm = models.DecimalField(max_digits=6, decimal_places=2)
    stock = models.PositiveIntegerField(default=0, verbose_name='stock disponible')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"{self.name} ({self.thickness_mm}mm) - Stock: {self.stock}"


class Order(models.Model):
    class Status(models.TextChoices):
        PENDIENTE = 'pendiente', 'Pendiente'
        CONFIRMADO = 'confirmado', 'Confirmado'
        EN_PRODUCCION = 'en_produccion', 'En Producción'
        FINALIZADO = 'finalizado', 'Finalizado'
        CANCELADO = 'cancelado', 'Cancelado'

    customer = models.ForeignKey(
        User,
        on_delete=models.CASCADE,
        related_name='orders',
        limit_choices_to={'role': 'cliente'},
    )
    employee = models.ForeignKey(
        User,
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='processed_orders',
        limit_choices_to={'role__in': ['empleado', 'jefe']},
    )
    status = models.CharField(
        max_length=20,
        choices=Status.choices,
        default=Status.PENDIENTE,
    )
    notes = models.TextField(blank=True, default='')

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Pedido #{self.pk} - {self.customer.username} ({self.status})"


class OrderItem(models.Model):
    order = models.ForeignKey(
        Order,
        on_delete=models.CASCADE,
        related_name='items',
    )
    sheet_material = models.ForeignKey(
        SheetMaterial,
        on_delete=models.SET_NULL,
        null=True,
        related_name='order_items',
    )
    width_mm = models.DecimalField(max_digits=6, decimal_places=2)
    length_mm = models.DecimalField(max_digits=6, decimal_places=2)
    thickness_mm = models.DecimalField(max_digits=5, decimal_places=2)
    shape = models.CharField(max_length=100)
    folds = models.TextField(
        blank=True,
        default='',
        help_text='Descripción de los pliegues',
    )
    blueprint = models.ImageField(
        upload_to='blueprints/',
        null=True,
        blank=True,
        help_text='Plano o dibujo del pliegue',
    )

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Item #{self.pk} - {self.width_mm}x{self.length_mm}mm"
