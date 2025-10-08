import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { LocalCategory, MapElementType } from '../../model/map.model';

class GeometryDto {
  @IsString()
  type: string;

  @IsArray()
  coordinates: number[] | number[][] | number[][][];
}

class PropertiesDto {
  @IsEnum(MapElementType)
  type: MapElementType;

  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  parentId?: string;

  @IsOptional()
  @IsEnum(LocalCategory)
  category?: LocalCategory;

  @IsOptional()
  @IsString()
  color?: string;

  @IsOptional()
  @IsString()
  exhibitor?: string;

  @IsOptional()
  selected?: boolean;
}

export class CreateElementDto {
  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  id?: string;

  @ValidateNested()
  @Type(() => GeometryDto)
  geometry: GeometryDto;

  @ValidateNested()
  @Type(() => PropertiesDto)
  properties: PropertiesDto;
}

export class UpdateElementDto {
  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => GeometryDto)
  geometry?: GeometryDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => PropertiesDto)
  properties?: PropertiesDto;
}
