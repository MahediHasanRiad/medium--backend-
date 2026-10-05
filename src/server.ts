import Redis from 'ioredis';
import { buildApp } from './app';
import { config } from './config';
import { prisma } from './lib/prisma';

const redis = new Redis(config.redisUrl);
const app = buildApp(prisma, redis);
let server: ReturnType<typeof app.listen>;

async function start() {
  try {
    server = app.listen(config.port, config.host, () => {
      console.log(`API listening on http://${config.host}:${config.port}`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
}

async function shutdown() {
  server?.close();
  await redis.quit();
  await prisma.$disconnect();
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

start();
