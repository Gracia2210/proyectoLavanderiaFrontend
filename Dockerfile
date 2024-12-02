# Etapa 1: Construir la aplicación Angular
FROM node:18.19.1 AS build

WORKDIR /app

# Copiar package.json y package-lock.json para instalar dependencias
COPY package*.json ./

RUN npm install

# Instalar Angular CLI globalmente
RUN npm install -g @angular/cli@16.1.0

# Copiar el código fuente
COPY . .

# Construir la aplicación en modo de desarrollo o producción
RUN ng build --configuration=development

# Etapa 2: Configurar Nginx para servir la aplicación Angular
FROM nginx:latest

# Copiar la aplicación Angular construida desde la etapa 1
COPY --from=build /app/dist/moduloepicsbot /usr/share/nginx/html

# Copiar el archivo de configuración personalizado de Nginx
#COPY nginx.conf /etc/nginx/nginx.conf

# Exponer el puerto 8080 para Google Cloud Run
EXPOSE 8080

# Comando para iniciar Nginx
CMD ["nginx", "-g", "daemon off;"]
