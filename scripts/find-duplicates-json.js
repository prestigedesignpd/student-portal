const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

async function findDuplicates() {
    try {
        await mongoose.connect(MONGODB_URI);
        const Enrollment = mongoose.model('Enrollment', new mongoose.Schema({}, { strict: false }), 'enrollments');

        const duplicates = await Enrollment.aggregate([
            {
                $group: {
                    _id: {
                        studentId: '$studentId',
                        courseId: '$courseId',
                        academicYear: '$academicYear',
                        semester: '$semester'
                    },
                    count: { $sum: 1 },
                    docs: { $push: '$$ROOT' }
                }
            },
            {
                $match: {
                    count: { $gt: 1 }
                }
            }
        ]);

        fs.writeFileSync('duplicates.json', JSON.stringify(duplicates, null, 2));
        console.log(`Found ${duplicates.length} duplicate groups. Saved to duplicates.json`);
        await mongoose.disconnect();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

findDuplicates();
