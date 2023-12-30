import { Test, TestingModule } from '@nestjs/testing';
import { ScopeDetectionService } from './scope-detection.service';

describe('ScopeDetectionService', () => {
  let service: ScopeDetectionService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [ScopeDetectionService],
    }).compile();

    service = module.get<ScopeDetectionService>(ScopeDetectionService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
