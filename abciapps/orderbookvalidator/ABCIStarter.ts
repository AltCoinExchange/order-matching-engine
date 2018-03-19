import {CounterApp} from './CounterApp';

async function bootstrap() {
  const app = new CounterApp();
  app.Start();
}

bootstrap();