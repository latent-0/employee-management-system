import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Sidebar from './Sidebar';
import Header from './Header';
import Dashboard from '../dashboard/Dashboard';
import EmployeeProfile from '../employees/EmployeeProfile';
import EmployeeManagement from '../employees/EmployeeManagement';
import Attendance from '../attendance/Attendance';
import LeaveManagement from '../leaves/LeaveManagement';
import LeaveApprovals from '../leaves/LeaveApprovals';
import Payroll from '../payroll/Payroll';
import PayrollProcessing from '../payroll/PayrollProcessing';
import Performance from '../performance/Performance';
import PerformanceReviews from '../performance/PerformanceReviews';
import Reports from '../reports/Reports';
import Wellness from '../wellness/Wellness';
import OrganizationChart from '../organization/OrganizationChart';
import { useAuth } from '../../hooks/useAuth';
import { ToastContainer } from '../../hooks/useNotifications';

const Layout: React.FC = () => {
    const { user } = useAuth();
    const [currentView, setCurrentView] = useState('dashboard');
    const [viewedEmployeeId, setViewedEmployeeId] = useState<string | null>(null);
    const [theme, setTheme] = useState(localStorage.getItem('theme') || 'light');
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    useEffect(() => {
        if (theme === 'dark') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
        localStorage.setItem('theme', theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
    };
    
    useEffect(() => {
        if(currentView !== 'profile') {
            setViewedEmployeeId(null);
        }
    }, [currentView]);

    const pageVariants = {
        initial: { opacity: 0, y: 20 },
        in: { opacity: 1, y: 0 },
        out: { opacity: 0, y: -20 },
    };

    const pageTransition = {
        type: 'tween',
        ease: 'anticipate',
        duration: 0.5,
    };

    const renderView = () => {
        switch (currentView) {
            case 'dashboard':
                return <Dashboard setCurrentView={setCurrentView} />;
            case 'profile':
                return <EmployeeProfile employeeId={viewedEmployeeId} />;
            case 'team':
                return <EmployeeManagement setCurrentView={setCurrentView} setViewedEmployeeId={setViewedEmployeeId} />;
            case 'attendance':
                return <Attendance />;
            case 'leave':
                return <LeaveManagement />;
            case 'leave-approvals':
                return <LeaveApprovals />;
            case 'payroll':
                return <Payroll />;
            case 'payroll-processing':
                return <PayrollProcessing />;
            case 'performance':
                return <Performance />;
            case 'performance-reviews':
                return <PerformanceReviews />;
            case 'reports':
                return <Reports />;
            case 'wellness':
                return <Wellness />;
            case 'organization-chart':
                return <OrganizationChart />;
            default:
                return <Dashboard setCurrentView={setCurrentView} />;
        }
    };

    return (
        <div className="relative flex h-screen bg-slate-100 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-200 overflow-hidden">
            <Sidebar 
                currentView={currentView} 
                setCurrentView={setCurrentView} 
                isOpen={isSidebarOpen}
                setIsOpen={setIsSidebarOpen}
            />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header 
                    currentView={currentView} 
                    theme={theme} 
                    toggleTheme={toggleTheme} 
                    onMenuClick={() => setIsSidebarOpen(true)}
                />
                <main 
                    className="flex-1 overflow-x-hidden overflow-y-auto"
                    onClick={() => {
                        if (isSidebarOpen) {
                            setIsSidebarOpen(false);
                        }
                    }}
                >
                     <ToastContainer />
                     <AnimatePresence mode="wait">
                        <motion.div
                            key={currentView}
                            initial="initial"
                            animate="in"
                            exit="out"
                            variants={pageVariants}
                            transition={pageTransition}
                            className="container mx-auto px-4 py-8 sm:px-6 lg:px-8"
                        >
                            {renderView()}
                        </motion.div>
                    </AnimatePresence>
                </main>
            </div>
        </div>
    );
};

export default Layout;