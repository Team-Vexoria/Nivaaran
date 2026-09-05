import { prisma } from '../core/prisma';

export async function pollOutbox() {
  const pending = await prisma.outboxEvent.findMany({ where: { status: 'PENDING' }, take: 10 });
  for (const ev of pending) {
    // dispatch to event bus / notification
    await prisma.outboxEvent.update({
      where: { id: ev.id },
      data: { status: 'DISPATCHED', dispatched_at: new Date() },
    });
  }
}
