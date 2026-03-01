import dbConnect from '@/lib/mongodb';
import Enrollment from '@/models/Enrollment';
import Student from '@/models/Student';
import Course from '@/models/Course';

export class AnalyticsService {
    static async getLevelPerformanceTrends() {
        await dbConnect();

        // Aggregate average GPA by level
        const stats = await Enrollment.aggregate([
            {
                $lookup: {
                    from: 'students',
                    localField: 'studentId',
                    foreignField: '_id',
                    as: 'student'
                }
            },
            { $unwind: '$student' },
            {
                $group: {
                    _id: '$student.level',
                    avgGPA: { $avg: '$gradePoint' },
                    totalEnrollments: { $sum: 1 }
                }
            },
            { $sort: { _id: 1 } }
        ]);

        return stats;
    }

    static async getDepartmentalStats() {
        await dbConnect();

        const stats = await Student.aggregate([
            {
                $group: {
                    _id: '$department',
                    studentCount: { $sum: 1 },
                    avgCgpa: { $avg: '$currentCgpa' }
                }
            }
        ]);

        return stats;
    }

    static async getPaymentMetrics() {
        await dbConnect();
        // In a real app, you'd aggregate the Payment model
        return {
            revenueByMonth: [], // Mocked
            completionRate: 0.85
        };
    }
}
