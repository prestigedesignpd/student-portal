import { NextResponse } from 'next/server'
import dbConnect from '@/lib/mongodb'
import { Book } from '@/models/Library'
import { requireAuth } from '@/lib/auth'

export async function GET() {
    try {
        await dbConnect()
        const user = await requireAuth()

        if (user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const books = await Book.find().sort({ createdAt: -1 }).lean()
        return NextResponse.json(books)
    } catch (error) {
        console.error('Fetch books error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function POST(request: Request) {
    try {
        await dbConnect()
        const user = await requireAuth()

        if (user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const data = await request.json()
        const { title, author, isbn, quantity, category } = data

        if (!title || !author || !isbn || !quantity || !category) {
            return NextResponse.json({ error: 'All fields are required' }, { status: 400 })
        }

        const book = await Book.create({
            title,
            author,
            isbn,
            quantity,
            availableQuantity: quantity,
            category
        })

        return NextResponse.json(book)
    } catch (error: any) {
        if (error.code === 11000) {
            return NextResponse.json({ error: 'Book with this ISBN already exists' }, { status: 400 })
        }
        console.error('Create book error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function PATCH(request: Request) {
    try {
        await dbConnect()
        const user = await requireAuth()

        if (user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const data = await request.json()
        const { id, ...updateData } = data

        if (!id) {
            return NextResponse.json({ error: 'Book ID is required' }, { status: 400 })
        }

        // If quantity is being updated, we need to adjust availableQuantity accordingly
        if (updateData.quantity !== undefined) {
            const currentBook = await Book.findById(id)
            if (!currentBook) return NextResponse.json({ error: 'Book not found' }, { status: 404 })

            const diff = updateData.quantity - currentBook.quantity
            updateData.availableQuantity = currentBook.availableQuantity + diff

            if (updateData.availableQuantity < 0) {
                return NextResponse.json({ error: 'New quantity is less than already borrowed books' }, { status: 400 })
            }
        }

        const book = await Book.findByIdAndUpdate(id, updateData, { new: true })
        return NextResponse.json(book)
    } catch (error) {
        console.error('Update book error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}

export async function DELETE(request: Request) {
    try {
        await dbConnect()
        const user = await requireAuth()

        if (user.role !== 'ADMIN') {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
        }

        const { searchParams } = new URL(request.url)
        const id = searchParams.get('id')

        if (!id) {
            return NextResponse.json({ error: 'ID required' }, { status: 400 })
        }

        const book = await Book.findById(id)
        if (book && book.availableQuantity !== book.quantity) {
            return NextResponse.json({ error: 'Cannot delete book with active loans' }, { status: 400 })
        }

        await Book.findByIdAndDelete(id)
        return NextResponse.json({ message: 'Book deleted' })
    } catch (error) {
        console.error('Delete book error:', error)
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 })
    }
}
