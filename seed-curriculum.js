const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

// Mock data generator for Nigerian Curriculum
const generateCourses = (deptName, deptCode, facultyCode) => {
    const courses = [];
    let maxLevel = 400; // Default
    if (['FET', 'LAW'].includes(facultyCode)) maxLevel = 500;
    if (facultyCode === 'MED') maxLevel = 600;

    const semesterTypes = ['FIRST', 'SECOND'];

    for (let level = 100; level <= maxLevel; level += 100) {
        for (const semester of semesterTypes) {
            const semNum = semester === 'FIRST' ? 1 : 2;

            // Define 5 courses per semester
            for (let i = 1; i <= 5; i++) {
                let courseCode, courseTitle, units;

                // 100 Level is mostly general courses
                if (level === 100) {
                    const genCourses = {
                        'FIRST': [
                            { code: 'GNS 101', title: 'Use of English I', units: 2 },
                            { code: 'MTH 101', title: 'Elementary Mathematics I', units: 3 },
                            { code: 'PHY 101', title: 'General Physics I', units: 3 },
                            { code: 'CHM 101', title: 'General Chemistry I', units: 3 },
                            { code: 'BIO 101', title: 'General Biology I', units: 3 }
                        ],
                        'SECOND': [
                            { code: 'GNS 102', title: 'Use of English II', units: 2 },
                            { code: 'MTH 102', title: 'Elementary Mathematics II', units: 3 },
                            { code: 'PHY 102', title: 'General Physics II', units: 3 },
                            { code: 'CHM 102', title: 'General Chemistry II', units: 3 },
                            { code: 'BIO 102', title: 'General Biology II', units: 3 }
                        ]
                    };
                    const c = genCourses[semester][i - 1];
                    courseCode = `${deptCode} ${c.code.split(' ')[1]}`; // Make it dept specific for uniqueness if needed, or keep generic
                    // Actually, for 100 level, we use the standard codes but they belong to the dept curriculum
                    courseCode = `${deptCode}${level + semNum * 10 + i}`;
                    courseTitle = `${c.title} (${deptCode})`;
                    units = c.units;
                } else {
                    // Specialized courses
                    const topics = ['Fundamentals of', 'Advanced', 'Introduction to', 'Principles of', 'Applied', 'Research in', 'Special Topics in', 'Seminar in', 'Practical', 'Techniques in'];
                    const subjects = deptName.split(' ');
                    const subject = subjects[subjects.length - 1];

                    courseCode = `${deptCode}${level + semNum * 10 + i}`;
                    courseTitle = `${topics[i % topics.length]} ${deptName} ${level + i}`;
                    units = (i % 2 === 0) ? 3 : 2;

                    // Final year project
                    if (level === maxLevel && semester === 'SECOND' && i === 5) {
                        courseTitle = `Research Project / Thesis`;
                        units = 6;
                    }
                }

                courses.push({
                    courseCode: courseCode,
                    courseTitle: courseTitle,
                    creditUnits: units,
                    level: level,
                    semester: semester,
                    department: deptName,
                    isElective: i === 4 // Mark 4th course as elective
                });
            }
        }
    }
    return courses;
};

async function seedCurriculum() {
    try {
        await mongoose.connect(MONGODB_URI);

        // Define Schemas inline to avoid import issues in script
        const Faculty = mongoose.model('Faculty', new mongoose.Schema({ name: String, code: String }));
        const Department = mongoose.model('Department', new mongoose.Schema({ name: String, code: String, facultyId: mongoose.Schema.Types.ObjectId }));
        const Course = mongoose.model('Course', new mongoose.Schema({
            courseCode: { type: String, required: true, unique: true },
            courseTitle: { type: String, required: true },
            creditUnits: { type: Number, required: true },
            level: { type: Number, required: true },
            semester: { type: String, enum: ['FIRST', 'SECOND'], required: true },
            department: { type: String, required: true },
            isElective: { type: Boolean, default: false }
        }));

        console.log('Cleaning existing courses...');
        await Course.deleteMany({});

        const faculties = await Faculty.find().lean();
        const departments = await Department.find().lean();

        let totalCourses = 0;
        for (const dept of departments) {
            const faculty = faculties.find(f => f._id.toString() === dept.facultyId.toString());
            const facultyCode = faculty ? faculty.code : 'GEN';

            console.log(`Generating courses for ${dept.name} (${dept.code})...`);
            const courses = generateCourses(dept.name, dept.code, facultyCode);

            try {
                await Course.insertMany(courses, { ordered: false });
                totalCourses += courses.length;
            } catch (err) {
                // Ignore duplicate key errors if any
                if (err.code !== 11000) console.error(`Error inserting for ${dept.code}:`, err.message);
            }
        }

        console.log(`Successfully seeded ${totalCourses} courses across ${departments.length} departments.`);
        process.exit(0);
    } catch (err) {
        console.error('Seeding failed:', err);
        process.exit(1);
    }
}

seedCurriculum();
