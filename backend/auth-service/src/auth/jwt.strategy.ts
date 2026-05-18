import { Injectable } from '@nestjs/common';

import { PassportStrategy } from '@nestjs/passport';

import { ExtractJwt, Strategy } from 'passport-jwt';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      ignoreExpiration: false,

      secretOrKey: process.env.JWT_SECRET || 'SECRET_KEY',
    });
  }

  async validate(payload: any) {
    return {
      // JWT payload: { sub, email, roles }
      // Expose only the minimal profile fields required by the frontend.
      id: payload?.sub,
      email: payload?.email,
      roles: payload?.roles ?? [],
    };
  }
}
