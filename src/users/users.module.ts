import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HashModule } from 'src/common/hash/hash.module';
import { User } from 'src/model/users.model';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [TypeOrmModule.forFeature([User]), HashModule],
  controllers: [UsersController],
  providers: [UsersService],
})
export class UsersModule {}
