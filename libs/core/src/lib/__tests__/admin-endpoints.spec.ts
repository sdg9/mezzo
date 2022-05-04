import {
  DEFAULT_VARIANT_CATEGORY,
  MEZZO_API_PATH,
} from '@caribou-crew/mezzo-constants';
import * as SuperTestRequest from 'supertest';
import mezzo from '../core';
import { adminEndpointsPort } from './testPorts';

describe('admin-endpoints', () => {
  let request: SuperTestRequest.SuperTest<SuperTestRequest.Test>;
  beforeAll(() => {
    // global.console = require('console'); // Don't stack trace out all console logs
  });

  const routePath = '/something';
  const routeId = `GET ${routePath}`;
  const variant1 = 'variant1';
  const _default = 'default';
  beforeEach(async () => {
    process.env.LOG_LEVEL = 'warn';
    const port = adminEndpointsPort;
    request = SuperTestRequest(`http://localhost:${port}`);
    await mezzo.start({
      port,
    });

    mezzo
      .route({
        id: routeId,
        path: routePath,
        handler: function (req, res) {
          res.json({ someKey: 'A' });
        },
      })
      .variant({
        id: variant1,
        label: `${variant1}-label`,
        handler: function (req, res) {
          res.json({ someKey: 'B' });
        },
      });
    mezzo.route({
      id: 'POST /route2',
      path: 'route2',
      method: 'POST',
      handler: function (req, res) {
        res.json({ someKey: 'C' });
      },
    });
  });
  afterEach(async () => {
    await mezzo.stop();
  });

  describe(`${MEZZO_API_PATH}/routes`, () => {
    it('should return all routes for admin GUI', async () => {
      await mezzo.setMockVariant([{ routeID: routeId, variantID: variant1 }]);

      const res = await request.get(`${MEZZO_API_PATH}/routes`);
      expect(res.status).toBe(200);
      expect(res.body.routes).toEqual([
        {
          activeVariant: 'variant1',
          id: routeId,
          method: 'GET',
          path: routePath,
          variants: [
            {
              category: DEFAULT_VARIANT_CATEGORY,
              id: _default,
            },
            {
              category: DEFAULT_VARIANT_CATEGORY,
              id: variant1,
              label: `${variant1}-label`,
            },
          ],
        },
        {
          activeVariant: _default,
          id: 'POST /route2',
          method: 'POST',
          path: 'route2',
          variants: [
            {
              category: DEFAULT_VARIANT_CATEGORY,
              id: _default,
            },
          ],
        },
      ]);
    });
  });
});
