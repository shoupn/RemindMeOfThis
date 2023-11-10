import { OnModuleInit } from '@nestjs/common';
import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import * as WebSocket from 'ws';
import { generatePrivateKey, getPublicKey } from 'nostr-tools';

@WebSocketGateway()
export class WebsocketsGateway
  implements
    OnModuleInit,
    OnGatewayInit,
    OnGatewayConnection,
    OnGatewayDisconnect
{
  afterInit(server: any) {
    console.log('server', server);
  }
  @WebSocketServer() server: Server | undefined;

  private externalSockets: WebSocket[] = [];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onModuleInit() {
    console.log('WebSocket Gateway initialized');

    // Initiate connections to external WebSocket servers
    this.initiateExternalConnections();
  }

  initiateExternalConnections() {
    const server1 = new WebSocket('wss://nostr-pub.wellorder.net/');
    this.externalSockets.push(server1);
    this.externalSockets.forEach((socket, index) => {
      try {
        socket.on('open', () => {
          console.log(`Connection to external server ${index + 1} opened`);

          // Send the initial message to the external server
          //this is the correct format for creating subscription to p tags in messages for user hex public key
          const initialMessage = [
            'REQ',
            '98507d66-9fd0-433c-a2b5-1f9d0d0c361f',
            {
              kinds: [1],
              '#p': [
                '56d5de36eb4fed1e2fe99bfbfdea10ab5fa630a13c59d2e3c70dbb5b3988a572',
              ],
            },
          ];

          socket.send(JSON.stringify(initialMessage));
        });
      } catch (error) {
        console.log(error);
      }

      socket.on('message', (data: any) => {
        this.handleExternalMessage(index, data);
      });

      socket.on('close', () => {
        console.log(`Connection to external server ${index + 1} closed`);
      });
    });
  }

  handleExternalMessage(index: number, data: string) {
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

  handleConnection(client: Socket, ...args: any[]) {
    console.log(args);
    console.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    console.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage('response')
  handleResponse(client: Socket, data: any): void {
    // Handle the response from the client
    console.log('Response received:', data);
  }
}
