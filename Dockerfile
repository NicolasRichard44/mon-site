# Étape de build
FROM node:20 AS build
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci
COPY . .
RUN npm run build --prod --build-optimizer

# Étape de déploiement (NGINX)
FROM nginx:alpine
RUN mkdir /app
COPY --from=build /app/dist/mon-site /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
USER nginx
EXPOSE 3000
