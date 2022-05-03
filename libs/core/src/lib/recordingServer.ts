import * as WebSocket from 'ws';

function ping(ws: WebSocket) {
  setTimeout(() => {
    ws.send('Ping');
    console.log('Ping');
    ping(ws);
  }, 1000);
}

export default (expressServer) => {
  const websocketServer = new WebSocket.Server({ server: expressServer });
  websocketServer.on('connection', (ws: WebSocket) => {
    //connection is up, let's add a simple simple event
    ws.on('message', (message: string) => {
      //log the received message and send it back to the client
      console.log('received: %s', message);
      ws.send(`Hello, you sent -> ${message}`);
    });

    //send immediatly a feedback to the incoming connection
    ws.send('Hi there, I am a WebSocket server');
    ping(ws);
  });

  // const websocketServer = new WebSocket.Server({
  //   noServer: true,
  //   path: '/websockets',
  // });

  return websocketServer;
};
