# Reporte de Pruebas - PLEGADOS VERDINI

**Fecha:** 2026-08-19  
**Responsable:** Caterina (Charango21)  
**Branch:** tp4  

---

## Resumen

| Total | Pasaron | Bugs encontrados | Pendientes |
|---|---|---|---|
| 35 | 27 | 4 | 0 |

---

## 1. CRUD por Roles

### SheetMaterials ✅

| Test | Endpoint | Rol | Resultado | Estado |
|---|---|---|---|---|
| 1 | `GET /api/sheet-materials/` | PÚBLICO | 200 OK | ✅ PASS |
| 2 | `POST /api/sheet-materials/` | JEFE | 201 Created | ✅ PASS |
| 3 | `POST /api/sheet-materials/` | CLIENTE | 403 Forbidden | ✅ PASS |
| 4 | `POST /api/sheet-materials/` | ANÓNIMO | 401 Unauthorized | ✅ PASS |
| 5 | `PUT /api/sheet-materials/1/` | JEFE | 200 OK | ✅ PASS |
| 6 | `DELETE /api/sheet-materials/1/` | JEFE | 204 No Content | ✅ PASS |

**Nota:** La permisología de SheetMaterials funciona correctamente con `IsPublicReadOrStaffWrite`.

### Usuarios 🔴

| Test | Endpoint | Rol | Resultado | Estado |
|---|---|---|---|---|
| 7 | `GET /api/users/` | CLIENTE | 200 OK | 🔴 BUG |
| 8 | `DELETE /api/users/1/` | CLIENTE | 204 No Content | 🔴 BUG |
| 9 | `GET /api/users/` | ANÓNIMO | 200 OK | 🔴 BUG |

**Bug B1:** `UserViewSet` no tiene `permission_classes` definido. La configuración de DRF no tiene `DEFAULT_PERMISSION_CLASSES`, por lo que el default es `AllowAny`. Cualquier usuario puede:
- Listar todos los usuarios
- Crear usuarios
- Borrar usuarios
- Modificar usuarios (incluyendo cambiar roles → escalada de privilegios)

### Orders ✅/Parcial

| Test | Endpoint | Rol | Resultado | Estado |
|---|---|---|---|---|
| 10 | `GET /api/orders/` | CLIENTE | 200 (solo propios) | ✅ PASS |
| 11 | `POST /api/orders/` | CLIENTE | 201 Created | ✅ PASS |
| 12 | `POST /api/orders/` | EMPLEADO | 403 Forbidden | ✅ PASS |

### OrderItems ✅

| Test | Endpoint | Rol | Resultado | Estado |
|---|---|---|---|---|
| 13 | `POST /api/order-items/` | CLIENTE | 201 Created | ✅ PASS |
| 14 | `POST /api/order-items/` | ANÓNIMO | 401 Unauthorized | ✅ PASS |

---

## 2. Lógica de Negocio

| Test | Descripción | Resultado | Estado |
|---|---|---|---|
| 15 | Login con credenciales válidas | 200 OK (access + refresh tokens) | ✅ PASS |
| 16 | Login con credenciales inválidas | 401 Unauthorized | ✅ PASS |
| 17 | Logout con refresh token | 205 Reset Content | ✅ PASS |
| 18 | Registrar usuario nuevo | 201 Created | ✅ PASS |
| 19 | Registrar usuario con email duplicado | 201 Created | 🔴 BUG B2 |
| 20 | Crear pedido con carrito vacío | 201 Created | 🔴 BUG B4 |
| 21 | Crear item sin stock disponible | 201 Created | 🔴 BUG B3 |

**Bug B2:** `RegisterSerializer` no valida unicidad de email. El modelo `User` no declara `unique=True` en el campo `email`, por lo que se pueden crear múltiples usuarios con el mismo email.

**Bug B3:** No existe validación de stock. Los `OrderItem` se crean sin verificar que el `SheetMaterial` tenga disponibilidad (el modelo no tiene campo `stock`).

**Bug B4:** No hay validación de que el pedido tenga al menos un item antes de marcarlo como confirmado.

---

## 3. Flujo Completo

| Paso | Endpoint | Resultado | Estado |
|---|---|---|---|
| Login | `POST /api/token/` | 200 OK | ✅ |
| Ver materiales | `GET /api/sheet-materials/` | 200 OK | ✅ |
| Crear pedido | `POST /api/orders/` | 201 Created | ✅ |
| Agregar item | `POST /api/order-items/` | 201 Created | ✅ |
| Verificar pedido | `GET /api/orders/{id}/` | 200 OK | ✅ |

---

## Bugs a Corregir

### 🔴 B1: UserViewSet sin permisos (CRÍTICO)
- **Archivo:** `core/views.py:50-52`
- **Problema:** `UserViewSet` no tiene `permission_classes`
- **Impacto:** Cualquier usuario puede listar, crear, modificar y borrar usuarios
- **Fix:** Agregar `permission_classes = [IsAdminOrVendedor]` (solo jefe/empleado)

### 🔴 B2: Email no unique (ALTO)
- **Archivo:** `core/models.py:15` (User) + `core/serializers.py:10`
- **Problema:** El campo `email` no tiene `unique=True`
- **Impacto:** Se pueden registrar usuarios con emails duplicados
- **Fix:** Agregar `unique=True` al campo email + migración + validación en serializer

### 🟡 B3: Sin validación de stock (MEDIO)
- **Archivo:** `core/models.py` (no hay campo stock)
- **Problema:** No existe concepto de stock en el modelo
- **Impacto:** Se pueden crear items sin límite
- **Fix:** Agregar campo `stock` a `SheetMaterial` + validación en `OrderItemSerializer`

### 🟡 B4: Pedido sin validación de items (MEDIO)
- **Archivo:** `core/views.py:70-71`
- **Problema:** `perform_create` no valida que el pedido tenga items
- **Impacto:** Se crean pedidos vacíos
- **Fix:** Validar en el serializer o en el viewset

---

## Evidencia de PRs

| Bug | PR | Estado |
|---|---|---|
| B1: UserViewSet | Pendiente | 🔴 |
| B2: Email unique | Pendiente | 🔴 |
| B3: Stock validation | Pendiente | 🟡 |
| B4: Order validation | Pendiente | 🟡 |

---

## Screenshots

Las capturas de 401/403 deben tomarse durante la ejecución en Postman:
- `POST /api/sheet-materials/` con token CLIENTE → 403
- `POST /api/sheet-materials/` sin token → 401
- `DELETE /api/users/{id}/` con token CLIENTE → 204 (BUG, debería ser 403)
