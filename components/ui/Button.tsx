import React from 'react';
import { motion } from 'framer-motion';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'danger';
    size?: 'md' | 'lg';
    isLoading?: boolean;
}

const Button: React.FC<ButtonProps> = ({
    children,
    className = '',
    variant = 'primary',
    size = 'md',
    isLoading = false,
    disabled,
    ...props
}) => {
    const baseClasses = 'inline-flex items-center justify-center rounded-xl border font-normal focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-slate-950 transition-colors duration-200';

    const variantClasses = {
        primary: 'bg-slate-800 text-white hover:bg-slate-950 border-transparent focus:ring-slate-500 disabled:bg-slate-400 dark:bg-slate-200 dark:text-slate-900 dark:hover:bg-white dark:focus:ring-slate-400 dark:disabled:bg-slate-800 dark:disabled:text-slate-400',
        secondary: 'bg-slate-200/80 text-slate-800 hover:bg-slate-200 border-transparent focus:ring-slate-500 disabled:bg-slate-100 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700 dark:focus:ring-slate-600 dark:disabled:opacity-50',
        danger: 'bg-red-600 text-white hover:bg-red-700 border-transparent focus:ring-red-500 disabled:bg-red-300',
    };

    const sizeClasses = {
        md: 'px-5 py-2.5 text-sm',
        lg: 'px-6 py-3 text-base',
    };

    const loadingSpinner = (
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
    );

    return (
        <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 400, damping: 15 }}
            className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
            disabled={isLoading || disabled}
            {...props}
        >
            {isLoading && loadingSpinner}
            {children}
        </motion.button>
    );
};

export default Button;
