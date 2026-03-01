import mongoose from 'mongoose';

const feeSchema = new mongoose.Schema({
    type: {
        type: String,
        required: true,
        unique: true,
        enum: ['TUITION', 'ACCOMMODATION', 'LIBRARY', 'SPORTS', 'TRANSCRIPT', 'GRADUATION', 'OTHER']
    },
    title: { type: String, required: true },
    baseAmount: { type: Number, required: true },
    description: { type: String },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

export default mongoose.models.Fee || mongoose.model('Fee', feeSchema);
