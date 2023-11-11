import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WebsocketsModule } from './websockets/websocket.module';
import { PrismaService } from './prisma/prisma.service';
import { AppActivityService } from './appactivity/appactivity.service';
import { SetReminderService } from './set-reminder/set-reminder.service';
import { SendNoteService } from './send-note/send-note.service';

@Module({
  imports: [WebsocketsModule],
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
