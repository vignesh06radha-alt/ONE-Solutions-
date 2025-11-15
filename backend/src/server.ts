import app from './app';
import { environment } from './config/environment';
import { logger } from './utils/logger';

const PORT = environment.PORT;

app.listen(PORT, () => {
  logger.info(`ONE Backend Server running on port ${PORT}`);
  logger.info(`Environment: ${environment.NODE_ENV}`);
  logger.info(`CORS Origin: ${environment.CORS_ORIGIN}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received, shutting down gracefully');
  process.exit(0);
});

process.on('SIGINT', () => {
  logger.info('SIGINT received, shutting down gracefully');
  process.exit(0);
});
