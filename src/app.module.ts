import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { HashModule } from './common/hash/hash.module';
import { HashService } from './common/hash/hash.service';
import { DBConfigService } from './config/typeorm';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRootAsync({
      useClass: DBConfigService,
      inject: [DBConfigService],
    }),
    UsersModule,
    HashModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [AppService, HashService],
})
export class AppModule {}
