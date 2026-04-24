FROM node:22-slim

# Build tools needed to compile better-sqlite3 from source
RUN apt-get update && apt-get install -y python3 make g++ \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
# npm install (not ci) so platform-specific optional deps install correctly on ARM
RUN npm install

COPY . .
RUN npm run build

RUN mkdir -p /data

EXPOSE 3000
ENV PORT=3000
ENV HOSTNAME=0.0.0.0
ENV NODE_ENV=production
ENV DATABASE_PATH=/data/afvalapp.db

COPY docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

ENTRYPOINT ["./docker-entrypoint.sh"]
