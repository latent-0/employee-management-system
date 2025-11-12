import React from 'react';
import { AuthProvider, useAuth } from './hooks/useAuth';
import Layout from './components/layout/Layout';
import AuthFlow from './components/auth/AuthFlow';
import OnboardingFlow from './components/onboarding/OnboardingFlow';
import AdminOnboardingFlow from './components/onboarding/AdminOnboardingFlow';
import { UserRole } from './types';
import { NotificationProvider } from './hooks/useNotifications';

const AppContent: React.FC = () => {
    const { user, isLoading } = useAuth();

    if (isLoading) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-gray-100 dark:bg-gray-900">
                <div className="animate-spin rounded-full h-32 w-32 border-t-2 border-b-2 border-primary-600"></div>
            </div>
        );
    }

    if (!user) {
        return <AuthFlow />;
    }

    if (!user.onboardingCompleted) {
        if (user.role === UserRole.ADMIN) {
            return <AdminOnboardingFlow />;
        }
        return <OnboardingFlow />;
    }

    return <Layout />;
};

const App: React.FC = () => {
    return (
        <AuthProvider>
            <NotificationProvider>
                <AppContent />
            </NotificationProvider>
        </AuthProvider>
    );
};

export default App;