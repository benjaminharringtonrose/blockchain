import express from 'express';
import bodyParser from 'body-parser';
import { Blockchain } from '../blockchain';
import {
  IGetBlockchainRequest,
  IPostMineRequest,
  IPostTransactionRequest,
} from './types';
import { ICreateNewTransaction, ICurrentBlockTransactions } from 'src/types';

const coin = new Blockchain();

const app = express();
app.use(bodyParser.json());
app.use(
  bodyParser.urlencoded({
    extended: false,
  })
);

app.get('/blockchain', function (req, res) {
  res.send(coin);
});

app.post('/transaction', function (req, res) {
  let requestBody: IPostTransactionRequest = req.body;
  const blockIndex = coin.createNewTransaction(requestBody);
  res.json({ note: `Transaction will be added in block ${blockIndex}.` });
});

app.post('/mine', function (req, res) {
  let requestBody: IPostMineRequest = req.body;
  res.send('Not implemented.');
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
  // const newBlock = coin.createNewBlock({});
});

app.listen(3000, function () {
  console.log('Listening on port 3000...');
});
