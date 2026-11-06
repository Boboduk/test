import dotenv from 'dotenv';
import { fileURLToPath } from 'node:url';
import { z } from 'zod';

// Путь одинаков для запуска исходников и собранного сервера.
dotenv.config({ path: fileURLToPath(new URL('../../.env', import.meta.url)), quiet: true });

const schema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  HOST: z.string().min(1).default('127.0.0.1'),
  PORT: z.coerce.number().int().min(1).max(65535).default(4000),
  DATABASE_URL: z.string().url().refine(
    (value) => ['postgres:', 'postgresql:'].includes(new URL(value).protocol),
    'Нужен адрес PostgreSQL',
  ),
  FRONTEND_ORIGIN: z.string().url().refine((value) => {
    const url = new URL(value);
    return ['http:', 'https:'].includes(url.protocol) && url.origin === value;
  }, 'Укажите origin без пути и завершающего слеша'),
});

const result = schema.safeParse(process.env);
if (!result.success) {
  // Выводим имена проблемных переменных, не раскрывая значения.
  throw new Error(`Некорректная конфигурация: ${Object.keys(result.error.flatten().fieldErrors).join(', ')}`);
}

export const env = result.data;
