from rest_framework import serializers
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from .models import User, SheetMaterial, Order, OrderItem


class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    @classmethod
    def get_token(cls, user):
        token = super().get_token(user)
        token['username'] = user.username
        token['role'] = user.role
        return token

    def validate(self, attrs):
        username = attrs.get('username')
        password = attrs.get('password')

        try:
            user = User.objects.get(username=username)
        except User.DoesNotExist:
            raise serializers.ValidationError('Credenciales incorrectas')

        if not user.check_password(password):
            raise serializers.ValidationError('Credenciales incorrectas')

        if not user.is_active:
            raise serializers.ValidationError('Usuario desactivado')

        data = {}
        refresh = self.get_token(user)
        data['refresh'] = str(refresh)
        data['access'] = str(refresh.access_token)
        data['user'] = {
            'id': user.id,
            'username': user.username,
            'email': user.email,
            'role': user.role,
        }
        return data


class RegisterSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = User
        fields = ('username', 'email', 'password', 'phone', 'address')

    def validate_email(self, value):
        if User.objects.filter(email=value).exists():
            raise serializers.ValidationError('Este email ya esta registrado.')
        return value

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
        read_only_fields = ('role', 'created_at', 'updated_at')


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
        fields = ('id', 'customer', 'employee', 'status', 'notes')
        read_only_fields = ('id', 'customer')

    def validate(self, data):
        if self.instance and self.instance.items.count() == 0:
            if data.get('status') in ('confirmado', 'en_produccion', 'finalizado'):
                raise serializers.ValidationError(
                    'No se puede confirmar un pedido sin items.'
                )
        return data
