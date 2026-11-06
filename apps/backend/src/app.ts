import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import { errorHandler, notFound } from './middleware/errors.js';

interface AppOptions {
  frontendOrigin: string;
  checkDatabase: () => Promise<void>;
}

export function createApp({ frontendOrigin, checkDatabase }: AppOptions) {
  const app = express();
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(cors({ origin: frontendOrigin, credentials: true }));
  app.use(express.json({ limit: '1mb' }));

  // Жив ли процесс: этот маршрут не зависит от доступности БД.
  app.get('/api/v1/health/live', (_req, res) => {
    res.json({ status: 'ok', service: 'lumo-api' });
  });

  // Готов ли сервис: выполняем реальный запрос к PostgreSQL.
  app.get('/api/v1/health/ready', async (_req, res) => {
    res.set('Cache-Control', 'no-store');
    try {
      await checkDatabase();
      res.json({ status: 'ok', database: 'connected' });
    } catch {
      res.status(503).json({ error: { code: 'DATABASE_UNAVAILABLE', message: 'База данных недоступна' } });
    }
  });

  app.use(notFound);
  app.use(errorHandler);
  return app;
}
