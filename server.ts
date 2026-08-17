import express from 'express';
import http from 'http';
import path from 'path';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { createServer as createViteServer } from 'vite';
import { apiRouter } from './server/routes/api.js';
import { wsBroadcaster } from './server/websocket/wsServer.js';

async function startServer() {
  const app = express();
  const server = http.createServer(app);
  const PORT = 3000;

  // Global Security & Parsing Middlewares
  app.use(cors({
    origin: true,
    credentials: true
  }));
  app.use(cookieParser());
  app.use(express.json({ limit: '15mb' }));
  app.use(express.urlencoded({ extended: true, limit: '15mb' }));

  // API Routes mounted FIRST
  app.use('/api', apiRouter);

  // Health check endpoint
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'ok',
      service: 'IFI Icestock Global Tournament Management System',
      version: '2.0.0-PROD',
      timestamp: new Date().toISOString()
    });
  });

  // Initialize Real-time WebSocket Broadcaster
  wsBroadcaster.init(server);

  // Vite middleware for development vs Static serving for production
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[IFI SERVER] Production server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[IFI SERVER] Failed to start server:', err);
  process.exit(1);
});
