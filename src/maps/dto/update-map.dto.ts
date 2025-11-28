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

  // Não validar profundamente as coordenadas porque elas podem ter
  // estruturas diferentes (Point, LineString, Polygon, etc.)
  coordinates: any;
}

class MapFeatureDto {
  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  id?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => GeometryDto)
  geometry?: GeometryDto;

  @IsOptional()
  @IsObject()
  properties?: Record<string, any>;
}

class MetadataDto {
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
