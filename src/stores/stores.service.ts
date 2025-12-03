import {
  ForbiddenException,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Store, StoreDocument } from '../model/store.model';
import { CreateStoreDto } from './dto/create-store.dto';
import { FindStoresDto } from './dto/find-stores.dto';
import { UpdateStoreDto } from './dto/update-store.dto';
import { MapsService } from '../maps/maps.service';

@Injectable()
export class StoresService {
  constructor(
    @InjectModel(Store.name) private readonly storeModel: Model<StoreDocument>,
    private readonly mapsService: MapsService,
  ) {}

  async create(createStoreDto: CreateStoreDto, userId: string): Promise<Store> {
    // Verificar se o mapa existe e pertence ao usuário
    const map = await this.mapsService.findOne(createStoreDto.mapId, userId);
    
    if (!map) {
      throw new NotFoundException(`Map with ID ${createStoreDto.mapId} not found`);
    }

    // Verificar se o feature existe no mapa
    const feature = map.features.find(f => f.id === createStoreDto.featureId);
    if (!feature) {
      throw new NotFoundException(
        `Feature with ID ${createStoreDto.featureId} not found in map ${createStoreDto.mapId}`
      );
    }

    // Verificar se o feature já está vinculado a outra store
    if (feature.properties.storeId) {
      throw new BadRequestException(
        `Feature ${createStoreDto.featureId} is already linked to another store`
      );
    }

    // Criar a store
    const newStore = new this.storeModel({
      ...createStoreDto,
      userId,
    });
    const savedStore = await newStore.save();

    // Atualizar o feature do mapa com o storeId
    const updatedFeatures = map.features.map(f => {
      if (f.id === createStoreDto.featureId) {
        const updatedFeature = {
          ...f,
          properties: {
            ...f.properties,
            storeId: (savedStore._id as any).toString(),
          },
        };
        return updatedFeature;
      }
      return f;
    });

    const updatedMap = await this.mapsService.update(
      createStoreDto.mapId,
      { features: updatedFeatures },
      userId
    );

    return savedStore;
  }

  async findAll(findStoresDto: FindStoresDto, userId?: string) {
    const {
      query,
      mapId,
      category,
      page = 1,
      limit = 10,
    } = findStoresDto;

    const filter: any = {};

    if (userId) {
      filter.userId = userId;
    }

    if (mapId) {
      filter.mapId = mapId;
    }

    if (category) {
      filter.category = category;
    }

    if (query) {
      filter.$or = [
        { name: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } },
      ];
    }

    const skip = (page - 1) * limit;

    const [stores, total] = await Promise.all([
      this.storeModel
        .find(filter)
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 })
        .exec(),
      this.storeModel.countDocuments(filter).exec(),
    ]);

    return {
      data: stores,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string, userId?: string): Promise<Store> {
    const store = await this.storeModel.findById(id).exec();

    if (!store) {
      throw new NotFoundException(`Store with ID ${id} not found`);
    }

    if (userId && store.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to access this store',
      );
    }

    return store;
  }

  async findByMapId(mapId: string): Promise<Store[]> {
    return this.storeModel.find({ mapId }).exec();
  }

  async findByMapIdPublic(mapId: string): Promise<Store[]> {
    // Versão pública que não requer autenticação
    // Retorna apenas stores vinculadas a mapas públicos
    return this.storeModel.find({ mapId }).exec();
  }

  async update(
    id: string,
    updateStoreDto: UpdateStoreDto,
    userId: string,
  ): Promise<Store> {
    const store = await this.storeModel.findById(id).exec();

    if (!store) {
      throw new NotFoundException(`Store with ID ${id} not found`);
    }

    if (store.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to update this store',
      );
    }

    // Verificar se está mudando o mapId ou featureId
    const isChangingLink = 
      (updateStoreDto.mapId && updateStoreDto.mapId !== store.mapId) ||
      (updateStoreDto.featureId && updateStoreDto.featureId !== store.featureId);

    if (isChangingLink) {
      // Remover o vínculo do feature antigo
      const oldMap = await this.mapsService.findOne(store.mapId, userId);
      if (oldMap) {
        const oldFeatures = oldMap.features.map(f => {
          if (f.id === store.featureId && f.properties.storeId === id) {
            const { storeId, ...restProperties } = f.properties;
            return { ...f, properties: restProperties };
          }
          return f;
        });
        await this.mapsService.update(store.mapId, { features: oldFeatures }, userId);
      }

      // Adicionar vínculo ao novo feature
      const newMapId = updateStoreDto.mapId || store.mapId;
      const newFeatureId = updateStoreDto.featureId || store.featureId;

      const newMap = await this.mapsService.findOne(newMapId, userId);
      if (!newMap) {
        throw new NotFoundException(`Map with ID ${newMapId} not found`);
      }

      const newFeature = newMap.features.find(f => f.id === newFeatureId);
      if (!newFeature) {
        throw new NotFoundException(
          `Feature with ID ${newFeatureId} not found in map ${newMapId}`
        );
      }

      if (newFeature.properties.storeId && newFeature.properties.storeId !== id) {
        throw new BadRequestException(
          `Feature ${newFeatureId} is already linked to another store`
        );
      }

      const newFeatures = newMap.features.map(f => {
        if (f.id === newFeatureId) {
          return {
            ...f,
            properties: {
              ...f.properties,
              storeId: id,
            },
          };
        }
        return f;
      });

      await this.mapsService.update(newMapId, { features: newFeatures }, userId);
    }

    const updatedStore = await this.storeModel
      .findByIdAndUpdate(
        id,
        { $set: updateStoreDto },
        { new: true, runValidators: false },
      )
      .exec();

    if (!updatedStore) {
      throw new NotFoundException(`Store with ID ${id} not found`);
    }

    return updatedStore;
  }

  async remove(id: string, userId: string): Promise<void> {
    const store = await this.storeModel.findById(id).exec();

    if (!store) {
      throw new NotFoundException(`Store with ID ${id} not found`);
    }

    if (store.userId !== userId) {
      throw new ForbiddenException(
        'You do not have permission to delete this store',
      );
    }

    // Remover o vínculo do feature no mapa
    try {
      const map = await this.mapsService.findOne(store.mapId, userId);
      if (map) {
        const updatedFeatures = map.features.map(f => {
          if (f.id === store.featureId && f.properties.storeId === id) {
            const { storeId, ...restProperties } = f.properties;
            return { ...f, properties: restProperties };
          }
          return f;
        });
        await this.mapsService.update(store.mapId, { features: updatedFeatures }, userId);
      }
    } catch (error) {
      // Se o mapa não existir mais, apenas continua com a remoção da store
      console.error('Error updating map when removing store:', error);
    }

    await this.storeModel.findByIdAndDelete(id).exec();
  }
}
