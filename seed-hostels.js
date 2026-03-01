const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: '.env.local' });

// We define schemas here directly for the script to run standalone
const roomSchema = new mongoose.Schema({
    hostelId: { type: mongoose.Schema.Types.ObjectId, ref: 'Hostel', required: true },
    roomNumber: { type: String, required: true },
    capacity: { type: Number, required: true },
    occupants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Student' }],
    isAvailable: { type: Boolean, default: true },
    type: { type: String, enum: ['MALE', 'FEMALE'], required: true },
});

const hostelSchema = new mongoose.Schema({
    name: { type: String, required: true, unique: true },
    location: { type: String, required: true },
    totalRooms: { type: Number, required: true },
    type: { type: String, enum: ['MALE', 'FEMALE'], required: true },
}, { timestamps: true });

const Room = mongoose.models.Room || mongoose.model('Room', roomSchema);
const Hostel = mongoose.models.Hostel || mongoose.model('Hostel', hostelSchema);

const hostelsToSeed = [
    { name: 'Alumni Hall', location: 'North Campus', totalRooms: 20, type: 'MALE', basePrice: 45000 },
    { name: 'Emerald Hall', location: 'South Campus', totalRooms: 15, type: 'FEMALE', basePrice: 65000 },
    { name: 'Legacy Hall', location: 'North Campus', totalRooms: 10, type: 'MALE', basePrice: 50000 },
];

async function seedHostels() {
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        console.log('Connected to DB');

        await Room.deleteMany({});
        await Hostel.deleteMany({});
        console.log('Cleared existing hostels and rooms');

        for (const data of hostelsToSeed) {
            const hostel = await Hostel.create({
                name: data.name,
                location: data.location,
                totalRooms: data.totalRooms,
                type: data.type
            });

            const rooms = [];
            for (let i = 1; i <= data.totalRooms; i++) {
                rooms.push({
                    hostelId: hostel._id,
                    roomNumber: `${data.name.charAt(0)}${i.toString().padStart(3, '0')}`,
                    capacity: data.name === 'Emerald Hall' ? 2 : 4, // Emerald is premium (2-man), others are 4-man
                    occupants: [],
                    isAvailable: true,
                    type: data.type
                });
            }

            await Room.insertMany(rooms);
            console.log(`Seeded ${data.name} with ${data.totalRooms} rooms.`);
        }

        console.log('Hostel seeding completed successfully!');
    } catch (error) {
        console.error('Error seeding hostels:', error);
    } finally {
        await mongoose.disconnect();
    }
}

seedHostels();
