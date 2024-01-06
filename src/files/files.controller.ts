import { Controller, Get, Query } from '@nestjs/common';
import { FilesService } from './files.service';
import { ApiTags } from '@nestjs/swagger';
import { SignedUrlResponse } from './types/signed-url';

@Controller({
  path: 'files',
  version: '1',
})
@ApiTags('Files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get('signed-url')
  async getSignedUrl(@Query('key') key: string): Promise<SignedUrlResponse> {
    return { signedUrl: await this.filesService.getSignedUrl(key) };
  }
}
