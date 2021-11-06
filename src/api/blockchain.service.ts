import axios, { AxiosPromise, AxiosRequestConfig } from 'axios';
import { injectable } from 'inversify';
import { nodeAddress } from './bootstrap';
import { Blockchain } from './Blockchain';
import { IBlock, ICreateNewTransaction, ICurrentBlockTransactions, ITransaction } from '../types';

@injectable()
export class BlockchainService {
  private coin: Blockchain;

  constructor() {
    this.coin = new Blockchain();
  }

  public getBlockchain() {
    return this.coin;
  }

  public addTransactionToPendingTransactions({ amount, sender, recipient }: ICreateNewTransaction) {
    const blockIndex = this.coin.addTransactionToPendingTransactions({ amount, sender, recipient });
    return blockIndex;
  }

  public async addAndBroadcastTransaction({ amount, sender, recipient }: ICreateNewTransaction) {
    const newTransaction = this.coin.createNewTransaction({ amount, sender, recipient });
    this.coin.addTransactionToPendingTransactions(newTransaction);
    const requestPromises: AxiosPromise[] = [];
    this.coin.networkNodes.forEach((networkNodeUrl) => {
      const requestOptions: AxiosRequestConfig = {
        method: 'post',
        url: networkNodeUrl + '/blockchain/transaction',
        data: newTransaction,
      };
      requestPromises.push(axios(requestOptions));
    });
    return await Promise.all(requestPromises);
  }

  public async mineNewBlock() {
    const lastBlock = this.coin.getLastBlock();
    const previousBlockHash = lastBlock.hash;
    const currentBlockTransactions: ICurrentBlockTransactions = {
      transactions: this.coin.pendingTransactions,
      index: lastBlock.index + 1,
    };
    const nonce = this.coin.proofOfWork({
      previousBlockHash,
      currentBlockTransactions,
    });
    const hash = this.coin.hashBlock({
      previousBlockHash,
      currentBlockTransactions,
      nonce,
    });
    const newBlock = this.coin.createNewBlock({ nonce, hash, previousBlockHash });
    const requestPromises: AxiosPromise[] = [];
    this.coin.networkNodes.forEach((networkNodeUrl) => {
      const requestOptions: AxiosRequestConfig = {
        method: 'post',
        url: networkNodeUrl + '/blockchain/receive-new-block',
        data: { newBlock },
      };
      requestPromises.push(axios(requestOptions));
    });
    await Promise.all(requestPromises);
    const requestOptions: AxiosRequestConfig = {
      method: 'post',
      url: this.coin.currentNodeUrl + '/blockchain/transaction/broadcast',
      data: {
        amount: 12.5,
        sender: '00',
        recipient: nodeAddress,
      },
    };
    await axios(requestOptions);
    return newBlock;
  }

  public receiveNewBlock(block: IBlock) {
    const lastBlock = this.coin.getLastBlock();
    const correctHash = lastBlock.hash === block.previousBlockHash;
    const correctIndex = lastBlock.index + 1 === block.index;
    if (correctHash && correctIndex) {
      this.coin.chain.push(block);
      this.coin.pendingTransactions = [];
      return {
        note: 'New block received and accepted.',
        block,
      };
    } else {
      return {
        note: 'New block rejected.',
        block,
      };
    }
  }

  public async registerAndBroadcastNode({ newNodeUrl }: { newNodeUrl: string }) {
    try {
      const nodeNotAlreadyPresent = this.coin.networkNodes.indexOf(newNodeUrl) === -1;
      const notCurrentNode = this.coin.currentNodeUrl !== newNodeUrl;
      if (nodeNotAlreadyPresent && notCurrentNode) {
        this.coin.networkNodes.push(newNodeUrl);
      }
      const registerNodesPromises: AxiosPromise[] = [];
      this.coin.networkNodes.forEach((networkNodeUrl) => {
        const requestOptions: AxiosRequestConfig = {
          method: 'post',
          url: networkNodeUrl + '/blockchain/register-node',
          data: { newNodeUrl },
        };
        registerNodesPromises.push(axios(requestOptions));
      });
      await Promise.all(registerNodesPromises);
      const bulkRegisterOptions: AxiosRequestConfig = {
        method: 'post',
        url: newNodeUrl + '/blockchain/register-nodes-bulk',
        data: { allNetworkNodes: [...this.coin.networkNodes, this.coin.currentNodeUrl] },
      };
      await axios(bulkRegisterOptions);
    } catch (e) {
      return e;
    }
  }

  public registerNewNode({ newNodeUrl }: { newNodeUrl: string }) {
    const nodeNotAlreadyPresent = this.coin.networkNodes.indexOf(newNodeUrl) === -1;
    const notCurrentNode = this.coin.currentNodeUrl !== newNodeUrl;
    if (nodeNotAlreadyPresent && notCurrentNode) {
      this.coin.networkNodes.push(newNodeUrl);
    }
  }

  public registerNodesBulk({ allNetworkNodes }: { allNetworkNodes: string[] }) {
    allNetworkNodes.forEach((networkNodeUrl) => {
      const nodeNotPresent = this.coin.networkNodes.indexOf(networkNodeUrl) === -1;
      const notCurrentNode = this.coin.currentNodeUrl !== networkNodeUrl;
      if (nodeNotPresent && notCurrentNode) {
        this.coin.networkNodes.push(networkNodeUrl);
      }
    });
  }

  public async getConsensus() {
    const requestPromises: AxiosPromise[] = [];
    this.coin.networkNodes.forEach((networkNodeUrl) => {
      const requestOptions: AxiosRequestConfig = {
        method: 'get',
        url: networkNodeUrl + '/blockchain',
      };
      requestPromises.push(axios(requestOptions));
    });
    const blockchains = await Promise.all(requestPromises);
    const currentChainLength = this.coin.chain.length;
    let maxChainLength = currentChainLength;
    let newLongestChain = null;
    let newPendingTransactions: ITransaction[] = [];
    blockchains.forEach((response) => {
      const blockchain = response.data;
      if (blockchain.chain.length > maxChainLength) {
        maxChainLength = blockchain.chain.length;
        newLongestChain = blockchain.chain;
        newPendingTransactions = blockchain.pendingTransactions;
      }
    });
    if (!newLongestChain || (newLongestChain && !this.coin.chainIsValid(newLongestChain))) {
      return {
        note: 'Current chain has not been replaced.',
        chain: this.coin.chain,
      };
    } else {
      this.coin.chain = newLongestChain;
      this.coin.pendingTransactions = newPendingTransactions;
      return {
        note: 'This chain has been replaced.',
        chain: this.coin.chain,
      };
    }
  }
}
