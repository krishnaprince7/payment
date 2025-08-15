import asyncHandler from "../utils/asynchandler.js";
import { Notification } from "../modles/notifiaction.models.js";

// @desc    Get all notifications for logged-in user
// @route   GET /api/notifications
// @access  Private
export const getNotifications = asyncHandler(async (req, res) => {
  const notifications = await Notification.find({
    recipient: req.user._id
  })
    .sort({ createdAt: -1 }) // Newest first
    .populate("sender", "name email")
    .limit(50);

  res.status(200).json({
    success: true,
    count: notifications.length,
    data: notifications
  });
});

// @desc    Create a new notification
// @access  Private (internal use)
export const createMoneyReceivedNotification = asyncHandler(
  async ({ recipientId, senderId, amount }) => {
    if (!recipientId || !senderId || typeof amount !== "number" || amount <= 0) {
      throw new Error("Missing or invalid notification fields");
    }

    const notification = await Notification.create({
      recipient: recipientId,
      sender: senderId,
      amount
    });

    return notification;
  }
);

// @desc    Example: Use after successful money transfer
export const handleSuccessfulTransfer = asyncHandler(
  async (sender, recipient, amt) => {
    await createMoneyReceivedNotification({
      recipientId: recipient._id,
      senderId: sender._id,
      amount: amt
    });
  }
);

// @desc    Clear all notifications for logged-in user
// @route   DELETE /api/notifications
// @access  Private
export const clearNotifications = asyncHandler(async (req, res) => {
  await Notification.deleteMany({ recipient: req.user._id });

  res.status(200).json({
    success: true,
    message: "All notifications cleared",
    data: []
  });
});
