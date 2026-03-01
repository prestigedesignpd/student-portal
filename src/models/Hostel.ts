import mongoose from 'mongoose';

const roomSchema = new mongoose.Schema({
    hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true },
    roomNumber: { type: String, required: true },
    capacity: { type: Number, required: true },
    occupants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    isAvailable: { type: Boolean, default: true },
    type: { type: String, enum: ['MALE', 'FEMALE'], required: true },
});

const hostelSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    location: { type: String, required: true },
    totalRooms: { type: Number, required: true },
    type: { type: String, enum: ['MALE', 'FEMALE'], required: true },
    price: { type: Number, required: true },
}, { timestamps: true });

export const Room = mongoose.models.Room || mongoose.model('Room', roomSchema);
export const Hostel = mongoose.models.Hostel || mongoose.model('Hostel', hostelSchema);
