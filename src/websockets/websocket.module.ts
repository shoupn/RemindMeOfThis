import { Module } from '@nestjs/common';
import { WebsocketsGateway } from './websocket.gateway';
import { AppActivityService } from '../appactivity/appactivity.service';
import { PrismaService } from 'src/prisma/prisma.service';

@Module({
  providers: [WebsocketsGateway, AppActivityService, PrismaService],
})
export class WebsocketsModule {}
