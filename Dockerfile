# Étape de build
FROM node:20 AS build
WORKDIR /src
COPY . .
RUN npm install && npm run build --prod

# Étape de déploiement (NGINX)
FROM nginx:alpine
COPY --from=build /src/dist/mon-site /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 3000
