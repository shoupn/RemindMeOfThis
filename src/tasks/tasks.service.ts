import { Inject, Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { RemindMeOfThisService } from 'src/services/remindmeofthis/remindmeofthis.service';
import { Logger } from 'winston';
@Injectable()
export class TasksService {
  constructor(
    private readonly remindmeofthisService: RemindMeOfThisService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  @Cron(CronExpression.EVERY_10_SECONDS)
  checkForNewEvents() {
    this.logger.info('Called every 10 seconds');
    this.remindmeofthisService.subForReplyEvents();
  }
}
