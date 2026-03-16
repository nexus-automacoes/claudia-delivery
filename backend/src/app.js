const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const express = require('express');
const http = require('http');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { Server } = require('socket.io');

// Import routes
const authRoutes = require('./routes/auth.routes');
const menuRoutes = require('./routes/menu.routes');
const orderRoutes = require('./routes/orders.routes');
const customerRoutes = require('./routes/customers.routes');
const deliveryRoutes = require('./routes/delivery.routes');
const broadcastRoutes = require('./routes/broadcast.routes');
const publicRoutes = require('./routes/public.routes');
const whatsappRoutes = require('./routes/whatsapp.routes');

// Import middleware
const errorHandler = require('./middleware/errorHandler.middleware');

// Cardapio Arte module
const cardapioRoutes = require('../cardapio-arte/cardapio-routes');

// Import services
const { initScheduler } = require('./services/scheduler.service');
const { initSocket } = require('./services/socket.service');
const deliveryController = require('./controllers/delivery.controller');
const baileysService = require('./services/baileys.service');

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    methods: ['GET', 'POST'],
    credentials: true,
  },
});

// Initialize socket service
initSocket(io);
baileysService.setSocketIO(io);

// Middlewares
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true,
}));
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Static files for uploaded images
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Public routes (no auth required)
app.use('/public', publicRoutes);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', menuRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/delivery', deliveryRoutes);
app.use('/api/broadcast', broadcastRoutes);
app.use('/api/whatsapp', whatsappRoutes);

// Cardapio Arte — gerador de arte do dia (disable helmet CSP for this route)
app.use('/admin/cardapio', (req, res, next) => {
  res.removeHeader('Content-Security-Policy');
  next();
}, cardapioRoutes);

// Machine API webhook route
app.post('/api/webhook/machine', deliveryController.webhookMachine);

// Error handler middleware (must be last)
app.use(errorHandler);

// Start server
const PORT = process.env.PORT || 3333;

server.listen(PORT, () => {
  console.log(`[Server] Claudia Delivery backend rodando na porta ${PORT}`);
  console.log(`[Server] Ambiente: ${process.env.NODE_ENV || 'development'}`);

  // Initialize scheduler service (cron jobs)
  initScheduler();
  console.log('[Scheduler] Servico de agendamento inicializado');
});

module.exports = { app, server, io };
