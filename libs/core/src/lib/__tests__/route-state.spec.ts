import * as SuperTestRequest from 'supertest';
import { fs, vol } from 'memfs';
import mezzo from '../core';
import * as path from 'path';
import { resourcesPath } from '../../utils/pathHelpers';
import {
  X_REQUEST_SESSION,
  X_REQUEST_VARIANT,
} from '@caribou-crew/mezzo-constants';
import { routeStatePort } from './testPorts';

describe('route-state', () => {
  let request: SuperTestRequest.SuperTest<SuperTestRequest.Test>;
  beforeAll(() => {
    // global.console = require('console'); // Don't stack trace out all console logs
  });

  let mockedDirectory;
  const routePath = '/something';
  const routeId = `GET ${routePath}`;
  const variant1 = 'v2';
  const variant2 = 'v2';
  const _default = 'default';
  const sessionId = '123';
  beforeEach(async () => {
    process.env.LOG_LEVEL = 'warn';
    const port = routeStatePort;
    request = SuperTestRequest(`http://localhost:${port}`);
    mockedDirectory = path.join(resourcesPath, 'some-custom-mocked-data');
    await mezzo.start({
      port,
      mockedDirectory,
      fsOverride: fs,
    });

    mezzo
      .route({
        id: routeId,
        path: routePath,
        callback(req, res) {
          res.send({ variant: _default });
        },
      })
      .variant({
        id: variant1,
        callback(req, res) {
          res.send({ variant: variant1 });
        },
      })
      .variant({
        id: variant2,
        callback(req, res) {
          res.send({ variant: variant2 });
        },
      });
  });
  afterEach(async () => {
    await mezzo.stop();
    vol.reset();
  });

  describe('request scoped variant', () => {
    it('should respect variant from header', async () => {
      const res = await request.get(routePath).set(X_REQUEST_VARIANT, variant1);
      expect(res.status).toBe(200);
      expect(res.body.variant).toBe(variant1);

      const res2 = await request
        .get(routePath)
        .set(X_REQUEST_VARIANT, _default);
      expect(res2.status).toBe(200);
      expect(res2.body.variant).toBe(_default);

      const res3 = await request
        .get(routePath)
        .set(X_REQUEST_VARIANT, 'mismatch');
      expect(res3.status).toBe(200);
      expect(res3.body.variant).toBe(_default);
    });
    it('should prefer request variant header over session and route state', async () => {
      await mezzo.setMockVariantForSession(sessionId, [
        { routeID: routeId, variantID: variant2 },
      ]);
      await mezzo.setMockVariant([{ routeID: routeId, variantID: variant2 }]);
      const res1 = await request
        .get(routePath)
        .set(X_REQUEST_SESSION, sessionId)
        .set(X_REQUEST_VARIANT, variant1);
      expect(res1.status).toBe(200);
      expect(res1.body.variant).toBe(variant1);
    });
  });

  describe('session scoped variant', () => {
    it('should respect variant from header', async () => {
      await mezzo.setMockVariantForSession(sessionId, [
        { routeID: routeId, variantID: variant2 },
      ]);
      const res1 = await request
        .get(routePath)
        .set(X_REQUEST_SESSION, sessionId);
      expect(res1.status).toBe(200);
      expect(res1.body.variant).toBe(variant2);

      await mezzo.setMockVariantForSession(sessionId, [
        { routeID: routeId, variantID: variant1 },
      ]);
      const res2 = await request
        .get(routePath)
        .set(X_REQUEST_SESSION, sessionId);
      expect(res2.status).toBe(200);
      expect(res2.body.variant).toBe(variant1);
    });
    it('should fall back to default variant for invalid session id', async () => {
      const res1 = await request
        .get(routePath)
        .set(X_REQUEST_SESSION, sessionId);
      expect(res1.status).toBe(200);
      expect(res1.body.variant).toBe(_default);
    });
    it('should fall back to default variant for invalid variant', async () => {
      await mezzo.setMockVariantForSession(sessionId, [
        { routeID: routeId, variantID: 'bogus' },
      ]);
      const res1 = await request
        .get(routePath)
        .set(X_REQUEST_SESSION, sessionId);
      expect(res1.status).toBe(200);
      expect(res1.body.variant).toBe(_default);
    });
    it('should prefer session variant header over route state', async () => {
      await mezzo.setMockVariantForSession(sessionId, [
        { routeID: routeId, variantID: variant1 },
      ]);
      await mezzo.setMockVariant([{ routeID: routeId, variantID: variant2 }]);
      const res1 = await request
        .get(routePath)
        .set(X_REQUEST_SESSION, sessionId);
      expect(res1.status).toBe(200);
      expect(res1.body.variant).toBe(variant1);
    });
  });
});
