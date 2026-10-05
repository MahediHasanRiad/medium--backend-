import cors from 'cors';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import Redis from 'ioredis';
import { PrismaClient } from '@prisma/client';
import { config } from './config';

export function buildApp(prisma: PrismaClient, redis: Redis) {
  const app = express();

  app.use(cors());
  app.use(helmet());
  app.use(express.json());
  app.use(express.urlencoded({extended: true}))

  const apiLimiter = rateLimit({
    windowMs: config.rateLimitWindowMs,
    limit: config.rateLimitMax,
    standardHeaders: 'draft-8',
    legacyHeaders: false,
    message: { error: 'Too many requests, please try again later.' },
  });

  // routers
  app.use('/api', apiLimiter);
  app.get('/health', async (_request, response) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      await redis.ping();
      return response.json({
        status: 'ok',
        services: { database: 'up', redis: 'up' },
      });
    } catch {
      return response.status(503).json({ status: 'degraded' });
    }
  });

  app.get('/api/v1', (_request, response) => {
    response.json({ name: 'medium-backend', version: 'v1' });
  });

  return app;
}
