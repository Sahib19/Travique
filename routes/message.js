const express = require("express");
const router = express.Router();
const wrapAsync = require("../utils/wrapAsync.js");
const { isLoggedIn } = require("../middleware.js");

// Import message controller
const messageController = require("../Controllers/message.js");

// Message routes

// Send a message for a specific booking
router.post("/booking/:bookingId/send", isLoggedIn, wrapAsync(messageController.sendMessage));

// Get conversation for a specific booking
router.get("/booking/:bookingId/conversation", isLoggedIn, wrapAsync(messageController.getConversation));

// Mark messages as read for a booking
router.post("/booking/:bookingId/mark-read", isLoggedIn, wrapAsync(messageController.markAsRead));

// Get unread message count for current user
router.get("/unread-count", isLoggedIn, wrapAsync(messageController.getUnreadCount));

module.exports = router;
