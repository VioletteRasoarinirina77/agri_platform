import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { UserEntity } from '../entities/user.entity';

type JwtPayload = {
  sub: number;
  email: string;
  roles: string[];
};

@Injectable()
export class TypeOrmAuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(UserEntity)
    private readonly usersRepo: Repository<UserEntity>,
  ) {}

  async register(params: {
    email: string;
    password: string;
    roles?: string[];
  }): Promise<{ access_token: string }> {
    const { email, password, roles } = params;

    if (!email || !password) {
      throw new BadRequestException('email et password sont requis');
    }

    const existing = await this.usersRepo.findOne({ where: { email } });
    if (existing) {
      throw new BadRequestException('Email déjà utilisé');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    const user = this.usersRepo.create({
      email,
      passwordHash,
      roles: roles && roles.length ? roles : ['FARMER'],
    });

    await this.usersRepo.save(user);

    return {
      access_token: this.signToken(user),
    };
  }

  async login(params: {
    email: string;
    password: string;
  }): Promise<{ access_token: string }> {
    const { email, password } = params;

    const user = await this.usersRepo.findOne({ where: { email } });
    if (!user) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Email ou mot de passe incorrect');
    }

    return {
      access_token: this.signToken(user),
    };
  }

  private signToken(user: UserEntity): string {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      roles: user.roles ?? [],
    };

    return this.jwtService.sign(payload);
  }
}

