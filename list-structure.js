const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

async function listStructure() {
    try {
        await mongoose.connect(MONGODB_URI);
        const Faculty = mongoose.model('Faculty', new mongoose.Schema({ name: String, code: String }));
        const Department = mongoose.model('Department', new mongoose.Schema({ name: String, code: String, facultyId: mongoose.Schema.Types.ObjectId }));

        const faculties = await Faculty.find().lean();
        const departments = await Department.find().lean();

        console.log('--- FACULTIES ---');
        console.log(JSON.stringify(faculties, null, 2));
        console.log('--- DEPARTMENTS ---');
        console.log(JSON.stringify(departments, null, 2));

        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
}

listStructure();
