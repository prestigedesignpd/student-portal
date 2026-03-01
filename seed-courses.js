require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const MONGODB_URI = process.env.MONGODB_URI;

const courseSchema = new mongoose.Schema({
    courseCode: { type: String, required: true, unique: true },
    courseTitle: { type: String, required: true },
    creditUnits: { type: Number, required: true },
    level: { type: Number, required: true },
    semester: { type: String, enum: ['FIRST', 'SECOND'], required: true },
    department: { type: String, required: true },
    isElective: { type: Boolean, default: false },
    materials: [{
        title: { type: String, required: true },
        type: { type: String, enum: ['PDF', 'VIDEO', 'LINK', 'DOC'], required: true },
        url: { type: String, required: true },
        size: { type: String },
    }],
    prerequisites: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Course' }],
}, { timestamps: true });

const Course = mongoose.models.Course || mongoose.model('Course', courseSchema);

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to DB");

        // Clear existing courses
        await Course.deleteMany({});
        console.log("Cleared existing courses");

        const courses = [
            // 100 LEVEL
            { courseCode: 'CS101', courseTitle: 'Introduction to Computer Science', creditUnits: 3, level: 100, semester: 'FIRST', department: 'Computer Science' },
            { courseCode: 'CS102', courseTitle: 'Structured Programming', creditUnits: 4, level: 100, semester: 'FIRST', department: 'Computer Science' },
            { courseCode: 'MTH101', courseTitle: 'Elementary Maths I', creditUnits: 3, level: 100, semester: 'FIRST', department: 'Computer Science' },
            { courseCode: 'CS111', courseTitle: 'Logic and Digital Design', creditUnits: 3, level: 100, semester: 'SECOND', department: 'Computer Science' },
            { courseCode: 'CS112', courseTitle: 'Algorithm Selection', creditUnits: 3, level: 100, semester: 'SECOND', department: 'Computer Science' },

            // 200 LEVEL
            { courseCode: 'CS201', courseTitle: 'Data Structures', creditUnits: 3, level: 200, semester: 'FIRST', department: 'Computer Science' },
            { courseCode: 'CS202', courseTitle: 'Object Oriented Programming', creditUnits: 3, level: 200, semester: 'FIRST', department: 'Computer Science' },
            { courseCode: 'CS211', courseTitle: 'Database Management Systems', creditUnits: 3, level: 200, semester: 'SECOND', department: 'Computer Science' },
            { courseCode: 'CS212', courseTitle: 'Computer Architecture', creditUnits: 3, level: 200, semester: 'SECOND', department: 'Computer Science' },

            // 300 LEVEL
            { courseCode: 'CS301', courseTitle: 'Operating Systems', creditUnits: 3, level: 300, semester: 'FIRST', department: 'Computer Science' },
            { courseCode: 'CS302', courseTitle: 'Software Engineering', creditUnits: 3, level: 300, semester: 'FIRST', department: 'Computer Science' },
            { courseCode: 'CS311', courseTitle: 'Mobile App Development', creditUnits: 3, level: 300, semester: 'SECOND', department: 'Computer Science' },
            { courseCode: 'CS312', courseTitle: 'Research Methodology', creditUnits: 2, level: 300, semester: 'SECOND', department: 'Computer Science' },

            // 400 LEVEL
            { courseCode: 'CS401', courseTitle: 'Distributed Systems', creditUnits: 3, level: 400, semester: 'FIRST', department: 'Computer Science' },
            { courseCode: 'CS402', courseTitle: 'Networks & Security', creditUnits: 3, level: 400, semester: 'FIRST', department: 'Computer Science' },
            { courseCode: 'CS411', courseTitle: 'Final Year Project I', creditUnits: 4, level: 400, semester: 'SECOND', department: 'Computer Science' },
            { courseCode: 'CS412', courseTitle: 'Artificial Intelligence', creditUnits: 3, level: 400, semester: 'SECOND', department: 'Computer Science' },

            // 500 LEVEL (For 5-year programs or post-grad options in certain structures)
            { courseCode: 'CS501', courseTitle: 'Advanced Machine Learning', creditUnits: 3, level: 500, semester: 'FIRST', department: 'Computer Science' },
            { courseCode: 'CS502', courseTitle: 'Cloud Computing Architecture', creditUnits: 3, level: 500, semester: 'FIRST', department: 'Computer Science' },
            { courseCode: 'CS511', courseTitle: 'Final Year Project II', creditUnits: 6, level: 500, semester: 'SECOND', department: 'Computer Science' },
            { courseCode: 'CS512', courseTitle: 'Bioinformatics', creditUnits: 3, level: 500, semester: 'SECOND', department: 'Computer Science' },
        ];

        // Add some mock materials to all
        const materials = [
            { title: 'Lecture 01 - PDF', type: 'PDF', url: '#', size: '1.2 MB' },
            { title: 'Syllabus Review', type: 'VIDEO', url: '#', size: '45 MB' }
        ];

        const coursesWithMaterials = courses.map(c => ({ ...c, materials }));

        await Course.insertMany(coursesWithMaterials);
        console.log(`SUCCESS: Seeded ${courses.length} courses with materials.`);
        process.exit(0);
    } catch (err) {
        console.error("ERROR:", err);
        process.exit(1);
    }
}

seed();
