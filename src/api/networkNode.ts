import express from 'express';
import bodyParser from 'body-parser';
import { Blockchain } from '../blockchain';
import { ICurrentBlockTransactions } from 'src/types';
import { v1 as uuidv1 } from 'uuid';
import axios, { AxiosPromise, AxiosRequestConfig } from 'axios';

const port = process.argv[2];
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
  const newTransaction = req.body;
  const blockIndex = coin.addTransactionToPendingTransactions(newTransaction);
  res.json({ note: `Transaction will be added in block ${blockIndex}` });
});

app.post('/transaction/broadcast', function (req, res) {
  const newTransaction = coin.createNewTransaction({
    amount: req.body.amount,
    sender: req.body.sender,
    recipient: req.body.recipient,
  });
  coin.addTransactionToPendingTransactions(newTransaction);

  const requestPromises: AxiosPromise<any>[] = [];
  coin.networkNodes.forEach((networkNodeUrl) => {
    const requestOptions: AxiosRequestConfig = {
      method: 'post',
      url: networkNodeUrl + '/transaction',
      data: newTransaction,
    };
    requestPromises.push(axios(requestOptions));
  });
  Promise.all(requestPromises).then((_) => {
    res.json({ note: 'Transaction created and broadcasted successfully.' });
  });
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

// register a node and broadcast it to the entire network
app.post('/register-and-broadcast-node', function (req, res) {
  const newNodeUrl = req.body.newNodeUrl;
  const nodeNotAlreadyPresent = coin.networkNodes.indexOf(newNodeUrl) === -1;
  const notCurrentNode = coin.currentNodeUrl !== newNodeUrl;
  if (nodeNotAlreadyPresent && notCurrentNode) {
    coin.networkNodes.push(newNodeUrl);
  }

  const registerNodesPromises: AxiosPromise<any>[] = [];
  coin.networkNodes.forEach((networkNodeUrl) => {
    const requestOptions: AxiosRequestConfig = {
      method: 'post',
      url: networkNodeUrl + '/register-node',
      data: { newNodeUrl },
    };
    registerNodesPromises.push(axios(requestOptions));
  });

  Promise.all(registerNodesPromises)
    .then((data) => {
      const bulkRegisterOptions: AxiosRequestConfig = {
        method: 'post',
        url: newNodeUrl + '/register-nodes-bulk',
        data: { allNetworkNodes: [...coin.networkNodes, coin.currentNodeUrl] },
      };
      return axios(bulkRegisterOptions);
    })
    .then((_) => {
      res.json({ note: 'New node registered with network successfully.' });
    })
    .catch((e) => res.json({ note: e.message }));
});

// register a node with the network
app.post('/register-node', function (req, res) {
  const newNodeUrl: string = req.body.newNodeUrl;
  const nodeNotAlreadyPresent = coin.networkNodes.indexOf(newNodeUrl) === -1;
  const notCurrentNode = coin.currentNodeUrl !== newNodeUrl;
  if (nodeNotAlreadyPresent && notCurrentNode) {
    coin.networkNodes.push(newNodeUrl);
  }
  res.json({ note: 'New node registered successfully.' });
});

// register multiple nodes at once
app.post('/register-nodes-bulk', function (req, res) {
  const allNetworkNodes: string[] = req.body.allNetworkNodes;
  allNetworkNodes.forEach((networkNodeUrl) => {
    const nodeNotAlreadyPresent =
      coin.networkNodes.indexOf(networkNodeUrl) === -1;
    const notCurrentNode = coin.currentNodeUrl !== networkNodeUrl;
    if (nodeNotAlreadyPresent && notCurrentNode) {
      coin.networkNodes.push(networkNodeUrl);
    }
  });
  res.json({ note: 'Bulk registration successful.' });
});

app.listen(port, function () {
  console.log(`Listening on port ${port}...`);
});
