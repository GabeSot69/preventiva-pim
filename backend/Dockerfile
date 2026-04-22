# Stage 1: Build
FROM node:23-alpine AS build

WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: Production
FROM node:23-alpine

WORKDIR /app
COPY package*.json ./
# Instala apenas dependências de produção (exclui devDependencies)
RUN npm install --omit=dev

# Copia apenas os arquivos transpilados e necessários
COPY --from=build /app/dist ./dist
# Note: Copie outros arquivos estáticos ou configs se necessário

EXPOSE 3000
CMD ["node", "dist/server.js"]
