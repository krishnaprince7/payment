// controllers/transaction.controller.js
import { Transaction } from "../modles/transaction.models.js";
import asyncHandler from "../utils/asynchandler.js";
import { User } from "../modles/users.models.js";
import mongoose from "mongoose";
import { Counter } from "../modles/Counter.model.js"; 

// Get both SENT and RECEIVED transactions in one API
export const getAllTransactions = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Fetch both in parallel for better performance
  const [sentTransactions, receivedTransactions] = await Promise.all([
    Transaction.find({ sender: userId }).sort({ createdAt: -1 }),
    Transaction.find({ recipient: userId }).sort({ createdAt: -1 })
  ]);

  res.status(200).json({
    success: true,
    sent: {
      count: sentTransactions.length,
      transactions: sentTransactions.map(tx => ({
        sNo: tx.sNo,
        id: tx._id,
        recipient: tx.recipientName,
        amount: tx.amount,
        note: tx.note,
        date: tx.createdAt,
        balanceAfter: tx.senderBalanceAfter
      }))
    },
    received: {
      count: receivedTransactions.length,
      transactions: receivedTransactions.map(tx => ({
        sNo: tx.sNo,
        id: tx._id,
        sender: tx.senderName,
        amount: tx.amount,
        note: tx.note,
        date: tx.createdAt,
        balanceAfter: tx.recipientBalanceAfter
      }))
    }
  });
});


export const getReceivedTransactionCount = asyncHandler(async (req, res) => {
  const userId = req.user._id;

  // Count only received transactions
  const receivedCount = await Transaction.countDocuments({ recipient: userId });

  res.status(200).json({
    success: true,
    received: receivedCount
  });
});

// Function to assign sNo before saving a transaction
export const assignTransactionSerial = async () => {
  const counter = await Counter.findOneAndUpdate(
    { id: "transaction" },
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  );
  return counter.seq;
};


export const confirmTransfer = asyncHandler(async (req, res) => {
  const { amount, recipientId, password, note } = req.body;
  const senderId = req.user._id;

  // Convert amount to number
  const amt = Number(amount);

  // Validate all fields
  if (!amt || !recipientId || !password) {
    return res.status(400).json({
      success: false,
      error: "Amount, recipient, and password are required"
    });
  }

  if (isNaN(amt) || amt <= 0) {
    return res.status(400).json({
      success: false,
      error: "Invalid amount"
    });
  }

  // Find users with only necessary fields
  const sender = await User.findById(senderId).select('name balance password');
  const recipient = await User.findById(recipientId).select('name balance');

  if (!sender || !recipient) {
    return res.status(404).json({
      success: false,
      error: "Sender or recipient not found"
    });
  }

  // Verify password
  const isPasswordCorrect = await sender.isPasswordCorrect(password);
  if (!isPasswordCorrect) {
    return res.status(401).json({
      success: false,
      error: "Wrong password. Try again."
    });
  }

  // Check balance
  if (sender.balance < amt) {
    return res.status(400).json({
      success: false,
      error: "Insufficient balance"
    });
  }

  // Update balances
  const senderNewBalance = Number(sender.balance) - amt;
  const recipientNewBalance = Number(recipient.balance) + amt;

  const counter = await Counter.findOneAndUpdate(
  { id: "transaction" },
  { $inc: { seq: 1 } },
  { new: true, upsert: true }
);
  // Create transaction record with names
 const transaction = new Transaction({
   sNo: counter.seq,
  sender: sender._id,
  senderName: sender.name,  // Will now save properly
  recipient: recipient._id,
  recipientName: recipient.name,  // Will now save properly
  amount: amt,
  fee: 0,
  note: note || undefined,
  senderBalanceAfter: senderNewBalance,
  recipientBalanceAfter: recipientNewBalance
});

  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    sender.balance = senderNewBalance;
    recipient.balance = recipientNewBalance;

    await sender.save({ session });
    await recipient.save({ session });
    await transaction.save({ session });

    await session.commitTransaction();

    res.status(200).json({
      success: true,
      message: `Money sent successfully to ${recipient.name}!`,
      data: {
        amount: amt,
        newBalance: sender.balance,
        recipient: recipient.name,
        transactionId: transaction._id
      }
    });
  } catch (err) {
    await session.abortTransaction();
    console.error("Transfer error:", err);
    return res.status(500).json({
      success: false,
      error: "Failed to complete transfer, please try again"
    });
  } finally {
    session.endSession();
  }
});

