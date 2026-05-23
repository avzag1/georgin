FROM node:26 AS dependencies
WORKDIR /georgin
COPY package.json .
COPY package-lock.json .
RUN npm install

FROM node:26 AS builder
WORKDIR /georgin
COPY . .
COPY --from=dependencies /georgin/node_modules ./node_modules
RUN npm run build

FROM node:26 AS runner
WORKDIR /georgin
COPY --from=builder /georgin/public ./public
COPY --from=builder /georgin/package.json ./package.json
COPY --from=builder /georgin/.next ./.next
COPY --from=builder /georgin/node_modules ./node_modules
COPY --from=builder /georgin/prisma ./prisma
CMD ["npm", "start"]

# docker build -t georgin .   Создание образа (при запуске указать порт 3000)

# docker tag georgin avzag1/georgin:1.0.1    Даем нашему образу имя для заливки на dockerhub
# docker push avzag1/georgin:1.0.1          Загрузка образа на dockerhub

# docker stop $(docker ps -aq)     Остановка всех контейнеров
# docker rm $(docker ps -a -q)     Удалить все контейнеры
# docker system prune -a   Удаляет все неиспользуемые образы, а не только те, которые не привязаны к контейнерам

# Запуск приложения
# sudo docker run -d --name georgin22052026 --restart always --network="host" -e NEXTAUTH_URL="http://188.225.33.34:3000" -e AUTH_TRUST_HOST="true" -e AUTH_SECRET="$2b$10$604n1qE2vWUJ0no1pzsbXORq7SYWVQQw4DJHr8Zls8fU5nrsed9SC" -e NEXTAUTH_SECRET="$2b$10$604n1qE2vWUJ0no1pzsbXORq7SYWVQQw4DJHr8Zls8fU5nrsed9SC" avzag1/georgin:1.0.1

# Применить миграции
# docker exec -it -e DATABASE_URL="postgresql://postgres:password@127.0.0.1:5432/postgres" georgin22052026 npx prisma db push

# docker start georgin22052026   Запуск контейнера
# docker stop georgin22052026    Остановка контейнера
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