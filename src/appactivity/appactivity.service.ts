import { Injectable } from '@nestjs/common';
import { AppActivity } from '@prisma/client';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class AppActivityService {
  constructor(private prisma: PrismaService) {}

  async lastTimeAppRan(): Promise<string | undefined> {
    const result = await this.prisma.appActivity.findFirst({
      orderBy: { startTime: 'desc' },
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
      orderBy: { startTime: 'desc' },
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
