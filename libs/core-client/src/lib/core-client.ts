import {
  MEZZZO_WS_API_REQUEST,
  MEZZZO_WS_API_RESPONSE,
} from '@caribou-crew/mezzo-constants';
import {
  ClientOptions,
  MezzoRecordedRequest,
  MezzoRecordedResponse,
  SocketRequestResponseMessage,
} from '@caribou-crew/mezzo-interfaces';
import generateGuid from './utils/generate-guid';
import serialize from './utils/serialize';

const DEFAULT_OPTIONS: ClientOptions = {
  createSocket: undefined,
  host: 'localhost',
  port: 8000,
  name: 'mezzo-core-client',
  secure: false,
  safeRecursion: true,
  onCommand: () => null,
  onConnect: () => null,
  onDisconnect: () => null,
};
function emptyPromise() {
  return Promise.resolve('');
}
export enum ArgType {
  String = 'string',
}

export interface CustomCommandArg {
  name: string;
  type: ArgType;
}

export interface CustomCommand {
  id?: number;
  command: string;
  handler: (args?: any) => void;

  title?: string;
  description?: string;
  args?: CustomCommandArg[];
}

export class MezzoClient {
  options: ClientOptions = Object.assign({}, DEFAULT_OPTIONS);
  /**
   * The last time we sent a message.
   */
  lastMessageDate = new Date();

  /**
   * Are we ready to start communicating?
   */
  isReady = false;

  readyState = -1;

  isConnected = false;

  /**
   * The registered custom commands
   */
  customCommands: CustomCommand[] = [];
  /**
   * Messages that need to be sent.
   */
  sendQueue: any[] = [];
  // socket: WebSocket = null;
  socket: any = null;

  public configure(options: ClientOptions = {}) {
    this.options = {
      ...this.options,
      ...options,
    };
  }

  public connect() {
    this.isConnected = true;
    const {
      createSocket,
      secure,
      host,
      environment,
      port,
      name,
      client = {},
      getClientId,
      onCommand,
      onConnect,
      onDisconnect,
    } = this.options;

    const location = `ws://${host}:${port}`;
    console.log(`Attempting to connect ws to ${location}`);
    console.log('Create socket: ', createSocket);
    if (!createSocket) {
      console.error('You must supply createSocket argument');
    }
    const socket = createSocket?.(`${location}`);

    // fires when we talk to the server
    const onOpen = () => {
      console.log('Socket is open');
      // fire our optional onConnect handler
      onConnect && onConnect();

      // trigger our plugins onConnect
      // this.plugins.forEach((p) => p.onConnect && p.onConnect());

      const getClientIdPromise = getClientId || emptyPromise;

      getClientIdPromise().then((clientId) => {
        this.isReady = true;
        this.readyState = WebSocket.OPEN;
        // introduce ourselves
        this.send('client.intro', {
          environment,
          ...client,
          name,
          clientId,
          reactotronCoreClientVersion: 'MEZZO_CORE_VERSION',
        });

        // flush the send queue
        while (this.sendQueue.length > 0) {
          const h = this.sendQueue[0];
          this.sendQueue = this.sendQueue.slice(1);
          this.socket.send(h);
        }
      });
    };

    // fires when we disconnect
    const onClose = () => {
      console.log('Socket is closed');
      this.isReady = false;
      this.readyState = WebSocket.CLOSING;
      // trigger our disconnect handler
      onDisconnect && onDisconnect();
      this.readyState = WebSocket.CLOSED;

      // as well as the plugin's onDisconnect
      // this.plugins.forEach((p) => p.onDisconnect && p.onDisconnect());
    };

    // fires when we receive a command, just forward it off
    const onMessage = (data: any) => {
      console.debug('Received message via socket: ', data);
      // console.log('Socket got message', data.toString());
      const command = typeof data === 'string' ? JSON.parse(data) : data;
      console.debug(`Command: ${command}`);
      // trigger our own command handler
      onCommand && onCommand(command);

      // trigger our plugins onCommand
      // this.plugins.forEach((p) => p.onCommand && p.onCommand(command));

      // trigger our registered custom commands
      if (command.type === 'custom') {
        this.customCommands
          .filter((cc) => {
            if (typeof command.payload === 'string') {
              return cc.command === command.payload;
            }

            return cc.command === command.payload.command;
          })
          .forEach((cc) =>
            cc.handler(
              typeof command.payload === 'object'
                ? command.payload.args
                : undefined
            )
          );
      } else if (command.type === 'setClientId') {
        this.options.setClientId && this.options.setClientId(command.payload);
      }
    };

    // this is ws style from require('ws') on node js
    if (socket.on) {
      socket.on('open', onOpen);
      socket.on('close', onClose);
      socket.on('message', onMessage);
    } else {
      // this is a browser
      socket.onopen = onOpen;
      socket.onclose = onClose;
      socket.onmessage = (evt: any) => onMessage(evt.data);
    }

    this.socket = socket;
    this.on = socket.on;
  }

  public close() {
    this.isConnected = false;
    this.socket.close();
  }

  // public on(event: string, listener: (data: WebSocket.Data) => void) {
  //   this.socket.on(event, listener);
  // }
  public on: any;

  /**
   * Sends a command to the server
   */
  public send = (type: string, payload = {}, important = false) => {
    // set the timing info
    const date = new Date();
    let deltaTime = date.getTime() - this.lastMessageDate.getTime();
    // glitches in the matrix
    if (deltaTime < 0) {
      deltaTime = 0;
    }
    this.lastMessageDate = date;

    const fullMessage: SocketRequestResponseMessage = {
      type,
      payload,
      important: !!important,
      date: date.toISOString(),
      deltaTime,
    };

    const serializedMessage = serialize(fullMessage, this.options.proxyHack);

    if (this.isReady) {
      console.log('Sending command');
      // send this command
      try {
        this.socket.send(serializedMessage);
      } catch {
        this.isReady = false;
        console.log('An error occured communicating with the mezzo recorder.');
      }
    } else {
      console.warn('Queueing command as it is not connected');
      // queue it up until we can connect
      this.sendQueue.push(serializedMessage);
    }
  };

  public captureApiRequest = (url: string) => {
    const guid = generateGuid();
    console.debug('Firing API request');
    this.send(MEZZZO_WS_API_REQUEST, { url, guid });
    return guid;
  };

  public captureApiResponse = (
    request: MezzoRecordedRequest,
    response: MezzoRecordedResponse,
    duration: number,
    guid = generateGuid()
  ) => {
    const ok =
      response &&
      response.status &&
      typeof response.status === 'number' &&
      response.status >= 200 &&
      response.status <= 299;
    const important = !ok;

    console.log({ request, response, duration, important, guid });
    this.send(
      MEZZZO_WS_API_RESPONSE,
      { request, response, duration },
      important
    );
  };
}

export function createClient(options?: ClientOptions) {
  const client = new MezzoClient();
  client.configure(options);
  client.connect();
  return client;
}
