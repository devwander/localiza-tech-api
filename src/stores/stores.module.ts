import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StoresService } from './stores.service';
import { StoresController } from './stores.controller';
import { PublicStoresController } from './public-stores.controller';
import { FixStoresController } from './fix-stores.controller';
import { Store, StoreSchema } from '../model/store.model';
import { UploadModule } from '../common/upload/upload.module';
import { MapsModule } from '../maps/maps.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Store.name, schema: StoreSchema }]),
    UploadModule,
    MapsModule,
  ],
  controllers: [StoresController, PublicStoresController, FixStoresController],
  providers: [StoresService],
  exports: [StoresService],
})
export class StoresModule {}
