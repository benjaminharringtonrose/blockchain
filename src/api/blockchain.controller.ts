import { Request, Response } from 'express';
import { controller, httpGet, httpPost } from 'inversify-express-utils';
import { BlockchainService } from './blockchain.service';
import { IBlock, ICreateNewTransaction } from '../types';

@controller('/blockchain')
export class BlockchainController {
  constructor(private readonly _service: BlockchainService) {}

  @httpGet('/')
  getBlockchain(_: Request, res: Response) {
    const coin = this._service.getBlockchain();
    res.send(coin);
  }

  @httpPost('/transaction')
  addTransactionToPendingTransactions(req: Request, res: Response) {
    const newTransaction: ICreateNewTransaction = req.body;
    const blockIndex = this._service.addTransactionToPendingTransactions(newTransaction);
    res.json({ note: `Transaction will be added in block ${blockIndex}` });
  }

  @httpPost('/transaction/broadcast')
  async addAndBroadcastTransaction(req: Request, res: Response) {
    const newTransaction: ICreateNewTransaction = req.body;
    await this._service.addAndBroadcastTransaction(newTransaction);
    res.json({ note: 'Transaction created and broadcasted successfully.' });
  }

  @httpGet('/mine')
  async mineNewBlock(_: Request, res: Response) {
    const newBlock = await this._service.mineNewBlock();
    res.json({ note: 'New block mined & broadcasted successfully', block: newBlock });
  }

  @httpPost('/receive-new-block')
  receiveNewBlock(req: Request, res: Response) {
    const newBlock: IBlock = req.body.newBlock;
    const { note, block } = this._service.receiveNewBlock(newBlock);
    res.json({ note, newBlock: block });
  }

  @httpPost('/register-and-broadcast-node')
  async registerAndBroadcastNode(req: Request, res: Response) {
    const newNodeUrl: string = req.body.newNodeUrl;
    const error = await this._service.registerAndBroadcastNode({ newNodeUrl });
    if (error) {
      res.json({ note: error });
    } else {
      res.json({ note: 'New node registered with network successfully.' });
    }
  }

  @httpPost('/register-node')
  registerNewNode(req: Request, res: Response) {
    const newNodeUrl: string = req.body.newNodeUrl;
    this._service.registerNewNode({ newNodeUrl });
    res.json({ note: 'New node registered successfully.' });
  }

  @httpPost('/register-nodes-bulk')
  async registerNodesBulk(req: Request, res: Response) {
    const allNetworkNodes: string[] = req.body.allNetworkNodes;
    this._service.registerNodesBulk({ allNetworkNodes });
    res.json({ note: 'Bulk registration successful.' });
  }

  @httpGet('/consensus')
  async getConsensus(_: Request, res: Response) {
    const { note, chain } = await this._service.getConsensus();
    res.json({ note, chain });
  }
}
