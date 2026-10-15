import cors from 'cors';
import express from 'express';
import { rateLimit } from 'express-rate-limit';
import helmet from 'helmet';
import Redis from 'ioredis';
import { PrismaClient } from '../generated/prisma/client';
import { config } from './config';
import authRouter from './auth/auth.router';
import { errorMiddleware } from './middleware/error.middleware';

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
  app.use(apiLimiter);

  app.use('/api/v1/auth', authRouter);
  // app.use('/api/v1', userRouter);
  // app.use('/api/v1', articleRouter);
  // app.use('/api/v1', commentRouter);
  // app.use('/api/v1', likeRouter);
  // app.use('/api/v1', bookmarkRouter);
  // app.use('/api/v1', followRouter);
  // app.use('/api/v1', publicationRouter);
  // app.use('/api/v1', notificationRouter);
  // app.use('/api/v1', subscriptionRouter);
  // app.use('/api/v1', planRouter);
  // app.use('/api/v1', planFeatureRouter);
  // app.use('/api/v1', planFeatureRouter);

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

  app.use(errorMiddleware);

  return app;
}
