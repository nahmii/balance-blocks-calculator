# Nahmii Balance Blocks Calculator

This module contains logics to calculates the numeric value of the area under the curve (AUC) of balance as function of block number, in this context referred to as _balance blocks_.

```JavaScript
const transactions = [
    {
        from: '0x0000000000000000000000000000000000c0ffee',
        to: '0x00000000000000000000000000000000DeaDBeef',
        value: '20',
        blockNumber: 10_123_456
    },
    {
        from: '0x00000000000000000000000000000000DeaDBeef',
        to: '0x00000000000000000000000000000000000c0c0a',
        value: '10',
        blockNumber: 10_456_789
    }
]

const balanceBlocks = calculateBalanceBlocks(
    '0x00000000000000000000000000000000DeaDBeef', // Wallet/account address
    10_000_000,                                   // Start block (inclusive)
    11_000_000,                                   // End block (non-inclusive)
    1_000,                                        // Start balance
    transactions                                  // Set of transactions
);
```

Note: `endBlock` is non-inclusive. This is to avoid potential mistakes where the `endBlock` will be included twice (As
the last block in one period, and the first block in the next). The default in Ethereum is that `endBlock` is inclusive
when querying logs and transactions.