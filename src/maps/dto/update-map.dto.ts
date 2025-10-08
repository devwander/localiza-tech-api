import { IsArray, IsObject, IsOptional, IsString } from 'class-validator';

export class UpdateMapDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsObject()
  @IsOptional()
  metadata?: {
    description?: string;
    version?: string;
  };

  @IsArray()
  @IsOptional()
  features?: Array<{
    type: string;
    geometry: {
      type: string;
      coordinates: number[] | number[][] | number[][][];
    };
    properties: Record<string, any>;
  }>;
}
