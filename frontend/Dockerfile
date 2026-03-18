# Usamos la versión de Node 25, la más limpia y moderna de 2026
FROM node:25-alpine3.23

# Establecer directorio de trabajo en el contenedor
WORKDIR /app

# Copiar package.json y package-lock.json primero para usar caché de Docker
COPY package*.json ./

# Instalar dependencias
# --legacy-peer-deps: Permite instalar dependencias aunque haya conflictos de versiones (común en React).
RUN npm install --legacy-peer-deps

# Copiar el resto del código del frontend
COPY . .

# Exponer el puerto por el que sirve Vite
EXPOSE 5173

# El argumento VITE_API_URL puede definirse en el docker-compose
# ARG: Define una variable que se puede pasar al build.
# ENV: Establece la variable de entorno dentro del contenedor.
# CHOKIDAR_USEPOLLING=true: Frecuente para que el Hot Reload (Vite) en Docker funcione perfecto en local, activa un modo de "vigilancia constante" para que los cambios se reflejen al instante.
ARG VITE_API_URL
ENV VITE_API_URL=$VITE_API_URL
ENV CHOKIDAR_USEPOLLING=true

# Arrancar el servidor de desarrollo Vite disponible para redes externas (host)
CMD ["npm", "run", "dev", "--", "--host"]
