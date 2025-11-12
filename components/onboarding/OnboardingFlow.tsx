import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import Card from '../ui/Card';
import Button from '../ui/Button';
import type { Employee } from '../../types';

const OnboardingFlow: React.FC = () => {
    const { user, markOnboardingAsCompleted } = useAuth();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    const [profileData, setProfileData] = useState<Partial<Employee>>({
        name: user?.name || '',
        email: user?.email || '',
        phone: '',
    });
    const [policiesAgreed, setPoliciesAgreed] = useState(false);
    
    const inputClasses = "mt-1 w-full rounded-md border-slate-300 shadow-sm sm:text-sm bg-white text-slate-900 dark:text-white dark:bg-slate-800 dark:border-slate-700 focus:ring-primary-500 focus:border-primary-500";
    const disabledInputClasses = "mt-1 w-full rounded-md border-slate-300 shadow-sm sm:text-sm bg-slate-100 text-slate-500 dark:bg-slate-900 dark:border-slate-700 dark:text-slate-400";

    const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setProfileData({ ...profileData, [e.target.name]: e.target.value });
    };

    const handleNextStep = () => setStep(prev => prev + 1);
    const handlePrevStep = () => setStep(prev => prev - 1);

    const handleFinishOnboarding = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            // First, save any final profile updates
            await api.updateEmployeeProfile(user.id, profileData);
            // Then, mark onboarding as complete on the backend
            await api.completeOnboarding(user.id);
            // Finally, update the auth state to unlock the app
            markOnboardingAsCompleted();
        } catch (error) {
            console.error("Failed to complete onboarding", error);
            alert("An error occurred. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const ProgressBar: React.FC<{ currentStep: number, totalSteps: number }> = ({ currentStep, totalSteps }) => (
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-8">
            <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: `${(currentStep / totalSteps) * 100}%` }}></div>
        </div>
    );

    const renderStep = () => {
        switch (step) {
            case 1: // Welcome
                return (
                    <div>
                        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">Welcome to EMS!</h2>
                        <p className="mt-4 text-center text-gray-600 dark:text-gray-400">We're excited to have you on board. This short guide will help you get set up.</p>
                        <div className="mt-8 flex justify-end">
                            <Button onClick={handleNextStep}>Let's Get Started</Button>
                        </div>
                    </div>
                );
            case 2: // Profile Completion
                return (
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Complete Your Profile</h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Please confirm your details are correct.</p>
                        <div className="mt-6 space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                                <input type="text" name="name" value={profileData.name} onChange={handleProfileChange} className={inputClasses} />
                            </div>
                             <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                                <input type="email" name="email" value={profileData.email} disabled className={disabledInputClasses} />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone Number</label>
                                <input type="tel" name="phone" value={profileData.phone} onChange={handleProfileChange} required className={inputClasses} />
                            </div>
                        </div>
                        <div className="mt-8 flex justify-between">
                            <Button variant="secondary" onClick={handlePrevStep}>Back</Button>
                            <Button onClick={handleNextStep}>Save and Continue</Button>
                        </div>
                    </div>
                );
            case 3: // Policy Review
                return (
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Company Policies</h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Please review the following company policies.</p>
                        <div className="mt-4 h-48 overflow-y-auto p-4 border rounded-md dark:border-gray-600 bg-gray-50 dark:bg-gray-900/50">
                            <h4 className="font-semibold text-gray-800 dark:text-gray-200">Code of Conduct</h4>
                            <p className="text-sm mt-1 text-gray-600 dark:text-gray-300">All employees are expected to maintain a professional and respectful work environment...</p>
                             <h4 className="font-semibold mt-4 text-gray-800 dark:text-gray-200">Data Privacy Policy</h4>
                            <p className="text-sm mt-1 text-gray-600 dark:text-gray-300">Our company is committed to protecting the privacy of employee and customer data...</p>
                        </div>
                        <div className="mt-6 flex items-center">
                            <input id="agree" type="checkbox" checked={policiesAgreed} onChange={() => setPoliciesAgreed(!policiesAgreed)} className="h-4 w-4 text-primary-600 border-gray-300 rounded focus:ring-primary-500" />
                            <label htmlFor="agree" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">I have read and agree to the company policies.</label>
                        </div>
                         <div className="mt-8 flex justify-between">
                            <Button variant="secondary" onClick={handlePrevStep}>Back</Button>
                            <Button onClick={handleNextStep} disabled={!policiesAgreed}>Continue</Button>
                        </div>
                    </div>
                );
            case 4: // Training Materials
                 return (
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Initial Training</h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Here are some resources to get you started. You can always find these later on your dashboard.</p>
                        <ul className="mt-6 space-y-3 list-disc list-inside text-gray-600 dark:text-gray-300">
                           <li><a href="#" className="text-primary-600 hover:underline">Watch: Welcome to the Team!</a></li>
                           <li><a href="#" className="text-primary-600 hover:underline">Read: Our Company Culture Guide</a></li>
                           <li><a href="#" className="text-primary-600 hover:underline">Course: Security Awareness Training</a></li>
                        </ul>
                         <div className="mt-8 flex justify-between">
                            <Button variant="secondary" onClick={handlePrevStep}>Back</Button>
                            <Button onClick={handleFinishOnboarding} isLoading={isLoading}>Finish Onboarding</Button>
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
         <div className="min-h-screen bg-gray-100 dark:bg-gray-800 flex items-center justify-center p-4">
            <div className="w-full max-w-2xl">
                <Card className="shadow-2xl">
                    <ProgressBar currentStep={step} totalSteps={4} />
                    {renderStep()}
                </Card>
            </div>
        </div>
    );
};

export default OnboardingFlow;