import { Inject, Injectable } from '@nestjs/common';
//import { Cron, CronExpression } from '@nestjs/schedule';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
@Injectable()
export class TasksService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {}

  //   @Cron(CronExpression.EVERY_5_SECONDS)
  //   checkForNewEvents() {
  //     this.logger.info('Called every 5 seconds');
  //   }
}
