import { Container } from 'inversify';
import { BlockchainController } from '../blockchain.controller';
import { BlockchainRepository } from '../blockchain.repository';
import { BlockchainService } from '../blockchain.service';

export const container = new Container({
  defaultScope: 'Singleton',
});
container.bind(BlockchainController).toSelf();
container.bind(BlockchainService).toSelf();
