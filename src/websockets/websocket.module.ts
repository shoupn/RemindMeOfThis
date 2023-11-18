import { Module } from '@nestjs/common';
import { WebsocketsGateway } from './websocket.gateway';
import { AppActivityService } from '../appactivity/appactivity.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { SendNoteService } from 'src/send-note/send-note.service';
import { SetReminderService } from 'src/set-reminder/set-reminder.service';

@Module({
  providers: [
    WebsocketsGateway,
    AppActivityService,
    PrismaService,
    SendNoteService,
    AppActivityService,
    SetReminderService,
  ],
})
export class WebsocketsModule {}
