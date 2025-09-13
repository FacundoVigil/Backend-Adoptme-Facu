FROM node:20-alpine AS builder
WORKDIR /app

COPY package*.json ./
RUN npm ci --omit=dev
COPY . .

FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV=production \
    PORT=8080

# Copia todo lo construido
COPY --from=builder /app /app

EXPOSE 8080
CMD ["node", "src/app.js"]
