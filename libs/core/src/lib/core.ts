import { createServer, Server } from 'http';
import logger from '../utils/logger';

import { CommonUtils } from '../utils/common-utils';
import { MiddlewareFn, RouteData, RouteModel, ServerOptions } from '../types';
import * as express from 'express';
import { Route } from '../models/route-model';
import { addAdminEndpoints, addAdminStaticSite } from './admin';

function mezzo() {
  const userRoutes: RouteModel[] = [];
  let server: Server;
  let app: express.Express;

  const _resetRouteState = () => (userRoutes.length = 0);

  const _addRouteToExpress = (myRoute: RouteModel) => {
    app[myRoute.method](myRoute.path, <MiddlewareFn>((req, res, next) => {
      myRoute.processRequest(req, res, next);
    }));
  };

  const _addRouteToState = (myRoute: RouteModel) => {
    userRoutes.push(myRoute);
  };

  const start = async (options?: ServerOptions): Promise<Server> => {
    app = express();
    _resetRouteState();
    addAdminEndpoints(app);
    addAdminStaticSite(app, options);

    return new Promise((resolve) => {
      const port = options?.port ?? 8000;
      server = createServer(app).listen(port, () => {
        logger.debug(
          `***************Server running on port ${port} ***************`
        );
        resolve(server);
      });
    });
  };

  const stop = async (serverArg?: Server) => {
    const serverToStop = serverArg ?? server;
    return new Promise((resolve) => {
      if (serverToStop) {
        logger.debug(
          '***************Stopping Mezzo mocking server ***************'
        );
        serverToStop.close(resolve);
        app = undefined;
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
  const route = (routeData: RouteData): RouteModel => {
    if (app == undefined) {
      logger.error(
        'You have not yet initialied the app, please start before adding routes'
      );
      throw new Error('App not yet initialized');
    }
    const myRoute = Route(routeData);
    _addRouteToExpress(myRoute);
    _addRouteToState(myRoute);

    return myRoute;
  };

  const setMockVariant = (method: string, path: string, variantId: string) => {
    const found = userRoutes.find(
      (route) =>
        path === route.path &&
        method.toUpperCase() === route.method.toUpperCase()
    );
    if (found) {
      // TODO log if variant cannot be set
      found.setVariant(variantId);
    } else {
      console.warn(
        `Could not find route for ${method} ${path} to set variant ${variantId}`
      );
    }
  };

  return {
    start,
    stop,
    route,
    routes: userRoutes,
    util: new CommonUtils(userRoutes),
    setMockVariant,
  };
}

export default mezzo();
