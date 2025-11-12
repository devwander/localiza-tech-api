import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document, Schema as MongooseSchema } from 'mongoose';

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

export enum MapTag {
  EVENTO = 'evento',
  FEIRA = 'feira',
  SHOPPING = 'shopping',
  CONGRESSO = 'congresso',
  EXPOSICAO = 'exposicao',
  FESTIVAL = 'festival',
  OUTRO = 'outro',
}

@Schema({ timestamps: true })
export class Map {
  @Prop({ required: true })
  name: string;

  @Prop({ required: true, default: 'FeatureCollection' })
  type: string;

  @Prop({ type: [String], default: [] })
  tags: string[];

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
        geometry: {
          type: { type: String },
          coordinates: MongooseSchema.Types.Mixed,
        },
        properties: MongooseSchema.Types.Mixed,
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
      storeId?: string; // ID da loja vinculada a este espaço
      [key: string]: any;
    };
  }>;

  @Prop({ required: true })
  userId: string;
}

export const MapSchema = SchemaFactory.createForClass(Map);
