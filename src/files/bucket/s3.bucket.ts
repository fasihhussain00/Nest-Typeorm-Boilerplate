import { IBucketService } from 'src/files/bucket/bucket';
import { Injectable } from '@nestjs/common';
import * as AWS from 'aws-sdk';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class S3BucketService implements IBucketService {
  private bucketName: string;
  private s3Client: AWS.S3;
  constructor(configService: ConfigService) {
    this.bucketName = configService.get<string>('AWS_S3_BUCKET');
    this.s3Client = new AWS.S3({
      signatureVersion: 'v4',
      credentials: {
        accessKeyId: configService.get<string>('AWS_ACCESS_KEY_ID'),
        secretAccessKey: configService.get<string>('AWS_SECRET_ACCESS_KEY'),
      },
      region: configService.get<string>('AWS_BUCKET_REGION'),
    });
  }

  async getSignedUrl(key: string): Promise<string> {
    return await this.s3Client.getSignedUrlPromise('putObject', {
      Bucket: this.bucketName,
      Key: key,
    });
  }
}
