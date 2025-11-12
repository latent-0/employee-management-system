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
            .select('scheduled_deletion_date, termination_reason')
            .eq('email', credentials.email)
            .single();

        if (profile?.scheduled_deletion_date) {
            const termError: any = new Error('This account is scheduled for deletion.');
            termError.isTermination = true;
            termError.details = { reason: profile.termination_reason, date: profile.scheduled_deletion_date };
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
        // Pre-flight check to prevent race condition with the 'PENDING' invitation code.
        const { data: pendingCompany, error: checkError } = await supabase
            .from('companies')
            .select('id')
            .eq('invitation_code', 'PENDING')
            .limit(1)
            .single();

        // Let PGRST116 (No rows found) pass, but throw other errors.
        if (checkError && checkError.code !== 'PGRST116') {
            throw new Error(`Database check failed: ${checkError.message}`);
        }

        if (pendingCompany) {
            throw new Error("An administrator sign-up is already in progress. Please wait a few moments and try again.");
        }
        
        // 1. Sign up the user. The session might be null if email confirmation is on.
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email: data.email,
            password: data.password,
            options: {
                data: {
                    name: data.name,
                    role: UserRoleEnum.ADMIN,
                    avatarUrl: data.avatarUrl,
                }
            }
        });

        if (authError || !authData.user) {
            throw authError || new Error('User could not be created.');
        }

        // 2. Call the database function to create the company and employee profile.
        // This function runs with elevated privileges (SECURITY DEFINER) to bypass RLS
        // that would otherwise block the new, unconfirmed user.
        const { data: companyId, error: rpcError } = await supabase.rpc('create_company_and_admin', {
            company_name: data.companyName,
            admin_id: authData.user.id,
            admin_name: data.name,
            admin_email: data.email,
            admin_avatar_url: data.avatarUrl
        });

        if (rpcError || !companyId) {
            console.error("Failed to create company and admin profile via RPC. Full error object:", rpcError);
            
            // Construct a detailed, user-friendly error message.
            let userMessage = "An error occurred while creating the company profile.";
            if (rpcError) {
                // Use the message from Supabase if available, as it's often informative.
                if (rpcError.message) {
                    userMessage = `Error: ${rpcError.message}`;
                    // Append details if they exist for more context.
                    if (rpcError.details) {
                        userMessage += ` (${rpcError.details})`;
                    }
                } else {
                    // Fallback for unexpected error structures, preventing '[object Object]'.
                    userMessage = `A database error occurred. Please check the console for the full error object.`;
                }
            }
            
            throw new Error(userMessage);
        }

        // 3. Log the user in to start their session immediately.
        const { error: signInError } = await supabase.auth.signInWithPassword({
            email: data.email,
            password: data.password,
        });

        if (signInError) {
            // If sign-in fails, it might be due to email confirmation being required.
            // We'll throw an error that suggests this.
            console.error("Sign-in after admin sign-up failed:", signInError);
            throw new Error(
                "Company created, but auto-login failed. Please check your email to verify your account, then log in manually."
            );
        }

        // After successful sign-in, the onAuthStateChange listener will fire,
        // fetch the user profile, and update the application state,
        // automatically redirecting the user to the admin onboarding flow.
    };

    const signUpEmployee = async (data: any) => {
        // 1. Find the company by invitation code. This is an anonymous query and is fine.
        const { data: companyData, error: companyError } = await supabase
            .from('companies')
            .select('id')
            .eq('invitation_code', data.invitationCode)
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
                    avatarUrl: data.avatarUrl,
                }
            }
        });

        if (authError || !authData.user) {
            throw authError || new Error('User could not be created.');
        }

        // 3. Create employee profile using an RPC call to a SECURITY DEFINER function
        const { error: rpcError } = await supabase.rpc('create_employee_profile', {
            employee_id: authData.user.id,
            company_id: companyData.id,
            employee_name: data.name,
            employee_email: data.email,
            employee_avatar_url: data.avatarUrl,
            employee_phone: data.phone
        });

        if (rpcError) {
            console.error("Failed to create employee profile via RPC. Full error object:", rpcError);
            
            // Construct a detailed, user-friendly error message.
            let userMessage = "An error occurred while creating the employee profile.";
             if (rpcError) {
                // Use the message from Supabase if available, as it's often informative.
                if (rpcError.message) {
                    userMessage = `Error: ${rpcError.message}`;
                    // Append details if they exist for more context.
                    if (rpcError.details) {
                        userMessage += ` (${rpcError.details})`;
                    }
                } else {
                    // Fallback for unexpected error structures, preventing '[object Object]'.
                    userMessage = `A database error occurred. Please check the console for the full error object.`;
                }
            }

            throw new Error(userMessage);
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
