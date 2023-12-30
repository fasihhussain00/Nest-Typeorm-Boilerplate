import { Test, TestingModule } from '@nestjs/testing';
import { ScopeDetectionController } from './scope-detection.controller';
import { ScopeDetectionService } from './scope-detection.service';

describe('ScopeDetectionController', () => {
  let controller: ScopeDetectionController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ScopeDetectionController],
      providers: [ScopeDetectionService],
    }).compile();

    controller = module.get<ScopeDetectionController>(ScopeDetectionController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
