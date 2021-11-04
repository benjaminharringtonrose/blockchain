import { sha256 } from 'js-sha256';
import { v1 as uuidv1 } from 'uuid';

import {
  IBlock,
  ICreateNewBlock,
  ICreateNewTransaction,
  IHashBlock,
  IProofOfWork,
  ITransaction,
} from '../types';

const currentNodeUrl = process.argv[3];

export class Blockchain {
  public chain: IBlock[];
  public pendingTransactions: ITransaction[];

  public currentNodeUrl: string;
  public networkNodes: string[];

  public constructor() {
    this.chain = [];
    this.pendingTransactions = [];
    this.currentNodeUrl = currentNodeUrl;
    this.networkNodes = [];
    this.createNewBlock({ nonce: 100, hash: '0', previousBlockHash: '0' });
  }

  public createNewBlock({ nonce, hash, previousBlockHash }: ICreateNewBlock): IBlock {
    const newBlock: IBlock = {
      index: this.chain.length + 1,
      timestamp: Date.now(),
      transactions: this.pendingTransactions,
      nonce,
      hash,
      previousBlockHash,
    };
    this.pendingTransactions = [];
    this.chain.push(newBlock);
    return newBlock;
  }

  public getLastBlock(): IBlock {
    return this.chain[this.chain.length - 1];
  }

  public createNewTransaction({ amount, sender, recipient }: ICreateNewTransaction) {
    const newTransaction = {
      amount,
      sender,
      recipient,
      transactionId: uuidv1().split('-').join(''),
    };
    return newTransaction;
  }

  public addTransactionToPendingTransactions(transaction: ICreateNewTransaction) {
    this.pendingTransactions.push(transaction);
    return this.getLastBlock().index + 1;
  }

  public hashBlock({ previousBlockHash, currentBlockTransactions, nonce }: IHashBlock) {
    const dataAsString =
      previousBlockHash + nonce.toString() + JSON.stringify(currentBlockTransactions);
    const hash = sha256(dataAsString);
    return hash;
  }

  public proofOfWork({ previousBlockHash, currentBlockTransactions }: IProofOfWork) {
    let nonce = 0;
    let hash = this.hashBlock({
      previousBlockHash,
      currentBlockTransactions,
      nonce,
    });
    while (hash.substring(0, 4) !== '0000') {
      nonce++;
      hash = this.hashBlock({
        previousBlockHash,
        currentBlockTransactions,
        nonce,
      });
    }
    return nonce;
  }

  public chainIsValid(blockchain: IBlock[]) {
    let validChain = true;
    for (let i = 1; i < blockchain.length; i++) {
      const prevBlock = blockchain[i - 1];
      const currentBlock = blockchain[i];
      const blockHash = this.hashBlock({
        previousBlockHash: prevBlock.hash,
        currentBlockTransactions: {
          transactions: currentBlock.transactions,
          index: currentBlock.index,
        },
        nonce: currentBlock.nonce,
      });
      if (blockHash.substring(0, 4) !== '0000') {
        validChain = false;
        break;
      }
      if (currentBlock.previousBlockHash !== prevBlock.hash) {
        validChain = false;
        break;
      }
    }
    const genesisBlock = blockchain[0];
    const correctNonce = genesisBlock.nonce === 100;
    const correctPreviousBlockHash = genesisBlock.previousBlockHash === '0';
    const correctHash = genesisBlock.hash === '0';
    const correctTransactions = genesisBlock.transactions.length === 0;
    if (!correctNonce || !correctPreviousBlockHash || !correctHash || !correctTransactions) {
      validChain = false;
    }
    return validChain;
  }
}
