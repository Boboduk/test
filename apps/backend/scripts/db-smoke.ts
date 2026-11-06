import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { prisma } from '../src/lib/prisma.js';

// Проверяем реальные связи БД; все тестовые данные откатываются.
const rollback = new Error('Откат проверочной транзакции');
try {
  await prisma.$transaction(async (tx) => {
    const suffix = randomUUID();
    const user = await tx.user.create({ data: {
      email: `${suffix}@example.invalid`, handle: suffix,
      displayName: 'Проверка БД', passwordHash: 'not-a-login-password',
    } });
    const video = await tx.video.create({ data: {
      authorId: user.id, title: 'Проверочное видео',
      tags: { create: { tag: { create: { name: suffix } } } },
    } });
    assert.equal(video.status, 'UPLOADING');
    assert.equal(video.visibility, 'PRIVATE');
    await tx.watchLater.create({ data: { userId: user.id, videoId: video.id } });
    const comment = await tx.comment.create({ data: { authorId: user.id, videoId: video.id, body: 'Комментарий' } });
    await tx.comment.create({ data: { authorId: user.id, videoId: video.id, parentId: comment.id, body: 'Ответ' } });
    await tx.videoReaction.create({ data: { userId: user.id, videoId: video.id, type: 'LIKE' } });
    const saved = await tx.video.findUniqueOrThrow({
      where: { id: video.id }, include: { comments: true, tags: true, reactions: true },
    });
    assert.equal(saved.comments.length, 2);
    assert.equal(saved.tags.length, 1);
    assert.equal(saved.reactions.length, 1);
    await tx.video.delete({ where: { id: video.id } });
    assert.equal(await tx.watchLater.count({ where: { videoId: video.id } }), 0);
    assert.equal(await tx.comment.count({ where: { videoId: video.id } }), 0);
    throw rollback;
  });
} catch (error) {
  if (error !== rollback) throw error;
  console.info('PostgreSQL: создание, связи, каскадное удаление и откат проверены');
} finally {
  await prisma.$disconnect();
}
