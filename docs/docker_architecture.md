# Arquitectura Dockerizada Stocker

Esta guía explica la estructura de contenedores y los pasos para levantar el entorno de desarrollo completo.

## Estructura de Contenedores

La aplicación se dividirá en tres contenedores principales operando en la misma red de Docker (`stocker-network`), lo que les permite comunicarse entre sí dinámicamente:

### 1. Database (PostgreSQL)
- **Rol:** Almacenamiento persistente de datos.
- **Imagen base:** `postgres:15-alpine` (Ligera).
- **Puertos:** `5432` expuesto a la máquina local para inspección con DBeaver/PgAdmin.
- **Volúmenes:** 
  - Archivos SQL de inicialización enlazados desde `./database/` a `/docker-entrypoint-initdb.d/` para que la base de datos se autorellene al crearse por primera vez.
  - Volumen persistente para almacenar la data sin perderla entre reinicios del contenedor.

### 2. Backend (FastAPI + SQLAlchemy)
- **Rol:** Proveer la API REST y gestionar la capa de negocio.
- **Imagen base:** `python:3.11-slim`
- **Puertos:** `8000` expuesto hacia afuera.
- **Conexión:** Se comunica con la base de datos a través de la URL de conexión interna de Docker (ej. `postgresql://user:pass@db:5432/stocker`).
- **Volúmenes:** Se enlaza el código fuente desde `./backend/` hasta `/app/` en el contenedor. Esto permitirá el *Hot-Reload* nativo de Uvicorn; es decir, podrás programar en tu ordenador y los cambios se reflejarán instantáneamente en la API.

### 3. Frontend (React + Vite)
- **Rol:** Interfaz visual de usuario.
- **Imagen base:** `node:20-alpine`
- **Puertos:** `5173` expuesto hacia afuera para acceder a la web desde tu navegador.
- **Conexión:** Consumirá la API desde la red (o apuntando a `localhost:8000`).
- **Volúmenes:** Se sincroniza el directorio `./frontend/` hacia adentro del contenedor para que Vite disponga de su *HMR (Hot Module Replacement)* y veas tus cambios de React en vivo.

## Pasos de Levantamiento (Futuro)

Una vez completada esta configuración por el equipo, el desarrollador sólo deberá seguir los siguientes pasos para iniciar su entorno de trabajo:

1. Clonar el repositorio.
2. Copiar `.env.example` a `.env` dentro de la carpeta `docker/`.
3. Ejecutar el comando de Docker Compose:
   ```bash
   cd docker
   docker compose up --build -d
   ```
4. Empezar a programar. La base de datos se habrá inicializado sola usando `database/schema.sql`.

*Fin del documento.*
