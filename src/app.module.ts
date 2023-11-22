import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { RemindMeOfThisModule } from './remindmeofthis/remindmeofthis.module';
import { PrismaService } from './services/prisma/prisma.service';
import { WinstonModule } from 'nest-winston';
import { ScheduleModule } from '@nestjs/schedule';
import * as winston from 'winston';

@Module({
  imports: [
    RemindMeOfThisModule,
    ScheduleModule.forRoot(),
    WinstonModule.forRoot({
      transports: [
        new winston.transports.Console({
          level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.simple(),
          ),
        }),
        new winston.transports.File({
          level: process.env.NODE_ENV === 'development' ? 'debug' : 'info',
          filename: 'application.log',
          format: winston.format.combine(
            winston.format.timestamp(),
            winston.format.json(),
          ),
        }),
      ],
    }),
  ],
  providers: [AppService, PrismaService],
})
export class AppModule {}
