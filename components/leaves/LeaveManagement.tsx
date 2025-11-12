import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import type { LeaveRequest } from '../../types';
import { LeaveType, LeaveStatus } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

const LeaveManagement: React.FC = () => {
    const { user } = useAuth();
    const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    // Form state
    const [showForm, setShowForm] = useState(false);
    const [leaveType, setLeaveType] = useState<LeaveType>(LeaveType.CASUAL);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [reason, setReason] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    const fetchLeaveData = useCallback(() => {
        if (user) {
            setIsLoading(true);
            api.getLeaveRequestsForEmployee(user.id)
                .then(data => {
                    setLeaveRequests(data.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()));
                })
                .catch(err => {
                    console.error("Failed to fetch leave requests", err);
                    setError("Could not load your leave data. Please try again.");
                })
                .finally(() => setIsLoading(false));
        }
    }, [user]);

    useEffect(() => {
        fetchLeaveData();
    }, [fetchLeaveData]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !user.managerId) {
             alert("Cannot submit request: You don't have a manager assigned.");
            return;
        }
        setIsSubmitting(true);
        try {
            await api.submitLeaveRequest({
                employeeId: user.id,
                leaveType,
                startDate,
                endDate,
                reason,
                approverId: user.managerId,
            });
            setShowForm(false);
            setReason('');
            setStartDate('');
            setEndDate('');
            fetchLeaveData();
        } catch (err) {
            console.error("Failed to submit leave request", err);
            alert("Failed to submit your request. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };
    
    const getStatusColor = (status: LeaveStatus) => {
        switch (status) {
            case LeaveStatus.APPROVED: return 'green';
            case LeaveStatus.PENDING: return 'yellow';
            case LeaveStatus.REJECTED: return 'red';
            default: return 'gray';
        }
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
    
    const renderLeaveForm = () => (
         <Card className="mt-6">
            <h3 className="text-xl font-medium text-slate-900 dark:text-white">New Leave Request</h3>
            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="leaveType" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Leave Type</label>
                        <select 
                            id="leaveType" 
                            value={leaveType} 
                            onChange={e => setLeaveType(e.target.value as LeaveType)} 
                            className="mt-1 block w-full rounded-lg border-slate-300 dark:border-slate-700 shadow-sm sm:text-sm bg-white dark:bg-slate-800"
                        >
                            {Object.values(LeaveType).map(type => (
                                <option key={type} value={type}>{type}</option>
                            ))}
                        </select>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label htmlFor="startDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Start Date</label>
                        <input type="date" id="startDate" value={startDate} onChange={e => setStartDate(e.target.value)} required className="mt-1 block w-full rounded-lg border-slate-300 dark:border-slate-700 shadow-sm sm:text-sm bg-white dark:bg-slate-800" />
                    </div>
                     <div>
                        <label htmlFor="endDate" className="block text-sm font-medium text-slate-700 dark:text-slate-300">End Date</label>
                        <input type="date" id="endDate" value={endDate} onChange={e => setEndDate(e.target.value)} required min={startDate} className="mt-1 block w-full rounded-lg border-slate-300 dark:border-slate-700 shadow-sm sm:text-sm bg-white dark:bg-slate-800" />
                    </div>
                </div>
                <div>
                     <label htmlFor="reason" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Reason</label>
                     <textarea id="reason" value={reason} onChange={e => setReason(e.target.value)} required rows={4} className="mt-1 block w-full rounded-lg border-slate-300 dark:border-slate-700 shadow-sm sm:text-sm bg-white dark:bg-slate-800"></textarea>
                </div>
                <div className="flex justify-end space-x-3 pt-2">
                    <Button type="button" variant="secondary" onClick={() => setShowForm(false)} disabled={isSubmitting}>Cancel</Button>
                    <Button type="submit" isLoading={isSubmitting}>Submit Request</Button>
                </div>
            </form>
        </Card>
    );

    return (
        <div className="space-y-8">
            <Card>
                <div className="flex justify-between items-center">
                    <div>
                        <h3 className="text-xl font-medium text-slate-900 dark:text-white">My Leave Requests</h3>
                        {!user?.managerId && !showForm && (
                            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                                A manager must be assigned to your profile to request leave.
                            </p>
                        )}
                    </div>
                    {!showForm && <Button onClick={() => setShowForm(true)} disabled={!user?.managerId}>New Request</Button>}
                </div>
                {showForm && renderLeaveForm()}
            </Card>

            <Card>
                <h3 className="text-xl font-medium text-slate-900 dark:text-white">Request History</h3>
                {isLoading ? (
                    <p className="mt-4 text-center text-slate-500">Loading history...</p>
                ) : error ? (
                    <p className="mt-4 text-center text-red-500">{error}</p>
                ) : leaveRequests.length === 0 ? (
                    <p className="mt-4 text-center text-slate-500 py-8">No leave requests found.</p>
                ) : (
                     <div className="mt-6 flow-root">
                        <div className="overflow-x-auto">
                            <div className="inline-block min-w-full py-2 align-middle">
                                <table className="min-w-full">
                                    <thead className="border-b border-slate-200 dark:border-slate-700">
                                        <tr>
                                            <th className="py-4 pl-4 pr-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider sm:pl-0">Dates</th>
                                            <th className="px-3 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Type</th>
                                            <th className="px-3 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Reason</th>
                                            <th className="px-3 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                        </tr>
                                    </thead>
                                    <motion.tbody variants={tableContainerVariants} initial="hidden" animate="visible">
                                        {leaveRequests.map(req => (
                                            <motion.tr key={req.id} variants={tableRowVariants} className="border-b border-slate-200 dark:border-slate-800">
                                                <td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm font-medium text-slate-900 dark:text-white sm:pl-0">{new Date(req.startDate).toLocaleDateString()} - {new Date(req.endDate).toLocaleDateString()}</td>
                                                <td className="whitespace-nowrap px-3 py-5 text-sm text-slate-500 dark:text-slate-400">{req.leaveType}</td>
                                                <td className="px-3 py-5 text-sm text-slate-500 dark:text-slate-400 max-w-sm truncate" title={req.reason}>{req.reason}</td>
                                                <td className="whitespace-nowrap px-3 py-5 text-sm">
                                                    <Badge color={getStatusColor(req.status)}>{req.status}</Badge>
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
        </div>
    );
};

export default LeaveManagement;