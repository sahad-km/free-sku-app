FROM node:22-alpine
RUN apk add --no-cache openssl

EXPOSE 3000

ENV NODE_ENV=production

WORKDIR /app

RUN npm config set legacy-peer-deps true

COPY package.json package-lock.json* ./

RUN npm install

COPY . .

RUN npm run build

CMD ["npm", "run", "docker-start"]
