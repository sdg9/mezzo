import { FileHandlerOptions } from '../../types';
import { Route } from '../models/route-model';
import logger from '@caribou-crew/mezzo-utils-logger';
import { timeout } from './timeoutUtils';
import { getFileContents, getFilePathForRequest } from './filePathUtils';
import * as nodeFs from 'fs';
import * as path from 'path';
import { Request, Response } from 'express';
import { routeStatePort } from '../__tests__/testPorts';

interface RespondWithFileType {
  statusCode: number;
  headers: Record<string, string | boolean>;
  filePath?: string;
  rawFileData?: string;
  type: string;
}

/**
 *
 * Called by user defined routes in mezzo.utils.respondWithFile
 * This will allow for reading network mock responses from disk
 *
 * @param fs
 * @param mockedDirectory
 * @param route
 * @param req
 * @param res
 * @param options
 * @returns
 */
const respondWithFile = async (
  fs: typeof nodeFs,
  mockedDirectory: string,
  route: Route,
  req: Request | null,
  res: Response,
  options?: FileHandlerOptions
): Promise<RespondWithFileType> => {
  logger.debug(
    `respond with file for ${route?.method} ${route?.path} of id ${route?.id}`
  );
  if (route == null) {
    res.status(500).send('Route must be defined to respond from file');
    return;
    // throw new Error('Route must be defined to respond from file');
  }

  const filePathInfo = await getFilePathForRequest(
    fs,
    mockedDirectory,
    route,
    req,
    options
  );

  const sendTypes = ['.txt', '.html'];
  const imageTypes = ['.png', '.gif', '.pdf', '.jpg', '.jpeg', '.svg'];
  const statusCode = options?.code ?? 200;
  const headers = options?.headers ?? {};
  await timeout(options?.delay ?? 0);
  let returnValue: RespondWithFileType;
  if (imageTypes.includes(filePathInfo.mimeType.toLowerCase())) {
    res.status(statusCode).header(headers).sendFile(filePathInfo.filePath);
    // returnValue = {
    //   statusCode,
    //   headers,
    //   filePath: filePathInfo.filePath,
    //   type: 'image',
    // };
  } else {
    const rawFileData = await getFileContents(fs, filePathInfo.filePath);
    if (filePathInfo.mimeType === '.json') {
      res.status(statusCode).header(headers).json(JSON.parse(rawFileData));
      // returnValue = {
      //   statusCode,
      //   headers,
      //   filePath: filePathInfo.filePath,
      //   rawFileData,
      //   type: 'json',
      // };
    } else if (sendTypes.includes(filePathInfo.mimeType.toLowerCase())) {
      res.status(statusCode).header(headers).send(rawFileData);
      // returnValue = {
      //   statusCode,
      //   headers,
      //   rawFileData,
      //   type: 'raw',
      // };
    } else {
      logger.warn(
        `Filetype ${filePathInfo.mimeType} not officially supported yet`
      );
      res.status(statusCode).header(headers).send(rawFileData);
      // returnValue = {
      //   statusCode,
      //   headers,
      //   rawFileData,
      //   type: 'raw',
      // };
    }
  }
  return returnValue;
};

export default respondWithFile;

export async function getVariantsFromDisk(
  // fs: typeof nodeFs,
  fs: any,
  dir: string,
  relativePath: string,
  variantsToIgnore = []
) {
  const files = await fs.promises.readdir(path.join(dir, relativePath));
  return files
    .map((name) => path.basename(name))
    .filter((name) => !variantsToIgnore.includes(name));
}

export function addAsVariant(route: Route, variants = [], code = 200) {
  variants.forEach((name) => {
    route.variant({
      id: name,
      label: name,
      callback: (req, res) => {
        // return respondWithFile()
        // TODO call respond with file
      },
    });
  });
}
