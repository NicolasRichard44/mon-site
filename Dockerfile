# Étape de build
FROM node:20 AS build
WORKDIR /src
COPY package.json package-lock.json ./
RUN npm install
COPY . .
RUN npm run build --prod --build-optimizer

# Étape de déploiement (NGINX)
FROM nginx:alpine
COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=build /src/dist/mon-site /usr/share/nginx/html
EXPOSE 3000
