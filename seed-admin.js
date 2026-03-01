require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("MONGODB_URI is not defined");
    process.exit(1);
}

const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    role: { type: String, enum: ['STUDENT', 'STAFF', 'ADMIN'], default: 'STUDENT' },
    isActive: { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

async function seedAdmin() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to DB");

        // Clear existing admin if any
        await User.deleteMany({ username: 'ADMIN001' });

        const hashedPassword = await bcrypt.hash('adminpassword123', 10);

        await User.create({
            username: 'ADMIN001',
            email: 'admin@uni.edu',
            password: hashedPassword,
            firstName: 'Super',
            lastName: 'Admin',
            role: 'ADMIN',
        });

        console.log("SUCCESS: Admin user seeded with username ADMIN001 and password adminpassword123");
        process.exit(0);
    } catch (err) {
        console.error("ERROR:", err);
        process.exit(1);
    }
}

seedAdmin();
