/**
 * Cost monitoring utilities for Azure Functions and storage
 */

interface CostMetrics {
  functionExecutions: number;
  executionTimeMs: number;
  storageOperations: number;
  dataTransferMB: number;
  estimatedCostUSD: number;
  timestamp: string;
}

interface CostLimits {
  maxMonthlyCostUSD: number;
  maxExecutionsPerMonth: number;
  maxStorageOperations: number;
  alertThresholds: number[]; // e.g., [50, 80, 100] for 50%, 80%, 100% of budget
}

export class CostMonitor {
  private metrics: CostMetrics[] = [];
  private limits: CostLimits;

  // Azure pricing (as of 2025, approximate)
  private readonly pricing = {
    functionExecutionCost: 0.0000002, // $0.0000002 per execution
    functionExecutionTimeCostPerMS: 0.000000017, // $0.000000017 per ms per GB memory
    storageCost: 0.0184, // $0.0184 per GB per month
    storageOperationCost: 0.00036, // $0.00036 per 10k operations
    dataTransferCost: 0.05 // $0.05 per GB outbound
  };

  constructor(limits?: Partial<CostLimits>) {
    this.limits = {
      maxMonthlyCostUSD: 1.00, // $1 monthly budget
      maxExecutionsPerMonth: 1000,
      maxStorageOperations: 100000,
      alertThresholds: [50, 80, 95, 100],
      ...limits
    };
  }

  /**
   * Record function execution metrics
   */
  recordExecution(executionTimeMs: number, memoryMB: number = 128): void {
    const executionCost = this.pricing.functionExecutionCost;
    const timeCost = (executionTimeMs * memoryMB / 1024) * this.pricing.functionExecutionTimeCostPerMS;
    
    const metric: CostMetrics = {
      functionExecutions: 1,
      executionTimeMs,
      storageOperations: 0,
      dataTransferMB: 0,
      estimatedCostUSD: executionCost + timeCost,
      timestamp: new Date().toISOString()
    };

    this.addMetric(metric);
    console.log(`💰 Function execution cost: $${metric.estimatedCostUSD.toFixed(6)}`);
  }

  /**
   * Record storage operation
   */
  recordStorageOperation(operations: number = 1, dataTransferMB: number = 0): void {
    const storageCost = (operations / 10000) * this.pricing.storageOperationCost;
    const transferCost = dataTransferMB * this.pricing.dataTransferCost;
    
    const metric: CostMetrics = {
      functionExecutions: 0,
      executionTimeMs: 0,
      storageOperations: operations,
      dataTransferMB,
      estimatedCostUSD: storageCost + transferCost,
      timestamp: new Date().toISOString()
    };

    this.addMetric(metric);
    
    if (metric.estimatedCostUSD > 0.000001) { // Only log if cost is meaningful
      console.log(`💾 Storage operation cost: $${metric.estimatedCostUSD.toFixed(6)}`);
    }
  }

  /**
   * Get current month's cost summary
   */
  getCurrentMonthCosts(): {
    totalCost: number;
    functionCosts: number;
    storageCosts: number;
    transferCosts: number;
    executionCount: number;
    percentOfBudget: number;
    remainingBudget: number;
  } {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const monthlyMetrics = this.metrics.filter(m => 
      new Date(m.timestamp) >= startOfMonth
    );

    const totals = monthlyMetrics.reduce((sum, m) => ({
      totalCost: sum.totalCost + m.estimatedCostUSD,
      functionCosts: sum.functionCosts + (m.functionExecutions > 0 ? m.estimatedCostUSD : 0),
      storageCosts: sum.storageCosts + (m.storageOperations > 0 ? m.estimatedCostUSD : 0),
      transferCosts: sum.transferCosts + (m.dataTransferMB > 0 ? m.estimatedCostUSD : 0),
      executionCount: sum.executionCount + m.functionExecutions
    }), {
      totalCost: 0,
      functionCosts: 0,
      storageCosts: 0,
      transferCosts: 0,
      executionCount: 0
    });

    const percentOfBudget = (totals.totalCost / this.limits.maxMonthlyCostUSD) * 100;
    const remainingBudget = Math.max(0, this.limits.maxMonthlyCostUSD - totals.totalCost);

    return {
      ...totals,
      percentOfBudget,
      remainingBudget
    };
  }

  /**
   * Check if we're approaching cost limits
   */
  checkCostLimits(): {
    isWithinLimits: boolean;
    alerts: string[];
    shouldBlock: boolean;
  } {
    const monthlyStats = this.getCurrentMonthCosts();
    const alerts: string[] = [];
    let shouldBlock = false;

    // Check budget thresholds
    this.limits.alertThresholds.forEach(threshold => {
      if (monthlyStats.percentOfBudget >= threshold && monthlyStats.percentOfBudget < threshold + 5) {
        alerts.push(`💸 ${threshold}% of monthly budget used ($${monthlyStats.totalCost.toFixed(4)})`);
      }
    });

    // Check if we've exceeded budget
    if (monthlyStats.percentOfBudget >= 100) {
      alerts.push(`🚨 BUDGET EXCEEDED: $${monthlyStats.totalCost.toFixed(4)} / $${this.limits.maxMonthlyCostUSD}`);
      shouldBlock = true;
    }

    // Check execution limits
    if (monthlyStats.executionCount >= this.limits.maxExecutionsPerMonth) {
      alerts.push(`🚨 EXECUTION LIMIT EXCEEDED: ${monthlyStats.executionCount} / ${this.limits.maxExecutionsPerMonth}`);
      shouldBlock = true;
    }

    return {
      isWithinLimits: monthlyStats.percentOfBudget < 100,
      alerts,
      shouldBlock
    };
  }

  /**
   * Estimate cost for planned operations
   */
  estimateOperationCost(operations: {
    functionExecutions?: number;
    avgExecutionTimeMs?: number;
    storageOperations?: number;
    dataTransferMB?: number;
  }): number {
    const {
      functionExecutions = 0,
      avgExecutionTimeMs = 30000, // 30 seconds default
      storageOperations = 0,
      dataTransferMB = 0
    } = operations;

    const executionCost = functionExecutions * this.pricing.functionExecutionCost;
    const timeCost = (functionExecutions * avgExecutionTimeMs * 0.128) * this.pricing.functionExecutionTimeCostPerMS; // 128MB default memory
    const storageCost = (storageOperations / 10000) * this.pricing.storageOperationCost;
    const transferCost = dataTransferMB * this.pricing.dataTransferCost;

    return executionCost + timeCost + storageCost + transferCost;
  }

  /**
   * Get projected monthly cost based on current usage
   */
  getProjectedMonthlyCost(): {
    projectedCost: number;
    daysIntoMonth: number;
    projectionAccuracy: 'low' | 'medium' | 'high';
  } {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const daysIntoMonth = Math.floor((now.getTime() - startOfMonth.getTime()) / (1000 * 60 * 60 * 24));
    const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

    const currentCosts = this.getCurrentMonthCosts();
    const dailyAverage = daysIntoMonth > 0 ? currentCosts.totalCost / daysIntoMonth : 0;
    const projectedCost = dailyAverage * daysInMonth;

    // Determine accuracy based on how far into the month we are
    let projectionAccuracy: 'low' | 'medium' | 'high' = 'low';
    if (daysIntoMonth > 7) projectionAccuracy = 'medium';
    if (daysIntoMonth > 15) projectionAccuracy = 'high';

    return {
      projectedCost,
      daysIntoMonth,
      projectionAccuracy
    };
  }

  /**
   * Send cost alert if needed
   */
  async sendCostAlert(context?: any): Promise<void> {
    const costCheck = this.checkCostLimits();
    
    if (costCheck.alerts.length > 0) {
      const monthlyStats = this.getCurrentMonthCosts();
      const projection = this.getProjectedMonthlyCost();
      
      const alertMessage = [
        '💰 COST MONITORING ALERT',
        '',
        ...costCheck.alerts,
        '',
        '📊 Current Month Summary:',
        `Total Cost: $${monthlyStats.totalCost.toFixed(4)}`,
        `Function Executions: ${monthlyStats.executionCount}`,
        `Budget Used: ${monthlyStats.percentOfBudget.toFixed(1)}%`,
        `Remaining Budget: $${monthlyStats.remainingBudget.toFixed(4)}`,
        '',
        '📈 Monthly Projection:',
        `Projected Cost: $${projection.projectedCost.toFixed(4)}`,
        `Accuracy: ${projection.projectionAccuracy} (${projection.daysIntoMonth} days into month)`,
        '',
        'Timestamp: ' + new Date().toISOString()
      ].join('\n');

      console.warn(alertMessage);

      // In a real implementation, you might send this to:
      // - Application Insights custom events
      // - Email via SendGrid
      // - Slack webhook
      // - Azure Monitor alerts
      
      if (context && context.log) {
        context.log.warn('Cost alert triggered', {
          monthlyStats,
          projection,
          alerts: costCheck.alerts
        });
      }
    }
  }

  /**
   * Get cost optimization recommendations
   */
  getCostOptimizationRecommendations(): string[] {
    const monthlyStats = this.getCurrentMonthCosts();
    const recommendations: string[] = [];

    if (monthlyStats.percentOfBudget > 80) {
      recommendations.push('Consider reducing function execution frequency');
      recommendations.push('Optimize function execution time to reduce compute costs');
      recommendations.push('Implement more aggressive caching to reduce API calls');
    }

    if (monthlyStats.functionCosts > monthlyStats.totalCost * 0.7) {
      recommendations.push('Function execution is the main cost driver - optimize code efficiency');
      recommendations.push('Consider batching operations to reduce number of executions');
    }

    if (monthlyStats.transferCosts > monthlyStats.totalCost * 0.3) {
      recommendations.push('High data transfer costs - consider data compression');
      recommendations.push('Review if all data transfers are necessary');
    }

    return recommendations;
  }

  /**
   * Export cost data for reporting
   */
  exportCostData(): {
    monthlyStats: ReturnType<typeof this.getCurrentMonthCosts>;
    projection: ReturnType<typeof this.getProjectedMonthlyCost>;
    recommendations: string[];
    limits: CostLimits;
    dailyBreakdown: { date: string; cost: number }[];
  } {
    const monthlyStats = this.getCurrentMonthCosts();
    const projection = this.getProjectedMonthlyCost();
    const recommendations = this.getCostOptimizationRecommendations();

    // Create daily cost breakdown for current month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const dailyBreakdown: { date: string; cost: number }[] = [];
    const dailyCosts = new Map<string, number>();

    this.metrics
      .filter(m => new Date(m.timestamp) >= startOfMonth)
      .forEach(m => {
        const date = new Date(m.timestamp).toISOString().split('T')[0];
        dailyCosts.set(date, (dailyCosts.get(date) || 0) + m.estimatedCostUSD);
      });

    Array.from(dailyCosts.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .forEach(([date, cost]) => {
        dailyBreakdown.push({ date, cost });
      });

    return {
      monthlyStats,
      projection,
      recommendations,
      limits: this.limits,
      dailyBreakdown
    };
  }

  private addMetric(metric: CostMetrics): void {
    this.metrics.push(metric);
    
    // Keep only last 3 months of data to prevent memory growth
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    this.metrics = this.metrics.filter(m => 
      new Date(m.timestamp) >= threeMonthsAgo
    );
  }
}

/**
 * Global cost monitor instance
 */
export const globalCostMonitor = new CostMonitor();

/**
 * Decorator function to automatically track function execution costs
 */
export function trackCosts(estimatedMemoryMB: number = 128) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const startTime = Date.now();
      
      try {
        const result = await method.apply(this, args);
        const executionTime = Date.now() - startTime;
        
        globalCostMonitor.recordExecution(executionTime, estimatedMemoryMB);
        
        return result;
      } catch (error) {
        const executionTime = Date.now() - startTime;
        globalCostMonitor.recordExecution(executionTime, estimatedMemoryMB);
        throw error;
      }
    };

    return descriptor;
  };
}

/**
 * Helper function to track storage operations
 */
export function trackStorageOperation(operations: number = 1, dataTransferMB: number = 0): void {
  globalCostMonitor.recordStorageOperation(operations, dataTransferMB);
}

/**
 * Initialize cost monitoring for Azure Functions
 */
export function initializeCostMonitoring(context: any): void {
  // Check costs at start of function execution
  const costCheck = globalCostMonitor.checkCostLimits();
  
  if (costCheck.shouldBlock) {
    context.log.error('Function execution blocked due to cost limits', costCheck.alerts);
    throw new Error('Function execution blocked due to cost limits: ' + costCheck.alerts.join(', '));
  }

  if (costCheck.alerts.length > 0) {
    context.log.warn('Cost alerts detected', costCheck.alerts);
  }

  // Send alerts if needed
  globalCostMonitor.sendCostAlert(context).catch(error => {
    context.log.error('Failed to send cost alert', error);
  });
}