import { Module } from '@nestjs/common';
import { RemindMeOfThisService } from '../services/remindmeofthis/remindmeofthis.service';
import { AppActivityService } from '../services/appactivity/appactivity.service';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { NoteService } from 'src/services/note/note.service';
import { TasksService } from 'src/tasks/tasks.service';

@Module({
  providers: [
    RemindMeOfThisService,
    TasksService,
    AppActivityService,
    PrismaService,
    NoteService,
    AppActivityService,
  ],
})
export class RemindMeOfThisModule {}
