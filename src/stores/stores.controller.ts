import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  Request,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { StoresService } from './stores.service';
import { CreateStoreDto } from './dto/create-store.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { FindStoresDto } from './dto/find-stores.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UploadService } from '../common/upload/upload.service';

interface UploadedFileType {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  buffer: Buffer;
}

@Controller('stores')
@UseGuards(JwtAuthGuard)
export class StoresController {
  constructor(
    private readonly storesService: StoresService,
    private readonly uploadService: UploadService,
  ) {}

  @Post('upload-logo')
  @UseInterceptors(FileInterceptor('file'))
  async uploadLogo(@UploadedFile() file: UploadedFileType) {
    if (!file) {
      throw new BadRequestException('Nenhum arquivo enviado');
    }

    try {
      const logoUrl = await this.uploadService.uploadImage(file);
      return { url: logoUrl };
    } catch (error) {
      throw new BadRequestException(error.message);
    }
  }

  @Post('upload-logo-base64')
  async uploadLogoBase64(@Body('image') base64Image: string, @Request() req) {
    console.log('=== DEBUG UPLOAD LOGO ===');
    console.log('User do request:', req.user);
    console.log('Imagem recebida:', base64Image ? `Base64 string (${base64Image.length} chars)` : 'VAZIO');
    
    if (!base64Image) {
      console.log('Erro: Imagem base64 não fornecida');
      throw new BadRequestException('Imagem base64 não fornecida');
    }

    try {
      console.log('Processando upload...');
      const logoUrl = await this.uploadService.uploadBase64Image(base64Image);
      console.log('Upload concluído! URL:', logoUrl);
      console.log('========================');
      return { url: logoUrl };
    } catch (error) {
      console.error('Erro no upload:', error.message);
      console.log('========================');
      throw new BadRequestException(error.message);
    }
  }

  @Post()
  create(@Body() createStoreDto: CreateStoreDto, @Request() req) {
    console.log('=== DEBUG CREATE STORE ===');
    console.log('Dados recebidos:', JSON.stringify(createStoreDto, null, 2));
    console.log('User ID:', req.user.userId);
    console.log('========================');
    return this.storesService.create(createStoreDto, req.user.userId);
  }

  @Get()
  findAll(@Query() findStoresDto: FindStoresDto, @Request() req) {
    return this.storesService.findAll(findStoresDto, req.user.userId);
  }

  @Get('map/:mapId')
  findByMapId(@Param('mapId') mapId: string) {
    return this.storesService.findByMapId(mapId);
  }

  @Get(':id')
  findOne(@Param('id') id: string, @Request() req) {
    return this.storesService.findOne(id, req.user.userId);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateStoreDto: UpdateStoreDto,
    @Request() req,
  ) {
    return this.storesService.update(id, updateStoreDto, req.user.userId);
  }

  @Delete(':id')
  remove(@Param('id') id: string, @Request() req) {
    return this.storesService.remove(id, req.user.userId);
  }
}
