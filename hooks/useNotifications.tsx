import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { AnimatePresence } from 'framer-motion';
import Toast from '../components/ui/Toast';

type NotificationType = 'info' | 'success' | 'error';

interface Notification {
    id: number;
    message: string;
    type: NotificationType;
}

interface NotificationContextType {
    addNotification: (message: string, type: NotificationType) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    const addNotification = useCallback((message: string, type: NotificationType) => {
        const id = new Date().getTime();
        setNotifications(prev => [...prev, { id, message, type }]);
    }, []);

    const removeNotification = useCallback((id: number) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    }, []);

    const value = { addNotification };

    return (
        <NotificationContext.Provider value={value}>
            {children}
            <div className="fixed top-5 right-5 z-[100] w-full max-w-sm">
                <AnimatePresence>
                    {notifications.map(notification => (
                        <Toast
                            key={notification.id}
                            id={notification.id}
                            message={notification.message}
                            type={notification.type}
                            onClose={removeNotification}
                        />
                    ))}
                </AnimatePresence>
            </div>
        </NotificationContext.Provider>
    );
};

// Renaming the container to avoid conflict with the hook name
export const ToastContainer = () => {
     const context = useContext(NotificationContext);
     if (!context) return null; // Should not happen if used within provider
     // The actual rendering is handled inside the provider now to have access to state
     return null;
}

export const useNotifications = () => {
    const context = useContext(NotificationContext);
    if (context === undefined) {
        throw new Error('useNotifications must be used within a NotificationProvider');
    }
    return context;
};
