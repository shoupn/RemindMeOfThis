import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { EventsDataService } from 'src/services/eventsdata/eventsdata.service';
import { NoteService } from 'src/services/note/note.service';
import { RemindMeOfThisService } from 'src/services/remindmeofthis/remindmeofthis.service';
import { Logger } from 'winston';
@Injectable()
export class TasksService {
  constructor(
    private readonly remindMeOfThisService: RemindMeOfThisService,
    private readonly noteService: NoteService,
    private readonly eventsDataService: EventsDataService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  async checkForNewEvents() {
    this.logger.info('Called checkForNewEvents');
    await this.remindMeOfThisService.subForReplyEvents();
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  async checkForEventsToRemind() {
    this.logger.info('Called checkForEventsToRemind');
    const eventsToRemind = await this.eventsDataService.getEventsToRemind();
    if (!eventsToRemind || eventsToRemind.length === 0) {
      return;
    }
    const promises = eventsToRemind.map(async (event) => {
      this.logger.info('Found event to remind', { event });
      await this.noteService.replyWithRemindedEvent(event.eventId);
    });
    await Promise.all(promises);
  }
}
