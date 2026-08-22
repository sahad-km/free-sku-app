FROM node:20-alpine
RUN apk add --no-cache openssl

EXPOSE 3000

WORKDIR /app

RUN npm config set legacy-peer-deps true

COPY package.json package-lock.json* ./

RUN npm install

COPY . .

RUN npm run build

ENV NODE_ENV=production
RUN npm prune --omit=dev && npm cache clean --force

CMD ["npm", "run", "docker-start"]
