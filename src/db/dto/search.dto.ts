import { IsArray, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class SearchDto {
  @IsString()
  search: string;

  @ApiProperty({
    description: 'Fields to search',
    example: ['username'],
  })
  @IsArray()
  @IsString({ each: true })
  field: string[];
}
