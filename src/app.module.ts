import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WebsocketsModule } from './websockets/websocket.module';
import { PrismaService } from './prisma/prisma.service';
import { AppActivityService } from './appactivity/appactivity.service';
import { SetReminderService } from './set-reminder/set-reminder.service';
import { SendNoteService } from './send-note/send-note.service';
import { WinstonModule } from 'nest-winston';
import * as winston from 'winston';

@Module({
  imports: [
    WebsocketsModule,
    WinstonModule.forRoot({
      transports: [
        // Console transport
        new winston.transports.Console({
          // level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.simple(),
          ),
        }),
        // File transport
        new winston.transports.File({
          // level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
          filename: 'application.log',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
      ],
    }),
  ],
  controllers: [AppController],
  providers: [
    AppService,
    PrismaService,
    AppActivityService,
    SetReminderService,
    SendNoteService,
  ],
})
export class AppModule {}
