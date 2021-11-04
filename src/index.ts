import { sha256 } from 'js-sha256';
import { Blockchain } from './api/blockchain';
const coin = new Blockchain();

const bc1 = {
  chain: [
    {
      index: 1,
      timestamp: 1635982617325,
      transactions: [],
      nonce: 100,
      hash: '0',
      previousBlockHash: '0',
    },
    {
      index: 2,
      timestamp: 1635983094371,
      transactions: [
        {
          amount: 300,
          sender: 'jksdhfkjh32k4jh234',
          recipient: 'hj2g3jh4g2jh34g234',
          transactionId: 'bfecb1903cff11ec9aa49351b9777928',
        },
        {
          amount: 300,
          sender: 'jksdhfkjh32k4jh234',
          recipient: 'hj2g3jh4g2jh34g234',
          transactionId: 'c77b33f03cff11ec82fd2f0b597e24ea',
        },
        {
          amount: 30,
          sender: 'jksdhfkjh32k4jh234',
          recipient: 'hj2g3jh4g2jh34g234',
          transactionId: 'db9561d03cff11ec82fd2f0b597e24ea',
        },
      ],
      nonce: 18452,
      hash: '0000f145500519e36bac45d7a722fed1fd356ded79dc2783bcd8bc98f0c4bd71',
      previousBlockHash: '0',
    },
  ],
  pendingTransactions: [
    {
      amount: 12.5,
      sender: '00',
      recipient: 'ef27b7803cfe11eca85433793c73728e',
      transactionId: '0b7f9e103d0011eca85433793c73728e',
    },
  ],
  currentNodeUrl: 'http://localhost:3001',
  networkNodes: [
    'http://localhost:3002',
    'http://localhost:3003',
    'http://localhost:3004',
    'http://localhost:3005',
  ],
};

console.log('VALID: ', coin.chainIsValid(bc1.chain));
