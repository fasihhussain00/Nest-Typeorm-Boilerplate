export interface IBucketService {
  getSignedUrl(key: string): Promise<string>;
}

export const IBucketService = Symbol('IBucketService');
