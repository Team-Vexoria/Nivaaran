import express, { Request, Response } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
}));

app.use(express.json());

// Health Check Endpoint
app.get('/api/health', (_req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    service: 'NIVAARAN Backend API',
    timestamp: new Date().toISOString(),
  });
});

app.listen(PORT, () => {
  console.log(`[NIVAARAN] Backend server listening on port ${PORT}`);
});
