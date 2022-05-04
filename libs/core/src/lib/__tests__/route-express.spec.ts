import * as SuperTestRequest from 'supertest';
import mezzo from '../core';
import { routeExpressPort } from './testPorts';

describe('route-express', () => {
  let request: SuperTestRequest.SuperTest<SuperTestRequest.Test>;
  beforeAll(() => {
    // global.console = require('console'); // Don't stack trace out all console logs
  });

  beforeEach(async () => {
    process.env.LOG_LEVEL = 'warn';
    const port = routeExpressPort;
    request = SuperTestRequest(`http://localhost:${port}`);
    await mezzo.start({
      port,
    });
  });
  afterEach(async () => {
    await mezzo.stop();
  });
  describe('async callback', () => {
    it.only('works when callback is async', async () => {
      mezzo.route({
        id: 'someRoute',
        path: '/someRoute',
        callback: async (req, res) => {
          res.json({ message: 'hi' });
        },
      });
      const res = await request.get('/someRoute');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: 'hi' });
    });
  });
  describe('with query string', () => {
    it('should interact with querystring params', async () => {
      mezzo.route({
        id: 'someRoute',
        path: '/someRoute',
        handler: (req, res) => {
          if (req.query?.message === 'notHi') {
            res.json({ message: 'bye' });
          } else {
            res.json({ message: 'hi' });
          }
        },
      });
      const res = await request.get('/someRoute');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: 'hi' });

      const res2 = await request.get('/someRoute?message=notHi');
      expect(res2.body).toEqual({ message: 'bye' });
    });
  });

  describe('with regexp', () => {
    it('should read from default file with regex in path', async () => {
      mezzo.route({
        id: 'someRoute',
        path: /.*fly$/,
        handler: (req, res) => {
          res.json({ message: 'hi' });
        },
      });
      const res = await request.get('/butterfly');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: 'hi' });

      const res2 = await request.get('/flyNot');
      expect(res2.status).toBe(404);
    });
    it('should be able to extrac parameters from url', async () => {
      let stuff;
      mezzo.route({
        id: 'someRoute',
        path: '/docs/:stuff',
        handler: (req, res) => {
          res.json({ message: 'hi' });
          stuff = req.params.stuff;
        },
      });
      await request.get('/docs/someStuff');
      expect(stuff).toEqual('someStuff');
    });
    it('should be able to extract parameters from regex', async () => {
      let params;
      mezzo.route({
        id: 'someRoute',
        path: /docs\/termsAndConditions_(.*)_(.*)\.json$/,
        handler: (req, res) => {
          params = req.params;
          res.json({ message: 'hi' });
        },
      });
      await request.get('/docs/termsAndConditions_platformA_version1.2.3.json');
      expect(params['0']).toEqual('platformA');
      expect(params['1']).toEqual('version1.2.3');
    });
  });
  it('should use default resopnse', async () => {
    mezzo.route({
      id: 'someRoute',
      method: 'GET',
      path: '/respondWithCustomCoding',
      handler: function (req, res) {
        res.send({ someCustomCodingResponse: true });
      },
    });

    const res = await request.get('/respondWithCustomCoding');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ someCustomCodingResponse: true });
  });

  it('should work with dynamic path', async () => {
    mezzo.route({
      id: 'someRoute',
      path: '/:someDynamicValue',
      handler: (req, res) => {
        res.json({
          someCustomCodingResponse: 'hi ' + req.params.someDynamicValue,
        });
      },
    });
    const res = await request.get('/someDynamicEndpoint');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      someCustomCodingResponse: 'hi someDynamicEndpoint',
    });
  });
  it('should allow custom status codes', async () => {
    mezzo.route({
      id: 'someRoute',
      method: 'GET',
      path: '/respondWithCustomCodingAndStatus',
      handler: function (req, res) {
        res.status(401).json({ someCustomError: true });
      },
    });
    const res = await request.get('/respondWithCustomCodingAndStatus');
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ someCustomError: true });
  });
  it('should be able to directly set the variant from the route', async () => {
    const someRoute = mezzo
      .route({
        id: 'GET /some/path',
        path: '/some/path',
        handler: function (req, res) {
          console.log('Got request for default!!!');
          res.json({ someKey: 'A' });
        },
      })
      .variant({
        id: 'someVariantId',
        handler: function (req, res) {
          console.log('Got request for variant!!!');
          res.json({ someKey: 'B' });
        },
      });

    someRoute.setVariant('someVariantId');
    const res2 = await request.get('/some/path');
    expect(res2.body).toEqual({ someKey: 'B' });
  });
  it('should be able to change the variant multiple times', async () => {
    const someRoute = mezzo.route({
      id: 'GET /some/path',
      path: '/some/path',
      handler: function (req, res) {
        console.log('Got request for default!!!');
        res.json({ someKey: 'A' });
      },
    });
    someRoute
      .variant({
        id: 'someVariantId',
        handler: function (req, res) {
          console.log('Got request for variant!!!');
          res.json({ someKey: 'B' });
        },
      })
      .variant({
        id: 'someVariantC',
        handler: function (req, res) {
          res.json({ someKey: 'C' });
        },
      });
    const res = await request.get('/some/path');
    expect(res.body).toEqual({ someKey: 'A' });

    someRoute.setVariant('someVariantId');
    const res2 = await request.get('/some/path');
    expect(res2.body).toEqual({ someKey: 'B' });

    someRoute.setVariant('someVariantC');
    const res3 = await request.get('/some/path');
    expect(res3.body).toEqual({ someKey: 'C' });
  });
});
