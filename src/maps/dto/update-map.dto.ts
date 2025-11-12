import { Type } from 'class-transformer';
import {
  IsArray,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

class GeometryDto {
  @IsString()
  type: string;

  @IsArray()
  coordinates: number[] | number[][] | number[][][];
}

class MapFeatureDto {
  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  id?: string;

  @ValidateNested()
  @Type(() => GeometryDto)
  geometry: GeometryDto;

  @IsObject()
  properties: Record<string, any>;
}

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
  @ValidateNested({ each: true })
  @Type(() => MapFeatureDto)
  features?: MapFeatureDto[];
}
