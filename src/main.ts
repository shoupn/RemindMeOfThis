import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WebsocketsGateway } from './websockets/websocket.gateway';
import * as dotenv from 'dotenv';

async function bootstrap() {
  dotenv.config(); // Load environment variables from .env file
  const app = await NestFactory.create(AppModule);
  app.enableShutdownHooks();
  const websocketsGateway = app.get(WebsocketsGateway);
  websocketsGateway.afterInit(app.getHttpServer());
  await app.listen(process.env.PORT || 3001);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
