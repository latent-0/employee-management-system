import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';
import ParticleBackground from '../ui/ParticleBackground';
import PhotoCapture from './PhotoCapture';

interface SignUpProps {
    navigateTo: (view: 'login' | 'landing') => void;
}

type View = 'choice' | 'join' | 'register';
type Step = 'details' | 'photo';

const SignUp: React.FC<SignUpProps> = ({ navigateTo }) => {
    const [view, setView] = useState<View>('choice');
    const [step, setStep] = useState<Step>('details');
    const { signUpEmployee, signUpAdmin } = useAuth();
    
    // Form state
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        phone: '',
        invitationCode: '',
        companyName: '',
        avatarUrl: '',
    });
    
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({...prev, [e.target.name]: e.target.value}));
    };

    const handleDetailsSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setStep('photo');
    };

    const handlePhotoVerified = async (avatarDataUrl: string) => {
        const finalData = { ...formData, avatarUrl: avatarDataUrl };
        setIsLoading(true);
        setError(null);
        try {
            if (view === 'join') {
                await signUpEmployee(finalData);
            } else {
                await signUpAdmin(finalData);
            }
        } catch (err: any) {
            setError(err.message || 'Failed to sign up. Please try again.');
            setStep('details'); // Go back to details step on error
        } finally {
            setIsLoading(false);
        }
    };

    const inputClasses = "appearance-none block w-full px-1 py-2 border-b-2 border-slate-200 bg-transparent text-slate-900 focus:outline-none focus:ring-0 focus:border-primary-500 sm:text-sm dark:border-slate-700 dark:placeholder-slate-400 dark:text-white";

    const renderChoiceView = () => (
        <div className="space-y-6">
            <Button size="lg" className="w-full" onClick={() => setView('join')}>
                Join an Existing Company
            </Button>
            <Button size="lg" variant="secondary" className="w-full" onClick={() => setView('register')}>
                Register a New Company
            </Button>
        </div>
    );
    
    const renderJoinForm = () => (
        <form className="space-y-8" onSubmit={handleDetailsSubmit}>
            {error && <p className="text-center text-sm text-red-500">{error}</p>}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className={inputClasses} />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className={inputClasses} />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleInputChange} required className={inputClasses} />
            </div>
             <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Phone</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} required className={inputClasses} />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Invitation Code</label>
                <input type="text" name="invitationCode" value={formData.invitationCode} onChange={(e) => setFormData(prev => ({...prev, invitationCode: e.target.value.toUpperCase()}))} required className={inputClasses} />
            </div>
            <div className="pt-2">
                <Button type="submit" className="w-full">Next: Add Photo</Button>
            </div>
        </form>
    );

    const renderRegisterForm = () => (
        <form className="space-y-8" onSubmit={handleDetailsSubmit}>
            {error && <p className="text-center text-sm text-red-500">{error}</p>}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Your Full Name</label>
                <input type="text" name="name" value={formData.name} onChange={handleInputChange} required className={inputClasses} />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Work Email</label>
                <input type="email" name="email" value={formData.email} onChange={handleInputChange} required className={inputClasses} />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
                <input type="password" name="password" value={formData.password} onChange={handleInputChange} required className={inputClasses} />
            </div>
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Company Name</label>
                <input type="text" name="companyName" value={formData.companyName} onChange={handleInputChange} required className={inputClasses} />
            </div>
            <div className="pt-2">
                 <Button type="submit" className="w-full">Next: Add Photo</Button>
            </div>
        </form>
    );

    const renderContent = () => {
        if (isLoading) {
             return <div className="text-center"><p className="text-slate-500 dark:text-slate-400">Creating your account...</p></div>;
        }

        if (step === 'photo') {
            return <PhotoCapture onPhotoVerified={handlePhotoVerified} onBack={() => { setStep('details'); setError(null); }} />;
        }

        switch(view) {
            case 'join': return renderJoinForm();
            case 'register': return renderRegisterForm();
            case 'choice':
            default: return renderChoiceView();
        }
    }

    return (
        <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 font-sans overflow-hidden">
            <ParticleBackground startInCircleState={true} />
            <div className="relative z-10 min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <h1 className="text-center text-4xl font-bold text-primary-700 dark:text-primary-300">EMS</h1>
                    <h2 className="mt-6 text-center text-3xl font-light text-gray-900 dark:text-white">
                        {step === 'photo' ? 'Set Your Profile Picture' :
                         view === 'choice' ? 'Get Started' :
                         view === 'join' ? 'Join your company' : 'Register your company'
                        }
                    </h2>
                </div>
                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white dark:bg-slate-900 py-8 px-4 border border-slate-200 dark:border-slate-800 sm:rounded-xl sm:px-10">
                        {renderContent()}
                        
                        <div className="mt-8 text-center">
                            <p className="text-sm text-slate-600 dark:text-slate-400 font-light">
                                {view !== 'choice' && step === 'details' ? (
                                    <a href="#" onClick={(e) => { e.preventDefault(); setView('choice'); setError(null); }} className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
                                        &larr; Back to options
                                    </a>
                                ) : view === 'choice' ? (
                                    <>
                                        Already have an account?{' '}
                                        <a href="#" onClick={(e) => { e.preventDefault(); navigateTo('login'); }} className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
                                            Sign in
                                        </a>
                                    </>
                                ) : null}
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SignUp;