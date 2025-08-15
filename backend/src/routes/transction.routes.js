import express from "express";
import { verifyToken } from "../middlewares/verifyToken.js";
import { confirmTransfer } from "../controler/transfer.controller.js";
// import { getSentTransactions } from "../controler/transfer.controller.js";
import { getAllTransactions, getReceivedTransactionCount } from "../controler/transfer.controller.js";

const router = express.Router();


// router.get("/sendmoney", verifyToken, getSentTransactions);
router.get("/transactions", verifyToken, getAllTransactions);
router.get("/count", verifyToken, getReceivedTransactionCount);
router.post("/password", verifyToken, confirmTransfer);


export default router;