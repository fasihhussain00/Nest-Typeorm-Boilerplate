import { Controller, Get, Query } from '@nestjs/common';
import { ScopeDetectionService } from './scope-detection.service';
import { ApiTags } from '@nestjs/swagger';

@Controller({
  path: 'scope-detection',
  version: '1',
})
@ApiTags('scope-detection')
export class ScopeDetectionController {
  constructor(private readonly scopeDetectionService: ScopeDetectionService) {}

  @Get()
  async getScope(@Query('uri') uri: string) {
    return {
      scopeDetectedDuration:
        await this.scopeDetectionService.findScopeDuration(uri),
    };
  }
}
