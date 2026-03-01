import mongoose from 'mongoose';

const enrollmentSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    semester: { type: String, enum: ['FIRST', 'SECOND'], required: true },
    academicYear: { type: String, required: true },
    grade: { type: String, enum: ['A', 'B', 'C', 'D', 'E', 'F', 'NG'], default: 'NG' },
    gradePoint: { type: Number, default: 0 },
    isCompleted: { type: Boolean, default: false },
    status: { type: String, enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING' },
    midtermScore: { type: Number, min: 0, max: 40, default: 0 },
    finalScore: { type: Number, min: 0, max: 60, default: 0 },
    totalScore: { type: Number, min: 0, max: 100, default: 0 },
    attendanceStatus: { type: String, enum: ['PRESENT', 'ABSENT'], default: 'PRESENT' },
    gradeUploadedAt: { type: Date },
    studentReview: {
        rating: { type: String, enum: ['POOR', 'FAIR', 'GOOD', 'EXCELLENT'] },
        comment: { type: String }
    },
    complaint: {
        message: { type: String },
        status: { type: String, enum: ['PENDING', 'RESOLVED', 'REJECTED'] },
        createdAt: { type: Date }
    }
}, { timestamps: true });

export default mongoose.models.Enrollment || mongoose.model('Enrollment', enrollmentSchema);
