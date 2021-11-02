import express from 'express';
import bodyParser from 'body-parser';
import { Blockchain } from '../blockchain';
import {
  IGetBlockchainRequest,
  IPostMineRequest,
  IPostTransactionRequest,
} from './types';
import { ICreateNewTransaction, ICurrentBlockTransactions } from 'src/types';
import { v1 as uuidv1 } from 'uuid';

const nodeAddress = uuidv1().split('-').join('');

const coin = new Blockchain();

const app = express();
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

app.get('/blockchain', function (_, res) {
  res.send(coin);
});

app.post('/transaction', function (req, res) {
  const requestBody: IPostTransactionRequest = req.body;
  const blockIndex = coin.createNewTransaction(requestBody);
  res.json({ note: `Transaction will be added in block ${blockIndex}.` });
});

app.get('/mine', function (_, res) {
  const lastBlock = coin.getLastBlock();
  const previousBlockHash = lastBlock.hash;
  const currentBlockTransactions: ICurrentBlockTransactions = {
    transactions: coin.pendingTransactions,
    index: lastBlock.index,
  };
  const nonce = coin.proofOfWork({
    previousBlockHash,
    currentBlockTransactions,
  });
  const hash = coin.hashBlock({
    previousBlockHash,
    currentBlockTransactions,
    nonce,
  });
  coin.createNewTransaction({
    amount: 12.5,
    sender: '00',
    recipient: nodeAddress,
  });
  const block = coin.createNewBlock({ nonce, hash, previousBlockHash });
  res.json({
    note: 'New block mined successfully',
    block,
  });
});

app.listen(3000, function () {
  console.log('Listening on port 3000...');
});
