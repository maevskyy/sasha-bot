# Устанавливаем базовый образ с Node.js
FROM node:18-alpine

# Устанавливаем рабочую директорию внутри контейнера
WORKDIR /app

# Копируем package.json и package-lock.json для установки зависимостей
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install 

# Копируем весь проект в контейнер
COPY . .

# Собираем TypeScript код в JavaScript
RUN npm run build

# Указываем команду для запуска приложения
CMD ["npm", "run", "start"]

# Указываем, какой порт будет использоваться
EXPOSE 3000
