import { Request, Response } from 'express';
import { controller, httpGet, httpPost } from 'inversify-express-utils';
import { BlockchainService } from './blockchain.service';
import { IBlock, ICreateNewTransaction } from '../types';

@controller('/blockchain')
export class BlockchainController {
  constructor(private readonly _service: BlockchainService) {}

  @httpGet('/')
  blockchain(_: Request, res: Response) {
    const coin = this._service.getBlockchain();
    res.send(coin);
  }

  @httpPost('/transaction')
  postTransaction(req: Request, res: Response) {
    const newTransaction: ICreateNewTransaction = req.body;
    const blockIndex = this._service.postTransaction(newTransaction);
    res.json({ note: `Transaction will be added in block ${blockIndex}` });
  }

  @httpPost('/transaction/broadcast')
  async postAndBroadcastTransaction(req: Request, res: Response) {
    const newTransaction: ICreateNewTransaction = req.body;
    await this._service.postAndBroadcastTransaction(newTransaction);
    res.json({ note: 'Transaction created and broadcasted successfully.' });
  }

  @httpGet('/mine')
  async mine(_: Request, res: Response) {
    const newBlock = await this._service.mine();
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
  registerNode(req: Request, res: Response) {
    const newNodeUrl: string = req.body.newNodeUrl;
    this._service.registerNode({ newNodeUrl });
    res.json({ note: 'New node registered successfully.' });
  }

  @httpPost('/register-nodes-bulk')
  async registerNodesBulk(req: Request, res: Response) {
    const allNetworkNodes: string[] = req.body.allNetworkNodes;
    this._service.registerNodesBulk({ allNetworkNodes });
    res.json({ note: 'Bulk registration successful.' });
  }

  @httpGet('/consensus')
  async consensus(_: Request, res: Response) {
    const { note, chain } = this._service.consensus();
    res.json({ note, chain });
  }
}
