import { Module } from '@nestjs/common';

import { TypeOrmModule } from '@nestjs/typeorm';

import { JwtModule } from '@nestjs/jwt';

import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth/auth.controller';

import { AuthService } from './auth/auth.service';

import { JwtStrategy } from './auth/jwt.strategy';

import { UserEntity } from './entities/user.entity';

@Module({
  imports: [

    PassportModule,

    JwtModule.register({
      secret: 'SECRET_KEY',

      signOptions: {
        expiresIn: '1d',
      },
    }),

    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.POSTGRES_HOST ?? 'postgres',
      port: Number(process.env.POSTGRES_PORT ?? 5432),
      username: process.env.POSTGRES_USER ?? 'postgres',
      password: process.env.POSTGRES_PASSWORD ?? 'violette',
      database: process.env.POSTGRES_DB ?? 'agri_platform',
      entities: [UserEntity],
      synchronize: true,
    }),

    TypeOrmModule.forFeature([
      UserEntity,
    ]),
  ],

  controllers: [AuthController],

  providers: [
    AuthService,
    JwtStrategy,
  ],
})
export class AppModule {}