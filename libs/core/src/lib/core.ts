import { createServer, Server } from 'http';
import logger from '../utils/logger';
import axios from 'axios';

import { CommonUtils } from '../utils/common-utils';
import {
  MiddlewareFn,
  MockVariantOptions,
  RouteData,
  ServerOptions,
} from '../types';
import * as express from 'express';
import { Route } from '../models/route-model';
import { addAdminEndpoints, addAdminStaticSite } from './admin';
import { findRouteIndexById } from '../utils/routeMatchingUtils';
import * as fsDefault from 'fs';
import { SessionState } from '../models/sessionState';
import { MEZZO_API_PATH } from '../utils/constants';

export class Mezzo {
  public userRoutes: Route[] = [];
  public sessionState: SessionState;
  private server: Server;
  private app: express.Express;
  private fs;
  public util: CommonUtils;
  public mockedDirectory;

  private _resetRouteState = () => (this.userRoutes.length = 0);

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

  public start = async (options?: ServerOptions): Promise<Server> => {
    this.app = express();
    this._resetRouteState();
    addAdminEndpoints(this.app, this);
    addAdminStaticSite(this.app, options);
    this.fs = options?.fsOverride ?? fsDefault;
    this.mockedDirectory = options.mockedDirectory;
    this.util = new CommonUtils(this.userRoutes, this.fs, this.mockedDirectory);
    this.sessionState = new SessionState();
    // if (options.fsOverride) {
    //   fs = options.fsOverride;
    // }

    return new Promise((resolve) => {
      const port = options?.port ?? 8000;
      this.server = createServer(this.app).listen(port, () => {
        logger.debug(
          `***************Server running on port ${port} ***************`
        );
        resolve(this.server);
      });
    });
  };

  public stop = async (serverArg?: Server) => {
    const serverToStop = serverArg ?? this.server;
    return new Promise((resolve) => {
      if (serverToStop) {
        logger.debug(
          '***************Stopping Mezzo mocking server ***************'
        );
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
  public route = (routeData: RouteData): Route => {
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

  // https://github.com/sgoff0/midway/blob/6614a6a91d3060951e99326c68333ebf78563e8c/src/utils/common-utils.ts#L318-L356
  public setMockVariant = async (options: MockVariantOptions) => {
    const url =
      'http://localhost:' +
      options.mockPort +
      MEZZO_API_PATH +
      '/route/' +
      encodeURIComponent(options.routeId);

    const response = await axios.post(url, {
      variant: options.variantId,
    });

    // axios.post()
    // const index = findRouteIndex(method, path, this.userRoutes);
    // const index = findRouteIndexById(routeId, this.userRoutes);
    // const foundRoute = this.userRoutes[index];
    // // console.log('Inside set mock variant', foundRoute);
    // if (foundRoute) {
    //   // TODO log if variant cannot be set

    //   // this is not actually updating entry in global state
    //   const updatedItem = foundRoute.setVariant(variantId);

    //   // So make sure to update hte array item
    //   this.userRoutes[index] = updatedItem;

    //   // logger.info(`Set variant complete: ${foundRoute.activeVariant}`);
    // } else {
    //   console.warn(
    //     `Could not find route for ${routeId} to set variant ${variantId}`
    //   );
    // }
  };

  public setMockVariantForSession = async (
    sessionId: string,
    payload: Record<string, string>
  ) => {
    // TODO make API call

    this.sessionState.setSessionVariantStateByKey(sessionId, payload);
  };
}

export default new Mezzo();
