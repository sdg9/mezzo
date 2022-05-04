import * as WebSocket from 'ws';

export function waitForSocketState(socket: WebSocket, state: number) {
  return new Promise<void>(function (resolve) {
    setTimeout(async function () {
      if (socket.readyState === state) {
        resolve();
      } else {
        waitForSocketState(socket, state).then(resolve);
      }
    }, 5);
  });
}
