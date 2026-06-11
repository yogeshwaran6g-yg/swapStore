import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import morgan from "morgan";
import { createServer } from "http";
import ratesRouter from './routes/rates.js';
import userRoutes from './routes/authRoutes.js';
import adminRoutes from './routes/adminRoutes.js';
import swapRoutes from './routes/swapRoutes.js';

const app = express();
const server = createServer(app);

const PORT = process.env.PORT || 3000;

// ── Middleware ──────────────────────────────────────────────
app.use(cors());
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ── Routes ─────────────────────────────────────────────────
app.get("/", (_req, res) => {
  res.json({ message: "SwapStore API is running 🚀" });
});

app.use('/api/v1/rates', ratesRouter);
app.use('/api/v1/auth', userRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/swap', swapRoutes);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

// ── 404 handler ────────────────────────────────────────────
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// ── Global error handler ───────────────────────────────────
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ error: err.message || "Internal Server Error" });
});

import { startContractListeners } from './services/contractListener.js';

// ── Start server ───────────────────────────────────────────
server.listen(PORT, () => {
  console.log(`✅ Server listening on http://localhost:${PORT}`);

  // Start Blockchain Event Listeners
  startContractListeners();
});
