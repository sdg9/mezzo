import * as WebSocket from 'ws';
import * as express from 'express';
import { Server } from 'http';
import {
  MEZZO_API_POST_RECORD_REQUEST,
  MEZZO_API_POST_RECORD_RESPONSE,
  MEZZO_API_GET_RECORDINGS,
} from '@caribou-crew/mezzo-constants';
import { v4 as uuidv4 } from 'uuid';
import { RecordedItem } from '@caribou-crew/mezzo-interfaces';

// function ping(ws: WebSocket) {
//   setTimeout(() => {
//     ws.send('Ping');
//     console.log('Ping');
//     ping(ws);
//   }, 1000);
// }

// TODO type this object in interfaces so that it can also be used via RecordingScreen.tsx
const data: RecordedItem[] = [];
interface Clients {
  uuid: string;
  ws: WebSocket;
}
const clients: Clients[] = [];

function setupAPI(app: express.Express, wss: WebSocket.Server) {
  app.post(MEZZO_API_POST_RECORD_REQUEST, (req, res) => {
    const { uuid, config, resource, startTime } = req.body;
    const item = {
      uuid,
      startTime,
      resource,
      request: {
        config,
      },
      response: undefined,
    };
    data.push(item);
    res.sendStatus(201);
    // TODO trigger update to anyone listening on socket
    clients.forEach(({ ws }) => {
      ws.send(JSON.stringify(item));
    });
  });
  app.post(MEZZO_API_POST_RECORD_RESPONSE, (req, res) => {
    const { duration, endTime, url, uuid, ...rest } = req.body;
    const existingIndex = data.findIndex((i) => i.uuid === uuid);
    const updatedItem = {
      ...data[existingIndex],
      duration,
      endTime,
      url,
      response: {
        ...rest,
      },
    };
    data[existingIndex] = updatedItem;
    res.sendStatus(201);
    // TODO trigger update to anyone listening on socket
    clients.forEach(({ ws }) => {
      console.log('Sending message to all connected clients');
      ws.send(JSON.stringify(updatedItem));
    });
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
    console.log('Client connected');
    const uuid = uuidv4();
    clients.push({
      uuid,
      ws,
    });
    // TODO why are 4 clients connecting from one browser?
    console.log(
      'Total Clients: ',
      clients.map((i) => i.uuid)
    );
    ws.on('message', (message: string) => {
      //log the received message and send it back to the client
      if (message.toString() === 'Close') {
        console.log('Removing client: ', uuid);
        const idx = clients.findIndex((i) => i.uuid === uuid);
        clients.splice(idx, 1);
        ws.close();
      }
      console.log('received: %s', message);
      // ws.send(`Hello, you sent -> ${message}`);
    });

    //send immediatly a feedback to the incoming connection
    // ws.send('Hi there, I am a WebSocket server');
    // ping(ws);
  });
  // websocketServer.on('disconnect', (ws: WebSocket) => {
  //   console.log('Client disconnected');
  // clients.push(ws);
  // ws.on('message', (message: string) => {
  //   //log the received message and send it back to the client
  //   console.log('received: %s', message);
  //   // ws.send(`Hello, you sent -> ${message}`);
  // });

  // //send immediatly a feedback to the incoming connection
  // // ws.send('Hi there, I am a WebSocket server');
  // // ping(ws);
  // });

  return websocketServer;
};
