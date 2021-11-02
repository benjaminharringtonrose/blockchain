export interface ICreateNewBlock {
  nonce: number;
  hash: string;
  previousBlockHash: string;
}

export interface IBlock extends ICreateNewBlock {
  index: number;
  timestamp: number;
  transactions: any[];
}

export interface ICreateNewTransaction {
  amount: number;
  sender: string;
  recipient: string;
}

export interface ITransaction extends ICreateNewTransaction {}

export interface IHashBlock {
  previousBlockHash: string;
  currentBlockTransactions: ICurrentBlockTransactions;
  nonce: number;
}

export interface IProofOfWork {
  previousBlockHash: string;
  currentBlockTransactions: ICurrentBlockTransactions;
}

export interface ICurrentBlockTransactions {
  transactions: ITransaction[];
  index: number;
}
