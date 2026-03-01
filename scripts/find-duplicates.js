const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error('MONGODB_URI not found in .env.local');
    process.exit(1);
}

async function findDuplicates() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

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
                    ids: { $push: '$_id' }
                }
            },
            {
                $match: {
                    count: { $gt: 1 }
                }
            }
        ]);

        if (duplicates.length === 0) {
            console.log('No duplicates found.');
        } else {
            console.log(`Found ${duplicates.length} sets of duplicates:`);
            duplicates.forEach((group, index) => {
                console.log(`\nGroup ${index + 1}:`);
                console.log(`Student ID: ${group._id.studentId}`);
                console.log(`Course ID: ${group._id.courseId}`);
                console.log(`Year: ${group._id.academicYear}, Semester: ${group._id.semester}`);
                console.log(`Entries: ${group.count}`);
                console.log(`IDs: ${group.ids.join(', ')}`);
            });
        }

        await mongoose.disconnect();
    } catch (error) {
        console.error('Error finding duplicates:', error);
        process.exit(1);
    }
}

findDuplicates();
