import { Request, Response, NextFunction, RequestHandler } from 'express';
import { Route } from './models/route-model';

/**
 * Express middleware function signature
 */
export type MiddlewareFn = (
  req: Request,
  res: Response,
  next: NextFunction
) => void;

/**
 * Server options used when starting mezzo
 */
export interface ServerOptions {
  port: number | string;
  adminEndpoint?: string;
  mockedDirectory: string;
  fsOverride?: any;
}

/**
 * Input provided when creating a new route
 */
export interface RouteData extends RouteAndVariantData {
  method?: string;
  path: string | RegExp;
}
/**
 * Input provided when creating a new variant
 */
export interface VariantData extends RouteAndVariantData {
  variantLabel?: string;
}
/**
 * Shared interface between route and variant data
 */
export interface RouteAndVariantData {
  id: string;
  label?: string;
  // callback?: any;
  callback?: CallbackType;
  handler?: HandlerType;
}

export type HandlerType = RequestHandler;

export type CallbackType = (
  req: Request,
  res: Response,
  route: Route
) => Promise<any>;

/**
 * Model representation of a route
 */
// export interface RouteModel {
//   id: string; // Unique ID given to a route
//   method: string; // HTTP method of route
//   path: string | RegExp; // Endpoint match of route, must be compatible with express
//   variant: (v: VariantData) => RouteModel; // Adds a variant to the route
//   variants: Map<string, VariantData>; // Map of key:value pairs of variant id to variant data
//   setVariant: (id: string) => RouteModel; // Sets the variant for given route
//   activeVariant: string; // Active variant id for route, or default
//   processRequest: MiddlewareFn; // Executed when route is visited
// }

// export interface RespondWithFileOptions {
//   code: number;
//   headers: Record<string, string>;
// }

export interface FileHandlerOptions {
  code?: number;
  headers?: Record<string, string | boolean>;
  filePath?: string;
  delay?: number;
  cookies?: any;
  // TODO
  transpose?: any;
}

export interface MockVariantOptions {
  mockPort?: number;
  // fixture: string,
  routeId: string;
  variantId: string;
  mezzoSessionId?: string;
}
