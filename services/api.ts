import { supabase } from "./supabaseClient";
import type { 
    Employee, 
    Company, 
    Attendance, 
    LeaveRequest, 
    Payroll, 
    PerformanceReview 
} from "../types";
import { AttendanceStatus, LeaveStatus } from "../types";

// Helper to convert object keys to snake_case for Supabase
const camelToSnakeCase = (str: string) => str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
const keysToSnakeCase = (obj: any): any => {
    if (Array.isArray(obj)) {
        return obj.map(v => keysToSnakeCase(v));
    } else if (obj !== null && obj.constructor === Object) {
        return Object.keys(obj).reduce((acc, key) => {
            acc[camelToSnakeCase(key)] = keysToSnakeCase(obj[key]);
            return acc;
        }, {} as any);
    }
    return obj;
};


// Helper function to handle Supabase errors
const handleSupabaseError = (error: any, context: string) => {
    if (error) {
        console.error(`Error in ${context}:`, error);
        throw new Error(error.message);
    }
};

export const api = {
    // Company
    async getCompanyById(id: string): Promise<Company | null> {
        const { data, error } = await supabase.from('companies').select('*').eq('id', id).single();
        handleSupabaseError(error, 'getCompanyById');
        return data;
    },
    async updateCompanyDetails(id: string, updates: Partial<Company>): Promise<Company> {
        const { data, error } = await supabase.from('companies').update(keysToSnakeCase(updates)).eq('id', id).select().single();
        handleSupabaseError(error, 'updateCompanyDetails');
        return data!;
    },

    // Employees
    async getEmployees(): Promise<Employee[]> {
        const { data, error } = await supabase.from('employees').select('*');
        handleSupabaseError(error, 'getEmployees');
        return data || [];
    },
    async getEmployeeById(id: string): Promise<Employee | null> {
        const { data, error } = await supabase.from('employees').select('*').eq('id', id).single();
        // A user might not have a profile yet right after sign up, so don't throw error on 406 (Not found)
        if (error && error.code !== 'PGRST116') {
             handleSupabaseError(error, 'getEmployeeById');
        }
        return data;
    },
    async updateEmployeeProfile(id: string, updates: Partial<Employee>): Promise<Employee> {
        const { data, error } = await supabase.from('employees').update(keysToSnakeCase(updates)).eq('id', id).select().single();
        handleSupabaseError(error, 'updateEmployeeProfile');
        return data!;
    },
    async removeEmployee(id: string, reason: string): Promise<void> {
        const deletionDate = new Date();
        deletionDate.setDate(deletionDate.getDate() + 10);
        
        const { error } = await supabase.from('employees').update({
            scheduled_deletion_date: deletionDate.toISOString(),
            termination_reason: reason
        }).eq('id', id);

        handleSupabaseError(error, 'removeEmployee');
    },
    async completeOnboarding(id: string): Promise<void> {
       const { error } = await supabase.from('employees').update({ onboarding_completed: true }).eq('id', id);
       handleSupabaseError(error, 'completeOnboarding');
    },

    // Attendance
    async getAttendanceForEmployee(employeeId: string): Promise<Attendance[]> {
        const { data, error } = await supabase.from('attendance').select('*').eq('employee_id', employeeId);
        handleSupabaseError(error, 'getAttendanceForEmployee');
        return data || [];
    },
    async markAttendance(employeeId: string, date: string): Promise<Attendance> {
        const { data: existing, error: findError } = await supabase
            .from('attendance')
            .select('*')
            .eq('employee_id', employeeId)
            .eq('date', date)
            .single();

        // Allow findError to be null or not found, but throw other errors
        if (findError && findError.code !== 'PGRST116') {
            handleSupabaseError(findError, 'markAttendance (find)');
        }

        const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

        if (existing) { // Clocking out
            if (existing.check_out_time) throw new Error("Already clocked out for today.");
            const { data, error } = await supabase
                .from('attendance')
                .update({ check_out_time: timeStr })
                .eq('id', existing.id)
                .select()
                .single();
            handleSupabaseError(error, 'markAttendance (checkout)');
            return data!;
        } else { // Clocking in
             const { data, error } = await supabase
                .from('attendance')
                .insert({
                    employee_id: employeeId,
                    date,
                    status: AttendanceStatus.PRESENT,
                    check_in_time: timeStr,
                })
                .select()
                .single();
            handleSupabaseError(error, 'markAttendance (checkin)');
            return data!;
        }
    },

    // Leave
    async getLeaveRequestsForEmployee(employeeId: string): Promise<LeaveRequest[]> {
        const { data, error } = await supabase.from('leave_requests').select('*').eq('employee_id', employeeId);
        handleSupabaseError(error, 'getLeaveRequestsForEmployee');
        return data || [];
    },
    async getLeaveRequestsForManager(managerId: string): Promise<LeaveRequest[]> {
        const { data, error } = await supabase.from('leave_requests').select('*').eq('approver_id', managerId);
        handleSupabaseError(error, 'getLeaveRequestsForManager');
        return data || [];
    },
    async submitLeaveRequest(requestData: Omit<LeaveRequest, 'id' | 'status'>): Promise<LeaveRequest> {
        const { data, error } = await supabase
            .from('leave_requests')
            .insert(keysToSnakeCase({ ...requestData, status: LeaveStatus.PENDING }))
            .select()
            .single();
        handleSupabaseError(error, 'submitLeaveRequest');
        return data!;
    },
    async updateLeaveStatus(id: string, status: LeaveStatus): Promise<LeaveRequest> {
        const { data, error } = await supabase
            .from('leave_requests')
            .update({ status })
            .eq('id', id)
            .select()
            .single();
        handleSupabaseError(error, 'updateLeaveStatus');
        return data!;
    },

    // Payroll
    async getPayrollsForEmployee(employeeId: string): Promise<Payroll[]> {
        const { data, error } = await supabase.from('payrolls').select('*').eq('employee_id', employeeId);
        handleSupabaseError(error, 'getPayrollsForEmployee');
        return data || [];
    },
    async processPayroll(month: string, year: number): Promise<Payroll[]> {
        // This is a complex operation. In a real app, this would be a serverless function.
        // For demonstration, we'll simulate it on the client.
        const { data: employees, error: empError } = await supabase.from('employees').select('id');
        handleSupabaseError(empError, 'processPayroll (getEmployees)');
        if (!employees) return [];
        
        const newPayrollsData = employees.map(emp => ({
            employee_id: emp.id,
            month,
            year,
            basic_salary: 5000,
            deductions: 500,
            net_salary: 4500,
            generated_date: new Date().toISOString(),
        }));

        const { data, error } = await supabase.from('payrolls').insert(newPayrollsData).select();
        handleSupabaseError(error, 'processPayroll (insert)');
        return data || [];
    },
    
    // Performance
    async getPerformanceReviewsForEmployee(employeeId: string): Promise<PerformanceReview[]> {
        const { data, error } = await supabase.from('performance_reviews').select('*').eq('employee_id', employeeId);
        handleSupabaseError(error, 'getPerformanceReviewsForEmployee');
        return data || [];
    },
    async getAllPerformanceReviews(): Promise<PerformanceReview[]> {
        const { data, error } = await supabase.from('performance_reviews').select('*');
        handleSupabaseError(error, 'getAllPerformanceReviews');
        return data || [];
    },
    async submitPerformanceReview(reviewData: Omit<PerformanceReview, 'id'>): Promise<PerformanceReview> {
       const { data, error } = await supabase.from('performance_reviews').insert(keysToSnakeCase(reviewData)).select().single();
       handleSupabaseError(error, 'submitPerformanceReview');
       return data!;
    },
};