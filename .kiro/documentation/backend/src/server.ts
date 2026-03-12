import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import { createServer } from 'http';
import { Server } from 'socket.io';

import { config } from './config/app';
import { logger } from './utils/logger';
import { errorHandler } from './middleware/errorHandler';
import { authMiddleware } from './middleware/authMiddleware';

// Route imports
import authRoutes from './routes/authRoutes';
import documentationRoutes from './routes/documentationRoutes';
import architectureRoutes from './routes/architectureRoutes';
import roleRoutes from './routes/roleRoutes';
import flowRoutes from './routes/flowRoutes';
import impactRoutes from './routes/impactRoutes';

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: config.frontend.url,
    methods: ['GET', 'POST'],
  },
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: config.frontend.url,
  credentials: true,
}));
app.use(morgan('combined', { stream: { write: (message) => logger.info(message.trim()) } }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.status(200).json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    service: 'MediKariyer Documentation System'
  });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/documentation', authMiddleware, documentationRoutes);
app.use('/api/architecture', authMiddleware, architectureRoutes);
app.use('/api/roles', authMiddleware, roleRoutes);
app.use('/api/flows', authMiddleware, flowRoutes);
app.use('/api/impact', authMiddleware, impactRoutes);

// WebSocket connection handling
io.on('connection', (socket) => {
  logger.info(`Client connected: ${socket.id}`);
  
  socket.on('join-room', (room: string) => {
    socket.join(room);
    logger.info(`Client ${socket.id} joined room: ${room}`);
  });
  
  socket.on('disconnect', () => {
    logger.info(`Client disconnected: ${socket.id}`);
  });
});

// Error handling
app.use(errorHandler);

// Start server
const PORT = config.server.port;
server.listen(PORT, () => {
  logger.info(`Documentation System Backend running on port ${PORT}`);
  logger.info(`Environment: ${config.env}`);
});

export { app, io };