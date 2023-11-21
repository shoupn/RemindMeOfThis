import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/services/prisma/prisma.service';
import { Event, VerifiedEvent } from 'nostr-tools';
import { EventReminders } from '@prisma/client';

@Injectable()
export class EventsDataService {
  constructor(private prisma: PrismaService) {}

  async getEventData(eventId: string): Promise<EventReminders | null> {
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
        createdAt: new Date(),
        eventJson: JSON.parse(JSON.stringify(event)),
        replyJson: JSON.parse(JSON.stringify(replyEvent)),
        eventReminderAt: futureDate,
      },
    });
  }

  async updateEventData(
    event: Event,
    remindedEvent: VerifiedEvent,
  ): Promise<EventReminders | null> {
    const existingEvent = await this.getEventData(event.id);
    if (!existingEvent) {
      return null;
    }
    return this.prisma.eventReminders.update({
      where: { id: existingEvent.id },
      data: {
        reminded: true,
        remindedAt: new Date(),
        remindedJson: JSON.parse(JSON.stringify(remindedEvent)),
      },
    });
  }
}
