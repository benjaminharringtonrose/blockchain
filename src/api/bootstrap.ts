import 'dotenv/config';
import 'reflect-metadata';
import express from 'express';
import { InversifyExpressServer } from 'inversify-express-utils';
import { v1 as uuidv1 } from 'uuid';

import { container } from './container';

const port = process.argv[2];
export const nodeAddress = uuidv1().split('-').join('');

export async function bootstrap() {
  const server = new InversifyExpressServer(container);
  server.setConfig((app) => {
    app.use(express.json());
  });
  const app = server.build();
  app.listen(port, () => {
    console.log(`server is running on http://localhost:${port}`);
  });
}

bootstrap();
