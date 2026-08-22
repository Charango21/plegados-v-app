# Matriz de Pruebas - PLEGADOS VERDINI

**Fecha:** 2026-08-19  
**Backend:** Django REST Framework + JWT  
**Base de datos:** PostgreSQL  

---

## Roles

| Rol | Usuario | Contraseña | Permisos |
|---|---|---|---|
| JEFE (Admin) | jefe | jefe1234 | Acceso total |
| EMPLEADO | empleado | empleado1234 | Gestión de pedidos y materiales |
| CLIENTE | cliente | cliente1234 | Solo pedidos propios |
| CLIENTE 2 | cliente2 | cliente1234 | Solo pedidos propios |

---

## 1. CRUD por Roles

### 1.1 SheetMaterials (Productos/Materiales)

| # | Endpoint | Rol | Acción | Resultado Esperado |
|---|---|---|---|---|
| 1 | `GET /api/sheet-materials/` | PÚBLICO | Listar materiales | 200 OK |
| 2 | `GET /api/sheet-materials/1/` | PÚBLICO | Ver material | 200 OK |
| 3 | `POST /api/sheet-materials/` | JEFE | Crear material | 201 Created |
| 4 | `POST /api/sheet-materials/` | EMPLEADO | Crear material | 201 Created |
| 5 | `POST /api/sheet-materials/` | CLIENTE | Crear material | 403 Forbidden |
| 6 | `POST /api/sheet-materials/` | ANÓNIMO | Crear material | 401 Unauthorized |
| 7 | `PUT /api/sheet-materials/1/` | JEFE | Editar material | 200 OK |
| 8 | `PUT /api/sheet-materials/1/` | CLIENTE | Editar material | 403 Forbidden |
| 9 | `DELETE /api/sheet-materials/1/` | JEFE | Borrar material | 204 No Content |
| 10 | `DELETE /api/sheet-materials/1/` | CLIENTE | Borrar material | 403 Forbidden |
| 11 | `DELETE /api/sheet-materials/1/` | ANÓNIMO | Borrar material | 401 Unauthorized |

### 1.2 Usuarios

| # | Endpoint | Rol | Acción | Resultado Esperado |
|---|---|---|---|---|
| 12 | `GET /api/users/` | CLIENTE | Listar usuarios | ⚠️ 200 (BUG: sin permisos) |
| 13 | `DELETE /api/users/1/` | CLIENTE | Borrar usuario | ⚠️ 204 (BUG: sin permisos) |
| 14 | `GET /api/users/` | ANÓNIMO | Listar usuarios | ⚠️ 200 (BUG: sin permisos) |

### 1.3 Orders (Pedidos)

| # | Endpoint | Rol | Acción | Resultado Esperado |
|---|---|---|---|---|
| 15 | `GET /api/orders/` | CLIENTE | Ver sus pedidos | 200 OK (solo los propios) |
| 16 | `GET /api/orders/` | JEFE | Ver todos los pedidos | 200 OK |
| 17 | `POST /api/orders/` | CLIENTE | Crear pedido | 201 Created |
| 18 | `POST /api/orders/` | EMPLEADO | Crear pedido | 403 Forbidden (solo clientes) |
| 19 | `POST /api/orders/` | ANÓNIMO | Crear pedido | 401 Unauthorized |
| 20 | `PUT /api/orders/1/` | JEFE | Actualizar estado | 200 OK |
| 21 | `PUT /api/orders/1/` | CLIENTE | Actualizar estado | 403 Forbidden (no es suyo) |
| 22 | `DELETE /api/orders/1/` | JEFE | Borrar pedido | 204 No Content |

### 1.4 OrderItems

| # | Endpoint | Rol | Acción | Resultado Esperado |
|---|---|---|---|---|
| 23 | `GET /api/order-items/` | CLIENTE | Ver items | 200 OK |
| 24 | `POST /api/order-items/` | CLIENTE | Crear item | 201 Created |
| 25 | `POST /api/order-items/` | ANÓNIMO | Crear item | 401 Unauthorized |
| 26 | `DELETE /api/order-items/1/` | JEFE | Borrar item | 204 No Content |

---

## 2. Lógica de Negocio

| # | Endpoint | Rol | Acción | Resultado Esperado |
|---|---|---|---|---|
| 27 | `POST /api/register/` | PÚBLICO | Registrar usuario existente | ⚠️ 201 (BUG: email no unique) |
| 28 | `POST /api/register/` | PÚBLICO | Registrar usuario nuevo | 201 Created |
| 29 | `POST /api/orders/` | CLIENTE | Pedido con carrito vacío | ⚠️ 201 (BUG: sin validación) |
| 30 | `POST /api/order-items/` | CLIENTE | Item sin stock disponible | ⚠️ 201 (BUG: sin validación stock) |
| 31 | `POST /api/token/` | PÚBLICO | Login con credenciales válidas | 200 OK (access + refresh) |
| 32 | `POST /api/token/` | PÚBLICO | Login con credenciales inválidas | 401 Unauthorized |
| 33 | `POST /api/logout/` | CLIENTE | Cerrar sesión | 205 Reset Content |

---

## 3. Flujo Completo

| # | Secuencia | Rol | Pasos | Resultado Esperado |
|---|---|---|---|---|
| 34 | Compra completa | CLIENTE | 1. Login → 2. Ver materiales → 3. Crear pedido → 4. Agregar items → 5. Verificar stock | 200 en cada paso |
| 35 | Login → Compra → Verificar | CLIENTE | Login → POST order → POST order-item → GET order | Pedido creado con items |

---

## Hallazgos Encontrados

### 🔴 Bloqueantes

| # | Endpoint | Bug | Severidad |
|---|---|---|---|
| B1 | `GET/DELETE /api/users/` | **UserViewSet sin permission_classes** → cualquier usuario (o anónimo) puede listar/borrar/crear usuarios | CRÍTICO |
| B2 | `POST /api/register/` | **Email no es unique** → se pueden crear usuarios con el mismo email | ALTO |
| B3 | `POST /api/order-items/` | **Sin validación de stock** → se pueden crear items sin verificar disponibilidad | MEDIO |
| B4 | `POST /api/orders/` | **Sin validación de carrito vacío** → se puede crear pedido sin items | MEDIO |

### 🟡 Sugerencias

| # | Observación |
|---|---|
| S1 | `UserViewSet` no tiene serializer seguro (expone `role` editable → escalada de privilegios) |
| S2 | No hay throttling/rate limiting en endpoints públicos |
| S3 | `SECRET_KEY` hardcodeado en settings.py (no bloqueante para TP) |
