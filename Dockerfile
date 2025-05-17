# Estágio de construção
#FROM node:18 AS build
#WORKDIR /app
#COPY package*.json ./
#RUN npm install
#COPY . .
#RUN npm run build

# Estágio de produção (servido por Nginx)
#FROM nginx:alpine
#RUN mkdir -p /usr/share/nginx/html
#COPY --from=build /app/dist /usr/share/nginx/html 
#COPY nginx.conf /etc/nginx/conf.d/default.conf
#EXPOSE 80
#CMD ["nginx", "-g", "daemon off;"]

# Estágio de build
#FROM node:20-alpine as build
FROM node:18 AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Estágio de produção com Nginx
FROM nginx:alpine
# Remover configuração padrão
RUN rm -rf /etc/nginx/conf.d/*
# Copiar a configuração personalizada
COPY nginx.conf /etc/nginx/conf.d/default.conf
# Copiar arquivos de build
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
# Comando padrão para iniciar o Nginx
#CMD ["nginx", "-g", "daemon off;"]