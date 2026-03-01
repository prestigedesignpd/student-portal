import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import Course from '@/models/Course'
import Enrollment from '@/models/Enrollment'
import { requireAuth } from '@/lib/auth'
import { SettingsService } from '@/services/settingsService'
import Payment from '@/models/Payment'

export async function GET() {
    try {
        await dbConnect()
        const user = await requireAuth()

        if (!user.student) {
            return NextResponse.json({ error: 'Student profile not found' }, { status: 404 })
        }

        // 1. Check if Registration is Open
        const regStatus = await SettingsService.getSetting('registration_status', { isOpen: true })
        if (!regStatus.isOpen) {
            return NextResponse.json({
                error: 'Registration Protocol Locked',
                reason: 'CLOSED'
            }, { status: 403 })
        }

        // 2. Financial standing check removed: Let unpaid students see what courses they WOULD take,
        // we'll restrict the actual SUBMIT action instead of the view action.

        const academicInfo = await SettingsService.getCurrentAcademicInfo()
        const currentLevel = user.student.level
        const currentSemester = academicInfo.semester

        // 1. Get all enrollments for this student
        const enrollments = await Enrollment.find({
            studentId: user.student._id
        }).lean()

        // 2. Check for PENDING registration to block re-submission
        const hasPendingReg = enrollments.some(e => e.status === 'PENDING')
        if (hasPendingReg) {
            return NextResponse.json({
                error: 'Registration Pending Approval',
                reason: 'PENDING'
            }, { status: 403 })
        }

        const enrolledCourseIds = enrollments.map(e => e.courseId.toString())
        const passedCourseIds = enrollments.filter(e => e.isCompleted).map(e => e.courseId.toString())
        const failedCourseIds = enrollments.filter(e => e.grade === 'F').map(e => e.courseId.toString())

        // 2. Fetch all courses in the department
        const allDeptCourses = await Course.find({
            department: user.student.department
        }).lean()

        // 3. Categorize
        const eligibleCourses = allDeptCourses.filter(course => {
            const isAlreadyPassed = passedCourseIds.includes(course._id.toString())
            if (isAlreadyPassed) return false

            const isCurrentSemester = course.semester === currentSemester
            if (!isCurrentSemester) return false

            // Core: Current level + Current semester
            const isCore = course.level === currentLevel

            // Carry-over: Previous level + Current semester + (Failed or Untaken)
            const isCarryOver = course.level < currentLevel && (failedCourseIds.includes(course._id.toString()) || !enrolledCourseIds.includes(course._id.toString()))

            return isCore || isCarryOver
        }).map(course => ({
            ...course,
            isCarryOver: course.level < currentLevel
        }))

        return NextResponse.json(eligibleCourses)
    } catch (error) {
        console.error('Fetch eligible courses error:', error)
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
}
