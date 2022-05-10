import { createServer, Server } from 'http';
import * as WebSocket from 'ws';
import logger, { setLogLevel } from '@caribou-crew/mezzo-utils-logger';

import { CommonUtils } from './utils/common-utils';
import { MiddlewareFn, RouteInputData, VariantInputData } from '../types';
import * as express from 'express';
import { Route } from './models/route-model';
import adminEndpoints from './plugins/admin-endpoints';
import * as fsDefault from 'fs';
import { SessionState } from './models/sessionState';
import {
  DEFAULT_PORT,
  MEZZO_API_PATH,
  LOCAL_HOST,
  DEFAULT_VARIANT_CATEGORY,
  GLOBAL_VARIANT_CATEGORY,
} from '@caribou-crew/mezzo-constants';

import {
  // MezzoStartOptions,
  ServerConnectionOptions,
  VariantCategory,
} from '@caribou-crew/mezzo-interfaces';
import { addRedirect } from './utils/redirect-endpoints';
import curry from './utils/curry';
import recordingServer from './plugins/record-endpoints';
import jsonBodyParser from './plugins/json-body-parser';
import cors from './plugins/cors';
import { ClientUtils } from './utils/client-utils';
// import * as logOG from 'loglevel';
import * as chalk from 'chalk';
import { getLogger } from 'loglevel';

const log = getLogger('core');

// // very simple quick'n'dirty hash function
// const getColorFromStr = function (str) {
//   if (str === undefined || str.length == 0) return chalk.white;
//   let hash = 0,
//     len;
//   for (let i = str.length; i--; ) {
//     hash += str.charCodeAt(i);
//   }
//   const chalkColors = [
//     chalk.red,
//     chalk.green,
//     chalk.yellow,
//     chalk.blue,
//     chalk.magenta,
//     chalk.cyan,
//   ];
//   return chalkColors[hash % chalkColors.length];
// };

// loglevel Plugin to create colorfull log output using 'chalk'
// const originalFactory = log.methodFactory;
// const tempLog = log;
// tempLog.methodFactory = function (methodName, logLevel, loggerName) {
//   const rawMethod = originalFactory(methodName, logLevel, loggerName);
//   const logLevelNames = ['TRACE', 'DEBUG', 'INFO ', 'WARN ', 'ERROR'];
//   const messageColor = getColorFromStr(loggerName); // or getColorFromStr(logLevel)

//   return function (message) {
//     rawMethod.bind(
//       chalk.cyan.underline(loggerName) +
//         ' ' +
//         chalk.bold.magenta(logLevelNames[logLevel]) +
//         ' ' +
//         messageColor(message)
//     );
//   };
// };

// const path = require('path');
// import * as path from 'path';

const stackTrace = function () {
  const obj: any = {};
  Error.captureStackTrace(obj, stackTrace);
  return obj.stack;
};

const getLine = function (stack) {
  const matchResult = stack.match(/\(.*?\)|\s.+/g) || [];
  const arr = matchResult.map((it) => {
    return it.split(' ').pop().replace(/\(|\)/g, '');
  });
  return arr[1] ?? '';
};

const log2 = function (...args) {
  const stack = stackTrace() || '';
  const matchResult = getLine(stack);
  const line = matchResult;
  for (const i in args) {
    if (typeof args[i] == 'object') {
      // util.inspect(arguments[i], false, 2, false)
      args[i] = JSON.stringify(args[i]);
    }
    args[i] += '  ' + line;
    // args[i] += '  ' + line;
  }

  // eslint-disable-next-line prefer-spread
  console.log.apply(console, args);
  // console.log(args);
};

log2('Hello world!!!!!!!!!!!!!!!!!!!!!!!!!!!s');
// ['debug', 'log', 'warn', 'error'].forEach((methodName) => {
//   const originalLoggingMethod = console[methodName];
//   console[methodName] = (firstArgument, ...otherArguments) => {
//     const originalPrepareStackTrace = Error.prepareStackTrace;
//     Error.prepareStackTrace = (_, stack) => stack;
//     const callee = new Error().stack[1];
//     Error.prepareStackTrace = originalPrepareStackTrace;
//     const relativeFileName = path.relative(process.cwd(), callee.getFileName());
//     const prefix = `${relativeFileName}:${callee.getLineNumber()}:`;
//     if (typeof firstArgument === 'string') {
//       originalLoggingMethod(prefix + ' ' + firstArgument, ...otherArguments);
//     } else {
//       originalLoggingMethod(prefix, firstArgument, ...otherArguments);
//     }
//   };
// });
// function trace(s) {
//   const orig = Error.prepareStackTrace;
//   Error.prepareStackTrace = (_, stack) => stack;
//   const err = new Error();
//   Error.captureStackTrace(err, arguments.callee);
//   Error.prepareStackTrace = orig;
//   const callee = err.stack[0];
//   process.stdout.write(
//     `${path.relative(
//       process.cwd(),
//       callee.getFileName()
//     )}:${callee.getLineNumber()}: ${s}\n`
//   );
// }
// module.exports = trace;

// trace('hey');

log.setDefaultLevel('trace');

// type MezzoServerPlugin = (mezzo: Mezzo) => void;

// TODO: Figure out best way to type Mezzo server class and put in shared interface
type MezzoServerPlugin = (mezzo: Mezzo) => Record<string, any>;
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
  adminEndpoints(),
  recordingServer(),
];

const DEFAULT_OPTIONS: MezzoStartOptions = {
  // createSocket: null,
  // hostname: LOCAL_HOST,
  port: DEFAULT_PORT,
  // name: "reactotron-core-client",
  // secure: false,
  plugins: corePlugins,
  // safeRecursion: true,
  // onCommand: () => null,
  // onConnect: () => null,
  // onDisconnect: () => null,
};

export class Mezzo {
  public options: MezzoStartOptions = Object.assign({}, DEFAULT_OPTIONS);
  // public plugins: MezzoServerPlugin[] = [];
  public userRoutes: Route[] = [];
  public globalVariants: VariantInputData[] = [];
  public sessionState: SessionState;
  server: Server;
  websocketServer: WebSocket.Server;
  app: express.Express;
  private fs;
  public util: CommonUtils;
  public clientUtil: ClientUtils;
  public log = {
    setLogLevel,
  };
  // public mockedDirectory;
  // public port;
  public redirect;
  public variantCategories: VariantCategory[] = [];

  private _resetRouteState = () => {
    this.userRoutes.length = 0;
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

  private _initialize() {
    this.redirect = curry(addRedirect)(this.app);

    this._resetRouteState();

    this.fs = this.options?.fsOverride ?? fsDefault;
    this.util = new CommonUtils(
      this.userRoutes,
      this.fs,
      this.options.mockedDirectory
    );
    this.clientUtil = new ClientUtils(this);

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
      this.options.plugins.forEach((p) => this.use(p));
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
        console.log('HI');
        // chalk.blue('Hello world!');
        // console.log(chalk.blue('Hello world!'));
        log.debug(
          `***************[log]Server running on port ${this.options.port} ***************`
        );
        log.info(
          `***************[log]Server running on port ${this.options.port} ***************`
        );
        log.warn(
          `***************[log]Server running on port ${this.options.port} ***************`
        );
        log.error(
          `***************[log]Server running on port ${this.options.port} ***************`
        );
        log.trace(
          `***************[log]Server running on port ${this.options.port} ***************`
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
    const pluginData = pluginCreator.call(this, this);
    logger.debug(`Applied plugin: ${pluginData?.name}`);

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
        // if (this.websocketServer) {
        //   logger.debug('Stopping websocket server too');
        //   this.websocketServer.close();
        // }
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

  getConnectionFromOptions(options?: ServerConnectionOptions) {
    const protocol = options?.useHttps ? 'https' : 'http';
    const hostname = options?.hostname ?? LOCAL_HOST;
    const port = options?.port ?? this.options.port;
    return `${protocol}://${hostname}:${port}${MEZZO_API_PATH}`;
  }
}

export default new Mezzo();
