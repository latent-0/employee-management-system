import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { UserRole } from '../../types';
import Card from '../ui/Card';
import { geminiService } from '../../services/geminiService';
import { useNotifications } from '../../hooks/useNotifications';

interface DashboardProps {
    setCurrentView: (view: string) => void;
}

const WelcomeBanner: React.FC<{ name?: string }> = ({ name }) => (
    <div className="p-8 md:p-12 rounded-xl bg-slate-900 dark:bg-slate-800 text-white">
        <h2 className="text-3xl sm:text-4xl font-normal text-slate-100">Welcome back, {name}!</h2>
        <p className="mt-2 text-slate-400 max-w-lg">Here's your snapshot for today. Stay productive and have a great day!</p>
    </div>
);

const QuickActionCard: React.FC<{ title: string, icon: React.ReactNode, onClick: () => void }> = ({ title, icon, onClick }) => (
    <motion.div whileHover={{ y: -5 }} transition={{ type: 'spring', stiffness: 300 }}>
        <Card onClick={onClick} className="cursor-pointer text-center h-full">
            <div className="flex flex-col items-center justify-center p-4">
                <div className="text-slate-500 dark:text-slate-400 mb-4">{icon}</div>
                <h4 className="font-medium text-slate-800 dark:text-slate-200">{title}</h4>
            </div>
        </Card>
    </motion.div>
);

const WellnessTipCard: React.FC = () => {
    const [tip, setTip] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        geminiService.getWellnessTip()
            .then(setTip)
            .catch(err => {
                console.error(err);
                setTip("Remember to stay hydrated and take short breaks to stretch!");
            })
            .finally(() => setIsLoading(false));
    }, []);

    return (
        <Card>
            <h4 className="font-medium text-slate-900 dark:text-white mb-3">AI Wellness Tip ✨</h4>
            {isLoading ? (
                <p className="text-sm text-slate-500 dark:text-slate-400 animate-pulse">Generating your daily tip...</p>
            ) : (
                <p className="text-sm text-slate-600 dark:text-slate-300 font-light italic">"{tip}"</p>
            )}
        </Card>
    );
};


const EventFeedCard: React.FC = () => {
    const { addNotification } = useNotifications();
    const [events, setEvents] = useState([
        { time: new Date(), message: 'System Initialized. Awaiting events...' }
    ]);

    const mockEvents = [
        "Jane Doe has clocked in for the day.",
        "System health check complete. All services operational.",
        "New leave request submitted by John Smith.",
        "Server performance is optimal. CPU usage at 15%.",
        "Mike Ross has clocked out for the day.",
        "Weekly attendance report has been generated."
    ];

    useEffect(() => {
        const interval = setInterval(() => {
            const newMessage = mockEvents[Math.floor(Math.random() * mockEvents.length)];
            const newEvent = { time: new Date(), message: newMessage };

            setEvents(prev => [newEvent, ...prev].slice(0, 5));
            addNotification(newMessage, 'info');

        }, 15000); // New event every 15 seconds

        return () => clearInterval(interval);
    }, [addNotification]);

    return (
        <Card className="h-full">
             <h4 className="font-medium text-slate-900 dark:text-white mb-4">Real-time Event Feed</h4>
             <div className="space-y-3">
                {events.map((event, index) => (
                    <div key={index} className="flex items-start text-sm">
                        <p className="text-slate-400 dark:text-slate-500 mr-3 w-16 text-right shrink-0">{event.time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                        <p className="text-slate-600 dark:text-slate-300 font-light">{event.message}</p>
                    </div>
                ))}
             </div>
        </Card>
    );
};


const Dashboard: React.FC<DashboardProps> = ({ setCurrentView }) => {
    const { user } = useAuth();
    const isHrOrAdmin = user?.role === UserRole.HR_MANAGER || user?.role === UserRole.ADMIN;


    return (
        <div className="space-y-8">
            <WelcomeBanner name={user?.name?.split(' ')[0]} />
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <QuickActionCard 
                    title="Mark Attendance" 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
                    onClick={() => setCurrentView('attendance')}
                />
                <QuickActionCard 
                    title="Request Leave" 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>}
                    onClick={() => setCurrentView('leave')}
                />
                <QuickActionCard 
                    title="View Payslips" 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" /></svg>}
                    onClick={() => setCurrentView('payroll')}
                />
                 <QuickActionCard 
                    title="My Profile" 
                    icon={<svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                    onClick={() => setCurrentView('profile')}
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2">
                    {isHrOrAdmin ? (
                        <EventFeedCard />
                    ) : (
                         <Card>
                            <h4 className="font-medium text-slate-900 dark:text-white">Announcements</h4>
                             <div className="mt-4 space-y-4">
                                <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                    <h5 className="font-medium text-slate-800 dark:text-slate-200">Quarterly All-Hands Meeting</h5>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 font-light">Join us on July 30th for the Q3 all-hands meeting. An invite has been sent to your calendar.</p>
                                </div>
                                 <div className="p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                                    <h5 className="font-medium text-slate-800 dark:text-slate-200">System Maintenance</h5>
                                    <p className="text-sm text-slate-600 dark:text-slate-400 mt-1 font-light">Please be aware of a scheduled system maintenance on Sunday, July 28th, from 2 AM to 4 AM.</p>
                                </div>
                            </div>
                        </Card>
                    )}
                </div>
                <div className="space-y-8">
                   <WellnessTipCard />
                </div>
            </div>
        </div>
    );
};

export default Dashboard;