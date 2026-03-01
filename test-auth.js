const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI;

async function test() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to DB");

        const userSchema = new mongoose.Schema({
            username: String,
            password: { type: String, required: true },
        });

        const User = mongoose.models.User || mongoose.model('User', userSchema);

        const username = 'STU001';
        const password = 'password123';

        const user = await User.findOne({ username }).lean();
        console.log("User found:", !!user);

        if (user) {
            console.log("Hashed password from DB:", user.password);
            const isValid = await bcrypt.compare(password, user.password);
            console.log("Password is valid:", isValid);
        }

        process.exit(0);
    } catch (err) {
        console.error("ERROR:", err);
        process.exit(1);
    }
}

test();
