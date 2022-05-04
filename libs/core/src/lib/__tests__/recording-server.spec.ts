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
import fetch from 'node-fetch';
import { interceptedFetch } from '@caribou-crew/mezzo-intercept-fetch';

const movies = [
  {
    Title: 'Avatar',
    Year: '2009',
    Rated: 'PG-13',
    Released: '18 Dec 2009',
    Runtime: '162 min',
    Genre: 'Action, Adventure, Fantasy',
    Director: 'James Cameron',
  },
  {
    Title: 'I Am Legend',
    Year: '2007',
    Rated: 'PG-13',
    Released: '14 Dec 2007',
    Runtime: '101 min',
    Genre: 'Drama, Horror, Sci-Fi',
    Director: 'Francis Lawrence',
  },
];
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

    mezzo.route({
      id: 'GET movies',
      path: '/movies',
      callback: function (req, res) {
        res.json(movies);
      },
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
    it('should work', async () => {
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

  describe('functionality', () => {
    it.only('mock fetch for testing', async () => {
      const myFetch = interceptedFetch(fetch, {
        port,
      });
      const response = await myFetch(`http://localhost:${port}/movies`);

      // Assert fetch still works as expected
      const json = await response.json();
      expect(json).toEqual(movies);

      // Assert local recording API has processed the request and response
      const response2 = await request.get(MEZZO_API_GET_RECORDINGS);
      expect(response2.status).toBe(200);
      expect(response2.body.responses).toHaveLength(1);
      expect(response2.body.requests).toHaveLength(1);
    });
  });
});
