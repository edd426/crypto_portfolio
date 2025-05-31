import { Router, Request, Response } from 'express';
import Joi from 'joi';
import { MarketDataService } from '../services/marketDataService';
import { asyncHandler } from '../utils/errorHandler';

const router = Router();
const marketDataService = new MarketDataService();

const topCoinsSchema = Joi.object({
  limit: Joi.number().integer().min(1).max(100).default(15),
  exclude: Joi.string().allow('').default('')
});

const pricesSchema = Joi.object({
  symbols: Joi.string().required()
});

const searchSchema = Joi.object({
  q: Joi.string().required().min(1),
  limit: Joi.number().integer().min(1).max(50).default(10)
});

router.get('/top-coins', asyncHandler(async (req: Request, res: Response) => {
  const { error, value } = topCoinsSchema.validate(req.query);
  if (error) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: error.details[0].message
      }
    });
  }

  const { limit, exclude } = value;
  const excludedCoins = exclude ? exclude.split(',').map((s: string) => s.trim().toUpperCase()) : [];
  
  const coins = await marketDataService.getTopCoins(limit, excludedCoins);
  
  res.json({
    data: coins,
    timestamp: new Date().toISOString(),
    cached: true
  });
}));

router.get('/prices', asyncHandler(async (req: Request, res: Response) => {
  const { error, value } = pricesSchema.validate(req.query);
  if (error) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: error.details[0].message
      }
    });
  }

  const symbols = value.symbols.split(',').map((s: string) => s.trim().toUpperCase());
  const prices = await marketDataService.getCoinPrices(symbols);
  
  res.json({
    data: prices
  });
}));

router.get('/search', asyncHandler(async (req: Request, res: Response) => {
  const { error, value } = searchSchema.validate(req.query);
  if (error) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: error.details[0].message
      }
    });
  }

  const { q, limit } = value;
  const results = await marketDataService.searchCoins(q, limit);
  
  res.json({
    results
  });
}));

export { router as marketRoutes };