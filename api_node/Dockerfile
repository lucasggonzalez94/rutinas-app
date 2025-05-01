FROM node:18-slim

# Instalar dependencias necesarias para compilar módulos nativos
RUN apt-get update && \
    apt-get install -y python3 make g++ python3-dev

WORKDIR /app

COPY package*.json ./
RUN npm install --build-from-source

COPY . .

EXPOSE 3000

CMD ["npm", "run", "dev"]
