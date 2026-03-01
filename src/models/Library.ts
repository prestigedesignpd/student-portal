import mongoose from 'mongoose';

const bookSchema = new mongoose.Schema({
    title: { type: String, required: true },
    author: { type: String, required: true },
    isbn: { type: String, required: true, unique: true },
    quantity: { type: Number, required: true },
    availableQuantity: { type: Number, required: true },
    category: { type: String, required: true },
}, { timestamps: true });

const loanSchema = new mongoose.Schema({
    bookId: { type: mongoose.Schema.Types.ObjectId, ref: 'Book', required: true },
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Student', required: true },
    loanDate: { type: Date, default: Date.now },
    dueDate: { type: Date, required: true },
    returnDate: { type: Date },
    status: { type: String, enum: ['BORROWED', 'RETURNED', 'OVERDUE'], default: 'BORROWED' },
}, { timestamps: true });

export const Book = mongoose.models.Book || mongoose.model('Book', bookSchema);
export const Loan = mongoose.models.Loan || mongoose.model('Loan', loanSchema);
