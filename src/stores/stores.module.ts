import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { StoresService } from './stores.service';
import { StoresController } from './stores.controller';
import { Store, StoreSchema } from '../model/store.model';
import { UploadModule } from '../common/upload/upload.module';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: Store.name, schema: StoreSchema }]),
    UploadModule,
  ],
  controllers: [StoresController],
  providers: [StoresService],
  exports: [StoresService],
})
export class StoresModule {}
