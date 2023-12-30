import { Inject, Injectable } from '@nestjs/common';
import { IBucketService } from 'src/files/bucket/bucket';

@Injectable()
export class FilesService {
  constructor(
    @Inject(IBucketService) private readonly bucketService: IBucketService,
  ) {}
  async getSignedUrl(key: string): Promise<string> {
    return await this.bucketService.getSignedUrl(key);
  }
}
