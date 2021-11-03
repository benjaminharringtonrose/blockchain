import { Blockchain } from './blockchain';
const coin = new Blockchain();

const bc1 = {
  chain: [
    {
      index: 1,
      timestamp: 1635960516666,
      transactions: [],
      nonce: 100,
      hash: '0',
      previousBlockHash: '0',
    },
    {
      index: 2,
      timestamp: 1635960522351,
      transactions: [],
      nonce: 18140,
      hash: '0000b9135b054d1131392c9eb9d03b0111d4b516824a03c35639e12858912100',
      previousBlockHash: '0',
    },
    {
      index: 3,
      timestamp: 1635960544119,
      transactions: [
        {
          amount: 12.5,
          sender: '00',
          recipient: '7a2119a03ccb11ec9a241b8d81b2f89e',
          transactionId: '7d87c4403ccb11ec9a241b8d81b2f89e',
        },
        {
          amount: 70,
          sender: 'jksdhfkjh32k4jh234',
          recipient: 'hj2g3jh4g2jh34g234',
          transactionId: '81e886503ccb11ec9a241b8d81b2f89e',
        },
        {
          amount: 6000,
          sender: 'jksdhfkjh32k4jh234',
          recipient: 'hj2g3jh4g2jh34g234',
          transactionId: '85b322e03ccb11ec9a241b8d81b2f89e',
        },
        {
          amount: 300,
          sender: 'jksdhfkjh32k4jh234',
          recipient: 'hj2g3jh4g2jh34g234',
          transactionId: '87f8cd203ccb11ec9a241b8d81b2f89e',
        },
      ],
      nonce: 24784,
      hash: '0000846007619e2107e1fa62d60a06838a117fa732b6a87b89dc88a773d7c34b',
      previousBlockHash:
        '0000b9135b054d1131392c9eb9d03b0111d4b516824a03c35639e12858912100',
    },
  ],
  pendingTransactions: [
    {
      amount: 12.5,
      sender: '00',
      recipient: '7a2119a03ccb11ec9a241b8d81b2f89e',
      transactionId: '8a7e66903ccb11ec9a241b8d81b2f89e',
    },
  ],
  currentNodeUrl: 'http://localhost:3001',
  networkNodes: [],
};

console.log('VALID: ', coin.chainIsValid(bc1.chain));
