import { Controller, Post, Get } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Store, StoreDocument } from '../model/store.model';
import { MapsService } from '../maps/maps.service';

/**
 * Controller temporário para corrigir stores antigas que não têm storeId nas features
 */
@Controller('stores/fix')
export class FixStoresController {
  constructor(
    @InjectModel(Store.name) private readonly storeModel: Model<StoreDocument>,
    private readonly mapsService: MapsService,
  ) {}

  @Get('check')
  async checkStores() {
    const stores = await this.storeModel.find().exec();
    const report: Array<{
      storeId: string;
      storeName: string;
      mapId?: string;
      featureId?: string;
      status: string;
      message?: string;
      hasStoreId?: boolean;
    }> = [];

    for (const store of stores) {
      try {
        // Buscar o mapa (sem autenticação para simplificar)
        const map = await this.mapsService.findOnePublic(store.mapId);
        
        if (!map) {
          report.push({
            storeId: (store._id as any).toString(),
            storeName: store.name,
            status: 'error',
            message: 'Map not found',
          });
          continue;
        }

        // Verificar se a feature tem storeId
        const feature = map.features.find(f => f.id === store.featureId);
        if (!feature) {
          report.push({
            storeId: (store._id as any).toString(),
            storeName: store.name,
            status: 'error',
            message: 'Feature not found',
          });
          continue;
        }

        const hasStoreId = feature.properties.storeId === (store._id as any).toString();
        report.push({
          storeId: (store._id as any).toString(),
          storeName: store.name,
          mapId: store.mapId,
          featureId: store.featureId,
          status: hasStoreId ? 'ok' : 'missing_link',
          hasStoreId,
        });
      } catch (error: any) {
        report.push({
          storeId: (store._id as any).toString(),
          storeName: store.name,
          status: 'error',
          message: error.message,
        });
      }
    }

    return {
      total: stores.length,
      needsFix: report.filter(r => r.status === 'missing_link').length,
      report,
    };
  }

  @Post('apply')
  async fixStores() {
    const stores = await this.storeModel.find().exec();
    const results: Array<{
      storeId: string;
      storeName: string;
      status: string;
      message: string;
    }> = [];

    for (const store of stores) {
      try {
        // Buscar o mapa (sem autenticação)
        const map = await this.mapsService.findOnePublic(store.mapId);
        
        if (!map) {
          results.push({
            storeId: (store._id as any).toString(),
            storeName: store.name,
            status: 'error',
            message: 'Map not found',
          });
          continue;
        }

        // Verificar se a feature existe
        const featureExists = map.features.find(f => f.id === store.featureId);
        if (!featureExists) {
          results.push({
            storeId: (store._id as any).toString(),
            storeName: store.name,
            status: 'error',
            message: 'Feature not found',
          });
          continue;
        }

        // Verificar se já tem storeId
        if (featureExists.properties.storeId === (store._id as any).toString()) {
          results.push({
            storeId: (store._id as any).toString(),
            storeName: store.name,
            status: 'skipped',
            message: 'Already linked',
          });
          continue;
        }

        // Adicionar storeId na feature
        const storeIdString = (store._id as any).toString();
        
        // Converter map.features para objetos simples (POJO) para evitar problemas com Mongoose
        const featuresArray = JSON.parse(JSON.stringify(map.features));
        
        const updatedFeatures = featuresArray.map(f => {
          // Comparar como string para garantir match
          if (f.id?.toString() === store.featureId?.toString()) {
            return {
              ...f,
              properties: {
                ...f.properties,
                storeId: storeIdString,
              },
            };
          }
          return f;
        });

        // Atualizar o mapa (força update sem userId)
        const updateDto = { features: updatedFeatures as any };
        await this.mapsService.updatePublic(store.mapId, updateDto);

        results.push({
          storeId: (store._id as any).toString(),
          storeName: store.name,
          status: 'fixed',
          message: 'Store linked to feature',
        });
      } catch (error: any) {
        results.push({
          storeId: (store._id as any).toString(),
          storeName: store.name,
          status: 'error',
          message: error.message,
        });
      }
    }

    return {
      total: stores.length,
      fixed: results.filter(r => r.status === 'fixed').length,
      skipped: results.filter(r => r.status === 'skipped').length,
      errors: results.filter(r => r.status === 'error').length,
      results,
    };
  }
}
