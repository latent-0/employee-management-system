import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import { geminiService } from '../../services/geminiService';
import type { PerformanceReview, Employee } from '../../types';
import { UserRole } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';

const PerformanceReviews: React.FC = () => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState<PerformanceReview[]>([]);
    const [team, setTeam] = useState<Employee[]>([]);
    const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filterEmployeeId, setFilterEmployeeId] = useState('all');

    // Form state
    const [showForm, setShowForm] = useState(false);
    const [selectedEmployeeId, setSelectedEmployeeId] = useState('');
    const [rating, setRating] = useState(3);
    const [comments, setComments] = useState('');
    const [goals, setGoals] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isGenerating, setIsGenerating] = useState(false);
    
    const fetchData = useCallback(() => {
        if (user) {
            setIsLoading(true);
            Promise.all([
                api.getAllPerformanceReviews(),
                api.getEmployees()
            ]).then(([reviewData, allEmployeeData]) => {
                setReviews(reviewData.sort((a, b) => new Date(b.reviewDate).getTime() - new Date(a.reviewDate).getTime()));
                const sortedEmployees = allEmployeeData.sort((a, b) => a.name.localeCompare(b.name));
                setAllEmployees(sortedEmployees);
                
                let manageableEmployees: Employee[] = [];
                if (user.role === UserRole.HR_MANAGER) {
                    manageableEmployees = sortedEmployees.filter(e => e.id !== user.id);
                } else if (user.role === UserRole.DEPARTMENT_HEAD) {
                    manageableEmployees = sortedEmployees.filter(e => e.managerId === user.id);
                }
                setTeam(manageableEmployees);

                if (manageableEmployees.length > 0) {
                    setSelectedEmployeeId(manageableEmployees[0].id);
                }
            }).catch(err => {
                console.error("Failed to load performance data", err);
                setError("Could not load performance review data.");
            }).finally(() => setIsLoading(false));
        }
    }, [user]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    const handleGenerateFeedback = async () => {
        const employee = team.find(e => e.id === selectedEmployeeId);
        if (!employee) return;
        
        setIsGenerating(true);
        try {
            // Find the most recent review for context
            const previousReview = reviews
                .filter(r => r.employeeId === selectedEmployeeId)
                .sort((a, b) => new Date(b.reviewDate).getTime() - new Date(a.reviewDate).getTime())[0];

            const feedback = await geminiService.generatePerformanceFeedback(employee.name, rating, previousReview?.comments);
            setComments(feedback);
        } catch (err) {
            console.error("Failed to generate feedback", err);
            alert("Could not generate AI feedback. Please try again or write it manually.");
        } finally {
            setIsGenerating(false);
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !selectedEmployeeId) return;

        setIsSubmitting(true);
        try {
            await api.submitPerformanceReview({
                employeeId: selectedEmployeeId,
                reviewerId: user.id,
                reviewDate: new Date().toISOString().split('T')[0],
                rating,
                comments,
                goals
            });
            setShowForm(false);
            setComments('');
            setGoals('');
            setRating(3);
            fetchData();
        } catch (err) {
            console.error("Failed to submit review", err);
            alert("Failed to submit review. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    const getNameById = (id: string) => allEmployees.find(e => e.id === id)?.name || 'Unknown';

    const renderReviewForm = () => (
         <Card className="mt-6">
             <h3 className="text-xl font-semibold text-slate-900 dark:text-white">New Performance Review</h3>
            <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                <div>
                    <label htmlFor="employee" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Employee</label>
                    <select id="employee" value={selectedEmployeeId} onChange={e => setSelectedEmployeeId(e.target.value)} className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-slate-800 dark:border-slate-700">
                        {team.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                    </select>
                </div>
                 <div>
                    <label htmlFor="rating" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Rating: {rating} / 5</label>
                    <input type="range" id="rating" min="1" max="5" step="0.5" value={rating} onChange={e => setRating(parseFloat(e.target.value))} className="mt-2 w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer dark:bg-slate-700" />
                </div>
                <div>
                     <label htmlFor="comments" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Comments</label>
                     <textarea id="comments" value={comments} onChange={e => setComments(e.target.value)} required rows={5} className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-slate-800 dark:border-slate-700"></textarea>
                     <Button type="button" variant="secondary" onClick={handleGenerateFeedback} isLoading={isGenerating} className="mt-2 text-xs">Generate with AI</Button>
                </div>
                 <div>
                     <label htmlFor="goals" className="block text-sm font-medium text-slate-700 dark:text-slate-300">Goals for Next Period</label>
                     <textarea id="goals" value={goals} onChange={e => setGoals(e.target.value)} required rows={3} className="mt-1 block w-full rounded-lg border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-slate-800 dark:border-slate-700"></textarea>
                </div>
                 <div className="flex justify-end space-x-3 pt-2">
                    <Button type="button" variant="secondary" onClick={() => setShowForm(false)} disabled={isSubmitting}>Cancel</Button>
                    <Button type="submit" isLoading={isSubmitting}>Submit Review</Button>
                </div>
            </form>
         </Card>
    );

    const renderReviewList = () => {
        if (isLoading) return <p className="mt-8 text-center text-slate-500">Loading reviews...</p>;
        if (error) return <p className="mt-8 text-center text-red-500">{error}</p>;

        const filteredReviews = filterEmployeeId === 'all'
            ? reviews
            : reviews.filter(review => review.employeeId === filterEmployeeId);

        if (filteredReviews.length === 0) return <p className="mt-8 text-center text-slate-500">No performance reviews found for the selected employee.</p>;

        return (
            <div className="mt-6 space-y-5">
                {filteredReviews.map(review => (
                    <div key={review.id} className="p-5 border border-slate-200 dark:border-slate-800 rounded-lg">
                         <div className="flex justify-between items-start">
                             <div>
                                <p className="font-semibold text-slate-900 dark:text-white">{getNameById(review.employeeId)}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Reviewed by: {getNameById(review.reviewerId)}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">Date: {new Date(review.reviewDate).toLocaleDateString()}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-sm text-slate-500 dark:text-slate-400">Rating</p>
                                <p className="text-xl font-bold text-primary-600 dark:text-primary-400">{review.rating} / 5</p>
                            </div>
                        </div>
                        <p className="mt-3 text-sm text-slate-600 dark:text-slate-300 italic font-light">"{review.comments}"</p>
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <Card>
                <div className="flex justify-between items-center">
                    <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Company Performance Reviews</h3>
                    {!showForm && <Button onClick={() => setShowForm(true)} disabled={team.length === 0}>{team.length > 0 ? 'New Review' : 'No team members'}</Button>}
                </div>

                <div className="mt-6">
                    <label htmlFor="employee-filter" className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                        View Reviews For
                    </label>
                    <select
                        id="employee-filter"
                        value={filterEmployeeId}
                        onChange={e => setFilterEmployeeId(e.target.value)}
                        className="mt-1 block w-full md:w-1/3 rounded-lg border-slate-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 sm:text-sm dark:bg-slate-800 dark:border-slate-700"
                    >
                        <option value="all">All Employees</option>
                        {allEmployees.map(emp => <option key={emp.id} value={emp.id}>{emp.name}</option>)}
                    </select>
                </div>
                
                {renderReviewList()}
            </Card>
            {showForm && renderReviewForm()}
        </div>
    );
};

export default PerformanceReviews;