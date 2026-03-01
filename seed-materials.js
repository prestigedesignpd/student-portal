require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

// Define schema internally to avoid TS/CJS import issues
const courseSchema = new mongoose.Schema({
    courseCode: String,
    courseTitle: String,
    materials: [{
        title: String,
        type: String,
        url: String,
        size: String,
    }]
});

const Course = mongoose.models.Course || mongoose.model('Course', courseSchema);

mongoose.connect(MONGODB_URI).then(async () => {
    console.log("Connected to DB");

    try {
        const mockMaterials = [
            { title: 'Lecture 01 - Foundations & Architecture', type: 'PDF', url: '#', size: '2.4 MB' },
            { title: 'Session 02 - Practical Implementation', type: 'VIDEO', url: '#', size: '120 MB' },
            { title: 'Case Study: Industry Standards', type: 'PDF', url: '#', size: '1.5 MB' },
            { title: 'Technical Reference Guide', type: 'LINK', url: '#', size: 'External' },
        ];
        console.log(`Adding materials to all courses via native driver...`);
        const result = await mongoose.connection.db.collection('courses').updateMany({}, { $set: { materials: mockMaterials } });
        console.log(`SUCCESS: Updated ${result.modifiedCount} courses with materials.`);
    } catch (err) {
        console.error("ERROR:", err);
    }
    process.exit(0);
}).catch(console.error);
