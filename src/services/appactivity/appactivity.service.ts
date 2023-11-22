import { Injectable } from '@nestjs/common';
import { AppActivity } from '@prisma/client';
import { PrismaService } from 'src/services/prisma/prisma.service';

@Injectable()
export class AppActivityService {
  constructor(private prisma: PrismaService) {}

  async lastTimeAppChecked(): Promise<string | undefined> {
    const result = await this.prisma.appActivity.findFirst({
      orderBy: { lastCheck: 'desc' },
    });
    return result?.lastCheck?.toISOString();
  }

  async lastTimeAppStopped(): Promise<string | undefined> {
    const result = await this.prisma.appActivity.findFirst({
      orderBy: { stopTime: 'desc' },
    });
    return result?.stopTime?.toISOString();
  }

  async createNewAppActivity(): Promise<AppActivity> {
    return this.prisma.appActivity.create({
      data: {
        processId: process.pid.toString(),
        startTime: new Date(),
        stopTime: null,
      },
    });
  }

  getCurrentAppActivity(): Promise<AppActivity | null> {
    return this.prisma.appActivity.findFirst({
      where: { processId: process.pid.toString() },
    });
  }

  async updateAppActivityLastCheck(): Promise<AppActivity | null> {
    const currentAppActivity = await this.getCurrentAppActivity();
    if (!currentAppActivity) {
      return null;
    }
    return this.prisma.appActivity.update({
      where: { id: currentAppActivity?.id, processId: process.pid.toString() },
      data: {
        lastCheck: new Date(),
      },
    });
  }

  async updateAppActivityStopTime(): Promise<AppActivity | null> {
    const currentAppActivity = await this.getCurrentAppActivity();
    return this.prisma.appActivity.update({
      where: { id: currentAppActivity?.id, processId: process.pid.toString() },
      data: {
        stopTime: new Date(),
      },
    });
  }
}
