FROM node:23-alpine

WORKDIR /app

# Instala dependências globais úteis para dev se necessário
# RUN npm install -g nodemon tsx

# Copia arquivos de definição de pacotes
COPY package*.json ./

# Instala todas as dependências (incluindo devDependencies)
RUN npm install

# O código fonte será mapeado via volume no docker-compose, 
# mas copiamos para garantir que a imagem seja funcional sozinha
COPY . .

EXPOSE 3000

# Comando padrão para desenvolvimento com hot-reload (tsx watch)
CMD ["npm", "run", "dev"]
