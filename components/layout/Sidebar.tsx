import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { NAV_ITEMS } from '../../constants';
import type { NavItem } from '../../types';

interface SidebarProps {
    currentView: string;
    setCurrentView: (view: string) => void;
    isOpen: boolean;
    setIsOpen: (isOpen: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ currentView, setCurrentView, isOpen, setIsOpen }) => {
    const { user, logout } = useAuth();

    const accessibleNavItems = NAV_ITEMS.filter(item => user && item.roles.includes(user.role));
    
    const handleNavClick = (view: string) => {
        setCurrentView(view);
        setIsOpen(false);
    };

    const sidebarContent = (
        <>
            <div className="h-20 flex items-center justify-center shrink-0">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-200 tracking-wider">
                    <span className="text-primary-600">E</span>MS
                </h1>
            </div>
            <nav className="flex-1 px-6 py-6 space-y-2 overflow-y-auto">
                {accessibleNavItems.map((item: NavItem) => (
                    <a
                        key={item.name}
                        href="#"
                        onClick={(e) => {
                            e.preventDefault();
                            handleNavClick(item.view);
                        }}
                        className={`relative flex items-center px-4 py-3 rounded-lg text-sm transition-colors ${
                            currentView === item.view
                                ? 'font-semibold text-slate-900 dark:text-white'
                                : 'font-normal text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800'
                        }`}
                    >
                        {currentView === item.view && (
                            <motion.div
                                layoutId="active-nav-indicator"
                                className="absolute inset-0 bg-slate-100 dark:bg-slate-800/50 rounded-lg z-0"
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            />
                        )}
                        <span className="relative z-10 flex items-center">
                            <item.icon className="h-5 w-5 mr-4" />
                            <span>{item.name}</span>
                        </span>
                    </a>
                ))}
            </nav>
            <div className="px-6 py-6 border-t border-slate-200 dark:border-slate-800 shrink-0">
                <div className="flex items-center">
                    <img className="h-10 w-10 rounded-full object-cover" src={user?.avatarUrl} alt={user?.name} />
                    <div className="ml-3">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">{user?.name}</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">{user?.role}</p>
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="w-full mt-4 text-left flex items-center px-4 py-3 rounded-lg text-sm font-medium text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 transition-colors"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    Logout
                </button>
            </div>
        </>
    );

    return (
        <>
            {/* Backdrop for mobile */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={() => setIsOpen(false)}
                        className="fixed inset-0 bg-black/50 z-20 md:hidden"
                    />
                )}
            </AnimatePresence>
            
            {/* Sidebar */}
            <aside 
                className={`fixed inset-y-0 left-0 w-80 bg-white dark:bg-slate-900 flex flex-col z-30 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${
                    isOpen ? 'translate-x-0' : '-translate-x-full'
                }`}
            >
                {sidebarContent}
            </aside>
        </>
    );
};

export default Sidebar;