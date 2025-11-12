// Fix: Added React import to resolve namespace errors for React.SVGProps
import React from 'react';
import type { NavItem } from './types';
import { UserRole } from './types';

const HomeIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955a1.5 1.5 0 012.122 0l8.954 8.955M2.25 12l8.954 8.955a1.5 1.5 0 002.122 0l8.954-8.955M2.25 12h19.5" /></svg>
);
const UsersIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-4.68c.11-.32.22-.65.33-1.002h.001M.75 4.5a.75.75 0 01.75-.75h13.5a.75.75 0 010 1.5H1.5a.75.75 0 01-.75-.75z" /></svg>
);
const CalendarIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0h18M12 14.25h.008v.008H12v-.008z" /></svg>
);
const ClockIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
);
const CreditCardIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 21z" /></svg>
);
const StarIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518 .442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" /></svg>
);
const ChartBarIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}><path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" /></svg>
);
const WellnessIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
    </svg>
);
const OrgChartIcon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" {...props}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M18 18.72a9.094 9.094 0 003.741-.479 3 3 0 00-4.682-2.72m-7.5-2.962a3.75 3.75 0 015.25 0m-5.25 0a3.75 3.75 0 00-5.25 0M15 4.5V7.5m6 3v3m-3-6v6m0 0v6m-6-6v6m-6-6v6m0 0v6m6-6v6m-3-3h6" />
    </svg>
);


export const NAV_ITEMS: NavItem[] = [
    // All Users
    { name: 'Dashboard', view: 'dashboard', icon: HomeIcon, roles: [UserRole.EMPLOYEE, UserRole.DEPARTMENT_HEAD, UserRole.HR_MANAGER, UserRole.ADMIN] },
    { name: 'My Profile', view: 'profile', icon: UsersIcon, roles: [UserRole.EMPLOYEE, UserRole.DEPARTMENT_HEAD, UserRole.HR_MANAGER, UserRole.ADMIN] },
    { name: 'Wellness', view: 'wellness', icon: WellnessIcon, roles: [UserRole.EMPLOYEE, UserRole.DEPARTMENT_HEAD, UserRole.HR_MANAGER, UserRole.ADMIN] },
    { name: 'Attendance', view: 'attendance', icon: ClockIcon, roles: [UserRole.EMPLOYEE, UserRole.DEPARTMENT_HEAD, UserRole.HR_MANAGER, UserRole.ADMIN] },
    { name: 'Leave', view: 'leave', icon: CalendarIcon, roles: [UserRole.EMPLOYEE, UserRole.DEPARTMENT_HEAD, UserRole.HR_MANAGER, UserRole.ADMIN] },
    { name: 'My Payslips', view: 'payroll', icon: CreditCardIcon, roles: [UserRole.EMPLOYEE, UserRole.DEPARTMENT_HEAD, UserRole.HR_MANAGER, UserRole.ADMIN] },
    { name: 'My Performance', view: 'performance', icon: StarIcon, roles: [UserRole.EMPLOYEE, UserRole.DEPARTMENT_HEAD, UserRole.HR_MANAGER, UserRole.ADMIN] },
    
    // Department Head, HR Manager & Admin
    { name: 'Employees', view: 'team', icon: UsersIcon, roles: [UserRole.DEPARTMENT_HEAD, UserRole.HR_MANAGER, UserRole.ADMIN] },
    { name: 'Leave Approvals', view: 'leave-approvals', icon: CalendarIcon, roles: [UserRole.DEPARTMENT_HEAD, UserRole.HR_MANAGER, UserRole.ADMIN] },
    { name: 'Performance Reviews', view: 'performance-reviews', icon: StarIcon, roles: [UserRole.DEPARTMENT_HEAD, UserRole.HR_MANAGER, UserRole.ADMIN] },
    
    // HR Manager & Admin Only
    { name: 'Organization', view: 'organization-chart', icon: OrgChartIcon, roles: [UserRole.HR_MANAGER, UserRole.ADMIN] },
    { name: 'Payroll Processing', view: 'payroll-processing', icon: CreditCardIcon, roles: [UserRole.HR_MANAGER, UserRole.ADMIN] },
    { name: 'Reports', view: 'reports', icon: ChartBarIcon, roles: [UserRole.HR_MANAGER, UserRole.ADMIN] },
];