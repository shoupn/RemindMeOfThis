import { Test, TestingModule } from '@nestjs/testing';
import { SetReminderService } from './set-reminder.service';

describe('SetReminderService', () => {
  let service: SetReminderService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SetReminderService],
    }).compile();

    service = module.get<SetReminderService>(SetReminderService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
