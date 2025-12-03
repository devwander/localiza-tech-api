import { Controller, Get, Param } from '@nestjs/common';
import { StoresService } from './stores.service';

@Controller('stores/public')
export class PublicStoresController {
  constructor(private readonly storesService: StoresService) {}

  @Get('map/:mapId')
  findByMapId(@Param('mapId') mapId: string) {
    return this.storesService.findByMapIdPublic(mapId);
  }
}
