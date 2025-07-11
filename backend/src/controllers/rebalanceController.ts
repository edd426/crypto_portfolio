import { Router, Request, Response } from 'express';
import Joi from 'joi';
import { RebalancingService } from '../services/rebalancingService';
import { asyncHandler } from '../utils/errorHandler';

const router = Router();
const rebalancingService = new RebalancingService();

const holdingSchema = Joi.object({
  symbol: Joi.string().required(),
  amount: Joi.number().min(0).required()
});

const portfolioSchema = Joi.object({
  holdings: Joi.array().items(holdingSchema).required(),
  cashBalance: Joi.number().min(0).required(),
  excludedCoins: Joi.array().items(Joi.string()).optional().default([]),
  maxCoins: Joi.number().integer().min(1).max(50).optional().default(15)
});

const rebalanceSchema = Joi.object({
  portfolio: portfolioSchema.required(),
  excludedCoins: Joi.array().items(Joi.string()).default([]),
  options: Joi.object({
    topN: Joi.number().integer().min(1).max(50).default(15)
  }).default({ topN: 15 })
});

router.post('/calculate', asyncHandler(async (req: Request, res: Response) => {
  const { error, value } = rebalanceSchema.validate(req.body);
  if (error) {
    return res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: error.details[0].message,
        details: error.details[0]
      }
    });
  }

  const { portfolio, excludedCoins, options } = value;
  
  // Use excludedCoins from portfolio if available, otherwise use top-level excludedCoins
  const finalExcludedCoins = portfolio.excludedCoins?.length > 0 ? portfolio.excludedCoins : excludedCoins;
  
  // Use maxCoins from portfolio if available, otherwise use options.topN (for backward compatibility)
  const maxCoins = portfolio.maxCoins || options.topN;
  
  const result = await rebalancingService.calculateRebalancing(
    portfolio,
    finalExcludedCoins,
    maxCoins
  );
  
  res.json(result);
}));

export { router as rebalanceRoutes };