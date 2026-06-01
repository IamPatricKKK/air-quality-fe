FROM node:20-alpine AS build
WORKDIR /app
ARG VITE_AIR_QUALITY_API_URL=http://localhost:3002/api/v1
ARG VITE_AIR_QUALITY_ADMIN_URL=http://localhost:5174
ARG VITE_AIR_QUALITY_BE_URL=http://localhost:8000/api/v1
ARG VITE_GOOGLE_CLIENT_ID=
ARG VITE_VAPID_PUBLIC_KEY=
ENV VITE_AIR_QUALITY_API_URL=$VITE_AIR_QUALITY_API_URL
ENV VITE_AIR_QUALITY_ADMIN_URL=$VITE_AIR_QUALITY_ADMIN_URL
ENV VITE_AIR_QUALITY_BE_URL=$VITE_AIR_QUALITY_BE_URL
ENV VITE_GOOGLE_CLIENT_ID=$VITE_GOOGLE_CLIENT_ID
ENV VITE_VAPID_PUBLIC_KEY=$VITE_VAPID_PUBLIC_KEY
RUN corepack enable && corepack prepare yarn@stable --activate
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build

FROM nginx:1.27-alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
