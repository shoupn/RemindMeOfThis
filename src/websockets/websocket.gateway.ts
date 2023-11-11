import {
  Injectable,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';
import {
  WebSocketGateway,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Socket } from 'socket.io';
import * as WebSocket from 'ws';
import { v4 as uuidv4 } from 'uuid';
import { AppActivityService } from 'src/appactivity/appactivity.service';

const validWebSocketUriRegex =
  /^wss?:\/\/(www\.)?[\w-]+(\.[a-z]{2,}){1,2}(:\d{1,5})?\/?$/;
@Injectable()
@WebSocketGateway()
export class WebsocketsGateway
  implements
    OnModuleInit,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnApplicationShutdown
{
  constructor(private appActivityService: AppActivityService) {}
  afterInit(server: any) {
    console.log(server);
  }
  async onApplicationShutdown(signal?: string | undefined) {
    await this.appActivityService.updateAppActivity();
    console.log(signal);
  }
  private externalSockets: WebSocket[] = [];

  onModuleInit() {
    this.appActivityService.createNewAppActivity();
    console.log('WebSocket Gateway initialized');
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
          console.error('Invalid WebSocket URI');
        }
      });
    }

    console.log('externalSockets', this.externalSockets);
    console.log('process.env.PUBLIC_KEY', process.env.PUBLIC_KEY);
    this.externalSockets.forEach((socket, index) => {
      socket.on('open', () => {
        console.log(`Connection to external server ${index + 1} opened`);

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
        console.log(`Connection to external server ${index + 1} closed`);
      });

      socket.on('error', (error) => {
        console.error(
          `Error in connection to external server ${index + 1}:`,
          error,
        );
      });
    });
  }

  handleEvents(index: number, data: string) {
    try {
      const message = JSON.parse(data);

      if (message[0] === 'EVENT') {
        const eventData = message[2];
        console.log(
          `Event received from external server ${index + 1}:`,
          eventData,
        );
      }
    } catch (error) {
      console.error(
        `Error parsing message from external server ${index + 1}:`,
        error,
      );
    }
  }

  handleConnection(socket: Socket, ...args: any[]) {
    console.log(args);
    console.log(`Client connected: ${socket.id}`);
  }

  handleDisconnect(socket: Socket) {
    console.log(`Client disconnected: ${socket.id}`);
  }

  //need a function to get the last time the user was online
  async getLastOnline() {
    //returns a unix timestamp number like 163000000
    //convert time to unix timestamp
    const lastTimeStampRan = await this.appActivityService.lastTimeAppRan();
    if (lastTimeStampRan) {
      //need to remove the milliseconds from the timestamp
      const lastTimeStampRanUnix = new Date(lastTimeStampRan)
        .getTime()
        .toString()
        .slice(0, -3);
      console.log('lastTimeStampRanUnix', lastTimeStampRanUnix);
      return lastTimeStampRanUnix;
    } else {
      return new Date().getTime().toString().slice(0, -3);
    }
  }

  getNewGuid() {
    return uuidv4();
  }
}
