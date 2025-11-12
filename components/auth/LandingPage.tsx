import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Button from '../ui/Button';
import ParticleBackground from '../ui/ParticleBackground';

interface LandingPageProps {
    navigateTo: (view: 'login' | 'signup') => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ navigateTo }) => {
    const [isTransitioning, setIsTransitioning] = useState(false);

    const handleNavigation = (view: 'login' | 'signup') => {
        setIsTransitioning(true);
        setTimeout(() => {
            navigateTo(view);
        }, 1500); // 1.5 seconds for animation before navigation
    };

    return (
        <div className="relative min-h-screen bg-white flex items-center justify-center p-4 overflow-hidden font-sans">
            <ParticleBackground 
                particleColor='rgba(15, 23, 42, 0.8)' 
                lineColor='rgba(15, 23, 42, 0.1)' 
                animateToCircle={isTransitioning} 
            />
            <div className="relative z-10 text-center">
                 <AnimatePresence>
                    {!isTransitioning && (
                        <motion.div
                            initial={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -20 }}
                            transition={{ duration: 0.5 }}
                        >
                            <h1 className="text-5xl md:text-7xl font-light tracking-wider text-slate-900">
                                Employee Management System
                            </h1>
                            <p className="mt-6 text-lg md:text-xl text-slate-600 max-w-2xl mx-auto font-light">
                                Streamline HR processes, empower your employees, and build a more efficient workplace.
                                All in one platform.
                            </p>
                            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
                                <Button 
                                    onClick={() => handleNavigation('login')} 
                                    size="lg" 
                                    variant="secondary"
                                    className="w-full sm:w-auto"
                                >
                                    Login
                                </Button>
                                <Button 
                                    onClick={() => handleNavigation('signup')} 
                                    size="lg" 
                                    className="w-full sm:w-auto"
                                >
                                    Sign Up
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
};

export default LandingPage;