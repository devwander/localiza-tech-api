import { Body, Controller, Post } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private authService: AuthService,
    private usersService: UsersService,
  ) {}

  @Post('signin')
  async login(@Body() loginDto: LoginDto) {
    if (!loginDto.email || !loginDto.password) {
      throw new Error('Email and password are required.');
    }

    const user = await this.usersService.validateLogin(
      loginDto.email,
      loginDto.password,
    );
    return this.authService.login(user);
  }

  @Post('signup')
  async register(@Body() registerDto: RegisterDto) {
    if (!registerDto.name || !registerDto.email || !registerDto.password) {
      throw new Error('Name, email, and password are required.');
    }

    const user = await this.usersService.create(registerDto);
    return this.authService.login(user);
  }
}
