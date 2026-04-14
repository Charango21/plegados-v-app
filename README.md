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
