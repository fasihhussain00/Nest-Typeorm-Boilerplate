import { Module } from '@nestjs/common';
import { FilesService } from './files.service';
import { FilesController } from './files.controller';
import { S3BucketService } from './bucket/s3.bucket';
import { IBucketService } from 'src/files/bucket/bucket';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [ConfigModule],
  controllers: [FilesController],
  providers: [
    FilesService,
    {
      provide: IBucketService,
      useClass: S3BucketService,
    },
  ],
})
export class FilesModule {}
