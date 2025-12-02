import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Request,
  UseGuards,
} from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CreateMapDto } from './dto/create-map.dto';
import { CreateElementDto, UpdateElementDto } from './dto/element.dto';
import { FindMapsDto } from './dto/find-maps.dto';
import { UpdateMapDto } from './dto/update-map.dto';
import { MapsService } from './maps.service';

interface RequestWithUser extends Request {
  user: {
    userId: string;
    email: string;
  };
}

@Controller('maps')
@UseGuards(JwtAuthGuard)
export class MapsController {
  constructor(private readonly mapsService: MapsService) {}

  @Post()
  create(@Body() createMapDto: CreateMapDto, @Request() req: RequestWithUser) {
    console.log(
      '[MapsController.create] Raw body received:',
      JSON.stringify(createMapDto, null, 2),
    );
    console.log(
      '[MapsController.create] Features count:',
      createMapDto.features?.length,
    );
    return this.mapsService.create(createMapDto, req.user.userId);
  }

  @Get('tags')
  findAllTags(@Request() req: RequestWithUser) {
    console.log(
      '[MapsController.findAllTags] Request from userId:',
      req.user.userId,
    );
    return this.mapsService.findAllTags(req.user.userId);
  }

  @Get()
  findAll(@Query() findMapsDto: FindMapsDto, @Request() req: RequestWithUser) {
    console.log(
      '[MapsController.findAll] Finding maps for user:',
      req.user.userId,
    );
    return this.mapsService.findAll(req.user.userId, findMapsDto);
  }

  @Get(':id/elements')
  searchElements(
    @Param('id') id: string,
    @Query('query') query: string,
    @Request() req: RequestWithUser,
  ) {
    return this.mapsService.searchElements(id, req.user.userId, query);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req: RequestWithUser) {
    console.log('[MapsController.findOne] Finding map with id:', id);
    return this.mapsService.findOne(id, req.user.userId);
  }

  @Post(':id/elements')
  addElement(
    @Param('id') id: string,
    @Body() createElement: CreateElementDto,
    @Request() req: RequestWithUser,
  ) {
    return this.mapsService.addElement(id, req.user.userId, createElement);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateMapDto: UpdateMapDto,
    @Request() req: RequestWithUser,
  ) {
    try {
      return await this.mapsService.update(id, updateMapDto, req.user.userId);
    } catch (error) {
      console.error('[MapsController.update] Error:', error);
      throw error;
    }
  }

  @Patch(':id/elements/:elementId')
  updateElement(
    @Param('id') id: string,
    @Param('elementId') elementId: string,
    @Body() updateElement: UpdateElementDto,
    @Request() req: RequestWithUser,
  ) {
    return this.mapsService.updateElement(
      id,
      req.user.userId,
      elementId,
      updateElement,
    );
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req: RequestWithUser) {
    return this.mapsService.remove(id, req.user.userId);
  }

  @Delete(':id/elements/:elementId')
  removeElement(
    @Param('id') id: string,
    @Param('elementId') elementId: string,
    @Request() req: RequestWithUser,
  ) {
    return this.mapsService.removeElement(id, req.user.userId, elementId);
  }
}
