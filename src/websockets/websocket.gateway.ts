import {
  Inject,
  Injectable,
  LoggerService,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import {
  WebSocketGateway,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import * as WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { AppActivityService } from 'src/appactivity/appactivity.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';

const validWebSocketUriRegex =
  /^wss?:\/\/(www\.)?[\w-]+(\.[a-z]{2,}){1,2}(:\d{1,5})?\/?$/;

@Injectable()
@WebSocketGateway()
export class WebsocketsGateway
  implements
    OnModuleInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnApplicationShutdown
{
  constructor(
    private appActivityService: AppActivityService,
    @Inject(WINSTON_MODULE_NEST_PROVIDER)
    private readonly logger: LoggerService,
  ) {}

  async onApplicationShutdown(signal?: string | undefined) {
    this.logger.log('onApplicationShutdown', { signal });
    try {
      await this.appActivityService.updateAppActivityStopTime();
    } catch (error) {
      this.logger.error('An exception occurred writing to mongodb', { error });
    }
  }
  private externalSockets: WebSocket[] = [];

  onModuleInit() {
    this.logger.log('onModuleInit', { processId: process.pid.toString() });
    this.appActivityService.createNewAppActivity();
    this.initiateExternalConnections();
  }

  initiateExternalConnections() {
    if (process.env.RELAYWS) {
      //I want to split here and then loop through the array and create a new websocket for each one
      const relays = process.env.RELAYWS.split(',').map((relay) =>
        relay.trim(),
      );
      relays.forEach((relay) => {
        if (validWebSocketUriRegex.test(relay)) {
          this.externalSockets.push(new WebSocket(relay));
        } else {
          this.logger.error('Invalid nostr relay', { relay });
        }
      });
    }
    this.logger.log('externalSockets', { sockets: this.externalSockets });
    this.logger.log(
      'initiating external connections and watching for public key to be tagged',
      {
        publicKey: process.env.PUBLIC_KEY,
      },
    );

    this.externalSockets.forEach((socket, index) => {
      socket.on('open', () => {
        this.logger.log(`Connection to external server ${index + 1} opened`, {
          socketUrl: socket.url,
        });

        const initialMessage = [
          'REQ',
          this.getNewGuid(),
          {
            since: this.getLastOnline(),
            kinds: [1, 6],
            '#p': [process.env.PUBLIC_KEY],
          },
        ];

        socket.send(JSON.stringify(initialMessage));
      });

      socket.on('message', (data: any) => {
        this.handleEvents(index, data);
      });

      socket.on('close', () => {
        this.logger.log(`Connection to external server ${index + 1} closed`, {
          socketUrl: socket.url,
        });
      });

      socket.on('error', (error) => {
        this.logger.error(
          `Error in connection to external server ${index + 1}:`,
          { socketUrl: socket.url, error },
        );
      });
    });
  }

  handleEvents(index: number, data: string) {
    try {
      const message = JSON.parse(data);

      if (message[0] === 'EVENT') {
        const eventData = message[2];
        this.logger.log(
          `Event received from external server ${index + 1}:`,
          eventData,
        );
      }
    } catch (error) {
      this.logger.error(
        `Error parsing message from external server ${index + 1}:`,
        error,
      );
    }
  }

  handleConnection(socket: Socket) {
    this.logger.log(`Client connected: ${socket.id}`);
  }

  handleDisconnect(socket: Socket) {
    this.logger.log(`Client disconnected: ${socket.id}`);
  }

  async getLastOnline() {
    const lastTimeStampRan = await this.appActivityService.lastTimeAppRan();
    let lastTimeStampRanUnix = new Date().getTime().toString().slice(0, -3);
    if (lastTimeStampRan) {
      lastTimeStampRanUnix = new Date(lastTimeStampRan)
        .getTime()
        .toString()
        .slice(0, -3);
    }
    this.logger.log('lastTimeStampRanUnix', { lastTimeStampRanUnix });
    return lastTimeStampRanUnix;
  }

  getNewGuid() {
    return uuidv4();
  }
}
