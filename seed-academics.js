const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
    console.error("MONGODB_URI is not defined in .env.local");
    process.exit(1);
}

const facultySchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true },
}, { timestamps: true });

const deptSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    code: { type: String, required: true, unique: true },
    facultyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Faculty', required: true },
}, { timestamps: true });

const Faculty = mongoose.models.Faculty || mongoose.model('Faculty', facultySchema);
const Department = mongoose.models.Department || mongoose.model('Department', deptSchema);

const academicData = [
    {
        faculty: { name: "Faculty of Engineering & Technology", code: "FET" },
        departments: [
            { name: "Mechanical Engineering", code: "MEE" },
            { name: "Civil Engineering", code: "CVE" },
            { name: "Electrical & Electronics Engineering", code: "EEE" },
            { name: "Computer Engineering", code: "CPE" },
            { name: "Chemical Engineering", code: "CHE" },
            { name: "Petroleum/Gas Engineering", code: "PGE" },
            { name: "Mechatronics Engineering", code: "MTE" }
        ]
    },
    {
        faculty: { name: "Faculty of Science (Life & Physical)", code: "SCI" },
        departments: [
            { name: "Computer Science", code: "CSC" },
            { name: "Biochemistry", code: "BCH" },
            { name: "Microbiology", code: "MCB" },
            { name: "Geology", code: "GLY" },
            { name: "Mathematics & Statistics", code: "MTH" },
            { name: "Physics / Industrial Physics", code: "PHY" },
            { name: "Plant Science & Biotechnology", code: "PSB" }
        ]
    },
    {
        faculty: { name: "Faculty of Management Sciences / Administration", code: "MGT" },
        departments: [
            { name: "Accounting", code: "ACC" },
            { name: "Business Administration", code: "BUS" },
            { name: "Finance & Banking", code: "FIB" },
            { name: "Marketing", code: "MKT" },
            { name: "Industrial Relations & Personnel Management", code: "IRP" },
            { name: "Insurance & Actuarial Science", code: "INS" }
        ]
    },
    {
        faculty: { name: "Faculty of Social Sciences", code: "SOC" },
        departments: [
            { name: "Economics", code: "ECO" },
            { name: "Political Science", code: "POL" },
            { name: "Sociology", code: "SOC" },
            { name: "Psychology", code: "PSY" },
            { name: "Geography & Environmental Management", code: "GEM" },
            { name: "Mass Communication", code: "MAC" }
        ]
    },
    {
        faculty: { name: "Faculty of Clinical Sciences (Medicine)", code: "MED" },
        departments: [
            { name: "Medicine & Surgery (MBBS)", code: "MBBS" },
            { name: "Nursing Science", code: "NRS" },
            { name: "Medical Laboratory Science", code: "MLS" },
            { name: "Physiotherapy", code: "PTH" },
            { name: "Radiography", code: "RAD" }
        ]
    },
    {
        faculty: { name: "Faculty of Arts & Humanities", code: "ART" },
        departments: [
            { name: "English & Literary Studies", code: "ENG" },
            { name: "History & International Studies", code: "HIS" },
            { name: "Philosophy", code: "PHL" },
            { name: "Theatre & Film Studies", code: "TFS" },
            { name: "Linguistics", code: "LIN" }
        ]
    },
    {
        faculty: { name: "Faculty of Law", code: "LAW" },
        departments: [
            { name: "Public Law", code: "PLW" },
            { name: "Private & Property Law", code: "PPL" },
            { name: "Commercial Law", code: "CLW" },
            { name: "Jurisprudence & International Law", code: "JIL" }
        ]
    }
];

async function seed() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log("Connected to MongoDB");

        // Clear existing data to avoid duplicates if re-run
        await Department.deleteMany({});
        await Faculty.deleteMany({});
        console.log("Cleared existing academic data");

        for (const item of academicData) {
            const faculty = await Faculty.create(item.faculty);
            console.log(`Created Faculty: ${faculty.name}`);

            const deptsWithFacultyId = item.departments.map(d => ({
                ...d,
                facultyId: faculty._id
            }));

            await Department.insertMany(deptsWithFacultyId);
            console.log(`Created ${item.departments.length} departments for ${faculty.name}`);
        }

        console.log("Seeding complete!");
        process.exit(0);
    } catch (error) {
        console.error("Seeding error:", error);
        process.exit(1);
    }
}

seed();
