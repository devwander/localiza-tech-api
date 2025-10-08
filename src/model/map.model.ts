import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type MapDocument = Map & Document;

export enum MapElementType {
  BACKGROUND = 'background',
  SUBMAPA = 'submapa',
  LOCAL = 'local',
  PATH = 'path',
  AMENITY = 'amenity',
}

export enum LocalCategory {
  BOOTH = 'booth',
  STORE = 'store',
  RESTAURANT = 'restaurant',
  RESTROOM = 'restroom',
  EXIT = 'exit',
  STAGE = 'stage',
  INFO = 'info',
  OTHER = 'other',
}

@Schema({ timestamps: true })
export class Map {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, default: 'FeatureCollection' })
  type: string;

  @Prop({ type: Object })
  metadata: {
    author: string;
    description?: string;
    version?: string;
    dimensions?: {
      width: number;
      height: number;
      unit: string;
    };
  };

  @Prop({
    type: [
      {
        type: { type: String },
        id: String,
        geometry: Object,
        properties: Object,
      },
    ],
    required: true,
  })
  features: Array<{
    type: string;
    id?: string;
    geometry: {
      type: string;
      coordinates: number[] | number[][] | number[][][];
    };
    properties: {
      type: MapElementType;
      name: string;
      parentId?: string;
      category?: LocalCategory;
      color?: string;
      exhibitor?: string;
      selected?: boolean;
      [key: string]: any;
    };
  }>;

  @Prop({ required: true })
  userId: string;
}

export const MapSchema = SchemaFactory.createForClass(Map);
