import express from "express";
import { getNotifications } from "../controler/notification.controler.js";
import { clearNotifications } from "../controler/notification.controler.js";
import { createMoneyReceivedNotification } from "../controler/notification.controler.js";
import { verifyToken } from "../middlewares/verifyToken.js";

const router = express.Router();



router.get("/notification", verifyToken, getNotifications);
router.get("/moneynotification", verifyToken, createMoneyReceivedNotification)


router.delete("/clearnotification", verifyToken, clearNotifications);





export default router;