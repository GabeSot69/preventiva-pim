FROM node:24-slim

WORKDIR /app

# Copia os arquivos de pacotes
COPY package*.json ./

# O --legacy-peer-deps resolve 90% dos erros de 'exit code 1' no Angular
RUN npm install --legacy-peer-deps

# Copia o resto do código
COPY . .

# Instala o CLI globalmente para garantir que o comando 'ng' funcione
RUN npm install -g @angular/cli@19

EXPOSE 4200

CMD ["npm", "start"]