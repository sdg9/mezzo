import * as express from 'express';
import { MezzoStartOptions } from '../types';
import { MEZZO_API_PATH } from '@caribou-crew/mezzo-constants';
import logger from '../utils/logger';
import { findRouteIndexById } from '../utils/routeMatchingUtils';
import { Mezzo } from './core';
import * as path from 'path';
import { version } from '../../package.json';
import {
  GetRoutesResponse,
  SetRouteVariant,
} from '@caribou-crew/mezzo-interfaces';

export const addAdminEndpoints = (app: express.Express, mezzo: Mezzo) => {
  app.get(`${MEZZO_API_PATH}/routes`, (req, res) => {
    const response: GetRoutesResponse = {
      routes: mezzo.serialiazeRoutes(),
      appVersion: version,
      variantCategories: mezzo.variantCategories,
    };
    res.json(response);
  });

  app.post(`${MEZZO_API_PATH}/routeVariants/set`, (req, res) => {
    const payload: SetRouteVariant = req.body;

    payload.forEach((item) => {
      const index = findRouteIndexById(item.routeID, mezzo.userRoutes);
      const foundRoute = mezzo.userRoutes[index];
      if (foundRoute) {
        const updatedItem = foundRoute.setVariant(item.variantID);
        mezzo.userRoutes[index] = updatedItem;
      } else {
        logger.warn(
          `Could not find route for ${item.routeID} to set variant ${item.variantID}`
        );
      }
    });

    res.sendStatus(200);
  });

  app.delete(`${MEZZO_API_PATH}/routeVariants`, (req, res) => {
    mezzo.userRoutes.forEach((route) => {
      route.setVariant('default');
    });
    res.sendStatus(200);
  });

  app.post(
    `${MEZZO_API_PATH}/sessionVariantState/set/:sessionId`,
    (req, res) => {
      const sessionId = req.params.sessionId;
      const payload: SetRouteVariant = req.body;
      mezzo.sessionState.setSessionVariantStateByKey(sessionId, payload);
      res.sendStatus(200);
    }
  );

  app.post(
    `${MEZZO_API_PATH}/sessionVariantState/update/:sessionId`,
    (req, res) => {
      const sessionId = req.params.sessionId;
      const payload: SetRouteVariant = req.body;
      mezzo.sessionState.updateSessionVariantStateByKey(sessionId, payload);
      res.sendStatus(200);
    }
  );

  app.delete(`${MEZZO_API_PATH}/sessionVariantState/:sessionId`, (req, res) => {
    const sessionId = req.params.sessionId;
    mezzo.sessionState.resetSessionVariantStateByKey(sessionId);
    res.sendStatus(200);
  });

  app.delete(`${MEZZO_API_PATH}/sessionVariantState`, (req, res) => {
    mezzo.sessionState.resetSessionVariantState();
    res.sendStatus(200);
  });
};

export const addAdminStaticSite = (
  app: express.Express,
  options?: MezzoStartOptions
) => {
  const rootAdmin = `/${options?.adminEndpoint ?? 'mezzo'}`;

  console.log('Starting at endpoint: ', rootAdmin);
  app.use(rootAdmin, express.static(path.join(__dirname, '..', 'public')));

  // With react routing on client side we need to call out routes if we also want to support server side
  // Alternatively we could use something like hash based routing
  app.use(
    `${rootAdmin}/record`,
    express.static(path.join(__dirname, '..', 'public'))
  );
};

export const addSiteManifest = (app: express.Express) => {
  const items = [
    '/favicon.ico',
    '/favicon-32x32.png',
    '/favicon-16x16.png',
    '/apple-touch-icon.png',
    '/android-chrome-512x512.png',
    '/android-chrome-192x192.png',
    '/site.webmanifest',
  ];

  items.forEach((i) => {
    app.use(i, express.static(path.join(__dirname, '..', 'public', i)));
  });
};
