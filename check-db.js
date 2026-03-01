require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI).then(async () => {
    console.log("Connected to DB");

    const allStudents = await mongoose.connection.db.collection('students').find({}).toArray();

    if (allStudents.length > 0) {
        const student = allStudents[0];
        console.log(`Student: ${student.matricNumber}, currentCgpa: ${student.currentCgpa}, totalCredits: ${student.totalCredits}`);

        // Check fees
        const allFees = await mongoose.connection.db.collection('fees').find({}).toArray();
        console.log("All Fees defined in system:", allFees.map(f => ({ type: f.type, amount: f.amount })));

        const payments = await mongoose.connection.db.collection('payments').find({ studentId: student._id }).toArray();
        console.log("Payments for student:", payments.map(p => ({ type: p.feeType, status: p.status, amount: p.amount })));
    } else {
        console.log("No students found.");
    }

    process.exit(0);
}).catch(console.error);
