import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
} from '@nestjs/common';

import { JwtService } from '@nestjs/jwt';

import { InjectRepository } from '@nestjs/typeorm';

import { Repository } from 'typeorm';

import * as bcrypt from 'bcrypt';

import { UserEntity } from '../entities/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private jwtService: JwtService,

    @InjectRepository(UserEntity)
    private usersRepo: Repository<UserEntity>,
  ) {}

  /* REGISTER */

  async register(body: any) {
    const { email, password, roles } = body;

    const existing = await this.usersRepo.findOne({
      where: { email },
    });

    if (existing) {
      throw new BadRequestException(
        'Email déjà utilisé',
      );
    }

    const passwordHash = await bcrypt.hash(
      password,
      10,
    );

    const user = this.usersRepo.create({
      email,
      passwordHash,
      roles: roles || ['FARMER'],
    });

    await this.usersRepo.save(user);

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      roles: user.roles,
    });

    return {
      access_token: token,
      user,
    };
  }

  /* LOGIN */

  async login(body: any) {
    const { email, password } = body;

    const user = await this.usersRepo.findOne({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException(
        'Utilisateur introuvable',
      );
    }

    const ok = await bcrypt.compare(
      password,
      user.passwordHash,
    );

    if (!ok) {
      throw new UnauthorizedException(
        'Mot de passe incorrect',
      );
    }

    const token = this.jwtService.sign({
      sub: user.id,
      email: user.email,
      roles: user.roles,
    });

    return {
      access_token: token,
      user,
    };
  }
}