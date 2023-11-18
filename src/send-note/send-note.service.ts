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
} from 'nostr-tools';
import { WINSTON_MODULE_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class SendNoteService {
  constructor(
    @Inject(WINSTON_MODULE_PROVIDER) private readonly logger: Logger,
  ) {
    this.logger = logger.child({ context: 'SendNoteService' });
    if (process.env.RELAYWS) {
      this.relays = process.env.RELAYWS.split(',').map((relay) => relay.trim());
    }
  }

  private relays: string[] = [];

  async replyToParent(replyMessage: string, parentEvent: Event) {
    // Retrieve the private key from the environment variable
    const sk = process.env.PRIVATE_KEY;
    const pk = process.env.PUBLIC_KEY;
    if (!sk || !pk) {
      this.logger.error('Private or Pubkey not found in environment variable.');
      return;
    }

    // Create the reply event
    const replyEvent: UnsignedEvent = {
      kind: 1,
      created_at: Math.floor(Date.now() / 1000),
      tags: [
        // Top-level "e" tag for the reply
        ['e', parentEvent.id, 'reply'],
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
      this.logger.log('event', { event });
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
    // Sign the reply event
    const signedReplyEvent = finishEvent(event, sk);

    // Publish the signed reply event using the relay pool
    const pubs = pool.publish(this.relays, signedReplyEvent);

    await Promise.all(pubs);
    this.logger.log('Published reply event', { signedReplyEvent });
    await pool.close(this.relays);
  }
}
