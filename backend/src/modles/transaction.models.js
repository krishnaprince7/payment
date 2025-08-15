import mongoose from "mongoose";

const transactionSchema = new mongoose.Schema({
   sNo: { type: Number, required: true },
 sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  senderName: {  // ← Add this
    type: String,
    required: true
  },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  recipientName: {  // ← Add this
    type: String,
    required: true
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  fee: {
    type: Number,
    default: 0
  },
  note: {
    type: String,
    trim: true,
    maxlength: 200
  },
  senderBalanceAfter: Number,
  recipientBalanceAfter: Number,
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  // Prevent duplicate transactions in quick succession
  timestamps: true,
  optimisticConcurrency: true
});

export const Transaction = mongoose.model("Transaction", transactionSchema);