import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema({
    courseCode: { type: String, required: true, unique: true },
    courseTitle: { type: String, required: true },
    creditUnits: { type: Number, required: true },
    level: { type: Number, required: true },
    semester: { type: String, enum: ['FIRST', 'SECOND'], required: true },
    department: { type: String, required: true },
    isElective: { type: Boolean, default: false },
    materials: [{
        title: { type: String, required: true },
        type: { type: String, enum: ['PDF', 'VIDEO', 'LINK', 'DOC'], required: true },
        url: { type: String, required: true },
        size: { type: String }, // e.g., '2.4 MB'
    }],
    prerequisites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
}, { timestamps: true });

export default mongoose.models.Course || mongoose.model('Course', courseSchema);
