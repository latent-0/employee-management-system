import React, { useState } from 'react';
import LandingPage from './LandingPage';
import Login from './Login';
import SignUp from './SignUp';

type AuthView = 'landing' | 'login' | 'signup';

const AuthFlow: React.FC = () => {
    const [view, setView] = useState<AuthView>('landing');

    const navigateTo = (newView: AuthView) => {
        setView(newView);
    };

    switch (view) {
        case 'login':
            return <Login navigateTo={navigateTo} />;
        case 'signup':
            return <SignUp navigateTo={navigateTo} />;
        case 'landing':
        default:
            return <LandingPage navigateTo={navigateTo} />;
    }
};

export default AuthFlow;