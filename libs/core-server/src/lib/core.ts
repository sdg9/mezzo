import { createServer, Server } from 'http';
import WebSocket from 'ws';
import logger, { setLogLevel } from '@caribou-crew/mezzo-utils-logger';

import { CommonUtils } from './utils/common-utils';
import { MiddlewareFn, RouteInputData, VariantInputData } from '../types';
import express from 'express';
import { Route } from './models/routeModel';
import adminRouteEndpoints from './plugins/routes-endpoints';
import * as fsDefault from 'fs';
import { SessionState } from './models/sessionState';
import {
  DEFAULT_PORT,
  DEFAULT_VARIANT_CATEGORY,
  GLOBAL_VARIANT_CATEGORY,
} from '@caribou-crew/mezzo-constants';

import {
  IMezzoServerPlugin,
  Profile,
  RouteVariant,
  VariantCategory,
} from '@caribou-crew/mezzo-interfaces';
import { addRedirect } from './utils/redirect-endpoints';
import curry from './utils/curry';
import recordingServer from './plugins/record-endpoints';
import jsonBodyParser from './plugins/json-body-parser';
import cors from './plugins/cors';
import adminProfileEndpoints from './plugins/profile-endpoints';
import adminStaticSiteEndpoints from './plugins/static-site-endpoints';

// type MezzoServerPlugin = (mezzo: Mezzo) => Record<string, any>;
export type MezzoServerPlugin = (mezzo: Mezzo) => IMezzoServerPlugin;

export interface MezzoStartOptions {
  port: number | string;
  adminEndpoint?: string;
  mockedDirectory?: string;
  fsOverride?: any;
  variantCategories?: VariantCategory[];
  plugins?: MezzoServerPlugin[];
}
export const corePlugins: MezzoServerPlugin[] = [
  jsonBodyParser(),
  cors(),
  adminRouteEndpoints(),
  adminProfileEndpoints(),
  adminStaticSiteEndpoints(),
  recordingServer(),
];

const DEFAULT_OPTIONS: MezzoStartOptions = {
  port: DEFAULT_PORT,
  plugins: corePlugins,
};

export class Mezzo {
  public options: MezzoStartOptions = Object.assign({}, DEFAULT_OPTIONS);
  public userRoutes: Route[] = [];
  public userProfiles: Profile[] = [];
  public globalVariants: VariantInputData[] = [];
  public sessionState: SessionState;
  server: Server;
  websocketServer: WebSocket.Server;
  app: express.Express;
  private fs;
  public util: CommonUtils;
  public log = {
    setLogLevel,
  };
  public redirect;
  public variantCategories: VariantCategory[] = [];
  public onStopCallbacks = [];

  private _resetRouteState = () => {
    this.userRoutes.length = 0;
    this.userProfiles.length = 0;
    this.globalVariants.length = 0;
  };

  private _addRouteToExpress = (myRoute: Route) => {
    this.app[myRoute.method.toLowerCase()](myRoute.path, <MiddlewareFn>((
      req,
      res,
      next
    ) => {
      myRoute.processRequest(req, res, next);
    }));
  };

  private _addRouteToState = (myRoute: Route) => {
    this.userRoutes.push(myRoute);
  };
  private _addProfileToState = (profile: Profile) => {
    this.userProfiles.push(profile);
  };

  private _initialize() {
    this.redirect = curry(addRedirect)(this.app);

    this._resetRouteState();

    this.fs = this.options?.fsOverride ?? fsDefault;
    this.util = new CommonUtils(
      this.userRoutes,
      this.fs,
      this.options.mockedDirectory
    );

    this.sessionState = new SessionState();
    this.variantCategories = [
      {
        name: DEFAULT_VARIANT_CATEGORY,
        order: 0,
      },
      {
        name: GLOBAL_VARIANT_CATEGORY,
        order: 100,
      },
      ...(this.options?.variantCategories || []),
    ];
  }

  _processPlugins() {
    logger.debug(`About to apply ${this.options.plugins.length} plugins`);
    if (Array.isArray(this.options.plugins)) {
      this.options.plugins.forEach((p) => {
        const plugin = this.use(p);
        plugin?.initialize?.();
        if (plugin?.onStop) {
          this.onStopCallbacks.push(plugin.onStop);
        }
      });
    }
  }

  public start = async (options?: MezzoStartOptions): Promise<Server> => {
    this.app = express();
    this.server = createServer(this.app);

    // TODO validate incoming options?
    this.options = {
      ...this.options,
      ...options,
    };

    this._initialize();
    this._processPlugins();

    return new Promise((resolve) => {
      this.server.listen(this.options.port, () => {
        logger.debug(
          `***************Server running on port ${this.options.port} ***************`
        );
        logger.info('Server running on port: ', this.options.port);

        resolve(this.server);
      });
    });
  };

  private use(pluginCreator: MezzoServerPlugin) {
    if (typeof pluginCreator !== 'function') {
      throw new Error('plugins must be a function');
    }
    // const pluginData = pluginCreator.call(this, this);
    const pluginData = pluginCreator(this);
    logger.debug(`Applied plugin: ${pluginData?.name}`);
    return pluginData;

    // if (typeof plugin !== 'object') {
    //   throw new Error('plugins must return an object');
    // }

    // this.plugins.push(plugin);
  }

  public stop = async (serverArg?: Server) => {
    const serverToStop = serverArg ?? this.server;
    return new Promise((resolve) => {
      if (serverToStop) {
        logger.debug(
          '***************Stopping Mezzo mocking server ***************'
        );
        this.onStopCallbacks.forEach((i) => i?.());
        serverToStop.close(resolve);
        this.app = undefined;
      } else {
        logger.warn(
          '***************Unable to stop Mezzo mocking server ***************'
        );
        resolve(null);
      }
    });
  };

  /**
   * Add route to mock server
   * @param routeData
   * @returns
   */
  public route = (routeData: RouteInputData): Route => {
    if (this.app == undefined) {
      logger.error(
        'You have not yet initialied the app, please start before adding routes'
      );
      throw new Error('App not yet initialized');
    }
    const myRoute = new Route(routeData, this.sessionState);
    this._addRouteToExpress(myRoute);
    this._addRouteToState(myRoute);

    return myRoute;
  };

  public profile = (name: string, variants: RouteVariant[]) => {
    if (this.app == undefined) {
      logger.error(
        'You have not yet initialied the app, please start before adding profiles'
      );
      throw new Error('App not yet initialized');
    }

    this._addProfileToState({ name, variants });
  };

  /**
   * Adds variant to all existing routes
   * Note: Routes added after this call will not have the global variant
   * @param variantData
   */
  public addGlobalVariant = (variantData: VariantInputData) => {
    if (variantData.category == null) {
      variantData.category = GLOBAL_VARIANT_CATEGORY;
    }
    this.globalVariants.push(variantData);
    this.userRoutes.forEach((route) => {
      route.variant(variantData);
    });
  };
}

export default new Mezzo();
