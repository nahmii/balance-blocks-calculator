'use strict';
const chai = require('chai');
chai.should();
const {calculateBalanceBlocks} = require('./index');

describe('index', () => {

  describe('#calculateBalanceBlocks()', () => {

    let result;

    const wallet = '0x000000000000000000000000000000000000000A';
    const otherWallet = '0x000000000000000000000000000000000000000B';
    const thirdWallet = '0x000000000000000000000000000000000000000C';

    describe('when successful', () => {

      [
        {
          description: 'wallet with null transactions',
          startBlock: 10,
          endBlock: 20,
          startBalance: '100',
          transactions: null,
          expectedBalanceBlocks: '1000'
        },
        {
          description: 'wallet with 0 transactions',
          startBlock: 10,
          endBlock: 20,
          startBalance: '100',
          transactions: [],
          expectedBalanceBlocks: '1000'
        },
        {
          description: 'wallet with 2 positive transactions',
          startBlock: 10,
          endBlock: 20,
          startBalance: '100',
          transactions: [
            {
              from: otherWallet,
              to: wallet,
              value: '20',
              blockNumber: 15
            },
            {
              from: otherWallet,
              to: wallet,
              value: '20',
              blockNumber: 17
            }
          ],
          expectedBalanceBlocks: '1160'
        },
        {
          description: 'wallet with 2 negative transactions',
          startBlock: 10,
          endBlock: 20,
          startBalance: '100',
          transactions: [
            {
              from: wallet,
              to: otherWallet,
              value: '20',
              blockNumber: 15
            },
            {
              from: wallet,
              to: otherWallet,
              value: '20',
              blockNumber: 17
            }
          ],
          expectedBalanceBlocks: '840'
        },
        {
          description: 'when wallet has a transaction at #startBlock (it should already be factored into the start balance)',
          startBlock: 10,
          endBlock: 20,
          startBalance: '10',
          transactions: [
            {
              from: otherWallet,
              to: wallet,
              value: '10',
              blockNumber: 10
            },
            {
              from: otherWallet,
              to: wallet,
              value: '10',
              blockNumber: 15
            }
          ],
          expectedBalanceBlocks: '150'
        },
        {
          description: 'when there are transactions outside interval (endBlock is non-inclusive to avoid potential mistakes where it is re-applied next period, if next period startblock equals current period\'s endblock)',
          startBlock: 10,
          endBlock: 20,
          startBalance: '10',
          transactions: [
            {
              from: otherWallet,
              to: wallet,
              value: '10',
              blockNumber: 15
            },
            {
              from: otherWallet,
              to: wallet,
              value: '10',
              blockNumber: 20
            },
            {
              from: otherWallet,
              to: wallet,
              value: '10',
              blockNumber: 30
            }
          ],
          expectedBalanceBlocks: '150'
        },
        {
          description: 'simplified real-world example (https://etherscan.io/address/0xf7ca4ffecfd4e33ff5fbf612d9e3f09763ed2563)',
          startBlock: 5562950,
          endBlock: 5567818,
          startBalance: '0',
          transactions: [
            {
              from: otherWallet,
              to: wallet,
              value: '10000000000000000',
              blockNumber: 5562959
            },
            {
              from: otherWallet,
              to: wallet,
              value: '122138400000000000',
              blockNumber: 5567801
            },
            {
              from: otherWallet,
              to: wallet,
              value: '7633650000000000',
              blockNumber: 5567817
            }
          ],
          expectedBalanceBlocks: '50673986450000000000'
        },
        {
          description: 'outgoing transaction with gas costs',
          startBlock: 0,
          endBlock: 20,
          startBalance: '100',
          transactions: [
            {
              from: otherWallet,
              to: wallet,
              gasUsed: '2',
              gasPrice: '5',
              value: '100',
              blockNumber: 10
            },
            {
              from: wallet,
              to: thirdWallet,
              gasUsed: '2',
              gasPrice: '5',
              value: '50',
              blockNumber: 15
            }
          ],
          expectedBalanceBlocks: '2700'
        },
        {
          description: 'transactions without non-positive amount or gas used',
          startBlock: 0,
          endBlock: 10,
          startBalance: '100',
          transactions: [
            {
              from: otherWallet,
              to: wallet,
              gasUsed: undefined,
              gasPrice: '5',
              value: '0',
              blockNumber: 5
            },
            {
              from: otherWallet,
              to: wallet,
              gasUsed: undefined,
              gasPrice: '5',
              value: '-5',
              blockNumber: 10
            }
          ],
          expectedBalanceBlocks: '1000'
        },
        {
          description: 'when there are multiple transactions for wallet in same block',
          startBlock: 0,
          endBlock: 20,
          startBalance: '100',
          transactions: [
            {
              from: otherWallet,
              to: wallet,
              gasUsed: '2',
              gasPrice: '5',
              value: '50',
              blockNumber: 10
            },
            {
              from: otherWallet,
              to: wallet,
              gasUsed: '2',
              gasPrice: '5',
              value: '50',
              blockNumber: 10
            },
            {
              from: wallet,
              to: thirdWallet,
              gasUsed: '1',
              gasPrice: '5',
              value: '25',
              blockNumber: 15
            },
            {
              from: wallet,
              to: thirdWallet,
              gasUsed: '1',
              gasPrice: '5',
              value: '25',
              blockNumber: 15
            }
          ],
          expectedBalanceBlocks: '2700'
        },
        {
          description: 'when transactions are unsorted',
          startBlock: 10,
          endBlock: 20,
          startBalance: '100',
          transactions: [
            {
              from: otherWallet,
              to: wallet,
              value: '20',
              blockNumber: 15
            },
            {
              from: otherWallet,
              to: wallet,
              value: '20',
              blockNumber: 13
            },
            {
              from: otherWallet,
              to: wallet,
              value: '20',
              blockNumber: 19
            },
            {
              from: otherWallet,
              to: wallet,
              value: '20',
              blockNumber: 11
            }
          ],
          expectedBalanceBlocks: '1440'
        }
      ].forEach(({description, startBlock, endBlock, startBalance, transactions, expectedBalanceBlocks}) => {

        describe(description, () => {

          beforeEach(() => {
            result = calculateBalanceBlocks(wallet, startBlock, endBlock, startBalance, transactions);
          });

          it('calculates balance blocks as expected', () => {
            result.should.equal(expectedBalanceBlocks);
          });

        });

      });

    });

    describe('when transactions are not from sender, or to sender', () => {

      it('throws', () => {
        let error;
        try {
          const startBlock = 0;
          const endBlock = 20;
          const startBalance = 0;
          const transactions = [
            {
              from: thirdWallet,
              to: otherWallet,
              value: '20',
              blockNumber: 15
            },
            {
              from: otherWallet,
              to: thirdWallet,
              value: '20',
              blockNumber: 17
            }
          ];

          result = calculateBalanceBlocks(
            wallet, startBlock, endBlock, startBalance, transactions);
        } catch (err) {
          error = err;
        }
        error.should.exist;
        error.message.should.match(/wallet must either be the recipient or originator of the transaction/i);
      });

    });

  });

});