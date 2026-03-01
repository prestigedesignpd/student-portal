const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '../.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

async function cleanupDuplicates() {
    try {
        await mongoose.connect(MONGODB_URI);
        const Enrollment = mongoose.model('Enrollment', new mongoose.Schema({}, { strict: false }), 'enrollments');

        const duplicatesFile = 'duplicates.json';
        if (!fs.existsSync(duplicatesFile)) {
            console.error('duplicates.json not found. Run find-duplicates-json.js first.');
            process.exit(1);
        }

        const duplicates = JSON.parse(fs.readFileSync(duplicatesFile, 'utf8'));
        let totalDeleted = 0;

        for (const group of duplicates) {
            // Sort by createdAt ascending to keep the earliest
            const docs = group.docs.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
            const keepId = docs[0]._id;
            const toDelete = docs.slice(1).map(d => d._id);

            console.log(`Processing Group: Student ${group._id.studentId}, Course ${group._id.courseId}`);
            console.log(`Keeping: ${keepId} (${docs[0].createdAt})`);
            console.log(`Deleting: ${toDelete.join(', ')}`);

            const result = await Enrollment.deleteMany({ _id: { $in: toDelete } });
            totalDeleted += result.deletedCount;
        }

        console.log(`\nDone. Total documents deleted: ${totalDeleted}`);
        await mongoose.disconnect();
    } catch (error) {
        console.error(error);
        process.exit(1);
    }
}

cleanupDuplicates();
