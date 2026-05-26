from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import User, SheetMaterial, Order, OrderItem


@admin.register(User)
class CustomUserAdmin(UserAdmin):
    list_display = ('username', 'email', 'role', 'phone', 'is_staff')
    list_filter = ('role', 'is_staff', 'is_active')
    fieldsets = UserAdmin.fieldsets + (
        ('Información adicional', {'fields': ('role', 'phone', 'address')}),
    )
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Información adicional', {'fields': ('role', 'phone', 'address')}),
    )


@admin.register(SheetMaterial)
class SheetMaterialAdmin(admin.ModelAdmin):
    list_display = ('name', 'thickness_mm', 'max_width_mm', 'max_length_mm')


class OrderItemInline(admin.TabularInline):
    model = OrderItem
    extra = 1


@admin.register(Order)
class OrderAdmin(admin.ModelAdmin):
    list_display = ('pk', 'customer', 'employee', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    inlines = [OrderItemInline]


@admin.register(OrderItem)
class OrderItemAdmin(admin.ModelAdmin):
    list_display = ('pk', 'order', 'shape', 'width_mm', 'length_mm')
    list_filter = ('order__status',)
