import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type StoreDocument = Store & Document;

export enum StoreCategory {
  FOOD = 'food',
  CLOTHING = 'clothing',
  ELECTRONICS = 'electronics',
  JEWELRY = 'jewelry',
  BOOKS = 'books',
  SPORTS = 'sports',
  HOME = 'home',
  BEAUTY = 'beauty',
  TOYS = 'toys',
  SERVICES = 'services',
  OTHER = 'other',
}

@Schema({ timestamps: true })
export class Store {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  floor: string;

  @Prop({ required: true, enum: StoreCategory })
  category: StoreCategory;

  @Prop({ required: true })
  openingHours: string;

  @Prop({ required: false })
  logo: string; // URL ou base64 do logo/ícone

  @Prop({ required: true })
  description: string;

  @Prop({ required: true })
  mapId: string; // ID do mapa ao qual a loja está vinculada

  @Prop({ required: true })
  featureId: string; // ID do feature (espaço) no mapa GeoJSON

  @Prop({ type: Object, required: true })
  location: {
    x: number;
    y: number;
    width?: number;
    height?: number;
  };

  @Prop()
  phone?: string;

  @Prop()
  email?: string;

  @Prop()
  website?: string;

  @Prop({ required: true })
  userId: string; // Responsável pela criação
}

export const StoreSchema = SchemaFactory.createForClass(Store);
