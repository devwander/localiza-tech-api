import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { HashService } from 'src/common/hash/hash.service';
import { User } from 'src/model/users.model';
import { FindOptionsWhere, ILike, Repository } from 'typeorm';
import { CreateUserDto } from './dto/create.dto';
import { FindUsersDto } from './dto/find-users.dto';
import { UpdateUserDto } from './dto/update.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private readonly hashService: HashService,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    const existingUser = await this.usersRepository.findOne({
      where: { email: createUserDto.email },
    });

    if (existingUser) {
      throw new UnauthorizedException('Email already in use.');
    }

    if (createUserDto.password) {
      createUserDto.password = await this.hashService.hash(
        createUserDto.password,
      );
    }

    const newUser = this.usersRepository.create(createUserDto);
    return this.usersRepository.save(newUser);
  }

  async findAll({
    query,
    page = 1,
    limit = 10,
    order = 'alphabetical',
  }: FindUsersDto): Promise<{
    data: User[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  }> {
    const where: FindOptionsWhere<User> = {};

    if (query) {
      where.name = ILike(`%${query}%`);
    }

    let orderBy: Partial<Record<keyof User, 'ASC' | 'DESC'>> = {};

    switch (order) {
      case 'most_recent':
        orderBy = { createdAt: 'DESC' };
        break;
      case 'oldest':
        orderBy = { createdAt: 'ASC' };
        break;
      default:
        orderBy = { name: 'ASC' };
    }

    const [data, total] = await this.usersRepository.findAndCount({
      where,
      order: orderBy,
      skip: (page - 1) * limit,
      take: limit,
    });

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<User> {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return user;
  }

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepository.findOne({ where: { email } });
  }

  async validateLogin(email: string, password: string): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { email },
    });

    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    const isPasswordValid = await this.hashService.compare(
      password,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid email or password.');
    }

    return user;
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User> {
    const user = await this.findOne(id);
    this.usersRepository.merge(user, updateUserDto);
    return this.usersRepository.save(user);
  }

  async remove(id: string): Promise<void> {
    const result = await this.usersRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }
}
