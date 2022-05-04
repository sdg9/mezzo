import {
  MEZZO_API_POST_RECORD_REQUEST,
  MEZZO_API_POST_RECORD_RESPONSE,
  MEZZO_API_GET_RECORDINGS,
} from '@caribou-crew/mezzo-constants';
import * as SuperTestRequest from 'supertest';
import mezzo from '../core';
import { recordingServerPort } from './testPorts';
import { waitForSocketState } from './webSocketTestUtils';
import * as WebSocket from 'ws';

describe('recordingServer', () => {
  let request: SuperTestRequest.SuperTest<SuperTestRequest.Test>;
  const port = recordingServerPort;
  beforeAll(() => {
    global.console = require('console'); // Don't stack trace out all console logs
  });

  beforeEach(async () => {
    request = SuperTestRequest(`http://localhost:${port}`);
    await mezzo.start({
      port,
    });
  });
  afterEach(async () => {
    await mezzo.stop();
  });

  describe('record request', () => {
    it('should be a post endpoint', async () => {
      const url = MEZZO_API_POST_RECORD_REQUEST;

      const res = await request.post(url);
      expect(res.status).toBe(201);
    });
  });

  describe('record response', () => {
    it('should be a post endpoint', async () => {
      const url = MEZZO_API_POST_RECORD_RESPONSE;

      const res = await request.post(url);
      expect(res.status).toBe(201);
    });
  });

  describe('view recordings', () => {
    it('should be a GET endpoint', async () => {
      const url = MEZZO_API_GET_RECORDINGS;

      const res = await request.post(url);
      expect(res.status).toBe(200);
      expect(res.body).toEqual([]);
    });
  });

  describe('socket connection', () => {
    it.only('should work', async () => {
      const client = new WebSocket(`ws://localhost:${port}`);

      let welcomeMessage;
      client.on('message', (data) => {
        welcomeMessage = data.toString();
      });
      await waitForSocketState(client, client.OPEN);

      expect(welcomeMessage).toBe('Hi there, I am a WebSocket server');
      client.close();
    });
  });
});
