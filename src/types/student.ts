export interface User {
    id: string
    _id?: string
    email: string
    username: string
    firstName: string
    lastName: string
    phone?: string
    address?: string
    profilePicture?: string
    avatar?: string
    role: 'STUDENT' | 'STAFF' | 'ADMIN'
    isActive: boolean
    createdAt?: Date
    updatedAt?: Date
}

export interface Student {
    id: string
    _id?: string
    userId: string
    user?: User
    matricNumber: string
    department: Department | string
    level: number
    currentCgpa: number
    totalCredits: number
    dateOfBirth?: Date
    admissionDate?: Date
    graduationDate?: Date
}

export interface Course {
    id: string
    _id?: string
    courseCode: string
    courseTitle: string
    creditUnits: number
    level: number
    semester: 'FIRST' | 'SECOND'
    department: Department | string
    isElective: boolean
    prerequisites?: (Course | string)[]
}

export interface Enrollment {
    id: string
    _id?: string
    studentId: string
    courseId: string | Course
    semester: 'FIRST' | 'SECOND'
    academicYear: string
    grade?: Grade
    gradePoint?: number
    isCompleted: boolean
    createdAt?: Date
}

export interface Payment {
    id: string
    _id?: string
    reference: string
    studentId: string
    amount: number
    feeType: FeeType
    status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED'
    paymentMethod?: string
    transactionId?: string
    paidAt?: Date
    createdAt?: Date
}

export interface Notification {
    id: string
    _id?: string
    userId?: string
    title: string
    message: string
    type: 'INFO' | 'SUCCESS' | 'WARNING' | 'DANGER' | 'ACADEMIC' | 'FINANCIAL'
    createdAt?: Date
    isRead?: boolean
}

// Enums / Discriminated Unions
export type Department =
    | 'CS' | 'ENG' | 'MATH' | 'PHY' | 'CHM' | 'BIO' | 'ACCOUNTING' | 'LAW' | 'MEDICINE'

export type Grade = 'A' | 'B' | 'C' | 'D' | 'E' | 'F' | 'NG'

export type FeeType =
    | 'TUITION'
    | 'ACCOMMODATION'
    | 'LIBRARY'
    | 'SPORTS'
    | 'OTHER'

// API Response Types
export interface ApiResponse<T> {
    success: boolean
    data?: T
    error?: string
    message?: string
}

export interface LoginResponse {
    success: boolean
    token: string
    user: User & { student?: Student }
}

export interface LoginRequest {
    username: string
    password: string
}
