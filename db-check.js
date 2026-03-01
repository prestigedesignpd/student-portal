require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

mongoose.connect(MONGODB_URI).then(async () => {
    console.log("Connected to DB");
    const count = await mongoose.connection.db.collection('courses').countDocuments();
    console.log("Course count:", count);
    process.exit(0);
}).catch(console.error);
