const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const messageSchema = new Schema({
    sender: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    receiver: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true
    },
    booking: {
        type: Schema.Types.ObjectId,
        ref: "Booking",
        required: true
    },
    content: {
        type: String,
        required: true,
        maxlength: 1000
    },
    isRead: {
        type: Boolean,
        default: false
    },
    readAt: {
        type: Date
    },
    // Create conversation thread between two users for a booking
    conversationId: {
        type: String,
        required: true
    }
}, {
    timestamps: true
});

// Index for efficient queries
messageSchema.index({ conversationId: 1, createdAt: 1 });
messageSchema.index({ receiver: 1, isRead: 1 });
messageSchema.index({ booking: 1 });

// Virtual for conversation participants (sorted for consistent conversation ID)
messageSchema.virtual('participants').get(function() {
    const participants = [this.sender.toString(), this.receiver.toString()].sort();
    return participants;
});

// Static method to generate conversation ID
messageSchema.statics.generateConversationId = function(senderId, receiverId, bookingId) {
    const participants = [senderId.toString(), receiverId.toString()].sort();
    return `${participants[0]}_${participants[1]}_${bookingId}`;
};

// Pre-save middleware to set conversation ID
messageSchema.pre('save', function(next) {
    if (!this.conversationId) {
        this.conversationId = this.constructor.generateConversationId(
            this.sender,
            this.receiver,
            this.booking
        );
    }
    next();
});

const Message = mongoose.model("Message", messageSchema);
module.exports = Message;
