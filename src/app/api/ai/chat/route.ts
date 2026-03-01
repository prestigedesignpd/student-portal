import { streamText } from 'ai';
import { google } from '@ai-sdk/google';
import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';
import ChatHistory from '@/models/ChatHistory';
import User from '@/models/User';
import { extractToken } from '@/utils/extractToken';
import jwt from 'jsonwebtoken';

// Required for Next.js 14+ API Routes
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
    try {
        // 1. Authenticate user
        const token = await extractToken(req);
        if (!token) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET || 'fallback-secret') as { id: string, role: string };
        const userId = decoded.id;

        // 2. Extract messages from payload
        const { messages } = await req.json();

        if (!messages || !Array.isArray(messages)) {
            return NextResponse.json({ error: 'Invalid message structure' }, { status: 400 });
        }

        // 3. Connect to DB layer to assemble context
        if (mongoose.connection.readyState !== 1) {
            await mongoose.connect(process.env.MONGODB_URI as string);
        }

        const user = await User.findById(userId).select('-password');
        if (!user) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Inject system prompt with live application context
        const systemPromptMessage = {
            role: 'system',
            content: `You are the friendly, intelligent AI Assistant for this academic institution's portal.
      You help ${user.role}s with their platform needs.
      Today's date is: ${new Date().toLocaleDateString()}
      User Profile Info: First Name: ${user.firstName}, Last Name: ${user.lastName}, Role: ${user.role}.
      Keep responses concise, helpful, and formatted elegantly using markdown.
      If you do not know the answer to an institutional question, suggest they contact support or check the dashboard.`,
        };

        // Prepend system instruction
        const fullMessages = [systemPromptMessage, ...messages] as any[];

        // 4. Stream response from Gemini
        // Using gemini-1.5-flash for fast chat interactions
        const result = streamText({
            model: google('gemini-1.5-flash'),
            messages: fullMessages,
            onFinish: async ({ text }) => {
                // 5. Asynchronously save the chat to MongoDB once the stream is finished
                try {
                    if (mongoose.connection.readyState !== 1) {
                        await mongoose.connect(process.env.MONGODB_URI as string);
                    }

                    let chat = await ChatHistory.findOne({ userId });

                    const newMessages = [
                        messages[messages.length - 1], // The latest user message
                        { role: 'assistant', content: text, createdAt: new Date() } // The AI response
                    ];

                    if (!chat) {
                        chat = new ChatHistory({
                            userId,
                            messages: newMessages
                        });
                    } else {
                        chat.messages.push(...newMessages);
                    }
                    await chat.save();
                } catch (dbError) {
                    console.error("Failed to save chat history to DB:", dbError);
                }
            },
        });

        return result.toTextStreamResponse();
    } catch (error: unknown) {
        console.error('AI Chat Error:', error);
        const errorMessage = error instanceof Error ? error.message : 'Internal Server Error';
        return NextResponse.json({ error: errorMessage }, { status: 500 });
    }
}
