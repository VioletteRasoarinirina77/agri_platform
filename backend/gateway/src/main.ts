import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ IMPORTANT : autoriser React (CORS)
  app.enableCors({
    origin: "*",
  });

  await app.listen(process.env.PORT ?? 3000);
  console.log("Gateway running on http://localhost:3000");
}

bootstrap();