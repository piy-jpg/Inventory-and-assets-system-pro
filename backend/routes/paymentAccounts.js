const express = require('express');
const PaymentAccount = require('../models/PaymentAccount');
const PaymentAccountTransaction = require('../models/PaymentAccountTransaction');
const { authMiddleware } = require('../config/auth');
const { getCurrentUserId } = require('../utils/getCurrentUser');

const router = express.Router();

const sanitizeAccount = (account) => {
  if (!account) return account;
  const data = account.toObject ? account.toObject() : account;
  return {
    ...data,
    current_balance: data.current_balance ?? data.balance ?? data.opening_balance ?? 0,
  };
};

router.get('/', authMiddleware, async (req, res, next) => {
  try {
    const accounts = await PaymentAccount.find().sort({ createdAt: -1 });
    const latestTransactions = await PaymentAccountTransaction.find()
      .sort({ transaction_date: -1 })
      .populate('account', 'name')
      .limit(200);

    const lastTransactionByAccount = latestTransactions.reduce((acc, transaction) => {
      const key = String(transaction.account?._id || transaction.account);
      if (!key || acc[key]) return acc;
      acc[key] = {
        _id: transaction._id,
        transaction_type: transaction.transaction_type,
        amount: transaction.amount,
        description: transaction.description,
        date: transaction.transaction_date,
      };
      return acc;
    }, {});

    res.json({
      success: true,
      data: {
        accounts: accounts.map((account) => ({
          ...sanitizeAccount(account),
          last_transaction: lastTransactionByAccount[String(account._id)] || null,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/', authMiddleware, async (req, res, next) => {
  try {
    const currentUserId = await getCurrentUserId(req.user);
    if (!currentUserId) {
      return res.status(401).json({ success: false, message: 'Authenticated user not found' });
    }

    const account = new PaymentAccount({ ...req.body, created_by: currentUserId });
    account.balance = Number(account.opening_balance || 0);
    await account.save();

    const io = req.app.get('io');
    io.emit('payment-account-updated', {
      type: 'created',
      data: sanitizeAccount(account),
    });

    res.status(201).json({
      success: true,
      data: { account: sanitizeAccount(account) },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/transactions', authMiddleware, async (req, res, next) => {
  try {
    const { startDate, endDate, accountId } = req.query;
    const filter = {};

    if (accountId) {
      filter.$or = [{ account: accountId }, { related_account: accountId }];
    }

    if (startDate || endDate) {
      filter.transaction_date = {};
      if (startDate) filter.transaction_date.$gte = new Date(startDate);
      if (endDate) {
        const inclusiveEnd = new Date(endDate);
        inclusiveEnd.setHours(23, 59, 59, 999);
        filter.transaction_date.$lte = inclusiveEnd;
      }
    }

    const transactions = await PaymentAccountTransaction.find(filter)
      .populate('account', 'name account_type')
      .populate('related_account', 'name account_type')
      .sort({ transaction_date: -1 });

    res.json({
      success: true,
      data: { transactions },
    });
  } catch (error) {
    next(error);
  }
});

router.post('/transactions', authMiddleware, async (req, res, next) => {
  try {
    const currentUserId = await getCurrentUserId(req.user);
    if (!currentUserId) {
      return res.status(401).json({ success: false, message: 'Authenticated user not found' });
    }

    const {
      from_account,
      to_account,
      amount,
      transaction_type,
      description,
      transaction_date,
    } = req.body;

    const numericAmount = Number(amount);
    if (!numericAmount || numericAmount <= 0) {
      return res.status(400).json({
        success: false,
        message: 'Amount must be greater than zero.',
      });
    }

    const sourceAccount = await PaymentAccount.findById(from_account);
    if (!sourceAccount) {
      return res.status(404).json({
        success: false,
        message: 'Source account not found.',
      });
    }

    if (sourceAccount.status !== 'active') {
      return res.status(400).json({
        success: false,
        message: 'Source account is not active.',
      });
    }

    let destinationAccount = null;
    if (transaction_type === 'transfer') {
      if (!to_account || to_account === from_account) {
        return res.status(400).json({
          success: false,
          message: 'Transfer requires a different destination account.',
        });
      }

      destinationAccount = await PaymentAccount.findById(to_account);
      if (!destinationAccount) {
        return res.status(404).json({
          success: false,
          message: 'Destination account not found.',
        });
      }

      if (destinationAccount.status !== 'active') {
        return res.status(400).json({
          success: false,
          message: 'Destination account is not active.',
        });
      }
    }

    if ((transaction_type === 'withdraw' || transaction_type === 'transfer') && sourceAccount.balance < numericAmount) {
      return res.status(400).json({
        success: false,
        message: 'Insufficient balance for this transaction.',
      });
    }

    if (transaction_type === 'deposit') {
      sourceAccount.balance += numericAmount;
    } else if (transaction_type === 'withdraw') {
      sourceAccount.balance -= numericAmount;
    } else if (transaction_type === 'transfer') {
      sourceAccount.balance -= numericAmount;
      destinationAccount.balance += numericAmount;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Unsupported transaction type.',
      });
    }

    await sourceAccount.save();
    if (destinationAccount) await destinationAccount.save();

    const transaction = await PaymentAccountTransaction.create({
      account: sourceAccount._id,
      related_account: destinationAccount?._id,
      amount: numericAmount,
      transaction_type,
      description,
      transaction_date: transaction_date ? new Date(transaction_date) : new Date(),
      created_by: currentUserId,
    });

    const populatedTransaction = await PaymentAccountTransaction.findById(transaction._id)
      .populate('account', 'name account_type')
      .populate('related_account', 'name account_type');

    const io = req.app.get('io');
    io.emit('payment-transaction-created', {
      type: 'created',
      data: populatedTransaction,
    });
    io.emit('payment-account-updated', {
      type: 'balance-updated',
      data: {
        accounts: [sanitizeAccount(sourceAccount), sanitizeAccount(destinationAccount)].filter(Boolean),
      },
    });

    res.status(201).json({
      success: true,
      data: { transaction: populatedTransaction },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
