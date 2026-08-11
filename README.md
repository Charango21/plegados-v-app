# Proyecto Backend - Django REST

## 📌 Nombre del proyecto

Backend API con Django y Django REST Framework PLEGADOS VERDINI

## 🎯 Objetivo general

Este proyecto tiene como objetivo construir la base de un backend utilizando Django y Django REST Framework. A lo largo de la cursada se desarrollará una API REST capaz de gestionar datos, usuarios y comunicación con un frontend (por ejemplo en React).

En esta primera etapa se deja preparado el entorno de desarrollo para comenzar a trabajar sobre funcionalidades más complejas en los próximos trabajos prácticos.

---

## ⚙️ Requisitos previos

Antes de comenzar, asegurarse de tener instalado:

* Python 3
* pip
* Git
* Un editor de código (por ejemplo Visual Studio Code)

Para verificar instalaciones:

```bash
python --version
pip --version
```

---

## 🚀 Pasos de instalación

1. Clonar el repositorio:

```bash
git clone <URL_DEL_REPOSITORIO>
cd <NOMBRE_DEL_REPOSITORIO>
```

2. Crear un entorno virtual:

```bash
python -m venv venv
```

3. Activar el entorno virtual:

* En Linux/Mac:

```bash
source venv/bin/activate
```

* En Windows (PowerShell):

```bash
venv\Scripts\Activate.ps1
```

4. Instalar dependencias:

```bash
pip install -r requirements.txt
```

---

## ▶️ Ejecución del proyecto

1. Aplicar migraciones:

```bash
python manage.py migrate
```

2. Crear superusuario:

```bash
python manage.py createsuperuser
```

3. Levantar el servidor:

```bash
python manage.py runserver
```

---

## 🌐 Accesos importantes

* Servidor local:

```
http://127.0.0.1:8000/
```

* Panel de administración:

```
http://127.0.0.1:8000/admin/
```

---

## 🧩 Notas adicionales

* El proyecto utiliza SQLite en esta etapa inicial.
* Más adelante se migrará a PostgreSQL.
* El frontend será integrado en este mismo repositorio en una carpeta separada.

---

## 👨‍💻 Autor

Franco Verdini

## Lo que se piensa hacer

Primero el cliente debe registrarse en la página para poder iniciar seción, lo mismo pasa con los empleados y el jefe del local.


El cliente realiza un pedido de chapa en el que ingresa:
Sus datos personales.
Las medidas de ancho y largo.
Espesor
Forma 
Pliegues
Un plano (dibujo)

Lo resibe el empleado y confirma el pedido.

---

## 📊 Modelo de datos

El sistema está diseñado para gestionar pedidos de pliegues de chapa. A continuación se describen los modelos principales:

### Users (Usuarios)
Todos los usuarios se registran en el sistema y se clasifican según su rol:
* **Cliente**: Realiza pedidos de chapa
* **Empleado**: Recibe y confirma los pedidos
* **Jefe**: Tiene acceso completo al sistema

### SheetMaterial (Material de Chapa)
Define los tipos de chapa disponibles con sus medidas máximas y espesores.

### Order (Pedido)
Representa un pedido realizado por un cliente. Contiene:
* Cliente que realiza el pedido
* Empleado asignado (opcional hasta confirmación)
* Estado del pedido (pendiente, confirmado, en producción, finalizado, cancelado)

### OrderItem (Detalle del Pedido)
Cada item dentro de un pedido contiene:
* Medidas (ancho y largo en mm)
* Espesor
* Forma
* Descripción de pliegues
* Plano/dibujo adjunto (imagen)

### Diagrama de relaciones

```
User (1) ────< Order (N) ────< OrderItem (N) >──── SheetMaterial (1)
 │
 ├── role: cliente / empleado / jefe
 └── phone, address

Order
 ├── customer → User (cliente)
 ├── employee → User (empleado/jefe, nullable)
 └── status: pendiente / confirmado / en_produccion / finalizado / cancelado

OrderItem
 ├── order → Order
 ├── sheet_material → SheetMaterial
 ├── width_mm, length_mm, thickness_mm
 ├── shape, folds
 └── blueprint (imagen)

SheetMaterial
 ├── name, thickness_mm
 └── max_width_mm, max_length_mm
```

---

## 🖥️ Frontend (React + Vite)

El frontend se desarrolla en la carpeta `frontend/`, separado del backend pero versionado en el mismo repositorio.

### Estructura de componentes (Home)

```
App (router)
├── Navbar
│   ├── Sin sesión: Login / Register
│   └── Con sesión: Perfil / Logout
├── Home (bienvenida de PLEGADOS VERDINI)
│   ├── Hero (presentación del negocio)
│   ├── Servicios (pliegues de chapa: medidas, espesor, forma)
│   └── Cómo pedir (pasos para el cliente)
├── Rutas protegidas por rol
│   ├── Cliente: NuevoPedido, MisPedidos
│   ├── Empleado: GestionarPedidos
│   └── Jefe: Panel de administración
└── Footer
```

### Flujo del pedido

1. El cliente inicia sesión (token JWT).
2. Completa el formulario de pedido: datos personales, medidas (ancho/largo), espesor, forma, pliegues y plano.
3. El pedido se envía al backend (`POST api/orders/`).
4. El empleado ve los pedidos pendientes en `GestionarPedidos` y los confirma.
5. El jefe gestiona el sistema completo desde su panel.

### Boceto / diseño inicial

[Boceto de la Home](https://drive.google.com/file/d/1mFz-VYPJZNNyWyTf5DscvZ86l1BS0zWC/view?usp=sharing)

### Comunicación con el backend

* El frontend corre en `http://localhost:3000` (configurado en `vite.config.js`).
* El backend corre en `http://127.0.0.1:8000`.
* CORS permite el origen `http://localhost:3000` para que el frontend pueda consumir la API.

---
