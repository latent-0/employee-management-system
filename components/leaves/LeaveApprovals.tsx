import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import type { LeaveRequest, Employee } from '../../types';
import { LeaveStatus } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

const LeaveApprovals: React.FC = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState<LeaveRequest[]>([]);
    const [employees, setEmployees] = useState<Map<string, Employee>>(new Map());
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isUpdating, setIsUpdating] = useState<string | null>(null); // store id of request being updated

    const fetchLeaveApprovals = useCallback(() => {
        if (user) {
            setIsLoading(true);
            Promise.all([
                api.getLeaveRequestsForManager(user.id),
                api.getEmployees()
            ]).then(([leaveData, employeeData]) => {
                setRequests(leaveData.sort((a, b) => new Date(a.startDate).getTime() - new Date(b.startDate).getTime()));
                
                const empMap = new Map<string, Employee>();
                employeeData.forEach(emp => empMap.set(emp.id, emp));
                setEmployees(empMap);

            }).catch(err => {
                console.error("Failed to load data", err);
                setError("Could not load leave approvals. Please try again.");
            }).finally(() => setIsLoading(false));
        }
    }, [user]);

    useEffect(() => {
        fetchLeaveApprovals();
    }, [fetchLeaveApprovals]);

    const handleUpdateStatus = async (id: string, status: LeaveStatus) => {
        setIsUpdating(id);
        try {
            await api.updateLeaveStatus(id, status);
            fetchLeaveApprovals(); // Refetch to get the latest list
        } catch (err) {
            console.error("Failed to update leave status", err);
            alert("Failed to update status. Please try again.");
        } finally {
            setIsUpdating(null);
        }
    };

    const getEmployeeName = (employeeId: string) => {
        return employees.get(employeeId)?.name || 'Unknown Employee';
    };

    if (isLoading) return <Card><p className="text-center text-slate-500">Loading leave requests for approval...</p></Card>;
    if (error) return <Card><p className="text-center text-red-500">{error}</p></Card>;

    const pendingRequests = requests.filter(r => r.status === LeaveStatus.PENDING);
    const historicalRequests = requests.filter(r => r.status !== LeaveStatus.PENDING);

    const renderRequestTable = (reqs: LeaveRequest[], title: string) => {
        if (reqs.length === 0) {
            return (
                <Card>
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{title}</h3>
                    <p className="mt-4 text-center text-slate-500 dark:text-slate-400 py-8">No requests found.</p>
                </Card>
            );
        }

        return (
            <Card>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">{title}</h3>
                <div className="mt-6 flow-root">
                    <div className="overflow-x-auto">
                        <div className="inline-block min-w-full py-2 align-middle">
                        <table className="min-w-full">
                             <thead className="border-b border-slate-200 dark:border-slate-700">
                                <tr>
                                    <th className="py-4 pl-4 pr-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider sm:pl-0">Employee</th>
                                    <th className="px-3 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Dates</th>
                                    <th className="px-3 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                                    <th className="px-3 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Reason</th>
                                    <th className="relative py-4 pl-3 pr-4 sm:pr-0">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {reqs.map(req => (
                                    <tr key={req.id} className="border-b border-slate-200 dark:border-slate-800">
                                        <td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm font-medium text-slate-900 dark:text-white sm:pl-0">{getEmployeeName(req.employeeId)}</td>
                                        <td className="whitespace-nowrap px-3 py-5 text-sm text-slate-500 dark:text-slate-400">{new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}</td>
                                        <td className="whitespace-nowrap px-3 py-5 text-sm text-slate-500 dark:text-slate-400">{req.leaveType}</td>
                                        <td className="px-3 py-5 text-sm text-slate-500 dark:text-slate-400 max-w-xs truncate" title={req.reason}>{req.reason}</td>
                                        <td className="relative whitespace-nowrap py-5 pl-3 pr-4 text-left text-sm font-medium sm:pr-0">
                                            {req.status === LeaveStatus.PENDING ? (
                                                <div className="flex items-center space-x-2">
                                                    <Button size="sm" variant="primary" onClick={() => handleUpdateStatus(req.id, LeaveStatus.APPROVED)} isLoading={isUpdating === req.id}>Approve</Button>
                                                    <Button size="sm" variant="danger" onClick={() => handleUpdateStatus(req.id, LeaveStatus.REJECTED)} isLoading={isUpdating === req.id}>Reject</Button>
                                                </div>
                                            ) : (
                                                <Badge color={req.status === LeaveStatus.APPROVED ? 'green' : 'red'}>{req.status}</Badge>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        </div>
                    </div>
                </div>
            </Card>
        );
    };

    return (
        <div className="space-y-8">
            {renderRequestTable(pendingRequests, 'Pending Leave Approvals')}
            {renderRequestTable(historicalRequests, 'Approval History')}
        </div>
    );
};

export default LeaveApprovals;