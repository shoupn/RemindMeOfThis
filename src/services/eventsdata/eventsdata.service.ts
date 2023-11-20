import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { Event, VerifiedEvent } from 'nostr-tools';

@Injectable()
export class EventsDataService {
  constructor(private prisma: PrismaService) {}

  async getEventData(eventId: string): Promise<any> {
    return this.prisma.eventReminders.findFirst({
      where: { eventId },
    });
  }
  async createEventData(
    event: Event,
    replyEvent: VerifiedEvent,
    futureDate: Date,
  ): Promise<any> {
    return this.prisma.eventReminders.create({
      data: {
        eventId: event.id,
        eventInitialResponse: new Date(),
        eventJson: JSON.stringify(event),
        replyJson: JSON.stringify(replyEvent),
        eventReminderTime: futureDate,
      },
    });
  }
}
