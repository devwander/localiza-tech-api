import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { TypeOrmModuleOptions, TypeOrmOptionsFactory } from '@nestjs/typeorm';
import { join } from 'path';
import { DataSource, DataSourceOptions } from 'typeorm';
import { User } from '../model/users.model';

import { config as dotenvConfig } from 'dotenv';
dotenvConfig();

@Injectable()
export class DBConfigService implements TypeOrmOptionsFactory {
  constructor(private configServiceNest: ConfigService) {}

  createTypeOrmOptions(): TypeOrmModuleOptions {
    return {
      type: 'postgres',
      host: this.configServiceNest.get<string>('DB_HOST'),
      port: this.configServiceNest.get<number>('DB_PORT'),
      username: this.configServiceNest.get<string>('DB_USER'),
      password: this.configServiceNest.get<string>('DB_PASSWORD'),
      database: this.configServiceNest.get<string>('DB_NAME'),
      entities: [User],
      synchronize: false,
      migrations: [join(__dirname, '../migrations/*{.ts,.js}')],
    };
  }
}

const cliConfigService = new ConfigService();

export const cliDataSourceOptions: DataSourceOptions = {
  type: 'postgres',
  host: cliConfigService.get<string>('DB_HOST'),
  port: parseInt(cliConfigService.get<string>('DB_PORT') ?? '5432', 10),
  username: cliConfigService.get<string>('DB_USER'),
  password: cliConfigService.get<string>('DB_PASSWORD'),
  database: cliConfigService.get<string>('DB_NAME'),
  entities: [User],
  migrations: [join(__dirname, '../migrations/*{.ts,.js}')],
  synchronize: false,
  logging: true,
};

const AppDataSource = new DataSource(cliDataSourceOptions);
export default AppDataSource;
