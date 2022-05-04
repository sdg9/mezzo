import * as SuperTestRequest from 'supertest';
import { fs, vol } from 'memfs';
import mezzo from '../core';
import * as path from 'path';
import { resourcesPath } from '../../utils/pathHelpers';
import {
  X_REQUEST_SESSION,
  X_REQUEST_VARIANT,
} from '@caribou-crew/mezzo-constants';
import { fileIOPort } from './testPorts';

describe('route-file-io', () => {
  let request: SuperTestRequest.SuperTest<SuperTestRequest.Test>;
  beforeAll(() => {
    global.console = require('console'); // Don't stack trace out all console logs
  });

  let mockedDirectory;
  const routePath1 = '/respondWithFile';
  const routeId1 = `GET ${routePath1}`;

  const routePath2 = '/respondWithVariantReplyFromFile';
  const routeId2 = `GET ${routePath2}`;

  const routePath3Dynamic = '/part1/:part2';
  const routeId3Dynamic = `GET ${routePath3Dynamic}`;

  const routePath4Html = '/somePath/terms.html';
  const routeId4Html = `GET ${routePath4Html}`;

  const variant1 = 'variant1';
  const _default = 'default';
  const sessionId = '123';
  const expectedPayload = 'Responding with file';

  const defaultHtml = `
        <html>
          <head><title>Terms agreement</title></head>
          <body>Hello world</body>
        </html>
  `;
  const variantHtml = `
        <html>
          <head><title>Terms agreement alternative</title></head>
          <body>Goodbye world</body>
        </html>
  `;
  beforeEach(async () => {
    process.env.LOG_LEVEL = 'warn';
    const port = fileIOPort;
    request = SuperTestRequest(`http://localhost:${port}`);
    mockedDirectory = path.join(resourcesPath, 'some-custom-mocked-data');
    await mezzo.start({
      port,
      mockedDirectory,
      fsOverride: fs,
    });

    vol.fromJSON(
      {
        './respondWithFile/GET/default.json': `{"message": "${expectedPayload}"}`,
        './respondWithVariantReplyFromFile/GET/default.json': `{"variant": "${_default}"}`,
        './respondWithVariantReplyFromFile/GET/variant1.json': `{"variant": "${variant1}"}`,
        './part1/:part2/GET/default.json': '{"variant": "default"}',
        './part1/:part2/GET/variant1.json': '{"variant": "other"}',
        './somePath/terms.html/GET/default.html': defaultHtml,
        './somePath/terms.html/GET/variant1.html': variantHtml,
        './some/path/stuff_*.*.json/GET/default.json': '{"someJson": "stuff2"}',
      },
      mockedDirectory
    );
  });
  afterEach(async () => {
    await mezzo.stop();
    vol.reset();
  });
  describe('custom options', () => {
    it('should read from file from custom base dir', async () => {
      mezzo.route({
        id: 'GET /emptyPath',
        path: '/emptyPath',
        callback: (req, res, route) => {
          return mezzo.util.respondWithFile(route, req, res, {
            baseDir: routePath4Html,
          });
        },
      });
      const res = await request.get(`/emptyPath`);
      expect(res.status).toBe(200);
      expect(res.text).toEqual(defaultHtml);
    });
    it('should read exact file from custom filePath', async () => {
      mezzo.route({
        id: 'GET /emptyPath',
        path: '/emptyPath',
        callback: (req, res, route) => {
          return mezzo.util.respondWithFile(route, req, res, {
            filePath: '/somePath/terms.html/GET/variant1.html',
          });
        },
      });
      const res = await request.get(`/emptyPath`);
      expect(res.status).toBe(200);
      expect(res.text).toEqual(variantHtml);
    });
    it('should use custom code', async () => {
      mezzo.route({
        id: routeId4Html,
        path: routePath4Html,
        callback: (req, res, route) => {
          return mezzo.util.respondWithFile(route, req, res, {
            code: 201,
          });
        },
      });
      const res = await request.get(routePath4Html);
      expect(res.status).toBe(201);
    });
    it('should send custom headers', async () => {
      mezzo.route({
        id: routeId4Html,
        path: routePath4Html,
        callback: (req, res, route) => {
          return mezzo.util.respondWithFile(route, req, res, {
            headers: {
              someKey: 'someValue',
            },
          });
        },
      });
      const res = await request.get(routePath4Html);
      expect(res.status).toBe(200);
      expect(res.get('someKey')).toBe('someValue');
    });
  });
  describe('html', () => {
    it('should read from file', async () => {
      mezzo.route({
        id: routeId4Html,
        path: routePath4Html,
        callback: (req, res, route) => {
          return mezzo.util.respondWithFile(route, req, res);
        },
      });
      const res = await request.get(routePath4Html);
      expect(res.status).toBe(200);
      expect(res.text).toEqual(defaultHtml);
    });
    it('should read variant from file', async () => {
      mezzo
        .route({
          id: routeId4Html,
          path: routePath4Html,
          callback: (req, res, route) => {
            return mezzo.util.respondWithFile(route, req, res);
          },
        })
        .variant({
          id: variant1,
          callback: (req, res, route) => {
            return mezzo.util.respondWithFile(route, req, res);
          },
        });
      await mezzo.setMockVariant([
        { routeID: routeId4Html, variantID: variant1 },
      ]);
      const res = await request.get(routePath4Html);
      expect(res.status).toBe(200);
      expect(res.text).toEqual(variantHtml);
    });
  });

  describe('collision of both json and html', () => {
    it('prefers json over html', async () => {
      vol.fromJSON(
        {
          './some.html/GET/default.html': 'hello world',
          './some.html/GET/default.json': '{"hello": "world"}',
        },
        mockedDirectory
      );
      mezzo.route({
        id: 'GET /some.html',
        path: '/some.html',
        callback: (req, res, route) => {
          return mezzo.util.respondWithFile(route, req, res);
        },
      });
      const res = await request.get('/some.html');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ hello: 'world' });
    });
  });

  describe('json', () => {
    it('should read from default file using backwards compatible handler', async () => {
      mezzo.route({
        id: routeId1,
        path: routePath1,
        handler(req, res) {
          return mezzo.util.respondWithFile(this, req, res);
        },
      });
      const res = await request.get(routePath1);
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: expectedPayload });
    });
    it('cannot read file using handler with fat arrow function (likely unexpected behavior to users)', async () => {
      mezzo.route({
        id: routeId1,
        path: routePath1,
        handler: (req, res) => {
          // Based on how scoping of `this` works, if you put it inside a fat arrow function it'll break the reference of this
          return mezzo.util.respondWithFile(this, req, res);
        },
      });
      const res = await request.get(routePath1);
      expect(res.status).toBe(500);
    });
    it('should read from default file using explicit callback', async () => {
      mezzo.route({
        id: routeId1,
        path: routePath1,
        callback: (req, res, route) => {
          return mezzo.util.respondWithFile(route, req, res);
        },
      });
      const res = await request.get(routePath1);
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ message: expectedPayload });
    });
    it('should read from variant file', async () => {
      mezzo
        .route({
          id: routeId2,
          path: routePath2,
          callback(req, res, route) {
            return mezzo.util.respondWithFile(route, req, res);
          },
        })
        .variant({
          id: variant1,
          callback(req, res, route) {
            return mezzo.util.respondWithFile(route, req, res);
          },
        });
      const res = await request.get(routePath2);
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ variant: _default });

      await mezzo.setMockVariant([{ routeID: routeId2, variantID: variant1 }]);

      const res2 = await request.get(routePath2);
      expect(res2.body).toEqual({ variant: variant1 });
    });
    it("handler's this and route are the same", async () => {
      let insideThis;
      const route = mezzo.route({
        id: routeId1,
        path: routePath1,
        handler(req, res) {
          // eslint-disable-next-line @typescript-eslint/no-this-alias
          insideThis = this;
          res.sendStatus(200);
        },
      });
      await request.get(routePath1);
      expect(route).toBe(insideThis);
    });
    it('should read file with dynamic path', async () => {
      mezzo
        .route({
          id: routeId3Dynamic,
          path: routePath3Dynamic,
          callback(req, res, route) {
            return mezzo.util.respondWithFile(route, req, res);
          },
        })
        .variant({
          id: variant1,
          callback(req, res, route) {
            mezzo.util.respondWithFile(route, req, res);
          },
        });

      const res = await request.get('/part1/someDynamicPart2Path');
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ variant: _default });
      await mezzo.setMockVariant([
        { routeID: routeId3Dynamic, variantID: variant1 },
      ]);
      const res2 = await request.get('/part1/someDynamicPart2Path');
      expect(res2.body).toEqual({ variant: 'other' });
      const res3 = await request.get('/part1/someDynamicPart2PathAlt');
      expect(res3.body).toEqual({ variant: 'other' });
    });
    it('should read file with highly dynamic path', async () => {
      const wildcardRoute = `/some/path/stuff_*.*.json`;
      const wildCardRouteId = `GET ${wildcardRoute}`;
      let param1;
      let param2;
      mezzo.route({
        id: wildCardRouteId,
        path: wildcardRoute,
        callback(req, res, route) {
          param1 = req.params[0];
          param2 = req.params[1];
          return mezzo.util.respondWithFile(route, req, res);
        },
      });

      const res = await request.get('/some/path/stuff_1.2.3.ios.json');
      expect(res.status).toBe(200);
      expect(param1).toBe('1.2.3');
      expect(param2).toBe('ios');
    });
    it('should support delay', async () => {
      // TODO: This test doesn't actually mock timers out so it's not perfect, it just confirms setTimeout was called accurate, could be improved
      const delay = 11;
      const spy = jest.spyOn(global, 'setTimeout');
      mezzo.route({
        id: routeId1,
        path: routePath1,
        async callback(req, res, route) {
          mezzo.util.respondWithFile(route, req, res, { delay });
        },
      });

      const res = await request.get(routePath1);
      const timeoutArg = spy.mock.calls[0][1];
      expect(res.status).toBe(200);
      expect(timeoutArg).toBe(delay);
      spy.mockRestore();
    });
    it('should support no delay', async () => {
      // TODO: This test doesn't actually mock timers out so it's not perfect, it just confirms setTimeout was called accurate, could be improved
      const spy = jest.spyOn(global, 'setTimeout');
      mezzo.route({
        id: routeId1,
        path: routePath1,
        async callback(req, res, route) {
          mezzo.util.respondWithFile(route, req, res);
        },
      });

      const res = await request.get(routePath1);
      expect(res.status).toBe(200);
      const timeoutArg = spy.mock.calls[0][1];
      expect(timeoutArg).toBe(0);
      spy.mockRestore();
    });
    it('should read session scoped variant from file', async () => {
      mezzo
        .route({
          id: routeId2,
          path: routePath2,
          callback(req, res, route) {
            return mezzo.util.respondWithFile(route, req, res);
          },
        })
        .variant({
          id: variant1,
          callback(req, res, route) {
            return mezzo.util.respondWithFile(route, req, res);
          },
        });

      const res = await request.get(routePath2);
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ variant: _default });

      await mezzo.setMockVariantForSession(sessionId, [
        { routeID: routeId2, variantID: variant1 },
      ]);

      const res2 = await request
        .get(routePath2)
        .set(X_REQUEST_SESSION, sessionId);
      expect(res2.body).toEqual({ variant: variant1 });
    });
    it('should read header scoped variant from file', async () => {
      mezzo
        .route({
          id: routeId2,
          path: routePath2,
          callback(req, res, route) {
            return mezzo.util.respondWithFile(route, req, res);
          },
        })
        .variant({
          id: variant1,
          callback(req, res, route) {
            return mezzo.util.respondWithFile(route, req, res);
          },
        });

      const res = await request.get(routePath2);
      expect(res.status).toBe(200);
      expect(res.body).toEqual({ variant: _default });

      const res2 = await request
        .get(routePath2)
        .set(X_REQUEST_VARIANT, variant1);
      expect(res2.body).toEqual({ variant: variant1 });
    });
  });
});
