import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
    reference: { type: String, required: true, unique: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    amount: { type: Number, required: true },
    feeType: { type: String, enum: ['TUITION', 'ACCOMMODATION', 'LIBRARY', 'SPORTS', 'TRANSCRIPT', 'GRADUATION', 'OTHER'], required: true },
    status: { type: String, enum: ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED', 'VERIFIED'], default: 'PENDING' },
    paymentMethod: { type: String },
    transactionId: { type: String },
    paidAt: { type: Date },
}, { timestamps: true });

export default mongoose.models.Payment || mongoose.model('Payment', paymentSchema);
