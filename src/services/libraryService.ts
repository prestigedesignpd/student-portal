import dbConnect from '@/lib/mongodb';
import { Book, Loan } from '@/models/Library';
import { addDays } from 'date-fns';

export class LibraryService {
    static async searchBooks(query: string) {
        await dbConnect();
        return Book.find({
            $or: [
                { title: { $regex: query, $options: 'i' } },
                { author: { $regex: query, $options: 'i' } },
                { category: { $regex: query, $options: 'i' } }
            ]
        }).lean();
    }

    static async borrowBook(bookId: string, studentId: string) {
        await dbConnect();

        const book = await Book.findById(bookId);
        if (!book || book.availableQuantity <= 0) {
            throw new Error('Book not available');
        }

        // Create loan
        const loan = await Loan.create({
            bookId,
            studentId,
            dueDate: addDays(new Date(), 14) // 2 weeks duration
        });

        // Update book availability
        book.availableQuantity -= 1;
        await book.save();

        return loan;
    }

    static async returnBook(loanId: string) {
        await dbConnect();

        const loan = await Loan.findById(loanId);
        if (!loan || loan.status === 'RETURNED') {
            throw new Error('Invalid loan or book already returned');
        }

        loan.returnDate = new Date();
        loan.status = 'RETURNED';
        await loan.save();

        const book = await Book.findById(loan.bookId);
        if (book) {
            book.availableQuantity += 1;
            await book.save();
        }

        return loan;
    }
}
