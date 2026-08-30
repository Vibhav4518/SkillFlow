import { app } from './app.js';
import { env } from './config/env.config.js';
import { prisma } from './infrastructure/database/lib/prisma.js';

const server = app.listen(env.PORT, "0.0.0.0", () => {
  console.log(`Backend running on http://localhost:${env.PORT}`);
});

async function gracefulShutdown(signal: string) {
  console.log(`\n⚠️ Received ${signal}. Starting graceful shutdown...`);
  server.close(async () => {
    console.log('🔒 HTTP server closed.');
    await prisma.$disconnect();
    console.log('🐘 PostgreSQL database disconnected.');
    process.exit(0);
  });
}

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));
