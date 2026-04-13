FROM node:20-alpine AS build
WORKDIR /app
ARG VITE_AIR_QUALITY_API_URL=http://localhost:3001/api/v1
ARG VITE_AIR_QUALITY_ADMIN_URL=http://localhost:5174
ENV VITE_AIR_QUALITY_API_URL=$VITE_AIR_QUALITY_API_URL
ENV VITE_AIR_QUALITY_ADMIN_URL=$VITE_AIR_QUALITY_ADMIN_URL
COPY package.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
