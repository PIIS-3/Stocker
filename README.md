# Stocker - Sistema de Gestión de Almacenes (SGA)

Stocker es una plataforma full-stack moderna diseñada para el control de inventario, gestión de lotes y trazabilidad en tiempo real.

## 🛠 Arquitectura Tecnológica

El proyecto está construido bajo una red orquestada de **Microservicios Docker**:

- **Frontend:** React 18, ViteJS, TailwindCSS.
- **Backend:** FastAPI, SQLModel (Pydantic + SQLAlchemy) y Alembic.
- **Base de Datos:** PostgreSQL 16.

---

## 🚀 Despliegue Rápido (Makefile)

Hemos simplificado todas las operaciones comunes en un **Makefile** central. No necesitas configurar entornos manuales.

### 1. Iniciar el entorno

Asegúrate de tener Docker abierto y ejecuta:

```bash
make up
```

_Esto crea tu `.env`, construye las imágenes y levanta los servicios._

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

### 3. Acceso a las plataformas

- **Panel Frontend:** [http://localhost:5173](http://localhost:5173)
- **Documentación Interactiva (Swagger):** [http://localhost:8000/docs](http://localhost:8000/docs)
  > 💡 **Tip:** Hemos profesionalizado la documentación. Ahora incluye ejemplos reales, etiquetas por módulo y descripciones detalladas para facilitar el trabajo del Frontend.

### 4. Comandos Makefile para el equipo

Ejecuta estos comandos desde la raíz del repositorio.

| Comando                      | Qué hace                                                                                      |
| ---------------------------- | --------------------------------------------------------------------------------------------- |
| `make up`                    | Inicializa entorno Docker (crea `.env` si no existe), construye imágenes y levanta servicios. |
| `make down`                  | Detiene los contenedores del entorno local.                                                   |
| `make restart`               | Reinicia todo el stack con reconstrucción de imágenes.                                        |
| `make logs`                  | Visualiza los logs de todos los servicios en tiempo real.                                     |
| `make seed`                  | Ejecuta el seeder Python idempotente del backend.                                             |
| `make seed-sql`              | Ejecuta el seeding SQL legacy directo sobre PostgreSQL.                                       |
| `make test`                  | **Global:** Ejecuta todos los tests (Backend + Frontend).                                     |
| `make test-backend`          | Ejecuta los tests del backend (pytest).                                                       |
| `make test-frontend`         | Ejecuta los tests del frontend (Vitest).                                                      |
| `make lint`                  | **Global:** Verifica EditorConfig, ESLint y formato de Prettier.                              |
| `make format-frontend`       | Aplica automáticamente el formato Prettier al frontend.                                       |
| `make migration m="mensaje"` | Crea una nueva migración de base de datos tras cambiar modelos.                               |
| `make migrate`               | Aplica las migraciones pendientes a la base de datos.                                         |
| `make pr-check`              | **Obligatorio antes de un PR.** Ejecuta linters, formateadores y tests.                       |

### 5. Parámetros de entorno para desarrollo

Estos parámetros se gestionan en `docker/.env` (puedes partir desde `docker/.env.example`):

| Variable            | Default                 | Uso                                     |
| ------------------- | ----------------------- | --------------------------------------- |
| `POSTGRES_USER`     | `postgres`              | Usuario de base de datos.               |
| `POSTGRES_PASSWORD` | `postgres`              | Password de base de datos.              |
| `POSTGRES_DB`       | `stocker`               | Nombre de base de datos.                |
| `API_PORT`          | `8000`                  | Puerto expuesto de la API en local.     |
| `FRONTEND_PORT`     | `5173`                  | Puerto expuesto del frontend en local.  |
| `FRONTEND_URL`      | `http://localhost:5173` | Origen permitido por CORS para backend. |
| `VITE_API_URL`      | `http://localhost:8000` | URL base de API usada por frontend.     |

## 📖 Documentación Ampliada para Desarrolladores

El equipo de ingeniería mantiene un **Hub Central de Documentación** alojado directamente en el código fuente. Contiene toda la información vital sobre flujos de trabajo (Jira), convenciones de equipo, guías de estilo, explicaciones de arquitectura y reglas de Git.

👉 **Abre el archivo [`docs/index.html`](docs/index.html) en tu navegador local para acceder al portal interactivo interno.**

---

## 🔧 Comandos de Desarrollo

| Comando                      | Descripción                                                             |
| ---------------------------- | ----------------------------------------------------------------------- |
| `make up`                    | Levanta todo el stack (Frontend, Backend, DB).                          |
| `make down`                  | Detiene y elimina los contenedores.                                     |
| `make restart`               | Reinicia los servicios aplicando cambios de configuración.              |
| `make logs`                  | Visualiza los logs de todos los servicios en tiempo real.               |
| `make seed`                  | Puebla la base de datos con datos de prueba (idempotente).              |
| `make migration m="mensaje"` | Crea una nueva migración de base de datos tras cambiar modelos.         |
| `make migrate`               | Aplica las migraciones pendientes a la base de datos.                   |
| `make pr-check`              | **Obligatorio antes de un PR.** Ejecuta linters, formateadores y tests. |

---

## 📖 Documentación Interna

El equipo mantiene un **Hub Central de Documentación** interactivo. Para acceder:

👉 **Abre el archivo [`docs/index.html`](docs/index.html) en tu navegador.**

Contiene guías sobre:

- Flujo de trabajo con Jira y Git.
- Arquitectura de componentes (Diseño Atómico).
- Estándares de código y QA.

---

_Stocker Engineering Team - 2026_
