import dbConnect from '@/lib/mongodb';
import Enrollment from '@/models/Enrollment';
import Student from '@/models/Student';
import Course from '@/models/Course';
import { calculateGPA, calculateCGPA } from '@/utils/calculators';

export class TranscriptService {
    static async getFullTranscript(studentId: string) {
        await dbConnect();

        const enrollments = await Enrollment.find({ studentId })
            .populate({ path: 'courseId', model: Course })
            .lean();

        const transcript = enrollments.map((e: any) => ({
            courseCode: e.courseId.courseCode,
            courseTitle: e.courseId.courseTitle,
            creditUnits: e.courseId.creditUnits,
            grade: e.grade,
            gradePoint: e.gradePoint,
            semester: e.semester,
            academicYear: e.academicYear
        }));

        // Group by semester for GPA calculation
        const semesters: { [key: string]: any[] } = {};
        transcript.forEach(entry => {
            const key = `${entry.semester} ${entry.academicYear}`;
            if (!semesters[key]) semesters[key] = [];
            semesters[key].push({
                creditUnits: entry.creditUnits,
                grade: entry.grade
            });
        });

        const gpas = Object.entries(semesters).map(([semester, courses]) => ({
            semester,
            gpa: calculateGPA(courses)
        }));

        const cgpa = calculateCGPA(gpas.map(g => g.gpa));

        return {
            transcript,
            gpas,
            cgpa
        };
    }
}
