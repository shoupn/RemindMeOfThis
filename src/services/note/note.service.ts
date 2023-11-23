import { Injectable, Inject } from '@nestjs/common';
import {
  validateEvent,
  verifySignature,
  getSignature,
  getEventHash,
  finishEvent,
  SimplePool,
  UnsignedEvent,
  Event,
  nip19,
} from 'nostr-tools';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';
import { EventsDataService } from 'src/services/eventsdata/eventsdata.service';
import {
  calculateFutureDate,
  parseMention,
} from 'src/helpers/mentionparser.helper';

@Injectable()
export class NoteService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
    private readonly eventDataService: EventsDataService,
  ) {
    if (process.env.RELAYWS) {
      this.relays = process.env.RELAYWS.split(',').map((relay) => relay.trim());
    }
  }
  private relays: string[] = [];
  async replyWithWillRemindEvent(parentEvent: Event) {
    const sk = process.env.PRIVATE_KEY;
    const pk = process.env.PUBLIC_KEY;
    if (!sk || !pk) {
      this.logger.error('Private or Pubkey not found in environment variable.');
      return;
    }

    const mentionTime = parseMention(parentEvent.content);
    if (!mentionTime) {
      this.logger.warn('No mention time found in parent event', {
        parentEvent,
      });
      return;
    }
    const futureDate = calculateFutureDate(mentionTime);
    if (!futureDate) {
      this.logger.warn('No future date found in parent event', {
        parentEvent,
      });
      return;
    }

    console.log(parentEvent);
    const replyMessage = `Yo nostr:${nip19.npubEncode(
      parentEvent.pubkey,
    )}! I will remind you of this note in ${mentionTime.time} ${
      mentionTime.unit
    }!`;
    const replyEvent: UnsignedEvent = {
      kind: 1,
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        // Top-level "e" tag for the reply
        ['e', parentEvent.id, '', 'reply'], //TODO add paid relay here
        // Include "p" tags from the parent note
        ...parentEvent.tags,
      ],
      content: replyMessage,
      pubkey: pk,
    };
    const pool = new SimplePool();
    const sub = pool.sub(this.relays, [
      {
        authors: [pk],
        kinds: [1],
      },
    ]);

    sub.on('event', (event) => {
      this.logger.info('replied to parent event with event', {
        parentEvent,
        event,
      });
    });

    const ok = validateEvent(replyEvent);
    if (!ok) {
      this.logger.error('Event failed validation', { replyEvent });
      return;
    }
    const event: Event = {
      ...replyEvent,
      id: getEventHash(replyEvent),
      sig: getSignature(replyEvent, sk),
    };

    const veryOk = verifySignature(event);
    if (!veryOk) {
      this.logger.error('Event failed signature verification', {
        replyEvent,
        pk,
      });
      return;
    }

    const signedReplyEvent = finishEvent(event, sk);

    this.logger.info('Signed reply event', { signedReplyEvent });

    const etagr = parentEvent.tags.find((tag) => tag[0] === 'e');
    if (etagr && etagr[2] && !this.relays.includes(etagr[2])) {
      this.relays.push(etagr[2]);
      this.logger.info('Publishing to relay', { etagr });
    }

    const pubs = pool.publish([...this.relays], signedReplyEvent);

    try {
      await Promise.all(pubs);
    } catch (e) {
      this.logger.error('Error publishing to a relay', { e });
    } finally {
      this.logger.info('Published reply event', { signedReplyEvent });
      pool.close(this.relays);
    }

    await this.eventDataService.createEventData(
      parentEvent,
      signedReplyEvent,
      futureDate,
    );
  }

  async replyWithRemindedEvent(parentEventId: string) {
    const sk = process.env.PRIVATE_KEY;
    const pk = process.env.PUBLIC_KEY;
    if (!sk || !pk) {
      this.logger.error('Private or Pubkey not found in environment variable.');
      return;
    }

    const parentEvent = await this.eventDataService.getEventData(parentEventId);
    if (!parentEvent) {
      this.logger.error('Parent event not found in database', {
        parentEventId,
      });
      return;
    }
    if (parentEvent.reminded) {
      this.logger.error('Parent event has already been reminded', {
        parentEvent,
      });
      return;
    }

    if (!parentEvent.eventJson) {
      this.logger.error('Parent event does not have eventJson', {
        parentEvent,
      });
      return;
    }
    const eventFromJson = parentEvent.eventJson as unknown as Event;

    const replyMessage = `Yo nostr:${nip19.npubEncode(
      eventFromJson.pubkey,
    )}! Just sending you a reminder of this note! If you found this helpful please feel free to zap this!`;

    const replyEvent: UnsignedEvent = {
      kind: 1,
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        [
          'e',
          parentEvent.eventId,
          '', //TODO add paid relay here
          `reply`,
        ],
        ...eventFromJson.tags,
      ],
      content: replyMessage,
      pubkey: pk,
    };
    const pool = new SimplePool();
    const sub = pool.sub(this.relays, [
      {
        authors: [pk],
        kinds: [1],
      },
    ]);

    sub.on('event', (event) => {
      this.logger.info('replied to parent event with event', {
        parentEvent,
        event,
      });
    });

    const ok = validateEvent(replyEvent);
    if (!ok) {
      this.logger.error('Event failed validation', { replyEvent });
      return;
    }
    const event: Event = {
      ...replyEvent,
      id: getEventHash(replyEvent),
      sig: getSignature(replyEvent, sk),
    };

    const veryOk = verifySignature(event);
    if (!veryOk) {
      this.logger.error('Event failed signature verification', {
        replyEvent,
        pk,
      });
      return;
    }

    const signedReminderEvent = finishEvent(event, sk);

    this.logger.info('Signed reminder event', {
      signedReminderEvent,
    });

    const etagr = eventFromJson.tags?.find((tag) => tag[0] === 'e');
    if (etagr && etagr[2] && !this.relays.includes(etagr[2])) {
      this.relays.push(etagr[2]);
      this.logger.info('Publishing to relay', { etagr });
    }

    const pubs = pool.publish([...this.relays], signedReminderEvent);

    try {
      await Promise.all(pubs);
    } catch (e) {
      this.logger.error('Error publishing to a relay', { e });
    } finally {
      this.logger.info('Published reminder event', {
        signedReminderEvent,
      });
      pool.close(this.relays);
    }
    this.logger.info('Published reminder event', {
      signedReminderEvent,
    });

    await this.eventDataService.updateEventData(
      eventFromJson,
      signedReminderEvent,
    );

    pool.close(this.relays);
    return;
  }
}
