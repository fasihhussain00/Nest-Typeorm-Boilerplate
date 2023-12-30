import { Controller, Get, Query } from '@nestjs/common';
import { ScopeDetectionService } from './scope-detection.service';
import { ApiTags } from '@nestjs/swagger';
import { ScopeDetectionResponse } from './types/scope-detection';

@Controller({
  path: 'scope-detection',
  version: '1',
})
@ApiTags('Scope-detection')
export class ScopeDetectionController {
  constructor(private readonly scopeDetectionService: ScopeDetectionService) {}

  @Get()
  async getScope(@Query('uri') uri: string): Promise<ScopeDetectionResponse> {
    return {
      scopeDetectedDuration:
        await this.scopeDetectionService.findScopeDuration(uri),
    };
  }
}
