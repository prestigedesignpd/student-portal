import mongoose from 'mongoose';

const departmentSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true }, // e.g., 'CSC' for Computer Science
    facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
}, { timestamps: true });

export default mongoose.models.Department || mongoose.model('Department', departmentSchema);
