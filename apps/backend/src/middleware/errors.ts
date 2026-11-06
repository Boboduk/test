import type { ErrorRequestHandler, RequestHandler } from 'express';

export const notFound: RequestHandler = (_req, res) => {
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Маршрут не найден' } });
};

export const errorHandler: ErrorRequestHandler = (error: unknown, _req, res, _next) => {
  const failure = error as { type?: string } | null;
  if (failure?.type === 'entity.parse.failed') {
    res.status(400).json({ error: { code: 'INVALID_JSON', message: 'Некорректный JSON' } });
    return;
  }
  if (failure?.type === 'entity.too.large') {
    res.status(413).json({ error: { code: 'PAYLOAD_TOO_LARGE', message: 'Превышен размер запроса' } });
    return;
  }
  // Не возвращаем клиенту стек вызовов и внутренние сообщения БД.
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Внутренняя ошибка сервера' } });
};
