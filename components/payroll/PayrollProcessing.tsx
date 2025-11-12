import React, { useState } from 'react';
import { api } from '../../services/api';
import type { Payroll } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';

const PayrollProcessing: React.FC = () => {
    const [month, setMonth] = useState(new Date().toLocaleString('default', { month: 'long' }));
    const [year, setYear] = useState(new Date().getFullYear());
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [processedPayrolls, setProcessedPayrolls] = useState<Payroll[] | null>(null);

    const handleProcessPayroll = async () => {
        const isConfirmed = window.confirm(
            `Are you sure you want to run payroll for ${month} ${year}? This action cannot be easily undone.`
        );
        if (!isConfirmed) {
            return;
        }

        setIsLoading(true);
        setError(null);
        setProcessedPayrolls(null);
        try {
            const result = await api.processPayroll(month, year);
            setProcessedPayrolls(result);
        } catch (err) {
            console.error("Failed to process payroll", err);
            setError("An error occurred while processing payroll. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 5 }, (_, i) => currentYear - i);

    return (
        <div className="space-y-8">
            <Card>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Process Payroll</h3>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Select the month and year to generate payslips for all employees.</p>
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-6 items-end">
                    <div>
                        <label htmlFor="month" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Month</label>
                        <select
                            id="month"
                            value={month}
                            onChange={(e) => setMonth(e.target.value)}
                            className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-slate-800 dark:border-slate-700"
                        >
                            {months.map(m => <option key={m} value={m}>{m}</option>)}
                        </select>
                    </div>
                     <div>
                        <label htmlFor="year" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Year</label>
                        <select
                            id="year"
                            value={year}
                            onChange={(e) => setYear(parseInt(e.target.value, 10))}
                            className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-slate-800 dark:border-slate-700"
                        >
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>
                    <Button
                        onClick={handleProcessPayroll}
                        isLoading={isLoading}
                        className="w-full sm:w-auto"
                    >
                        Run Payroll
                    </Button>
                </div>
                {error && <p className="mt-4 text-sm text-red-500">{error}</p>}
            </Card>

            {processedPayrolls && (
                <Card>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Payroll Processed Successfully</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        Generated {processedPayrolls.length} payslips for {month} {year}.
                    </p>
                    <div className="mt-6 flow-root">
                        <div className="-my-2 -mx-4 sm:-mx-6 lg:-mx-8">
                            <div className="inline-block min-w-full py-2 align-middle">
                                <table className="min-w-full">
                                    <thead className="border-b border-slate-200 dark:border-slate-700">
                                        <tr>
                                            <th className="py-4 pl-4 pr-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider sm:pl-6 lg:pl-8">Employee ID</th>
                                            <th className="px-3 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Net Salary</th>
                                            <th className="px-3 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Generated Date</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {processedPayrolls.map(p => (
                                            <tr key={p.id} className="border-b border-slate-200 dark:border-slate-800">
                                                <td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm font-medium text-slate-900 dark:text-white sm:pl-6 lg:pl-8">{p.employeeId}</td>
                                                <td className="whitespace-nowrap px-3 py-5 text-sm text-slate-500 dark:text-slate-400">${p.netSalary.toLocaleString()}</td>
                                                <td className="whitespace-nowrap px-3 py-5 text-sm text-slate-500 dark:text-slate-400">{new Date(p.generatedDate).toLocaleDateString()}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                </Card>
            )}
        </div>
    );
};

export default PayrollProcessing;