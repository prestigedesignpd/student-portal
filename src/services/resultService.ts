import dbConnect from '@/lib/mongodb';
import Enrollment from '@/models/Enrollment';
import Course from '@/models/Course';

export class ResultService {
    static async getStudentResults(studentId: string) {
        await dbConnect();

        // Fetch all relevant enrollments
        const enrollments = await Enrollment.find({
            studentId,
            status: { $in: ['APPROVED', 'PENDING'] },
        })
            .populate({ path: 'courseId', model: Course })
            .sort({ academicYear: -1, semester: 1 })
            .lean();

        // Grouping logic
        const groupedResults = enrollments.reduce((acc: any, enrollment: any) => {
            const year = enrollment.academicYear;
            const semester = enrollment.semester;

            if (!acc[year]) acc[year] = { FIRST: [], SECOND: [] };
            acc[year][semester].push(enrollment);

            return acc;
        }, {});

        return groupedResults;
    }

    static async getLatestResults(studentId: string) {
        await dbConnect();

        return Enrollment.find({
            studentId,
            isCompleted: true
        })
            .sort({ updatedAt: -1 })
            .limit(5)
            .populate({ path: 'courseId', model: Course })
            .lean();
    }
}
