import {
  RouteOrVariantIcon,
  VariantCategory,
} from '@caribou-crew/mezzo-interfaces';
import { Request, Response, NextFunction, RequestHandler } from 'express';
import { Route } from './models/route-model';

/**
 * Server options used when starting mezzo
 */
export interface MezzoStartOptions {
  port: number | string;
  adminEndpoint?: string;
  mockedDirectory?: string;
  fsOverride?: any;
  variantCategories?: VariantCategory[];
}

/**
 * Input provided when creating a new route
 */
export interface RouteInputData extends RouteAndVariantInputData {
  method?: string;
  path: string | RegExp;
}
/**
 * Input provided when creating a new variant
 */
export interface VariantInputData extends RouteAndVariantInputData {
  variantLabel?: string;
}
/**
 * Shared interface between route and variant data
 */
export interface RouteAndVariantInputData {
  id: string;
  label?: string;
  callback?: CallbackFnType;
  handler?: HandlerFnType;
  titleIcons?: RouteOrVariantIcon[];
  icons?: RouteOrVariantIcon[];
  category?: string;
}

export type HandlerFnType = RequestHandler;

export type CallbackFnType = (
  req: Request,
  res: Response,
  route: Route
) => Promise<any> | void;

export interface FileHandlerOptions {
  code?: number;
  headers?: Record<string, string | boolean>;
  baseDir?: string; // Base directory to scan method + variant for
  filePath?: string; // Exact file to read (bypasses variant logic)
  delay?: number;
}

/**
 * Express middleware function signature
 */
export type MiddlewareFn = (
  req: Request,
  res: Response,
  next: NextFunction
) => void;
