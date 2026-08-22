FROM node:20-alpine
RUN apk add --no-cache openssl

EXPOSE 3000

ENV NODE_ENV=production

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm ci --legacy-peer-deps

COPY . .

RUN npm run build

RUN npm prune --omit=dev && npm cache clean --force

CMD ["npm", "run", "docker-start"]
