import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import Card from '../ui/Card';
import Button from '../ui/Button';
import type { Company } from '../../types';

const AdminOnboardingFlow: React.FC = () => {
    const { user, markOnboardingAsCompleted } = useAuth();
    const [step, setStep] = useState(1);
    const [isLoading, setIsLoading] = useState(false);
    
    // Step 2 State
    const [geoData, setGeoData] = useState({ latitude: '', longitude: '', radius: '200' });

    // Step 3 State
    const [invitationCode, setInvitationCode] = useState('');
    const [isGeneratingCode, setIsGeneratingCode] = useState(false);

    const inputClasses = "mt-1 w-full rounded-md border-slate-300 shadow-sm sm:text-sm bg-white text-slate-900 dark:text-white dark:bg-slate-800 dark:border-slate-700 focus:ring-primary-500 focus:border-primary-500";

    const handleGeoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setGeoData({ ...geoData, [e.target.name]: e.target.value });
    };
    
    const handleNextStep = () => setStep(prev => prev + 1);
    const handlePrevStep = () => setStep(prev => prev - 1);
    
    const saveGeofence = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            await api.updateCompanyDetails(user.companyId, {
                latitude: parseFloat(geoData.latitude),
                longitude: parseFloat(geoData.longitude),
                radius: parseInt(geoData.radius, 10),
            });
            handleNextStep();
        } catch (error) {
             console.error("Failed to save geofence", error);
             alert("Could not save settings. Please ensure values are correct.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const generateAndSaveCode = async () => {
        if (!user) return;
        setIsGeneratingCode(true);
        try {
            const code = Math.random().toString(36).substring(2, 8).toUpperCase();
            await api.updateCompanyDetails(user.companyId, { invitationCode: code });
            setInvitationCode(code);
        } catch (error) {
            console.error("Failed to generate code", error);
        } finally {
            setIsGeneratingCode(false);
        }
    };

    const handleFinishOnboarding = async () => {
        if (!user) return;
        setIsLoading(true);
        try {
            await api.completeOnboarding(user.id);
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
            <div className="bg-primary-600 h-2.5 rounded-full" style={{ width: `${(currentStep / totalSteps) * 100}%`, transition: 'width 0.5s ease-in-out' }}></div>
        </div>
    );

    const renderStep = () => {
        switch (step) {
            case 1: // Welcome
                return (
                    <div>
                        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">Welcome, Administrator!</h2>
                        <p className="mt-4 text-center text-gray-600 dark:text-gray-400">Let's set up your new company on the EMS platform.</p>
                        <div className="mt-8 flex justify-end">
                            <Button onClick={handleNextStep}>Start Setup</Button>
                        </div>
                    </div>
                );
            case 2: // Geofence Setup
                return (
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Configure Smart Attendance</h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Set a geofence around your office to enable location-based clock-ins. Employees must be within this radius to mark attendance.</p>
                        <div className="mt-6 space-y-4">
                             <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Office Latitude</label>
                                <input type="number" name="latitude" value={geoData.latitude} onChange={handleGeoChange} required className={inputClasses} placeholder="e.g., 37.422" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Office Longitude</label>
                                <input type="number" name="longitude" value={geoData.longitude} onChange={handleGeoChange} required className={inputClasses} placeholder="e.g., -122.084"/>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Radius (in meters)</label>
                                <input type="number" name="radius" value={geoData.radius} onChange={handleGeoChange} required className={inputClasses} />
                            </div>
                        </div>
                        <div className="mt-8 flex justify-between">
                            <Button variant="secondary" onClick={handlePrevStep}>Back</Button>
                            <Button onClick={saveGeofence} isLoading={isLoading}>Save and Continue</Button>
                        </div>
                    </div>
                );
            case 3: // Invitation Code
                return (
                    <div>
                        <h2 className="text-xl font-bold text-gray-900 dark:text-white">Employee Invitation</h2>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Generate a unique code to share with your employees so they can join your company.</p>
                        
                        {invitationCode ? (
                            <div className="mt-8 text-center">
                                <p className="text-sm text-gray-500">Your company invitation code is:</p>
                                <p className="text-4xl font-mono my-4 p-4 bg-slate-100 dark:bg-slate-800 rounded-lg tracking-widest text-slate-900 dark:text-slate-200">{invitationCode}</p>
                                <p className="text-xs text-gray-500">Share this code with your team. They will need it to sign up.</p>
                            </div>
                        ) : (
                             <div className="mt-8 flex justify-center">
                                <Button onClick={generateAndSaveCode} isLoading={isGeneratingCode}>Generate Code</Button>
                            </div>
                        )}
                        
                        <div className="mt-8 flex justify-between">
                            <Button variant="secondary" onClick={handlePrevStep}>Back</Button>
                            <Button onClick={handleNextStep} disabled={!invitationCode}>Continue</Button>
                        </div>
                    </div>
                );
            case 4: // Finish
                 return (
                    <div>
                        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">Setup Complete!</h2>
                        <p className="mt-4 text-center text-gray-600 dark:text-gray-400">Your company is now configured. You can now access the full dashboard and start managing your team.</p>
                        <div className="mt-8 flex justify-between">
                            <Button variant="secondary" onClick={handlePrevStep}>Back</Button>
                            <Button onClick={handleFinishOnboarding} isLoading={isLoading}>Go to Dashboard</Button>
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

export default AdminOnboardingFlow;