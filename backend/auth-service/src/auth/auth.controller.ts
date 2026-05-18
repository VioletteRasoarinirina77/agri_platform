import {
  Body,
  Controller,
  Post,
  Get,
  Req,
  UseGuards,
} from '@nestjs/common';

import { AuthGuard } from '@nestjs/passport';

import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
  ) {}

  /* REGISTER */

  @Post('register')
  register(@Body() body: any) {
    return this.authService.register(body);
  }

  /* LOGIN */

  @Post('login')
  login(@Body() body: any) {
    return this.authService.login(body);
  }

  /* PROFILE */

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  profile(@Req() req: any) {
    return {
      message: 'PROFILE OK',
      user: req.user,
    };
  }

  /* ADMIN */

  @UseGuards(AuthGuard('jwt'))
  @Get('admin')
  admin(@Req() req: any) {

    const roles: string[] = req?.user?.roles ?? [];
    if (!roles.includes('ADMIN')) {
      return {
        error: 'Accès refusé',
      };
    }

    return {
      message: 'Bienvenue ADMIN',
    };
  }
}