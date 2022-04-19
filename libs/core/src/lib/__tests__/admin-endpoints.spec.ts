import * as SuperTestRequest from 'supertest';
import mezzo from '../core';

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
    const port = 3001;
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

  describe('/admin', () => {
    it('should have stubbed out admin site (move out of common)', async () => {
      const res = await request.get('/mezzo');
      expect(res.status).toBe(200);
      expect(res.text).toBe('TODO HTML Site');
    });
  });

  describe('/_admin/routes', () => {
    it('should return all routes for admin GUI', async () => {
      await mezzo.setMockVariant({
        routeId: routeId,
        variantId: variant1,
      });

      const res = await request.get('/_admin/routes');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({
        routes: [
          {
            activeVariant: 'variant1',
            id: routeId,
            method: 'GET',
            path: routePath,
            variants: [
              {
                id: _default,
              },
              {
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
                id: _default,
              },
            ],
          },
        ],
      });
    });
  });
});
