import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User } from 'src/model/users.model';

@Injectable()
export class AuthService {
  constructor(private readonly jwtService: JwtService) {}

  login(user: User) {
    const payload = {
      email: user.email,
      sub: { id: user.id },
    };

    return {
      token: {
        type: 'Bearer',
        token: this.jwtService.sign(payload),
      },
    };
  }
}
