import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import Card from '../ui/Card';
import { geminiService } from '../../services/geminiService';

const MoodTracker: React.FC = () => {
    const [selectedMood, setSelectedMood] = useState<string | null>(null);

    const moods = [
        { name: 'Happy', icon: '😄' },
        { name: 'Neutral', icon: '😐' },
        { name: 'Sad', icon: '😔' },
        { name: 'Stressed', icon: '😫' },
        { name: 'Productive', icon: '🚀' },
    ];

    const handleMoodSelect = (mood: string) => {
        setSelectedMood(mood);
        setTimeout(() => setSelectedMood(null), 3000); // Reset after 3 seconds
    };

    return (
        <Card>
            <h3 className="text-xl font-medium text-slate-900 dark:text-white">How are you feeling today?</h3>
            {selectedMood ? (
                <div className="mt-4 text-center py-8">
                    <p className="text-slate-600 dark:text-slate-300">Thanks for sharing! Your feedback is valuable.</p>
                </div>
            ) : (
                <div className="mt-6 flex justify-around items-center">
                    {moods.map(mood => (
                        <motion.div
                            key={mood.name}
                            onClick={() => handleMoodSelect(mood.name)}
                            className="text-center cursor-pointer group"
                            whileHover={{ scale: 1.2, rotate: [0, 10, -10, 0] }}
                            whileTap={{ scale: 0.9 }}
                            transition={{ type: 'spring', stiffness: 300 }}
                        >
                            <p className="text-4xl">{mood.icon}</p>
                            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 font-light opacity-0 group-hover:opacity-100 transition-opacity">{mood.name}</p>
                        </motion.div>
                    ))}
                </div>
            )}
        </Card>
    );
};


const Wellness: React.FC = () => {
    const [tip, setTip] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        setIsLoading(true);
        geminiService.getWellnessTip()
            .then(setTip)
            .catch(err => {
                console.error("Failed to fetch wellness tip", err);
                setTip("Taking short, frequent breaks can improve focus and reduce stress. Try the 20-20-20 rule: every 20 minutes, look at something 20 feet away for 20 seconds.");
            })
            .finally(() => setIsLoading(false));
    }, []);

    const wellnessTopics = [
        { title: "Mental Health Support", description: "Access confidential counseling and mental health resources 24/7 through our Employee Assistance Program." },
        { title: "Physical Fitness Challenge", description: "Join the company-wide steps challenge this month! Track your progress and win prizes." },
        { title: "Ergonomics Workshop", description: "Sign up for our upcoming workshop on setting up an ergonomic workspace to prevent strain." },
        { title: "Financial Wellness Seminar", description: "Learn about retirement planning and investment strategies in our next seminar." },
    ];

    return (
        <div className="space-y-8">
            <div className="p-6 sm:p-8 md:p-12 rounded-xl bg-gradient-to-r from-emerald-500 to-teal-600 text-white shadow-lg">
                <h2 className="text-3xl sm:text-4xl font-normal">Employee Wellness Hub</h2>
                <p className="mt-2 text-emerald-100 font-light">Your well-being is our priority. Explore resources to support your health and happiness.</p>
            </div>

            <MoodTracker />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                    <h3 className="text-xl font-medium text-slate-900 dark:text-white">AI-Powered Daily Wellness Tip ✨</h3>
                    {isLoading ? (
                        <p className="mt-3 text-slate-500 dark:text-slate-400 animate-pulse">Generating a fresh tip just for you...</p>
                    ) : (
                        <p className="mt-3 text-slate-700 dark:text-slate-300 font-light italic">"{tip}"</p>
                    )}
                </Card>

                {wellnessTopics.map((topic, index) => (
                    <Card key={index}>
                        <h4 className="text-lg font-medium text-slate-900 dark:text-white">{topic.title}</h4>
                        <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 font-light">{topic.description}</p>
                         <a href="#" className="mt-4 inline-block text-sm font-medium text-primary-600 hover:text-primary-800 dark:text-primary-400 dark:hover:text-primary-200">Learn More &rarr;</a>
                    </Card>
                ))}
            </div>
        </div>
    );
};

export default Wellness;