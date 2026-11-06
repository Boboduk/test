import { createApp } from './app.js';
import { env } from './config/env.js';
import { prisma } from './lib/prisma.js';

const app = createApp({
  frontendOrigin: env.FRONTEND_ORIGIN,
  checkDatabase: async () => { await prisma.$queryRaw`SELECT 1`; },
});

async function main() {
  // Не начинаем обслуживать запросы с неработающей конфигурацией БД.
  await prisma.$connect();
  const server = app.listen(env.PORT, env.HOST, () => {
    console.info(`Lumo API запущен на ${env.HOST}:${env.PORT}`);
  });
  server.on('error', async () => {
    console.error('Не удалось запустить HTTP-сервер');
    await prisma.$disconnect();
    process.exit(1);
  });

  let stopping = false;
  const shutdown = () => {
    if (stopping) return;
    stopping = true;
    const timeout = setTimeout(() => process.exit(1), 10_000);
    timeout.unref();
    server.close(() => {
      void prisma.$disconnect().then(() => process.exit(0), () => process.exit(1));
    });
    server.closeIdleConnections();
  };
  process.once('SIGINT', shutdown);
  process.once('SIGTERM', shutdown);
}

main().catch(async () => {
  console.error('Запуск не выполнен. Проверьте настройки и доступность PostgreSQL.');
  await prisma.$disconnect();
  process.exit(1);
});
