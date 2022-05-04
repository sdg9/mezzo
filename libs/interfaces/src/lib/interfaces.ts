export interface RouteOrVariantIcon {
  name: string;
  link?: string;
  color?: string;
}

export interface GetRoutesResponse {
  appVersion: string;
  routes: RouteItemType[];
  variantCategories: VariantCategory[];
}

export interface VariantItem {
  id: string;
  label?: string;
  icons?: RouteOrVariantIcon[];
  category?: string;
}

// TODO, this is almost a duplicate of core/src/types RouteData, address? This is the html facing API return value though
export interface RouteItemType {
  id: string; // GET /appium
  activeVariant: string; // default
  label?: string; // /appium
  method: string; // GET
  path: string | RegExp; // /appium
  variants: VariantItem[];
  titleIcons?: RouteOrVariantIcon[];
}

export type VariantCategory = {
  name: string;
  order: number;
};

export interface RouteVariant {
  routeID: string;
  variantID: string;
}

export type SetRouteVariant = RouteVariant[];

/**
 * Options used for set/update/reset mock variant util calls
 */
export interface ServerConnectionOptions {
  useHttps?: boolean;
  hostname?: string;
  port?: number;
}

export type Fetch = (
  input: RequestInfo,
  init?: RequestInit
) => Promise<Response>;

// Network record/response types
export interface RecordedItem {
  uuid: string;
  resource: string;
  request: RecordedRequest;
  startTime: number;
  endTime?: number;
  duration?: number;
  url?: string;
  response?: RecordedResponse;
}
export interface RecordedRequest {
  config: Record<string, any>;
}
export interface RecordedResponse {
  body: any;
  headers: Record<string, string>;
  redirected: boolean;
  status: number;
  statusText: string;
  type: string;
}
