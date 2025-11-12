import React, { createContext, useState, useContext, useEffect, ReactNode } from 'react';
import { supabase } from '../services/supabaseClient';
import { api } from '../services/api';
import type { Employee, UserRole } from '../types';
import { UserRole as UserRoleEnum } from '../types';

interface AuthContextType {
    user: Employee | null;
    role: UserRole | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (credentials: any) => Promise<void>;
    logout: () => void;
    signUpAdmin: (data: any) => Promise<void>;
    signUpEmployee: (data: any) => Promise<void>;
    markOnboardingAsCompleted: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [user, setUser] = useState<Employee | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
            if (session?.user) {
                const profile = await api.getEmployeeById(session.user.id);
                setUser(profile || null);
            } else {
                setUser(null);
            }
            setIsLoading(false);
        });

        // Initial check
        const checkUser = async () => {
            const { data: { user: authUser } } = await supabase.auth.getUser();
            if (authUser) {
                const profile = await api.getEmployeeById(authUser.id);
                setUser(profile || null);
            }
            setIsLoading(false);
        }
        checkUser();

        return () => subscription.unsubscribe();
    }, []);

    const login = async (credentials: any) => {
        // Pre-authentication check for terminated employees
        const { data: profile } = await supabase
            .from('employees')
            .select('scheduledDeletionDate, terminationReason')
            .eq('email', credentials.email)
            .single();

        if (profile?.scheduledDeletionDate) {
            const termError: any = new Error('This account is scheduled for deletion.');
            termError.isTermination = true;
            termError.details = { reason: profile.terminationReason, date: profile.scheduledDeletionDate };
            throw termError;
        }

        const { error } = await supabase.auth.signInWithPassword(credentials);
        if (error) throw error;
        // onAuthStateChange will handle setting the user
    };

    const logout = async () => {
        await supabase.auth.signOut();
        setUser(null);
    };

    const signUpAdmin = async (data: any) => {
        // 1. Create the company
        const { data: companyData, error: companyError } = await supabase
            .from('companies')
            .insert({ name: data.companyName, invitationCode: 'PENDING' })
            .select()
            .single();

        if (companyError) throw companyError;

        // 2. Sign up the user
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
                data: {
                    name: data.name,
                    role: UserRoleEnum.ADMIN,
                    companyId: companyData.id,
                    avatarUrl: data.avatarUrl, // Use captured photo
                }
            }
        });

        if (authError) throw authError;

        // 3. Create the employee profile
        if (authData.user) {
            const { error: profileError } = await supabase.from('employees').insert({
                id: authData.user.id,
                name: data.name,
                email: data.email,
                role: UserRoleEnum.ADMIN,
                companyId: companyData.id,
                avatarUrl: data.avatarUrl, // Use captured photo
                onboardingCompleted: false,
                department: 'Management',
                jobTitle: 'Administrator',
                dateOfJoining: new Date().toISOString().split('T')[0],
                phone: '',
            });

            if (profileError) throw profileError;
        }
        // onAuthStateChange will handle setting the user state
    };

    const signUpEmployee = async (data: any) => {
        // 1. Find the company by invitation code
        const { data: companyData, error: companyError } = await supabase
            .from('companies')
            .select('id')
            .eq('invitationCode', data.invitationCode)
            .single();
        
        if (companyError || !companyData) throw new Error("Invalid invitation code.");

        // 2. Sign up the user
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
             options: {
                data: {
                    name: data.name,
                    role: UserRoleEnum.EMPLOYEE,
                    companyId: companyData.id,
                    avatarUrl: data.avatarUrl, // Use captured photo
                }
            }
        });

        if (authError) throw authError;

        // 3. Create employee profile
         if (authData.user) {
            const { error: profileError } = await supabase.from('employees').insert({
                id: authData.user.id,
                name: data.name,
                email: data.email,
                role: UserRoleEnum.EMPLOYEE,
                companyId: companyData.id,
                avatarUrl: data.avatarUrl, // Use captured photo
                onboardingCompleted: false,
                department: 'Unassigned',
                jobTitle: 'Employee',
                dateOfJoining: new Date().toISOString().split('T')[0],
                phone: data.phone,
            });

            if (profileError) throw profileError;
        }
    };
    
    const markOnboardingAsCompleted = async () => {
        if (user) {
            await api.updateEmployeeProfile(user.id, { onboardingCompleted: true });
            setUser({ ...user, onboardingCompleted: true });
        }
    };

    const value = {
        user,
        role: user?.role || null,
        isAuthenticated: !!user,
        isLoading,
        login,
        logout,
        signUpAdmin,
        signUpEmployee,
        markOnboardingAsCompleted,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};