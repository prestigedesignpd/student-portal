import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    matricNumber: { type: String, required: true, unique: true },
    department: { type: String, required: true },
    level: { type: Number, required: true },
    currentCgpa: { type: Number, default: 0.0 },
    totalCredits: { type: Number, default: 0 },
    dateOfBirth: { type: Date },
    admissionDate: { type: Date, default: Date.now },
    graduationDate: { type: Date },
    hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel' },
    roomId: { type: mongoose.Schema.Types.ObjectId, ref: 'Room' },
}, { timestamps: true });

export default mongoose.models.Student || mongoose.model('Student', studentSchema);
