import mongoose, { Schema, Document } from 'mongoose'

export interface INotification extends Document {
    title: string;
    message: string;
    type: 'INFO' | 'WARNING' | 'URGENT' | 'FINANCIAL';
    isGlobal: boolean;
    recipientId?: mongoose.Types.ObjectId;
    targetDepartment?: string;
    targetLevel?: number;
    readBy: mongoose.Types.ObjectId[];
    createdAt: Date;
    updatedAt: Date;
}

const NotificationSchema: Schema = new Schema({
    title: { type: String, required: true },
    message: { type: String, required: true },
    type: { type: String, enum: ['INFO', 'WARNING', 'URGENT', 'FINANCIAL'], default: 'INFO' },
    isGlobal: { type: Boolean, default: false },
    userId: { type: Schema.Types.ObjectId, ref: 'User' },
    targetDepartment: { type: String },
    targetLevel: { type: Number },
    readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }]
}, { timestamps: true })

if (mongoose.models.Notification) {
    delete (mongoose.connection.models as any).Notification
    delete (mongoose.models as any).Notification
}

export default mongoose.models.Notification || mongoose.model<INotification>('Notification', NotificationSchema)
