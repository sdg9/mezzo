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
const requests = [];
const resopnse = [];
const data = [];

function setupAPI(app: express.Express, wss: WebSocket.Server) {
  app.post(MEZZO_API_POST_RECORD_REQUEST, (req, res) => {
    // console.log('Req: ', req);
    // ws.send(JSON.stringify(req));
    // ws.send('Got request');
    console.log('Broadcasting Req...');
    // wss.broadcast('Got request');
    res.sendStatus(201);
  });
  app.post(MEZZO_API_POST_RECORD_RESPONSE, (req, res) => {
    console.log('Broadcasting Res...');
    // console.log('Req: ', req);
    // ws.send(JSON.stringify(req));
    // ws.send('Got response');
    res.sendStatus(201);
  });
  app.post(MEZZO_API_GET_RECORDINGS, (req, res) => {
    console.log('Broadcasting Res...');
    // console.log('Req: ', req);
    // ws.send(JSON.stringify(req));
    // ws.send('Got response');
    res.send(data);
    // res.sendStatus(200);
  });
}

export default (app: express.Express, expressServer: Server) => {
  const websocketServer = new WebSocket.Server({ server: expressServer });
  setupAPI(app, websocketServer);
  websocketServer.on('connection', (ws: WebSocket) => {
    // console.log('Connection called');
    //connection is up, let's add a simple simple event
    ws.on('message', (message: string) => {
      //log the received message and send it back to the client
      console.log('received: %s', message);
      ws.send(`Hello, you sent -> ${message}`);
    });

    //send immediatly a feedback to the incoming connection
    ws.send('Hi there, I am a WebSocket server');
    // ping(ws);
  });

  // const websocketServer = new WebSocket.Server({
  //   noServer: true,
  //   path: '/websockets',
  // });

  return websocketServer;
};
