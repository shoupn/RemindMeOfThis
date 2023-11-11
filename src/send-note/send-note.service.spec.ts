import { Test, TestingModule } from '@nestjs/testing';
import { SendNoteService } from './send-note.service';

describe('SendNoteService', () => {
  let service: SendNoteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SendNoteService],
    }).compile();

    service = module.get<SendNoteService>(SendNoteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
