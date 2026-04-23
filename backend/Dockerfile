# Usamos la versión 3.12 de Python sobre Debian 12 (Bookworm) (estable y segura)
FROM python:3.12-slim-bookworm

# Variables de entorno para Python
# Evita que Python genere archivos .pyc que ensucian el contenedor.
ENV PYTHONDONTWRITEBYTECODE=1
# Fuerza a que los logs de la API (los print o errores) se muestren en tiempo real en la terminal de Docker.
ENV PYTHONUNBUFFERED=1

# Instalar dependencias del sistema requeridas para compilar psycopg2 (necesario para Postgres)
# gcc: Compilador C necesario para compilar extensiones de Python.
# libpq-dev: Librerías de desarrollo de PostgreSQL (necesarias para que Python hable con la base de datos).
# apt-get clean: Limpia la caché de paquetes para mantener la imagen ligera.
RUN apt-get update \
    && apt-get install -y gcc libpq-dev \
    && apt-get clean

# Establecer directorio de trabajo en la imagen
WORKDIR /app

# Copiar el archivo de requerimientos
COPY requirements.txt .

# Instalar las librerias de Python
# --upgrade pip: Actualiza pip a la última versión.
# --no-cache-dir: Evita que pip guarde archivos temporales, manteniendo la imagen ligera.
# -r requirements.txt: Instala todas las librerías listadas en el archivo.
RUN pip install --upgrade pip \
    && pip install --no-cache-dir -r requirements.txt

# Copiar todo el código de la API al contenedor
COPY . .

# Exponer el puerto donde correrá Uvicorn
EXPOSE 8000

# El comando de arranque se sobrescribe en el docker-compose para usar modo --reload
