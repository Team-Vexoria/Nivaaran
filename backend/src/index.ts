import { app } from './app';
import { prisma } from './core/prisma';
import { getConfig } from './core/config';
import { logger } from './core/logger';

const PORT = getConfig().PORT;

app.listen(PORT, () => {
  logger.info(`[NIVAARAN] Backend server listening on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
