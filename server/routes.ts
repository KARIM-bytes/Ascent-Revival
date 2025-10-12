import type { Express } from "express";
import { createServer, type Server } from "http";
import authRoutes from './routes/authRoutes';
import jobRoutes from './routes/jobRoutes';
import applicationRoutes from './routes/applicationRoutes';
import adminRoutes from './routes/adminRoutes';
import notificationRoutes from './routes/notificationRoutes';
import { errorHandler } from './middleware/errorHandler';
import { initCronJobs } from './cron/jobs';

export async function registerRoutes(app: Express): Promise<Server> {
  // Register all API routes
  app.use('/api/auth', authRoutes);
  app.use('/api/jobs', jobRoutes);
  app.use('/api/applications', applicationRoutes);
  app.use('/api/admin', adminRoutes);
  app.use('/api/notifications', notificationRoutes);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.status(200).json({
      status: 'ok',
      timestamp: new Date().toISOString(),
    });
  });

  // Error handler must be registered after all routes
  app.use(errorHandler);

  // Initialize cron jobs
  initCronJobs();

  const httpServer = createServer(app);

  return httpServer;
}
