FROM node:22-alpine AS dependencies
WORKDIR /georgin
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /georgin
COPY . .
COPY --from=dependencies /georgin/node_modules ./node_modules
ARG AUTH_SECRET="$2b$10$604n1qE2vWUJ0no1pzsbXORq7SYWVQQw4DJHr8Zls8fU5nrsed9SC"
ENV AUTH_SECRET=$AUTH_SECRET
COPY prisma ./prisma/
ARG DATABASE_URL
ENV DATABASE_URL=$DATABASE_URL
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /georgin
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=builder /georgin/public ./public
COPY --from=builder /georgin/.next/standalone ./
COPY --from=builder /georgin/.next/static ./.next/static
COPY --from=builder /georgin/package.json ./package.json
COPY --from=builder /georgin/prisma ./prisma
COPY --from=builder /georgin/prisma.config.ts ./prisma.config.ts
RUN npm install @prisma/client && npm install -g prisma
EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"
# CMD ["sh", "-c", "npx prisma migrate deploy && exec node server.js"]
CMD ["sh", "-c", "npx prisma migrate deploy && exec node -r dotenv/config server.js dotenv_config_path=/var/www/georgin/.env"]

# docker build -t georgin .   Создание образа (при запуске указать порт 3000)
# docker build --no-cache -t georgin . Если нужно без кеша

# docker tag georgin avzag1/georgin:1.0.55    Даем нашему образу имя для заливки на dockerhub
# docker push avzag1/georgin:1.0.55          Загрузка образа на dockerhub

# docker rm -f georgin02062026     Удаляем старый контейнер
# docker stop $(docker ps -aq)     Остановка всех контейнеров
# docker rm $(docker ps -a -q)     Удалить все контейнеры
# docker system prune -a   Удаляет все неиспользуемые образы, а не только те, которые не привязаны к контейнерам

# docker run -d --name georgin02062026 --restart always --network="host" --env-file /var/www/georgin/.env avzag1/georgin:1.0.55

# docker logs georgin01062026 Лог запуска приложения на удаленном сервере (в т.ч. лог миграций)
# docker logs --tail 50 georgin01062026

# docker start georgin27052026   Запуск контейнера
# docker stop georgin27052026    Остановка контейнера
# docker ps -a                  Просмотр всех контейнеров

# df -h    Просмотр свободного пространства на диске
# docker container prune -f    Удалить все остановленные контейнеры
# docker image prune -a -f     Удалить неиспользуемые образы
# docker volume prune -f       Удалить неиспользуемые volume
# docker network prune -f      Удалить неиспользуемые сети
# docker system df             Вывод контейнеров, образов и кэша

# Docker Swarm - сервис для избежания простоя

# docker compose up -d

# docker login - авторизация в docker