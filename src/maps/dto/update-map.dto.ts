import { Type } from 'class-transformer';
import {
  IsArray,
  IsObject,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class GeometryDto {
  @IsString()
  type: string;

  @IsArray()
  coordinates: any;
}

export class MapFeatureDto {
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

export class MetadataDto {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  version?: string;

  @IsOptional()
  @IsString()
  author?: string;

  @IsOptional()
  @IsObject()
  dimensions?: {
    width: number;
    height: number;
    unit: string;
  };
}

export class UpdateMapDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsArray()
  @IsOptional()
  @IsString({ each: true })
  tags?: string[];

  @IsObject()
  @IsOptional()
  @ValidateNested()
  @Type(() => MetadataDto)
  metadata?: MetadataDto;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => MapFeatureDto)
  features?: MapFeatureDto[];
}
