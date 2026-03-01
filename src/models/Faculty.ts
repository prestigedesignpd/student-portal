import mongoose from 'mongoose';

const facultySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true }, // e.g., 'SCI' for Science
}, { timestamps: true });

export default mongoose.models.Faculty || mongoose.model('Faculty', facultySchema);
