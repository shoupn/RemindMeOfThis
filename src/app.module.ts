import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WebsocketsGateway } from './websockets/websocket.gateway';

@Module({
  imports: [WebsocketsGateway],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
