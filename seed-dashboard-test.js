require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI).then(async () => {
    console.log("Connected to DB");

    // Clear and find student
    const student = await mongoose.connection.db.collection('students').findOne({ matricNumber: 'STU/26/7289' });
    if (!student) {
        console.error("Student not found!");
        process.exit(1);
    }

    const studentId = student._id;

    // 1. Create Pending Payment
    console.log("Creating pending payment...");
    await mongoose.connection.db.collection('payments').insertOne({
        reference: 'REF-' + Math.random().toString(36).substring(7).toUpperCase(),
        studentId: studentId,
        amount: 150000,
        feeType: 'ACCOMMODATION',
        status: 'PENDING',
        createdAt: new Date(),
        updatedAt: new Date()
    });

    // 2. Create Active Enrollments (Approved but not completed)
    console.log("Creating active enrollments...");
    const courses = await mongoose.connection.db.collection('courses').find({ level: 100, semester: 'FIRST' }).limit(3).toArray();

    for (const course of courses) {
        await mongoose.connection.db.collection('enrollments').insertOne({
            studentId: studentId,
            courseId: course._id,
            semester: 'FIRST',
            academicYear: '2025/2026',
            status: 'APPROVED',
            isCompleted: false,
            grade: 'NG',
            gradePoint: 0,
            midtermScore: 0,
            finalScore: 0,
            totalScore: 0,
            createdAt: new Date(),
            updatedAt: new Date()
        });
    }

    console.log("SUCCESS: Dashboard test data seeded.");
    process.exit(0);
}).catch(console.error);
