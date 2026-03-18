# Stocker - Sistema de Gestión de Almacenes (SGA)

Stocker es una plataforma full-stack moderna diseñada para el control de inventario, gestión de lotes y trazabilidad en tiempo real de cadenas de distribución.

## 🛠 Arquitectura Tecnológica

El proyecto está construido bajo una red orquestada de **Microservicios Docker**:

- **Frontend:** React 18, ViteJS 8, TailwindCSS y Framer Motion (Ejecutándose sobre contenedor `stocker_web` Node V25).
- **Backend:** FastAPI, Uvicorn, SQLModel (Pydantic + SQLAlchemy) y Alembic (Ejecutándose sobre contenedor `stocker_api` Python 3.12).
- **Base de Datos:** PostgreSQL 16 (Ejecutándose sobre contenedor `stocker_db` Alpine).

## 🚀 Despliegue en Desarrollo (Local)

El proyecto utiliza Docker Compose para aislar dependencias sin ensuciar tu sistema operativo anfitrión. 

### 1. Iniciar el entorno desde cero
Sitúate en la raíz del proyecto y corre el comando Compose. Esto descargará, instalará y preparará todo tu ecosistema.
```bash
cd docker
docker compose up --build -d
```
* **Panel Frontend React:** [http://localhost:5173](http://localhost:5173)
* **Punto de Entrada API (FastAPI):** [http://localhost:8000](http://localhost:8000)
* **Documentación SWAGGER Interactiva:** [http://localhost:8000/docs](http://localhost:8000/docs)

### 2. Poblar la Base de Datos Inicial (Seeding)
Cuando levantas el proyecto por primera vez, PostgreSQL estara vacío. Alembic (gestor de migraciones) generará las tablas automáticas los primeros 10 segundos, pero debes inyectar los datos mock manualmente para habilitar el sistema.
```bash
cd docker
docker exec -i stocker_db psql -U postgres -d stocker < ../database/seed.sql
```

## 📖 Documentación Ampliada

Puedes encontrar toda la documentación oficial visual en HTML pre-compilado en la carpeta `/docs`. Abre cualquier archivo con doble click en tu navegador favorito:

- **`docs/getting_started.html`**:  Manual de Operaciones completo (Cómo borrar cachés, migrar modelos y gestionar los contenedores diarios).
- **`docs/project_structure.html`**: Árbol de directorios detallado y explicación sobre qué rol cumple cada librería instalada.
- **`docs/containers.html`**: Guía técnica DevOps sobre cómo se intercomunican los contenedores de red a red.

## 💾 Cambios Estructurales (Alembic)
Si añades/eliminas tablas de `backend/app/models.py`, actualiza la base de datos disparando sobre el contenedor `stocker_api`:
```bash
docker exec stocker_api alembic revision --autogenerate -m "Tu mensaje descriptivo"
docker exec stocker_api alembic upgrade head
```

---
*Diseñado con 🤍 para la fluidez en logística y operaciones.*
