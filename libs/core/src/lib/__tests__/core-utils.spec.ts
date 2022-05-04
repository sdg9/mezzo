import * as SuperTestRequest from 'supertest';
import mezzo from '../core';
import { X_REQUEST_SESSION } from '@caribou-crew/mezzo-constants';
import { corePort } from './testPorts';

describe('core-utils', () => {
  let request: SuperTestRequest.SuperTest<SuperTestRequest.Test>;
  beforeAll(() => {
    // global.console = require('console'); // Don't stack trace out all console logs
  });

  const route1 = 'someId';
  const route1Path = '/somePath';
  const variant1 = 'A2';
  const a1Default = 'A1-default';
  const b1Default = 'B1-default';

  const route2 = 'someOtherId';
  const route2Path = '/someOtherPath';
  const variant2 = 'B2';
  const sessionId = '123';

  beforeEach(async () => {
    process.env.LOG_LEVEL = 'warn';
    const port = corePort;
    request = SuperTestRequest(`http://localhost:${port}`);
    await mezzo.start({
      port,
    });

    mezzo
      .route({
        id: route1,
        path: route1Path,
        handler: function (req, res) {
          res.json({ someKey: a1Default });
        },
      })
      .variant({
        id: variant1,
        handler: function (req, res) {
          res.json({ someKey: variant1 });
        },
      });

    mezzo
      .route({
        id: route2,
        path: route2Path,
        handler: function (req, res) {
          res.json({ someKey: b1Default });
        },
      })
      .variant({
        id: variant2,
        handler: function (req, res) {
          res.json({ someKey: variant2 });
        },
      });
  });
  afterEach(async () => {
    await mezzo.stop();
  });

  describe('.setMockVariantForSession', () => {
    it('should reset all variants for session when setting new values', async () => {
      await mezzo.setMockVariantForSession(sessionId, [
        { routeID: route1, variantID: variant1 },
        { routeID: route2, variantID: variant2 },
      ]);

      const res1 = await request
        .get(route1Path)
        .set(X_REQUEST_SESSION, sessionId);
      expect(res1.body.someKey).toBe(variant1);

      await mezzo.setMockVariantForSession(sessionId, [
        { routeID: route2, variantID: variant2 },
      ]);

      const res2 = await request
        .get(route1Path)
        .set(X_REQUEST_SESSION, sessionId);
      expect(res2.body.someKey).toBe(a1Default);
    });
  });

  describe('.updateMockVariantForSession', () => {
    it('should preserve prior variants without collision for session when setting new values', async () => {
      await mezzo.setMockVariantForSession(sessionId, [
        { routeID: route1, variantID: variant1 },
        { routeID: route2, variantID: variant2 },
      ]);

      const res1 = await request
        .get(route1Path)
        .set(X_REQUEST_SESSION, sessionId);
      expect(res1.body.someKey).toBe(variant1);

      await mezzo.updateMockVariantForSession(sessionId, [
        { routeID: route2, variantID: variant2 },
      ]);

      const res2 = await request
        .get(route1Path)
        .set(X_REQUEST_SESSION, sessionId);
      expect(res2.body.someKey).toBe(variant1);
    });
  });

  describe('.setMockVariant', () => {
    it('should change the active variant of route', async () => {
      const res = await request.get(route1Path);
      expect(res.body).toEqual({ someKey: a1Default });

      await mezzo.setMockVariant([{ routeID: route1, variantID: variant1 }]);
      const res2 = await request.get(route1Path);
      expect(res2.body).toEqual({ someKey: variant1 });
    });
  });

  describe('.resetMockVariantForSession', () => {
    it('should reset all variants for session', async () => {
      await mezzo.setMockVariantForSession(sessionId, [
        { routeID: route1, variantID: variant1 },
        { routeID: route2, variantID: variant2 },
      ]);

      const res1 = await request
        .get(route1Path)
        .set(X_REQUEST_SESSION, sessionId);
      expect(res1.body.someKey).toBe(variant1);

      await mezzo.resetMockVariantForSession(sessionId);

      const res2 = await request
        .get(route1Path)
        .set(X_REQUEST_SESSION, sessionId);
      expect(res2.body.someKey).toBe(a1Default);
    });
  });
  describe('.resetMockVariantForAllSessions', () => {
    it('should reset all variants for session', async () => {
      await mezzo.setMockVariantForSession(sessionId, [
        { routeID: route1, variantID: variant1 },
        { routeID: route2, variantID: variant2 },
      ]);

      const res1 = await request
        .get(route1Path)
        .set(X_REQUEST_SESSION, sessionId);
      expect(res1.body.someKey).toBe(variant1);

      await mezzo.resetMockVariantForAllSessions();

      const res2 = await request
        .get(route1Path)
        .set(X_REQUEST_SESSION, sessionId);
      expect(res2.body.someKey).toBe(a1Default);
    });
  });
  describe('.resetMockVariant', () => {
    it('should reset all variants', async () => {
      await mezzo.setMockVariant([{ routeID: route1, variantID: variant1 }]);
      const res1 = await request.get(route1Path);
      expect(res1.body).toEqual({ someKey: variant1 });

      await mezzo.resetMockVariant();
      const res2 = await request.get(route1Path);
      expect(res2.body).toEqual({ someKey: a1Default });
    });
  });
});
