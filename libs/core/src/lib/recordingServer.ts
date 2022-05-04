import * as WebSocket from 'ws';
import * as express from 'express';
import { Server } from 'http';
import {
  MEZZO_API_POST_RECORD_REQUEST,
  MEZZO_API_POST_RECORD_RESPONSE,
  MEZZO_API_GET_RECORDINGS,
} from '@caribou-crew/mezzo-constants';

// function ping(ws: WebSocket) {
//   setTimeout(() => {
//     ws.send('Ping');
//     console.log('Ping');
//     ping(ws);
//   }, 1000);
// }
const data = [];

function setupAPI(app: express.Express, wss: WebSocket.Server) {
  app.post(MEZZO_API_POST_RECORD_REQUEST, (req, res) => {
    const { uuid, config, resource, startTime } = req.body;
    data.push({
      uuid,
      startTime,
      resource,
      request: {
        config,
      },
      response: {},
    });
    res.sendStatus(201);
    // TODO trigger update to anyone listening on socket
  });
  app.post(MEZZO_API_POST_RECORD_RESPONSE, (req, res) => {
    const { duration, endTime, url, uuid, ...rest } = req.body;
    const existingIndex = data.findIndex((i) => i.uuid === uuid);
    data[existingIndex] = {
      ...data[existingIndex],
      duration,
      endTime,
      url,
      response: {
        ...rest,
      },
    };
    res.sendStatus(201);
    // TODO trigger update to anyone listening on socket
  });
  app.get(MEZZO_API_GET_RECORDINGS, (req, res) => {
    res.send({
      data,
    });
  });
}

export default (app: express.Express, expressServer: Server) => {
  const websocketServer = new WebSocket.Server({ server: expressServer });
  setupAPI(app, websocketServer);
  websocketServer.on('connection', (ws: WebSocket) => {
    ws.on('message', (message: string) => {
      //log the received message and send it back to the client
      console.log('received: %s', message);
      ws.send(`Hello, you sent -> ${message}`);
    });

    //send immediatly a feedback to the incoming connection
    ws.send('Hi there, I am a WebSocket server');
    // ping(ws);
  });

  return websocketServer;
};
