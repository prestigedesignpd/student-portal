import mongoose from 'mongoose';

const messageSchema = new mongoose.Schema({
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional, null could mean "Admin Support"
    isAdminSupport: { type: Boolean, default: false },
    subject: { type: String },
    content: { type: String, required: true },
    isRead: { type: Boolean, default: false },
    attachmentUrl: { type: String },
    threadId: { type: String }, // For grouping messages into conversations
    isInternal: { type: Boolean, default: false }, // For admin-only notes on a ticket
}, { timestamps: true });

const Message = mongoose.models.Message || mongoose.model('Message', messageSchema);
export default Message;
