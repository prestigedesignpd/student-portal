import dbConnect from '@/lib/mongodb';
import { Room, Hostel } from '@/models/Hostel';
import Student from '@/models/Student';

export class HostelService {
    static async applyForRoom(studentId: string, hostelId: string, preferredType: 'MALE' | 'FEMALE') {
        await dbConnect();

        // Find available room in the specified hostel
        const room = await Room.findOne({
            hostelId,
            type: preferredType,
            isAvailable: true,
            $expr: { $lt: [{ $size: "$occupants" }, "$capacity"] }
        });

        if (!room) {
            throw new Error('No available rooms in this hostel');
        }

        // Add student to room
        room.occupants.push(studentId);
        if (room.occupants.length >= room.capacity) {
            room.isAvailable = false;
        }

        await room.save();
        return room;
    }

    static async getHostels(type?: 'MALE' | 'FEMALE') {
        await dbConnect();
        const query = type ? { type } : {};
        return Hostel.find(query).lean();
    }

    static async getRoomsByHostel(hostelId: string) {
        await dbConnect();
        return Room.find({ hostelId }).populate({ path: 'occupants', model: Student }).lean();
    }
}
