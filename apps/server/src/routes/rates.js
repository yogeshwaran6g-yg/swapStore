import express from 'express';
import { fetchRates } from '../controllers/rateController.js';

const router = express.Router();

router.get('/', fetchRates);

export default router;
