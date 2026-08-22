from rest_framework import serializers
from .models import User, SheetMaterial, Order, OrderItem


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'phone', 'address')

    def create(self, validated_data):
        password = validated_data.pop('password')
        user = User(**validated_data, role=User.Role.CLIENTE)
        user.set_password(password)
        user.save()
        return user


class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ('id', 'username', 'email', 'role', 'phone', 'address', 'created_at', 'updated_at')
        read_only_fields = ('created_at', 'updated_at')


class SheetMaterialSerializer(serializers.ModelSerializer):
    class Meta:
        model = SheetMaterial
        fields = '__all__'


class OrderItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = '__all__'

    def validate(self, data):
        sheet_material = data.get('sheet_material')
        if sheet_material and sheet_material.stock <= 0:
            raise serializers.ValidationError(
                f'No hay stock disponible de {sheet_material.name}.'
            )
        return data


class OrderItemCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = OrderItem
        fields = '__all__'


class OrderSerializer(serializers.ModelSerializer):
    items = OrderItemSerializer(many=True, read_only=True)
    customer = serializers.StringRelatedField(read_only=True)
    employee = serializers.StringRelatedField(read_only=True)

    class Meta:
        model = Order
        fields = ('id', 'customer', 'employee', 'status', 'notes', 'items', 'created_at', 'updated_at')
        read_only_fields = ('created_at', 'updated_at')


class OrderCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Order
        fields = ('customer', 'employee', 'status', 'notes')
