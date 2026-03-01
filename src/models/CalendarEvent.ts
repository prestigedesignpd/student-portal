import mongoose, { Schema, Document } from 'mongoose'

export interface ICalendarEvent extends Document {
    title: string;
    description: string;
    type: 'EXAM' | 'ACADEMIC' | 'HOLIDAY' | 'REGISTRATION';
    date: Date;
    createdAt: Date;
    updatedAt: Date;
}

const CalendarEventSchema: Schema = new Schema({
    title: { type: String, required: true },
    description: { type: String },
    type: { type: String, enum: ['EXAM', 'ACADEMIC', 'HOLIDAY', 'REGISTRATION'], default: 'ACADEMIC' },
    date: { type: Date, required: true }
}, { timestamps: true })

export default mongoose.models.CalendarEvent || mongoose.model<ICalendarEvent>('CalendarEvent', CalendarEventSchema)
