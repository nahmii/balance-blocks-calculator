'use strict';
const BN = require('bn.js');

const calculateBalanceBlocks = (wallet, startBlock, endBlock, startBalance, transactions) => {
  let currentBlock = startBlock;
  let balanceBN = new BN(startBalance);

  const balanceBlockParts = [];
  let holdingPeriodBN;
  let gasCostBN;

  if (transactions) {
    mergeTransactions(transactions)
      .filter(tx => tx.blockNumber > startBlock && tx.blockNumber < endBlock)
      .filter(tx => (new BN(tx.value).gt(new BN('0')) || (new BN(tx.gasCost).gt(new BN('0')))))
      .forEach(tx => {
        holdingPeriodBN = new BN(tx.blockNumber - currentBlock);
        balanceBlockParts.push(balanceBN.mul(holdingPeriodBN));

        currentBlock = tx.blockNumber;
        if (tx.to.toLowerCase() === wallet.toLowerCase()) {
          balanceBN = balanceBN.add(new BN(tx.value));
        } else if (tx.from.toLowerCase() === wallet.toLowerCase()) {
          gasCostBN = (new BN(tx.gasCost));
          balanceBN = balanceBN.sub(new BN(tx.value)).sub(gasCostBN);
        } else {
          throw new Error('Wallet must either be the recipient or originator of the transaction.');
        }
      });
  }

  holdingPeriodBN = new BN(endBlock - currentBlock);
  balanceBlockParts.push(balanceBN.mul(holdingPeriodBN));

  return balanceBlockParts.reduce(
    (prev, curr) => prev.add(curr),
    new BN(0)).toString();
};

// Merges multiple transactions from the same block, with
// the same sender and recipient, into one transaction,
// and calculates the total transaction cost.
const mergeTransactions = transactions => {
  const map = new Map();

  transactions.forEach(tx => {
    const key = `${tx.from}/${tx.to}/${tx.blockNumber}`;

    if (!map.has(key)) {
      map.set(key, { gasCost: new BN('0'), value: new BN('0')
      });
    }

    const {gasCost, value} = map.get(key);
    const txGasCost = (new BN(tx.gasUsed)).mul(new BN(tx.gasPrice));

    map.set(key, {
      gasCost: gasCost.add(txGasCost),
      value: value.add(new BN(tx.value))
    });
  });

  return convertToTxArray(map);
};

const convertToTxArray = map => {
  const result = [];
  for (const [key, val] of map) {
    const [from, to, blockNumber] = key.split('/');
    const {gasCost, value} = val;
    result.push({
      from: from,
      to: to,
      gasCost: gasCost.toString(),
      value: value.toString(),
      blockNumber: blockNumber
    });
  }
  return result;
};

module.exports = {
  calculateBalanceBlocks
};
