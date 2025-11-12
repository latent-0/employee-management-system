import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import type { PerformanceReview } from '../../types';
import Card from '../ui/Card';

const Performance: React.FC = () => {
    const { user } = useAuth();
    const [reviews, setReviews] = useState<PerformanceReview[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (user) {
            setIsLoading(true);
            api.getPerformanceReviewsForEmployee(user.id)
                .then(data => {
                    setReviews(data.sort((a, b) => new Date(b.reviewDate).getTime() - new Date(a.reviewDate).getTime()));
                })
                .catch(err => {
                    console.error("Failed to fetch performance reviews", err);
                    setError("Could not load your performance data. Please try again.");
                })
                .finally(() => setIsLoading(false));
        }
    }, [user]);

    const listVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: 'spring' }
        }
    };

    return (
        <Card>
            <h3 className="text-xl font-medium text-slate-900 dark:text-white">My Performance Reviews</h3>
            {isLoading ? (
                <p className="mt-4 text-center text-slate-500">Loading performance history...</p>
            ) : error ? (
                <p className="mt-4 text-center text-red-500">{error}</p>
            ) : reviews.length === 0 ? (
                <p className="mt-4 text-center text-slate-500 py-8">No performance reviews found.</p>
            ) : (
                <motion.div 
                    className="mt-6 space-y-6"
                    variants={listVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {reviews.map(review => (
                        <motion.div key={review.id} variants={itemVariants}>
                            <div className="p-5 border border-slate-200 dark:border-slate-800 rounded-lg bg-white dark:bg-slate-900">
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="font-medium text-slate-900 dark:text-white">Review on {new Date(review.reviewDate).toLocaleDateString()}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400 font-light">Reviewer ID: {review.reviewerId}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-sm text-slate-500 dark:text-slate-400 font-light">Overall Rating</p>
                                        <p className="text-2xl font-bold text-slate-700 dark:text-slate-200">{review.rating.toFixed(1)} / 5</p>
                                    </div>
                                </div>
                                <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700">
                                    <h4 className="text-sm font-medium text-slate-600 dark:text-slate-300">Reviewer Comments:</h4>
                                    <p className="mt-1 text-sm text-slate-800 dark:text-slate-200 font-light italic">"{review.comments}"</p>
                                </div>
                                <div className="mt-4">
                                    <h4 className="text-sm font-medium text-slate-600 dark:text-slate-300">Goals for Next Period:</h4>
                                    <p className="mt-1 text-sm text-slate-800 dark:text-slate-200 font-light">"{review.goals}"</p>
                                </div>
                            </div>
                        </motion.div>
                    ))}
                </motion.div>
            )}
        </Card>
    );
};

export default Performance;
