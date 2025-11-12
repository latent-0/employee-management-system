import React, { useState } from 'react';
import { useAuth } from '../../hooks/useAuth';
import Button from '../ui/Button';
import ParticleBackground from '../ui/ParticleBackground';

interface LoginProps {
    navigateTo: (view: 'signup' | 'landing') => void;
}

const TerminationNotice: React.FC<{ reason: string; date: string }> = ({ reason, date }) => (
    <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 font-sans overflow-hidden">
        <ParticleBackground startInCircleState={true} />
        <div className="relative z-10 min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h1 className="text-center text-4xl font-bold text-primary-700 dark:text-primary-300">EMS</h1>
            </div>
            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white dark:bg-slate-900 py-8 px-4 border border-slate-200 dark:border-slate-800 sm:rounded-xl sm:px-10 text-center">
                    <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Account Scheduled for Deletion</h2>
                    <div className="mt-6 text-slate-600 dark:text-slate-300 space-y-4 font-light">
                        <p>This account is scheduled to be permanently deleted on <span className="font-medium text-slate-800 dark:text-slate-100">{new Date(date).toLocaleDateString()}</span>.</p>
                        <div>
                            <p className="font-normal text-slate-500">Reason:</p>
                            <p className="italic">"{reason}"</p>
                        </div>
                        <p className="text-sm text-slate-500 dark:text-slate-400 pt-4">If you believe this is an error, please contact your HR department.</p>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const Login: React.FC<LoginProps> = ({ navigateTo }) => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [terminationInfo, setTerminationInfo] = useState<{ reason: string; date: string } | null>(null);
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setIsLoading(true);
        try {
            await login({ email, password });
            // The AuthProvider will handle redirecting to the main app layout
        } catch (err: any) {
            if (err.isTermination) {
                setTerminationInfo(err.details);
            } else {
                setError(err.message || 'Failed to login. Please check your credentials.');
            }
        } finally {
            setIsLoading(false);
        }
    };

    if (terminationInfo) {
        return <TerminationNotice reason={terminationInfo.reason} date={terminationInfo.date} />;
    }

    return (
        <div className="relative min-h-screen bg-slate-50 dark:bg-slate-950 font-sans overflow-hidden">
            <ParticleBackground startInCircleState={true} />
            <div className="relative z-10 min-h-screen flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <h1 className="text-center text-4xl font-bold text-primary-700 dark:text-primary-300">EMS</h1>
                    <h2 className="mt-6 text-center text-3xl font-light text-gray-900 dark:text-white">
                        Sign in to your account
                    </h2>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white dark:bg-slate-900 py-8 px-4 border border-slate-200 dark:border-slate-800 sm:rounded-xl sm:px-10">
                        <form className="space-y-8" onSubmit={handleSubmit}>
                            {error && <p className="text-center text-sm text-red-500">{error}</p>}
                            <div>
                                <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Email address
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="email"
                                        name="email"
                                        type="email"
                                        autoComplete="email"
                                        required
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="appearance-none block w-full px-1 py-2 border-b-2 border-slate-200 bg-transparent text-slate-900 focus:outline-none focus:ring-0 focus:border-primary-500 sm:text-sm dark:border-slate-700 dark:placeholder-slate-400 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div>
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Password
                                </label>
                                <div className="mt-1">
                                    <input
                                        id="password"
                                        name="password"
                                        type="password"
                                        autoComplete="current-password"
                                        required
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className="appearance-none block w-full px-1 py-2 border-b-2 border-slate-200 bg-transparent text-slate-900 focus:outline-none focus:ring-0 focus:border-primary-500 sm:text-sm dark:border-slate-700 dark:placeholder-slate-400 dark:text-white"
                                    />
                                </div>
                            </div>

                            <div className="pt-2">
                                <Button type="submit" className="w-full" isLoading={isLoading}>
                                    Sign in
                                </Button>
                            </div>
                        </form>

                        <div className="mt-8">
                            <div className="relative">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-300 dark:border-slate-700" />
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-2 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400">
                                        Or
                                    </span>
                                </div>
                            </div>

                            <div className="mt-6 text-center">
                                 <p className="text-sm text-slate-600 dark:text-slate-400 font-light">
                                    Don't have an account?{' '}
                                    <a href="#" onClick={(e) => { e.preventDefault(); navigateTo('signup'); }} className="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300">
                                        Sign up
                                    </a>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;