import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import type { Payroll as PayrollType } from '../../types';
import Card from '../ui/Card';

const Payroll: React.FC = () => {
    const { user } = useAuth();
    const [payrolls, setPayrolls] = useState<PayrollType[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            setIsLoading(true);
            api.getPayrollsForEmployee(user.id)
                .then(data => {
                    setPayrolls(data.sort((a, b) => new Date(`${a.year}-${a.month}-01`) > new Date(`${b.year}-${b.month}-01`) ? -1 : 1));
                })
                .catch(err => {
                    console.error("Failed to fetch payrolls", err);
                    setError("Could not load your payroll data. Please try again.");
                })
                .finally(() => setIsLoading(false));
        }
    }, [user]);

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
    };

    const tableContainerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.05 }
        }
    };

    const tableRowVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: 'spring' }
        }
    };

    return (
        <Card>
            <h3 className="text-xl font-medium text-slate-900 dark:text-white">My Payslips</h3>
            {isLoading ? (
                <p className="mt-4 text-center text-slate-500">Loading payslips...</p>
            ) : error ? (
                <p className="mt-4 text-center text-red-500">{error}</p>
            ) : payrolls.length === 0 ? (
                <p className="mt-4 text-center text-slate-500 py-8">No payslips found.</p>
            ) : (
                <div className="mt-6 flow-root">
                    <div className="overflow-x-auto">
                        <div className="inline-block min-w-full py-2 align-middle">
                            <table className="min-w-full">
                                <thead className="border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th className="py-4 pl-4 pr-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider sm:pl-0">Period</th>
                                        <th className="px-3 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Basic Salary</th>
                                        <th className="px-3 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Deductions</th>
                                        <th className="px-3 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Net Salary</th>
                                        <th className="relative py-4 pl-3 pr-4 sm:pr-0"><span className="sr-only">Download</span></th>
                                    </tr>
                                </thead>
                                <motion.tbody variants={tableContainerVariants} initial="hidden" animate="visible">
                                    {payrolls.map(p => (
                                        <motion.tr key={p.id} variants={tableRowVariants} className="border-b border-slate-200 dark:border-slate-800">
                                            <td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm font-medium text-slate-900 dark:text-white sm:pl-0">{p.month} {p.year}</td>
                                            <td className="whitespace-nowrap px-3 py-5 text-sm text-slate-500 dark:text-slate-400">{formatCurrency(p.basicSalary)}</td>
                                            <td className="whitespace-nowrap px-3 py-5 text-sm text-slate-500 dark:text-slate-400">{formatCurrency(p.deductions)}</td>
                                            <td className="whitespace-nowrap px-3 py-5 text-sm font-semibold text-slate-700 dark:text-slate-300">{formatCurrency(p.netSalary)}</td>
                                            <td className="relative whitespace-nowrap py-5 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                                                <a href="#" onClick={e => e.preventDefault()} className="text-primary-600 hover:text-primary-800 dark:text-primary-400">Download</a>
                                            </td>
                                        </motion.tr>
                                    ))}
                                </motion.tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default Payroll;