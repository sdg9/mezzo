import { Request, Response } from 'express';
import { Route } from '../models/route-model';
import { FileHandlerOptions } from '../../types';
import * as nodeFs from 'fs';
import { RouteItemType, VariantItem } from '@caribou-crew/mezzo-interfaces';
import respondWithFile from './respondWithFile';

export class CommonUtils {
  private _routes: Route[];
  private _fs: typeof nodeFs;
  private _mockedDirectory: string;

  constructor(routes: Route[], fs: typeof nodeFs, mockedDirectory: string) {
    this._routes = routes;
    this._fs = fs;
    this._mockedDirectory = mockedDirectory;
  }

  public serialiazeRoutes = (): RouteItemType[] => {
    const routes: RouteItemType[] = this._routes.map((route) => {
      const variantRetVal: VariantItem[] = [];

      // add default variant
      variantRetVal.push({
        id: 'default',
        icons: route.icons,
        category: route.category,
      });

      // add route specific variants
      route.getVariants().forEach((variant, key) => {
        variantRetVal.push({
          id: key,
          label: variant.label,
          icons: variant.icons,
          category: variant?.category,
        });
      });

      return {
        id: route.id,
        method: route.method,
        label: route.label,
        path: route.path,
        variants: variantRetVal,
        activeVariant: route.getActiveVariant(),
        titleIcons: route.titleIcons,
      };
    });
    return routes;
  };

  /**
   *  Called by user defined routes in mezzo.utils.respondWithFile
   */
  public respondWithFile = async (
    route: Route,
    req: Request | null,
    res: Response,
    options?: FileHandlerOptions
  ) => {
    await respondWithFile(
      this._fs,
      this._mockedDirectory,
      route,
      req,
      res,
      options
    );
    // try {
    //   const retVal = await respondWithFile(
    //     this._fs,
    //     this._mockedDirectory,
    //     route,
    //     req,
    //     res,
    //     options
    //   );
    //   const { statusCode, headers, filePath, rawFileData, type } = retVal;
    //   switch (type) {
    //     case 'image':
    //       res.status(statusCode).header(headers).sendFile(filePath);
    //       break;
    //     case 'json':
    //       res.status(statusCode).header(headers).json(JSON.parse(rawFileData));
    //       break;
    //     case 'raw':
    //       res.status(statusCode).header(headers).send(rawFileData);
    //       break;
    //     default:
    //       logger.warn(`Type ${type} not officially supported yet`);
    //       break;
    //   }
    // } catch (e) {
    //   return res.status(500).send('Route must be defined to respond from file');
    // }
  };
}
