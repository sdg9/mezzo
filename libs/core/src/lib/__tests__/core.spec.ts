import * as SuperTestRequest from 'supertest';
import { fs, vol } from 'memfs';
import mezzo from '../core';
import * as path from 'path';
import { resourcesPath } from '../../utils/pathHelpers';
import { X_REQUEST_SESSION, X_REQUEST_VARIANT } from '../../utils/constants';

describe('mezzo', () => {
  let request: SuperTestRequest.SuperTest<SuperTestRequest.Test>;
  beforeAll(() => {
    global.console = require('console'); // Don't stack trace out all console logs
  });

  let mockedDirectory;
  beforeEach(async () => {
    process.env.LOG_LEVEL = 'warn';
    const port = 3000;
    request = SuperTestRequest(`http://localhost:${port}`);
    mockedDirectory = path.join(resourcesPath, 'some-custom-mocked-data');
    await mezzo.start({
      port,
      mockedDirectory,
      fsOverride: fs,
    });
  });
  afterEach(async () => {
    await mezzo.stop();
    vol.reset();
  });

  describe('.route', () => {
    describe('variant headers', () => {
      const routePath = '/something';
      const routeId = 'someRoute';
      beforeEach(() => {
        mezzo
          .route({
            id: routeId,
            path: routePath,
            handler(req, res) {
              res.send({ variant: 'default' });
            },
          })
          .variant({
            id: 'v1',
            handler(req, res) {
              res.send({ variant: 'v1' });
            },
          })
          .variant({
            id: 'v2',
            handler(req, res) {
              res.send({ variant: 'v2' });
            },
          });
      });
      it('should respect variant from request header', async () => {
        const res = await request.get(routePath).set(X_REQUEST_VARIANT, 'v1');
        expect(res.status).toBe(200);
        expect(res.body.variant).toBe('v1');

        const res2 = await request
          .get(routePath)
          .set(X_REQUEST_VARIANT, 'default');
        expect(res2.status).toBe(200);
        expect(res2.body.variant).toBe('default');

        const res3 = await request
          .get(routePath)
          .set(X_REQUEST_VARIANT, 'mismatch');
        expect(res3.status).toBe(200);
        expect(res3.body.variant).toBe('default');
      });
      it('should respect session from request header', async () => {
        const sessionId = '123';
        mezzo.setMockVariantForSession(sessionId, {
          [routeId]: 'v2',
        });
        const res1 = await request
          .get(routePath)
          .set(X_REQUEST_SESSION, sessionId);
        expect(res1.status).toBe(200);
        expect(res1.body.variant).toBe('v2');

        mezzo.setMockVariantForSession(sessionId, {
          [routeId]: 'v1',
        });
        const res2 = await request
          .get(routePath)
          .set(X_REQUEST_SESSION, sessionId);
        expect(res2.status).toBe(200);
        expect(res2.body.variant).toBe('v1');
      });
      it('should use default for invalid session id', async () => {
        const res1 = await request.get(routePath).set(X_REQUEST_SESSION, '123');
        expect(res1.status).toBe(200);
        expect(res1.body.variant).toBe('default');
      });
      it('should use default if invalid variant is set in matching session', async () => {
        const sessionId = '123';
        mezzo.setMockVariantForSession(sessionId, {
          [routeId]: 'bogus',
        });
        const res1 = await request.get(routePath).set(X_REQUEST_SESSION, '123');
        expect(res1.status).toBe(200);
        expect(res1.body.variant).toBe('default');
      });
      it.only('should prefer request variant header over session and route state', async () => {
        const sessionId = '123';
        mezzo.setMockVariantForSession(sessionId, {
          [routeId]: 'v2',
        });
        mezzo.setMockVariant(routeId, 'v2');
        const res1 = await request
          .get(routePath)
          .set(X_REQUEST_SESSION, sessionId)
          .set(X_REQUEST_VARIANT, 'v1');
        expect(res1.status).toBe(200);
        expect(res1.body.variant).toBe('v1');
      });
      it('should prefer session variant header over route state', async () => {
        const sessionId = '123';
        mezzo.setMockVariantForSession(sessionId, {
          [routeId]: 'v1',
        });
        mezzo.setMockVariant(routeId, 'v2');
        const res1 = await request
          .get(routePath)
          .set(X_REQUEST_SESSION, sessionId);
        expect(res1.status).toBe(200);
        expect(res1.body.variant).toBe('v1');
      });
    });
    describe('file response', () => {
      it('should read from default file using backwards compatible handler', async () => {
        vol.fromJSON(
          {
            './respondWithFile/GET/default.json':
              '{"message": "Responding with file"}',
          },
          mockedDirectory
        );
        mezzo.route({
          id: 'someRoute',
          path: '/respondWithFile',
          handler(req, res) {
            return mezzo.util.respondWithFile(this, req, res);
          },
        });
        const res = await request.get('/respondWithFile');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ message: 'Responding with file' });
      });
      it('cannot read file using handler with fat arrow function (likely unexpected behavior to users)', async () => {
        vol.fromJSON(
          {
            './respondWithFile/GET/default.json':
              '{"message": "Responding with file"}',
          },
          mockedDirectory
        );
        mezzo.route({
          id: 'someRoute',
          path: '/respondWithFile',
          handler: (req, res) => {
            // Based on how scoping of `this` works, if you put it inside a fat arrow function it'll break the reference of this
            return mezzo.util.respondWithFile(this, req, res);
          },
        });
        const res = await request.get('/respondWithFile');
        expect(res.status).toBe(500);
      });
      it('should read from default file using explicit callback', async () => {
        vol.fromJSON(
          {
            './respondWithFile/GET/default.json':
              '{"message": "Responding with file"}',
          },
          mockedDirectory
        );
        mezzo.route({
          id: 'someRoute',
          path: '/respondWithFile',
          callback: (req, res, route) => {
            return mezzo.util.respondWithFile(route, req, res);
          },
        });
        const res = await request.get('/respondWithFile');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ message: 'Responding with file' });
      });
      it('should read from variant file', async () => {
        vol.fromJSON(
          {
            './respondWithVariantReplyFromFile/GET/default.json':
              '{"variant": "default"}',
            './respondWithVariantReplyFromFile/GET/variant1.json':
              '{"variant": "variant1"}',
          },
          mockedDirectory
        );
        const myPath = '/respondWithVariantReplyFromFile';
        mezzo
          .route({
            id: 'someRoute',
            path: myPath,
            handler(req, res) {
              return mezzo.util.respondWithFile(this, req, res);
            },
          })
          .variant({
            id: 'variant1',
            handler(req, res) {
              return mezzo.util.respondWithFile(this, req, res);
            },
          });
        const res = await request.get(myPath);
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ variant: 'default' });

        mezzo.setMockVariant('someRoute', 'variant1');

        const res2 = await request.get(myPath);
        expect(res2.body).toEqual({ variant: 'variant1' });
      });
      it("handler's this and route are the same", async () => {
        const path = '/part1';
        let insideThis;
        const route = mezzo.route({
          id: 'someRoute',
          path,
          handler(req, res) {
            insideThis = this;
            res.sendStatus(200);
          },
        });
        await request.get(path);
        expect(route).toBe(insideThis);
      });
      it('should read file with dynamic path', async () => {
        vol.fromJSON(
          {
            './part1/:part2/GET/default.json': '{"variant": "default"}',
            './part1/:part2/GET/variant1.json': '{"variant": "other"}',
          },
          mockedDirectory
        );
        const path = '/part1/:part2';
        const routeId = 'someRoute';
        mezzo
          .route({
            id: routeId,
            path,
            handler(req, res) {
              return mezzo.util.respondWithFile(this, req, res);
            },
          })
          .variant({
            id: 'variant1',
            handler(req, res) {
              mezzo.util.respondWithFile(this, req, res);
            },
          });

        const res = await request.get('/part1/someDynamicPart2Path');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ variant: 'default' });
        mezzo.setMockVariant(routeId, 'variant1');
        const res2 = await request.get('/part1/someDynamicPart2Path');
        expect(res2.body).toEqual({ variant: 'other' });
        const res3 = await request.get('/part1/someDynamicPart2PathAlt');
        expect(res3.body).toEqual({ variant: 'other' });
      });
      it('should support delay', async () => {
        // TODO: This test doesn't actually mock timers out so it's not perfect, it just confirms setTimeout was called accurate, could be improved
        const delay = 11;
        const spy = jest.spyOn(global, 'setTimeout');
        const path = '/respondWithFile';
        vol.fromJSON(
          {
            './respondWithFile/GET/default.json':
              '{"message": "Responding with file"}',
          },
          mockedDirectory
        );
        mezzo.route({
          id: 'someRoute',
          path,
          async handler(req, res) {
            mezzo.util.respondWithFile(this, req, res, { delay });
          },
        });

        const res = await request.get(path);
        const timeoutArg = spy.mock.calls[0][1];
        expect(res.status).toBe(200);
        expect(timeoutArg).toBe(delay);
        spy.mockRestore();
      });
      it('should support no delay', async () => {
        // TODO: This test doesn't actually mock timers out so it's not perfect, it just confirms setTimeout was called accurate, could be improved
        const spy = jest.spyOn(global, 'setTimeout');
        const path = '/respondWithFile';
        vol.fromJSON(
          {
            './respondWithFile/GET/default.json':
              '{"message": "Responding with file"}',
          },
          mockedDirectory
        );
        mezzo.route({
          id: 'someRoute',
          path,
          async handler(req, res) {
            mezzo.util.respondWithFile(this, req, res);
          },
        });

        const res = await request.get(path);
        expect(res.status).toBe(200);
        const timeoutArg = spy.mock.calls[0][1];
        expect(timeoutArg).toBe(0);
        spy.mockRestore();
      });
      it.skip('should read session scoped variant from file TODO', async () => {});
      it.skip('should read header scoped variant from file TODO', async () => {});
    });
    describe('express response', () => {
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
        it('should be able to extrac parameters from regex', async () => {
          let params;
          mezzo.route({
            id: 'someRoute',
            path: /docs\/termsAndConditions_(.*)_(.*)\.json$/,
            handler: (req, res) => {
              params = req.params;
              res.json({ message: 'hi' });
            },
          });
          await request.get(
            '/docs/termsAndConditions_platformA_version1.2.3.json'
          );
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
            res.json({ someCustomCodingResponse: 'hi' });
          },
        });
        const res = await request.get('/someDynamicEndpoint');
        expect(res.status).toBe(200);
        expect(res.body).toEqual({ someCustomCodingResponse: 'hi' });
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
      it.skip('should read session scoped variant from code TODO', async () => {});
      it.skip('should read header scoped variant from code TODO', async () => {});
    });
  });

  describe('.setMockVariant', () => {
    it('should change the active variant of route', async () => {
      const myPath = '/some/path';
      const altVariantName = 'someVariantB';
      const routeId = `GET ${myPath}`;
      mezzo
        .route({
          id: routeId,
          path: myPath,
          handler: function (req, res) {
            res.json({ someKey: 'A' });
          },
        })
        .variant({
          id: altVariantName,
          handler: function (req, res) {
            res.json({ someKey: 'B' });
          },
        });
      const res = await request.get(myPath);
      expect(res.body).toEqual({ someKey: 'A' });

      mezzo.setMockVariant(routeId, altVariantName);
      const res2 = await request.get(myPath);
      expect(res2.body).toEqual({ someKey: 'B' });
    });
  });

  describe('/admin', () => {
    it('should have stubbed out admin site (move out of common)', async () => {
      const res = await request.get('/mezzo');
      expect(res.status).toBe(200);
      expect(res.text).toBe('TODO HTML Site');
    });
  });
});
