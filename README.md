# Stocker - Sistema de Gestión de Almacenes (SGA)

Stocker es una plataforma full-stack moderna diseñada para el control de inventario, gestión de lotes y trazabilidad en tiempo real de cadenas de distribución.

## 🛠 Arquitectura Tecnológica

El proyecto está construido bajo una red orquestada de **Microservicios Docker**:

- **Frontend:** React 18, ViteJS, TailwindCSS, Axios (Ejecutándose sobre contenedor `stocker_web` Node V25).
- **Backend:** FastAPI, Uvicorn, SQLModel (Pydantic + SQLAlchemy) y Alembic (Ejecutándose sobre contenedor `stocker_api` Python 3.12).
- **Base de Datos:** PostgreSQL 16 (Ejecutándose sobre contenedor `stocker_db` Alpine).

---

## 🚀 Despliegue Rápido en Desarrollo (Local)

El proyecto utiliza Docker Compose para aislar dependencias sin ensuciar tu sistema operativo anfitrión. 

### 1. Iniciar el entorno
Sitúate en la raíz del proyecto, copia las variables de entorno oficiales y corre el comando Compose. Esto descargará, instalará y preparará todo tu ecosistema.
```bash
cd docker
cp .env.example .env
docker compose up --build -d
```
* **Panel Frontend React:** [http://localhost:5173](http://localhost:5173)
* **Punto de Entrada API (FastAPI):** [http://localhost:8000](http://localhost:8000)
* **Documentación SWAGGER Interactiva:** [http://localhost:8000/docs](http://localhost:8000/docs)

### 2. Poblar la Base de Datos Inicial (Seeding)
Cuando levantas el proyecto por primera vez, PostgreSQL estara vacío. Alembic generará las tablas automáticas los primeros 10 segundos. Luego ejecuta el seeder del backend (idempotente) para cargar categorías y productos de prueba.
```bash
make seed
```

Equivalente directo (sin Makefile):
```bash
docker exec stocker_api python -m app.seed
```

Si necesitas la ruta SQL clásica, sigue disponible como alternativa:
```bash
make seed-sql
```

### 3. Comandos Makefile para el equipo
Ejecuta estos comandos desde la raíz del repositorio.

| Comando | Qué hace |
|---|---|
| `make up` | Inicializa entorno Docker (crea `.env` si no existe), construye imágenes y levanta servicios. |
| `make down` | Detiene los contenedores del entorno local. |
| `make restart` | Reinicia todo el stack con reconstrucción de imágenes. |
| `make seed` | Ejecuta el seeder Python idempotente del backend. |
| `make seed-sql` | Ejecuta el seeding SQL legacy directo sobre PostgreSQL. |

### 4. Parámetros de entorno para desarrollo
Estos parámetros se gestionan en `docker/.env` (puedes partir desde `docker/.env.example`):

| Variable | Default | Uso |
|---|---|---|
| `POSTGRES_USER` | `postgres` | Usuario de base de datos. |
| `POSTGRES_PASSWORD` | `postgres` | Password de base de datos. |
| `POSTGRES_DB` | `stocker` | Nombre de base de datos. |
| `API_PORT` | `8000` | Puerto expuesto de la API en local. |
| `FRONTEND_PORT` | `5173` | Puerto expuesto del frontend en local. |
| `FRONTEND_URL` | `http://localhost:5173` | Origen permitido por CORS para backend. |
| `VITE_API_URL` | `http://localhost:8000` | URL base de API usada por frontend. |

## 📖 Documentación Ampliada para Desarrolladores

El equipo de ingeniería mantiene un **Hub Central de Documentación** alojado directamente en el código fuente. Contiene toda la información vital sobre flujos de trabajo (Jira), convenciones de equipo, guías de estilo, explicaciones de arquitectura y reglas de Git.

👉 **Abre el archivo [`docs/index.html`](docs/index.html) en tu navegador local para acceder al portal interactivo interno.**

---
*Diseñado para la fluidez en logística y operaciones.*


## Reinicio de contenedores

Si necesitas actualizar los contenedores tras un cambio en el código o la configuración, ejecuta desde la carpeta `docker`:
```bash
docker compose down
docker compose up --build -d
```

Esto detiene los contenedores, reconstruye las imágenes con los últimos cambios y los levanta de nuevo. Los datos de la base de datos se mantienen salvo que añadas la flag `-v`, que elimina los volúmenes.
