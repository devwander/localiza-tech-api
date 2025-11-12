import { IsEnum, IsNotEmpty, IsOptional, IsString, IsObject, ValidateNested, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { StoreCategory } from '../../model/store.model';

class LocationDto {
  @IsNotEmpty()
  @IsNumber()
  x: number;

  @IsNotEmpty()
  @IsNumber()
  y: number;

  @IsOptional()
  @IsNumber()
  width?: number;

  @IsOptional()
  @IsNumber()
  height?: number;
}

export class CreateStoreDto {
  @IsNotEmpty()
  @IsString()
  name: string;

  @IsNotEmpty()
  @IsString()
  floor: string;

  @IsNotEmpty()
  @IsEnum(StoreCategory)
  category: StoreCategory;

  @IsNotEmpty()
  @IsString()
  openingHours: string;

  @IsOptional()
  @IsString()
  logo?: string;

  @IsNotEmpty()
  @IsString()
  description: string;

  @IsNotEmpty()
  @IsString()
  mapId: string;

  @IsNotEmpty()
  @IsString()
  featureId: string;

  @IsNotEmpty()
  @ValidateNested()
  @Type(() => LocationDto)
  location: LocationDto;

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
