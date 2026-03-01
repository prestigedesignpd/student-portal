import axios from 'axios'
import type { Course } from '@/types/student'

export const getCourses = async (): Promise<Course[]> => {
    const response = await axios.get('/api/courses')
    return response.data
}

export const registerCourse = async (courseIds: string[]): Promise<any> => {
    const response = await axios.post('/api/courses', { courseIds })
    return response.data
}

export const getEligibleCourses = async (): Promise<(Course & { isCarryOver: boolean })[]> => {
    const response = await axios.get('/api/courses/eligible')
    return response.data
}
