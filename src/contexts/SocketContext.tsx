'use client'

import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';
import toast from 'react-hot-toast';

interface SocketContextType {
    socket: Socket | null;
    onlineUsers: string[];
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [onlineUsers, setOnlineUsers] = useState<string[]>([]);
    const { user } = useAuth();

    useEffect(() => {
        if (user) {
            // Connect to the generic socket server
            const newSocket = io(process.env.NEXT_PUBLIC_SOCKET_URL || '', {
                query: { userId: user._id },
                transports: ['websocket'], // Force websocket only, disable polling fallback
                reconnectionAttempts: 3,
                reconnectionDelay: 10000,
                timeout: 5000,
            });

            setSocket(newSocket);

            newSocket.on('getOnlineUsers', (users: string[]) => {
                setOnlineUsers(users);
            });

            newSocket.on('notification', (data: any) => {
                toast(data.message, {
                    icon: '🔔',
                    style: {
                        borderRadius: '10px',
                        background: '#333',
                        color: '#fff',
                    },
                });
            });

            return () => {
                newSocket.close();
            };
        } else {
            if (socket) {
                socket.close();
                setSocket(null);
            }
        }
    }, [user]);

    return (
        <SocketContext.Provider value={{ socket, onlineUsers }}>
            {children}
        </SocketContext.Provider>
    );
}

export function useSocket() {
    const context = useContext(SocketContext);
    if (context === undefined) {
        throw new Error('useSocket must be used within a SocketProvider');
    }
    return context;
}
