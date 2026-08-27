FROM node:24-alpine
WORKDIR /app
COPY package*.json ./
COPY prisma ./prisma
RUN npm ci
COPY . .
RUN npm run build
EXPOSE 7001
CMD ["node", "dist/main.js"]
