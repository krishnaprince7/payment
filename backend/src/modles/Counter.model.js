// models/Counter.model.js
import mongoose from "mongoose";

const counterSchema = new mongoose.Schema({
  id: { type: String, required: true }, // like "transaction"
  seq: { type: Number, default: 0 },
});

export const Counter = mongoose.model("Counter", counterSchema);
