import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Store, StoreDocument } from '../model/store.model';
import { CreateStoreDto } from './dto/create-store.dto';
import { FindStoresDto } from './dto/find-stores.dto';
import { UpdateStoreDto } from './dto/update-store.dto';

@Injectable()
export class StoresService {
  constructor(
    @InjectModel(Store.name) private storeModel: Model<StoreDocument>,
  ) {}

  async create(createStoreDto: CreateStoreDto, userId: string): Promise<Store> {
    const newStore = new this.storeModel({
      ...createStoreDto,
      userId,
    });
    return newStore.save();
  }

  async findAll(findStoresDto: FindStoresDto, userId?: string) {
    const {
      query,
      mapId,
      category,
      floor,
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

    if (floor) {
      filter.floor = floor;
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

    await this.storeModel.findByIdAndDelete(id).exec();
  }
}
