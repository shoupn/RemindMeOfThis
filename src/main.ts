import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { WebsocketsGateway } from './websockets/websocket.gateway';
// import { IoClientAdapter } from './websockets/ioclientadapter.client';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const websocketsGateway = app.get(WebsocketsGateway);
  websocketsGateway.afterInit(app.getHttpServer());
  await app.listen(3000);
  console.log(`Application is running on: ${await app.getUrl()}`);
}
bootstrap();
