import { app } from './app';
import { prisma } from './core/prisma';
import { getConfig } from './core/config';
import { initFirebaseAdmin } from './config/firebase';
import { logger } from './core/logger';

// Configuration is loaded once at `core/config.ts` import (idempotent
// singleton), so no explicit `loadConfig()` is required here. Firebase Admin is
// initialized explicitly from the parsed service-account credentials; it
// no-ops (with a warning) in demo/test mode where no credentials are present.
initFirebaseAdmin();

const PORT = getConfig().PORT;

app.listen(PORT, () => {
  logger.info(`[NIVAARAN] Backend server listening on port ${PORT}`);
});

// Graceful shutdown
process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});