interface Course {
    creditUnits: number
    grade?: 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'NG'
    gradePoint?: number
}

const GRADE_POINTS = {
    A: 5.0,
    B: 4.0,
    C: 3.0,
    D: 2.0,
    E: 1.0,
    F: 0.0,
    NG: 0.0,
}

export function calculateGPA(courses: Course[]): number {
    let totalPoints = 0
    let totalUnits = 0

    for (const course of courses) {
        if (course.grade && course.grade !== 'NG') {
            const points = GRADE_POINTS[course.grade] * course.creditUnits
            totalPoints += points
            totalUnits += course.creditUnits
        }
    }

    if (totalUnits === 0) return 0.0

    return Number((totalPoints / totalUnits).toFixed(2))
}

export function calculateCGPA(semesterGPAs: number[]): number {
    if (semesterGPAs.length === 0) return 0.0

    const sum = semesterGPAs.reduce((acc, gpa) => acc + gpa, 0)
    return Number((sum / semesterGPAs.length).toFixed(2))
}

export function predictClassOfDegree(cgpa: number): string {
    if (cgpa >= 4.5) return 'First Class Honours'
    if (cgpa >= 3.5) return 'Second Class Honours (Upper)'
    if (cgpa >= 2.5) return 'Second Class Honours (Lower)'
    if (cgpa >= 1.5) return 'Third Class Honours'
    return 'Pass'
}

export function calculateRequiredGPAToImproveClass(
    currentCGPA: number,
    currentTotalCredits: number,
    targetClass: string,
    remainingCredits: number
): number {
    const classBoundaries = {
        'First Class Honours': 4.5,
        'Second Class Honours (Upper)': 3.5,
        'Second Class Honours (Lower)': 2.5,
        'Third Class Honours': 1.5,
    }

    const targetCGPA = classBoundaries[targetClass as keyof typeof classBoundaries]
    if (!targetCGPA) return 0

    const currentTotalPoints = currentCGPA * currentTotalCredits
    const requiredTotalPoints = targetCGPA * (currentTotalCredits + remainingCredits)
    const requiredPoints = requiredTotalPoints - currentTotalPoints

    if (requiredPoints <= 0) return 0

    const requiredGPA = requiredPoints / remainingCredits
    return Number(requiredGPA.toFixed(2))
}