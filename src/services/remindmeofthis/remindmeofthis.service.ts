import 'websocket-polyfill';
import {
  Inject,
  Injectable,
  OnApplicationShutdown,
  OnModuleInit,
} from '@nestjs/common';

import { AppActivityService } from 'src/services/appactivity/appactivity.service';
import { NoteService } from 'src/services/note/note.service';

import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { SimplePool, Filter } from 'nostr-tools';
import { subDays } from 'date-fns';
import { EventsDataService } from 'src/services/eventsdata/eventsdata.service';

const validWebSocketUriRegex =
  /^wss?:\/\/(www\.)?[\w-]+(\.[a-z]{2,}){1,2}(:\d{1,5})?\/?$/;

@Injectable()
export class RemindMeOfThisService
  implements OnModuleInit, OnApplicationShutdown
{
  constructor(
    private appActivityService: AppActivityService,
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly noteService: NoteService,
    private eventsDataService: EventsDataService,
  ) {}

  async onApplicationShutdown(signal?: string | undefined) {
    this.logger.log('onApplicationShutdown', { signal });
    try {
      await this.appActivityService.updateAppActivityStopTime();
    } catch (error) {
      this.logger.error('An exception occurred writing to mongodb', { error });
    }
  }
  private externalSockets: WebSocket[] = [];
  private relays: string[] = [];
  onModuleInit() {
    this.logger.log('onModuleInit', { processId: process.pid.toString() });
    this.appActivityService.createNewAppActivity();
    this.initiateExternalConnections();
  }

  //todo use recursion if prior socket was closed/fails
  async initiateExternalConnections() {
    if (process.env.RELAYWS) {
      //test each relay to make sure it is a valid websocket uri
      const relays = process.env.RELAYWS.split(',').map((relay) =>
        relay.trim(),
      );
      relays.forEach((relay) => {
        if (!validWebSocketUriRegex.test(relay)) {
          this.logger.error('Invalid websocket uri', { relay });
          return;
        }
        this.relays.push(relay);
      });
    }

    if (!process.env.PUBLIC_KEY) {
      this.logger.error('No public key found in environment variable');
      return;
    }
    const filter: Filter<number> = {
      since: await this.getLastOnline(),
      //since: 0,
      kinds: [1, 6],
      '#p': [process.env.PUBLIC_KEY],
    };

    const pool = new SimplePool();
    const sub = pool.sub(this.relays, [filter]);

    sub.on('event', async (event) => {
      try {
        if (!event.content.includes(`nostr:${process.env.PUBLIC_KEY_NPUB}`)) {
          this.logger.info('event does not contain reminder tag', { event });
          return;
        }
        this.logger.info('event received', { event });
        const existingEvent = await this.eventsDataService.getEventData(
          event.id,
        );
        if (existingEvent) {
          this.logger.info('event already exists', { event });
          return;
        }
        await this.noteService.replyToParent('reply', event);
      } catch (error) {
        this.logger.error('An exception occurred writing to mongodb', {
          error,
        });
      }
    });

    sub.on('eose', () => {
      this.logger.info('eose received', { filter });
    });

    this.logger.log('externalSockets', { sockets: this.externalSockets });
    this.logger.log(
      'initiating external connections and watching for public key to be tagged',
      {
        publicKey: process.env.PUBLIC_KEY,
      },
    );
  }

  async getLastOnline() {
    const lastTimeStampRan = await this.appActivityService.lastTimeAppRan();
    let lastTimeStampRanUnix = Math.floor(new Date().getTime() / 1000);
    if (lastTimeStampRan) {
      const yesterday = subDays(new Date(), 7);
      lastTimeStampRanUnix = Math.floor(yesterday.getTime() / 1000);
    }
    this.logger.log('lastTimeStampRanUnix', { lastTimeStampRanUnix });
    return lastTimeStampRanUnix;
  }
}
