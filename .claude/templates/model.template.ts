/**
 * Model definitions for [Feature Name]
 * Follow the existing pattern from portfolio.model.ts
 */

/**
 * Main model interface
 */
export interface [ModelName] {
  id: string;
  name: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
  // Add your properties here following TypeScript strict mode
}

/**
 * Request/Response DTOs
 */
export interface [ModelName]Request {
  name: string;
  description?: string;
  // Properties sent to API
}

export interface [ModelName]Response {
  data: [ModelName];
  timestamp: string;
  cached: boolean;
}

/**
 * Enums for type safety
 */
export enum [ModelName]Status {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  PENDING = 'pending'
}

/**
 * Validation constants
 */
export const [MODEL_NAME]_CONSTRAINTS = {
  NAME_MIN_LENGTH: 3,
  NAME_MAX_LENGTH: 50,
  DESCRIPTION_MAX_LENGTH: 200
} as const;

/**
 * Type guards
 */
export function is[ModelName](value: any): value is [ModelName] {
  return (
    value &&
    typeof value === 'object' &&
    typeof value.id === 'string' &&
    typeof value.name === 'string' &&
    value.createdAt instanceof Date &&
    value.updatedAt instanceof Date
  );
}

/**
 * Factory functions
 */
export function create[ModelName](data: Partial<[ModelName]>): [ModelName] {
  const now = new Date();
  return {
    id: data.id || generateId(),
    name: data.name || '',
    description: data.description,
    createdAt: data.createdAt || now,
    updatedAt: data.updatedAt || now
  };
}

/**
 * Utility functions
 */
function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}