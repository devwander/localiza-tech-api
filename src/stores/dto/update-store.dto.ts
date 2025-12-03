import { IsEnum, IsOptional, IsString, IsObject } from 'class-validator';
import { StoreCategory } from '../../model/store.model';

export class UpdateStoreDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  floor?: string;

  @IsOptional()
  @IsEnum(StoreCategory)
  category?: StoreCategory;

  @IsOptional()
  @IsString()
  openingHours?: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsString()
  featureId?: string;

  @IsOptional()
  @IsString()
  mapId?: string;

  @IsOptional()
  @IsObject()
  location?: {
    x: number;
    y: number;
    width?: number;
    height?: number;
  };

  @IsOptional()
  @IsString()
  phone?: string;

  @IsOptional()
  @IsString()
  email?: string;

  @IsOptional()
  @IsString()
  website?: string;
}
