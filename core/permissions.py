from rest_framework import permissions


STAFF_ROLES = ('jefe', 'empleado')


class IsAdminOrVendedor(permissions.BasePermission):
    def has_permission(self, request, view):
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in STAFF_ROLES
        )


class IsPublicReadOrStaffWrite(permissions.BasePermission):
    def has_permission(self, request, view):
        if request.method in permissions.SAFE_METHODS:
            return True
        return (
            request.user
            and request.user.is_authenticated
            and request.user.role in STAFF_ROLES
        )


class IsOrderOwnerOrStaff(permissions.BasePermission):
    def has_permission(self, request, view):
        if not (request.user and request.user.is_authenticated):
            return False
        if view.action == 'create':
            return request.user.role == 'cliente'
        return True

    def has_object_permission(self, request, view, obj):
        if request.user.role in STAFF_ROLES:
            return True
        return obj.customer == request.user


class IsAuthenticatedOwner(permissions.BasePermission):
    def has_permission(self, request, view):
        return request.user and request.user.is_authenticated
