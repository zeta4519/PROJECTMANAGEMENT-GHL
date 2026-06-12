FROM node:20-alpine

RUN apk add --no-cache python3 make g++

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

RUN mkdir -p /app/data

EXPOSE 3001

CMD ["node", "server/index.js"]
