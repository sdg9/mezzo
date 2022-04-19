import * as express from 'express';
import { RouteVariants, ServerOptions } from '../types';
import { MEZZO_API_PATH } from '../utils/constants';
import logger from '../utils/logger';
import { findRouteIndexById } from '../utils/routeMatchingUtils';
import { Mezzo } from './core';
import * as path from 'path';

export const addAdminEndpoints = (app: express.Express, mezzo: Mezzo) => {
  app.get(`/mezzo/routes`, (req, res) => {
    res.json(mezzo.serialiazeRoutes());
  });

  // setMockVariahttps://github.com/sgoff0/midway/blob/6614a6a91d3060951e99326c68333ebf78563e8c/src/utils/common-utils.ts#L318-L356nt
  app.post(`${MEZZO_API_PATH}/route/:id`, (req, res) => {
    const routeId = req.params.id;
    const variantId = req.body.variant;
    const index = findRouteIndexById(routeId, mezzo.userRoutes);
    const foundRoute = mezzo.userRoutes[index];
    if (foundRoute) {
      const updatedItem = foundRoute.setVariant(variantId);
      mezzo.userRoutes[index] = updatedItem;
    } else {
      logger.warn(
        `Could not find route for ${routeId} to set variant ${variantId}`
      );
    }
    res.sendStatus(200);
  });

  // setMockVariantWithSession https://github.com/sgoff0/midway/blob/6614a6a91d3060951e99326c68333ebf78563e8c/src/utils/common-utils.ts#L288-L315
  app.post(
    `${MEZZO_API_PATH}/sessionVariantState/set/:sessionId`,
    (req, res) => {
      const sessionId = req.params.sessionId;
      const payload: RouteVariants = req.body;
      mezzo.sessionState.setSessionVariantStateByKey(sessionId, payload);
      res.sendStatus(200);
    }
  );

  app.post(
    `${MEZZO_API_PATH}/sessionVariantState/update/:sessionId`,
    (req, res) => {
      //TODO
      const sessionId = req.params.sessionId;
      const payload: RouteVariants = req.body;
      mezzo.sessionState.updateSessionVariantStateByKey(sessionId, payload);
      res.sendStatus(200);
    }
  );

  // ===================================
  // NOT YET IMPLEMENTED
  // ===================================
  app.get(`/api`, (req, res) => {
    res.status(200).json({ message: 'Hello world from api' });
  });

  app.get(`/_admin`, (req, res) => {
    res.redirect(`/mezzo`);
  });

  app.get(`/mezzo-data`, (req, res) => {
    // TODO: format and return data
    res.json({
      id: 'todoId',
      routes: 'todoRoutes',
      profiles: 'todoProfiles',
      actions: 'todoActions',
    });
  });

  app.post(`${MEZZO_API_PATH}/action`, (req, res) => {
    //TODO
  });
  app.post(`${MEZZO_API_PATH}/state/reset`, (req, res) => {
    //TODO
    res.status(200).json({ message: 'reset' });
  });
  app.post(`${MEZZO_API_PATH}/sessionVariantState/reset`, (req, res) => {
    //TODO
  });

  // Wire up to CLI resetMockVariantWithSession https://github.com/sgoff0/midway/blob/6614a6a91d3060951e99326c68333ebf78563e8c/src/utils/common-utils.ts#L269-L286
  app.post(
    `${MEZZO_API_PATH}/sessionVariantState/reset/:sessionId`,
    (req, res) => {
      //TODO
    }
  );

  app.post(`${MEZZO_API_PATH}/input/reset`, (req, res) => {
    //TODO
  });
};

export const addAdminStaticSite = (
  app: express.Express,
  options?: ServerOptions
) => {
  // app.get(`/${options?.adminEndpoint ?? 'mezzo'}`, (req, res) => {
  //   res.status(200).send('TODO HTML Site');
  // });
  app.use(
    `/${options?.adminEndpoint ?? 'mezzo'}`,
    express.static(path.join(__dirname, '..', 'public'))
  );
  // app.use(express.static(path.join(__dirname, 'web')));
};
