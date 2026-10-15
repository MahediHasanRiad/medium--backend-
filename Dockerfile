FROM node:20-alpine AS build

WORKDIR /app
ENV DATABASE_URL=postgresql://app:app@db:5432/medium_backend?schema=public
COPY package*.json ./
RUN npm install
COPY tsconfig.json .env.example ./
COPY prisma ./prisma
COPY src ./src
RUN npm run db:generate && npm run build
RUN npm prune --omit=dev

FROM node:20-alpine AS runtime

WORKDIR /app
ENV NODE_ENV=production
COPY --from=build /app/package*.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
COPY --from=build /app/prisma ./prisma
COPY --from=build /app/generated ./generated

EXPOSE 3000
CMD ["node", "dist/src/server.js"]
