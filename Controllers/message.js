const Message = require("../models/message");
const Booking = require("../models/booking");
const User = require("../models/user");

// Send a message
module.exports.sendMessage = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const { content } = req.body;
        const senderId = req.user._id;

        // Get booking details
        const booking = await Booking.findById(bookingId)
            .populate('guest')
            .populate('host');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        // Check if user is participant in this booking
        const isParticipant = booking.guest._id.toString() === senderId.toString() ||
                             booking.host._id.toString() === senderId.toString();

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: "You don't have permission to send messages for this booking"
            });
        }

        // Determine receiver (the other participant)
        const receiverId = booking.guest._id.toString() === senderId.toString()
            ? booking.host._id
            : booking.guest._id;

        // Create message
        const message = new Message({
            sender: senderId,
            receiver: receiverId,
            booking: bookingId,
            content: content,
            conversationId: Message.generateConversationId(senderId, receiverId, bookingId)
        });

        await message.save();

        // Populate sender info for response
        await message.populate('sender', 'username profile.firstName profile.lastName');

        res.json({
            success: true,
            message: message,
            conversationId: message.conversationId
        });

    } catch (error) {
        console.error("Error sending message:", error);
        res.status(500).json({
            success: false,
            message: "Failed to send message"
        });
    }
};

// Get conversation messages
module.exports.getConversation = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const userId = req.user._id;

        // Get booking details
        const booking = await Booking.findById(bookingId)
            .populate('guest')
            .populate('host');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        // Check if user is participant in this booking
        const isParticipant = booking.guest._id.toString() === userId.toString() ||
                             booking.host._id.toString() === userId.toString();

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: "You don't have permission to view messages for this booking"
            });
        }

        // Determine other participant
        const otherParticipantId = booking.guest._id.toString() === userId.toString()
            ? booking.host._id
            : booking.guest._id;

        const conversationId = Message.generateConversationId(userId, otherParticipantId, bookingId);

        // Get all messages in conversation
        const messages = await Message.find({ conversationId })
            .populate('sender', 'username profile.firstName profile.lastName')
            .sort({ createdAt: 1 });

        // Mark messages as read
        await Message.updateMany(
            { conversationId, receiver: userId, isRead: false },
            { isRead: true, readAt: new Date() }
        );

        // Get unread count for current user
        const unreadCount = await Message.countDocuments({
            conversationId,
            receiver: userId,
            isRead: false
        });

        res.json({
            success: true,
            messages: messages,
            booking: {
                id: booking._id,
                title: booking.listing.title,
                otherParticipant: otherParticipantId === booking.host._id.toString()
                    ? { id: booking.host._id, username: booking.host.username, name: `${booking.host.profile?.firstName || ''} ${booking.host.profile?.lastName || booking.host.username}`.trim() }
                    : { id: booking.guest._id, username: booking.guest.username, name: `${booking.guest.profile?.firstName || ''} ${booking.guest.profile?.lastName || booking.guest.username}`.trim() }
            },
            unreadCount: unreadCount
        });

    } catch (error) {
        console.error("Error getting conversation:", error);
        res.status(500).json({
            success: false,
            message: "Failed to load conversation"
        });
    }
};

// Get unread message count for user
module.exports.getUnreadCount = async (req, res) => {
    try {
        const userId = req.user._id;

        const unreadCount = await Message.countDocuments({
            receiver: userId,
            isRead: false
        });

        res.json({
            success: true,
            unreadCount: unreadCount
        });

    } catch (error) {
        console.error("Error getting unread count:", error);
        res.status(500).json({
            success: false,
            message: "Failed to get unread count"
        });
    }
};

// Mark conversation as read
module.exports.markAsRead = async (req, res) => {
    try {
        const { bookingId } = req.params;
        const userId = req.user._id;

        // Get booking details
        const booking = await Booking.findById(bookingId)
            .populate('guest')
            .populate('host');

        if (!booking) {
            return res.status(404).json({
                success: false,
                message: "Booking not found"
            });
        }

        // Check if user is participant
        const isParticipant = booking.guest._id.toString() === userId.toString() ||
                             booking.host._id.toString() === userId.toString();

        if (!isParticipant) {
            return res.status(403).json({
                success: false,
                message: "You don't have permission to mark messages as read"
            });
        }

        // Determine other participant
        const otherParticipantId = booking.guest._id.toString() === userId.toString()
            ? booking.host._id
            : booking.guest._id;

        const conversationId = Message.generateConversationId(userId, otherParticipantId, bookingId);

        // Mark messages as read
        const result = await Message.updateMany(
            { conversationId, receiver: userId, isRead: false },
            { isRead: true, readAt: new Date() }
        );

        res.json({
            success: true,
            markedCount: result.modifiedCount
        });

    } catch (error) {
        console.error("Error marking messages as read:", error);
        res.status(500).json({
            success: false,
            message: "Failed to mark messages as read"
        });
    }
};
