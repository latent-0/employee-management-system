import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import type { Employee } from '../../types';
import { UserRole } from '../../types';
import Card from '../ui/Card';
import Badge from '../ui/Badge';

interface EmployeeManagementProps {
    setCurrentView: (view: string) => void;
    setViewedEmployeeId: (id: string) => void;
}

const EmployeeManagement: React.FC<EmployeeManagementProps> = ({ setCurrentView, setViewedEmployeeId }) => {
    const { user } = useAuth();
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchTerm, setSearchTerm] = useState('');

    const isHrOrAdmin = user?.role === UserRole.HR_MANAGER || user?.role === UserRole.ADMIN;
    const title = isHrOrAdmin ? 'All Employees' : 'Your Team';

    useEffect(() => {
        if (user) {
            setIsLoading(true);
            setError(null);
            api.getEmployees().then(allEmployees => {
                if (isHrOrAdmin) {
                    setEmployees(allEmployees);
                } else {
                    const managedTeam = allEmployees.filter(e => e.managerId === user.id);
                    setEmployees(managedTeam);
                }
            }).catch(err => {
                console.error("Failed to fetch employees", err);
                setError("Could not load employee data. Please try again.");
            }).finally(() => {
                setIsLoading(false);
            });
        }
    }, [user, isHrOrAdmin]);
    
    const filteredEmployees = useMemo(() => 
        employees.filter(employee => 
            employee.name.toLowerCase().includes(searchTerm.toLowerCase())
        ), [employees, searchTerm]);

    const handleViewProfile = (employeeId: string) => {
        setViewedEmployeeId(employeeId);
        setCurrentView('profile');
    };

    if (isLoading) {
        return <Card><p className="text-center text-slate-500 dark:text-slate-400">Loading...</p></Card>;
    }

    if (error) {
        return <Card><p className="text-center text-red-500">{error}</p></Card>;
    }

    return (
        <Card>
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-4 sm:gap-0">
                <div>
                    <h3 className="text-xl font-semibold leading-6 text-slate-900 dark:text-white">{title}</h3>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                        {isHrOrAdmin ? 'View, search, and manage all employees.' : 'View your direct reports.'}
                    </p>
                </div>
                {isHrOrAdmin && (
                    <div className="mt-3 sm:mt-0">
                        <input
                            type="text"
                            placeholder="Search by name..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="block w-full sm:w-64 rounded-md border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm text-slate-900 dark:text-white dark:bg-slate-800 dark:border-slate-700"
                        />
                    </div>
                )}
            </div>
            
            {filteredEmployees.length === 0 ? (
                <p className="mt-8 text-center text-slate-500 dark:text-slate-400">
                    {isHrOrAdmin && searchTerm ? `No employees found for "${searchTerm}".` : "No employees to display."}
                </p>
            ) : (
                <div className="mt-6 flow-root">
                    <div className="overflow-x-auto">
                        <div className="inline-block min-w-full py-2 align-middle">
                            <table className="min-w-full">
                                <thead className="border-b border-slate-200 dark:border-slate-700">
                                    <tr>
                                        <th scope="col" className="py-4 pl-4 pr-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider sm:pl-0">Name</th>
                                        <th scope="col" className="px-3 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Title</th>
                                        <th scope="col" className="px-3 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Department</th>
                                        <th scope="col" className="px-3 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                        <th scope="col" className="relative py-4 pl-3 pr-4 sm:pr-0"><span className="sr-only">Actions</span></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredEmployees.map((employee) => (
                                        <tr key={employee.id} className="border-b border-slate-200 dark:border-slate-800">
                                            <td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm sm:pl-0">
                                                <div className="flex items-center">
                                                    <div className="h-10 w-10 flex-shrink-0">
                                                        <img className="h-10 w-10 rounded-full" src={employee.avatarUrl} alt="" />
                                                    </div>
                                                    <div className="ml-4">
                                                        <div className="font-medium text-slate-900 dark:text-white">{employee.name}</div>
                                                        <div className="text-slate-500 dark:text-slate-400">{employee.email}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-5 text-sm text-slate-500 dark:text-slate-400">{employee.jobTitle}</td>
                                            <td className="whitespace-nowrap px-3 py-5 text-sm text-slate-500 dark:text-slate-400">{employee.department}</td>
                                            <td className="whitespace-nowrap px-3 py-5 text-sm">
                                                <Badge color={employee.scheduledDeletionDate ? 'yellow' : 'green'}>
                                                    {employee.scheduledDeletionDate ? 'Pending Deletion' : 'Active'}
                                                </Badge>
                                            </td>
                                            <td className="relative whitespace-nowrap py-5 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                                                <a href="#" onClick={(e) => { e.preventDefault(); handleViewProfile(employee.id); }} className="text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200">View<span className="sr-only">, {employee.name}</span></a>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}
        </Card>
    );
};

export default EmployeeManagement;