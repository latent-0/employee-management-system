// Fix: Added React import to resolve JSX namespace error.
import React from 'react';

export enum UserRole {
    EMPLOYEE = 'Employee',
    DEPARTMENT_HEAD = 'Department Head',
    HR_MANAGER = 'HR Manager',
    ADMIN = 'Admin',
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    companyId: string;
    avatarUrl: string;
    onboardingCompleted: boolean;
}

export interface Employee extends User {
    department: string;
    jobTitle: string; 
    dateOfJoining: string;
    managerId?: string;
    phone: string;
    scheduledDeletionDate?: string;
    terminationReason?: string;
    // Fix: Add optional password property to align with mock API for user creation.
    password?: string;
}

export interface Company {
    id: string;
    name: string;
    invitationCode: string;
    latitude?: number;
    longitude?: number;
    radius?: number;
}

export interface NavItem {
    name: string;
    view: string;
    // Fix: Changed JSX.Element to React.ReactElement to resolve the "Cannot find namespace 'JSX'" error in a .ts file.
    icon: (props: React.SVGProps<SVGSVGElement>) => React.ReactElement;
    roles: UserRole[];
}

export enum AttendanceStatus {
    PRESENT = 'Present',
    ABSENT = 'Absent',
    ON_LEAVE = 'On Leave',
}

export interface Attendance {
    id: string;
    employeeId: string;
    date: string; // YYYY-MM-DD
    status: AttendanceStatus;
    checkInTime?: string; // HH:MM
    checkOutTime?: string; // HH:MM
}

export enum LeaveType {
    SICK = 'Sick',
    CASUAL = 'Casual',
    ANNUAL = 'Annual',
}

export enum LeaveStatus {
    PENDING = 'Pending',
    APPROVED = 'Approved',
    REJECTED = 'Rejected',
}

export interface LeaveRequest {
    id: string;
    employeeId: string;
    leaveType: LeaveType;
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
    reason: string;
    status: LeaveStatus;
    approverId: string;
}

export interface Payroll {
    id: string;
    employeeId: string;
    month: string;
    year: number;
    basicSalary: number;
    deductions: number;
    netSalary: number;
    generatedDate: string; // ISO string
}

export interface PerformanceReview {
    id: string;
    employeeId: string;
    reviewerId: string;
    reviewDate: string; // YYYY-MM-DD
    rating: number; // 1-5
    comments: string;
    goals: string;
}