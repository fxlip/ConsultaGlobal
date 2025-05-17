# Estágio de construção
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