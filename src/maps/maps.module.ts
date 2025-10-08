import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Map, MapSchema } from '../model/map.model';
import { MapsController } from './maps.controller';
import { MapsService } from './maps.service';
import { PublicMapsController } from './public-maps.controller';

@Module({
  imports: [MongooseModule.forFeature([{ name: Map.name, schema: MapSchema }])],
  controllers: [MapsController, PublicMapsController],
  providers: [MapsService],
  exports: [MapsService],
})
export class MapsModule {}
