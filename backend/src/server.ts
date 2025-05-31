import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { marketRoutes } from './controllers/marketController';
import { rebalanceRoutes } from './controllers/rebalanceController';
import { errorHandler } from './utils/errorHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:4200',
  credentials: true
}));

app.use(express.json());

app.use('/api/v1/market', marketRoutes);
app.use('/api/v1/rebalance', rebalanceRoutes);

app.get('/api/v1/health', (req, res) => {
  res.json({
    status: 'healthy',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 API Health: http://localhost:${PORT}/api/v1/health`);
});

export default app;