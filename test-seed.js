require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI).then(async () => {
    console.log("Connected to DB");

    const User = require('./src/models/User').default || require('./src/models/User');
    const Student = require('./src/models/Student').default || require('./src/models/Student');

    try {
        // Clear existing test data
        await User.deleteMany({ username: 'STU001' });
        await Student.deleteMany({ matricNumber: 'STU001' });

        const user = await User.create({
            username: 'STU001',
            email: 'test@uni.edu',
            password: 'password123',
            firstName: 'Test',
            lastName: 'User',
            role: 'STUDENT',
        });

        await Student.create({
            userId: user._id,
            matricNumber: 'STU001',
            department: 'Computer Science',
            level: 100,
        });

        console.log("SUCCESS: Test user seeded with matric STU001 and password password123");
    } catch (err) {
        console.error("ERROR:", err);
    }
    process.exit(0);
}).catch(console.error);
