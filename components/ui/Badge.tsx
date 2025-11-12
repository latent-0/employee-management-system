

import React from 'react';

interface BadgeProps {
    children: React.ReactNode;
    color?: 'green' | 'yellow' | 'red' | 'blue' | 'gray';
}

const Badge: React.FC<BadgeProps> = ({ children, color = 'gray' }) => {
    const colorClasses = {
        green: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-300',
        yellow: 'bg-amber-50 text-amber-700 dark:bg-amber-900/50 dark:text-amber-300',
        red: 'bg-red-50 text-red-700 dark:bg-red-900/50 dark:text-red-300',
        blue: 'bg-sky-50 text-sky-700 dark:bg-sky-900/50 dark:text-sky-300',
        gray: 'bg-slate-100 text-slate-700 dark:bg-slate-700/50 dark:text-slate-300',
    };

    return (
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${colorClasses[color]}`}>
            {children}
        </span>
    );
};

export default Badge;