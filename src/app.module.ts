import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { WebsocketsModule } from './websockets/websocket.module';
import { PrismaService } from './prisma/prisma.service';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

@Module({
  imports: [
    WebsocketsModule,
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.simple(),
          ),
        }),
        new winston.transports.File({
          level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
          filename: 'application.log',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
      ],
    }),
  ],
  providers: [AppService, PrismaService],
})
export class AppModule {}
