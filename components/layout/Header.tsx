import React from 'react';
import { NAV_ITEMS } from '../../constants';

interface HeaderProps {
    currentView: string;
    theme: string;
    toggleTheme: () => void;
    onMenuClick: () => void;
}

const SunIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v2.25m6.364.386l-1.591 1.591M21 12h-2.25m-.386 6.364l-1.591-1.591M12 18.75V21m-4.95-4.223l-1.591 1.591M5.25 12H3m4.223-4.95l1.591-1.591M12 12a4.5 4.5 0 000 9 4.5 4.5 0 000-9z" />
    </svg>
);

const MoonIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z" />
    </svg>
);

const MenuIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
    </svg>
);


const Header: React.FC<HeaderProps> = ({ currentView, theme, toggleTheme, onMenuClick }) => {
    const pageTitle = NAV_ITEMS.find(item => item.view === currentView)?.name || 'Dashboard';
    
    return (
        <header className="flex items-center justify-between h-20 px-4 sm:px-8 lg:px-12 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm sticky top-0 z-10">
            <div className="flex items-center">
                 <button
                    onClick={onMenuClick}
                    className="p-2 mr-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 focus:outline-none md:hidden"
                    aria-label="Open menu"
                >
                    <MenuIcon className="w-6 h-6" />
                </button>
                <h2 className="text-xl md:text-2xl font-normal text-slate-600 dark:text-slate-300 capitalize">{pageTitle}</h2>
            </div>
            
            <button
                onClick={toggleTheme}
                className="p-2 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-700/50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 dark:focus:ring-offset-slate-900 transition-colors"
                aria-label="Toggle theme"
            >
                {theme === 'light' ? (
                    <MoonIcon className="w-6 h-6" />
                ) : (
                    <SunIcon className="w-6 h-6 text-yellow-400" />
                )}
            </button>
        </header>
    );
};

export default Header;