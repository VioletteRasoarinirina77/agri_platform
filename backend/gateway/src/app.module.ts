// app.module.ts
import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';   // 👈 ajout
import { PassportModule } from '@nestjs/passport';
import { AppController } from './app.controller';
import { JwtStrategy } from './jwt.strategy';

@Module({
  imports: [
    HttpModule,              // 👈 indispensable pour axios
    PassportModule.register({ defaultStrategy: 'jwt' })
  ],
  controllers: [AppController],
  providers: [JwtStrategy],
})
export class AppModule {}