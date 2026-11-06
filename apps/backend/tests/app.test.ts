import assert from 'node:assert/strict';
import test from 'node:test';
import request from 'supertest';
import { createApp } from '../src/app.js';

const frontendOrigin = 'http://localhost:5173';

test('Проверка процесса не обращается к БД', async () => {
  const app = createApp({ frontendOrigin, checkDatabase: async () => { throw new Error('БД выключена'); } });
  const response = await request(app).get('/api/v1/health/live').expect(200);
  assert.equal(response.body.service, 'lumo-api');
  assert.equal(response.headers['x-powered-by'], undefined);
});

test('Проверка готовности вызывает запрос к БД', async () => {
  let called = false;
  const app = createApp({ frontendOrigin, checkDatabase: async () => { called = true; } });
  const response = await request(app).get('/api/v1/health/ready').expect(200);
  assert.equal(called, true);
  assert.equal(response.body.database, 'connected');
  assert.equal(response.headers['cache-control'], 'no-store');
});

test('Сбой БД возвращает 503 без внутренних данных', async () => {
  const app = createApp({ frontendOrigin, checkDatabase: async () => { throw new Error('секретный адрес'); } });
  const response = await request(app).get('/api/v1/health/ready').expect(503);
  assert.equal(response.body.error.code, 'DATABASE_UNAVAILABLE');
  assert.ok(!response.text.includes('секретный'));
});

test('Неизвестный маршрут возвращает JSON с кодом 404', async () => {
  const app = createApp({ frontendOrigin, checkDatabase: async () => {} });
  const response = await request(app).get('/api/v1/missing').expect(404);
  assert.equal(response.body.error.code, 'NOT_FOUND');
});

test('Ошибки JSON и размера тела имеют корректные коды', async () => {
  const app = createApp({ frontendOrigin, checkDatabase: async () => {} });
  const invalid = await request(app).post('/api/v1/missing').set('Content-Type', 'application/json').send('{').expect(400);
  assert.equal(invalid.body.error.code, 'INVALID_JSON');
  const large = await request(app).post('/api/v1/missing').send({ text: 'a'.repeat(1024 * 1024) }).expect(413);
  assert.equal(large.body.error.code, 'PAYLOAD_TOO_LARGE');
});

test('CORS разрешает чтение только заданному frontend', async () => {
  const app = createApp({ frontendOrigin, checkDatabase: async () => {} });
  const allowed = await request(app).get('/api/v1/health/live').set('Origin', frontendOrigin).expect(200);
  assert.equal(allowed.headers['access-control-allow-origin'], frontendOrigin);
  const other = await request(app).get('/api/v1/health/live').set('Origin', 'https://other.example').expect(200);
  assert.notEqual(other.headers['access-control-allow-origin'], 'https://other.example');
});
