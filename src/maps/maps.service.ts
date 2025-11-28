import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { FilterQuery, Model, SortOrder } from 'mongoose';
import { Map, MapDocument } from '../model/map.model';
import { CreateMapDto } from './dto/create-map.dto';
import { CreateElementDto, UpdateElementDto } from './dto/element.dto';
import { FindMapsDto } from './dto/find-maps.dto';
import { UpdateMapDto } from './dto/update-map.dto';

@Injectable()
export class MapsService {
  constructor(@InjectModel(Map.name) private mapModel: Model<MapDocument>) {}

  async create(createMapDto: CreateMapDto, userId: string): Promise<Map> {
    console.log(
      '[MapsService.create] Received DTO:',
      JSON.stringify(createMapDto, null, 2),
    );
    console.log(
      '[MapsService.create] Features count:',
      createMapDto.features?.length,
    );

    if (createMapDto.features && createMapDto.features.length > 0) {
      console.log(
        '[MapsService.create] First feature:',
        JSON.stringify(createMapDto.features[0], null, 2),
      );
    }

    const createdMap = new this.mapModel({
      ...createMapDto,
      userId,
      metadata: {
        ...createMapDto.metadata,
        author: userId,
      },
    });

    const savedMap = await createdMap.save();
    console.log(
      '[MapsService.create] Saved map features:',
      savedMap.features?.length,
    );

    if (savedMap.features && savedMap.features.length > 0) {
      console.log(
        '[MapsService.create] First saved feature:',
        JSON.stringify(savedMap.features[0], null, 2),
      );
    }

    return savedMap;
  }

  async findAll(
    userId: string,
    { query, page = 1, limit = 10, order = 'alphabetical' }: FindMapsDto = {},
  ): Promise<{
    data: Map[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const filter: FilterQuery<MapDocument> = { userId };

    if (query) {
      filter.name = { $regex: query, $options: 'i' };
    }

    let sortBy: Record<string, SortOrder> = {};

    switch (order) {
      case 'most_recent':
        sortBy = { createdAt: -1 };
        break;
      case 'oldest':
        sortBy = { createdAt: 1 };
        break;
      default:
        sortBy = { name: 1 };
    }

    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.mapModel.find(filter).sort(sortBy).skip(skip).limit(limit).exec(),
      this.mapModel.countDocuments(filter).exec(),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, userId: string): Promise<Map> {
    const map = await this.mapModel.findOne({ _id: id, userId }).exec();
    if (!map) {
      throw new NotFoundException(`Map with ID ${id} not found`);
    }
    return map;
  }

  async findOnePublic(id: string): Promise<Map> {
    const map = await this.mapModel.findById(id).exec();

    if (!map) {
      throw new NotFoundException(`Map with ID ${id} not found`);
    }

    return map;
  }

  async update(
    id: string,
    updateMapDto: UpdateMapDto,
    userId: string,
  ): Promise<Map> {
    console.log(
      '[MapsService.update] Received DTO:',
      JSON.stringify(updateMapDto, null, 2),
    );
    console.log(
      '[MapsService.update] Features count:',
      updateMapDto.features?.length,
    );

    if (updateMapDto.features && updateMapDto.features.length > 0) {
      console.log(
        '[MapsService.update] First feature:',
        JSON.stringify(updateMapDto.features[0], null, 2),
      );
    }

    try {
      // Primeiro verifica se o mapa existe
      const existingMap = await this.mapModel
        .findOne({ _id: id, userId })
        .exec();

      if (!existingMap) {
        throw new NotFoundException(`Map with ID ${id} not found`);
      }

      // Prepara o objeto de atualização apenas com os campos fornecidos
      const updateData: Partial<Map> = {};
      
      if (updateMapDto.name !== undefined) {
        updateData.name = updateMapDto.name;
      }
      
      if (updateMapDto.type !== undefined) {
        updateData.type = updateMapDto.type;
      }
      
      if (updateMapDto.tags !== undefined) {
        updateData.tags = updateMapDto.tags;
      }
      
      if (updateMapDto.metadata !== undefined) {
        updateData.metadata = {
          ...existingMap.metadata,
          ...updateMapDto.metadata,
        };
      }
      
      if (updateMapDto.features !== undefined) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        updateData.features = updateMapDto.features as any;
      }

      console.log(
        '[MapsService.update] Update data:',
        JSON.stringify(updateData, null, 2),
      );

      // Atualiza o mapa
      const map = await this.mapModel
        .findOneAndUpdate(
          { _id: id, userId },
          { $set: updateData },
          { new: true, runValidators: true },
        )
        .exec();

      if (!map) {
        throw new NotFoundException(`Map with ID ${id} not found`);
      }

      console.log(
        '[MapsService.update] Updated map features:',
        map.features?.length,
      );

      if (map.features && map.features.length > 0) {
        console.log(
          '[MapsService.update] First updated feature:',
          JSON.stringify(map.features[0], null, 2),
        );
      }

      return map;
    } catch (error: any) {
      console.error('[MapsService.update] Error updating map:', error);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      console.error('[MapsService.update] Error name:', error?.name);
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      console.error('[MapsService.update] Error message:', error?.message);
      
      // Log detalhado do erro se for erro de validação do MongoDB
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error?.name === 'ValidationError') {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        console.error('[MapsService.update] Validation errors:', error.errors);
      }
      
      // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
      if (error?.name === 'CastError') {
        console.error('[MapsService.update] Cast error details:', {
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          path: error.path,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          value: error.value,
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-member-access
          kind: error.kind,
        });
      }
      
      if (error instanceof NotFoundException) {
        throw error;
      }
      throw error;
    }
  }

  async remove(id: string, userId: string): Promise<Map> {
    const map = await this.mapModel
      .findOneAndDelete({ _id: id, userId })
      .exec();
    if (!map) {
      throw new NotFoundException(`Map with ID ${id} not found`);
    }
    return map;
  }

  // Buscar elementos dentro de um mapa específico
  async searchElements(
    id: string,
    userId: string,
    query: string,
  ): Promise<any[]> {
    const map = await this.findOne(id, userId);

    if (!query) {
      return map.features;
    }

    return map.features.filter(
      (feature) =>
        feature.properties?.name?.toLowerCase().includes(query.toLowerCase()) ||
        feature.id?.toLowerCase().includes(query.toLowerCase()),
    );
  }

  // Adicionar um elemento a um mapa existente
  async addElement(
    id: string,
    userId: string,
    element: CreateElementDto,
  ): Promise<Map> {
    const map = await this.findOne(id, userId);

    // Converter CreateElementDto para o formato esperado
    const newFeature = {
      type: element.type,
      id: element.id,
      geometry: element.geometry,
      properties: element.properties,
    };

    map.features.push(newFeature);

    const updated = await this.mapModel
      .findOneAndUpdate(
        { _id: id, userId },
        { features: map.features },
        { new: true },
      )
      .exec();

    if (!updated) {
      throw new NotFoundException(`Map with ID ${id} not found`);
    }

    return updated;
  }

  // Atualizar um elemento específico
  async updateElement(
    mapId: string,
    userId: string,
    elementId: string,
    updates: UpdateElementDto,
  ): Promise<Map> {
    const map = await this.findOne(mapId, userId);

    const elementIndex = map.features.findIndex((f) => f.id === elementId);

    if (elementIndex === -1) {
      throw new NotFoundException(`Element with ID ${elementId} not found`);
    }

    // Atualizar o elemento de forma segura
    const currentElement = map.features[elementIndex];
    map.features[elementIndex] = {
      type: updates.type || currentElement.type,
      id: currentElement.id,
      geometry: updates.geometry || currentElement.geometry,
      properties: {
        ...currentElement.properties,
        ...(updates.properties || {}),
      },
    };

    const updated = await this.mapModel
      .findOneAndUpdate(
        { _id: mapId, userId },
        { features: map.features },
        { new: true },
      )
      .exec();

    if (!updated) {
      throw new NotFoundException(`Map with ID ${mapId} not found`);
    }

    return updated;
  }

  // Remover um elemento específico
  async removeElement(
    mapId: string,
    userId: string,
    elementId: string,
  ): Promise<Map> {
    const map = await this.findOne(mapId, userId);

    const updatedFeatures = map.features.filter((f) => f.id !== elementId);

    if (updatedFeatures.length === map.features.length) {
      throw new NotFoundException(`Element with ID ${elementId} not found`);
    }

    const updated = await this.mapModel
      .findOneAndUpdate(
        { _id: mapId, userId },
        { features: updatedFeatures },
        { new: true },
      )
      .exec();

    if (!updated) {
      throw new NotFoundException(`Map with ID ${mapId} not found`);
    }

    return updated;
  }
}
