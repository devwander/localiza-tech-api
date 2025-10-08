import { Controller, Get, Param } from '@nestjs/common';
import { MapsService } from './maps.service';

@Controller('maps/public')
export class PublicMapsController {
  constructor(private readonly mapsService: MapsService) {}

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.mapsService.findOnePublic(id);
  }
}
