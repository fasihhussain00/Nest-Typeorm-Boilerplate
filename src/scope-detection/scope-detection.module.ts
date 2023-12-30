import { Module } from '@nestjs/common';
import { ScopeDetectionService } from './scope-detection.service';
import { ScopeDetectionController } from './scope-detection.controller';

@Module({
  controllers: [ScopeDetectionController],
  providers: [ScopeDetectionService],
})
export class ScopeDetectionModule {}
