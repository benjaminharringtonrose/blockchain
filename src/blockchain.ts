import { sha256 } from 'js-sha256';
import {
  IBlock,
  ICreateNewBlock,
  ICreateNewTransaction,
  IHashBlock,
  IProofOfWork,
  ITransaction,
} from './types';

export class Blockchain {
  public chain: IBlock[];
  public pendingTransactions: ITransaction[];

  public constructor() {
    this.chain = [];
    this.pendingTransactions = [];
    this.createNewBlock({ nonce: 100, hash: '0', previousBlockHash: '0' });
  }

  public createNewBlock({
    nonce,
    hash,
    previousBlockHash,
  }: ICreateNewBlock): IBlock {
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

  public createNewTransaction({
    amount,
    sender,
    recipient,
  }: ICreateNewTransaction): number {
    const newTransaction: ITransaction = {
      amount,
      sender,
      recipient,
    };
    this.pendingTransactions.push(newTransaction);
    return this.getLastBlock()['index'] + 1;
  }

  public hashBlock({
    previousBlockHash,
    currentBlockTransactions,
    nonce,
  }: IHashBlock) {
    const dataAsString =
      previousBlockHash +
      nonce.toString() +
      JSON.stringify(currentBlockTransactions);
    const hash = sha256(dataAsString);
    return hash;
  }

  public proofOfWork({
    previousBlockHash,
    currentBlockTransactions,
  }: IProofOfWork) {
    // this function will repeatedly hash block until it finds the correct hash => '0000OIANSDFUI08N9AS'
    // uses current block data for the hash, but also the previousBlockHash
    // continuously changes nonce value until it finds the correct hash
    // returns to us the nonce value that creates the correct hash
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
}
