import React, { useState, useEffect } from 'react';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar
} from 'recharts';
import { api } from '../../services/api';
import { geminiService } from '../../services/geminiService';
import type { Employee, PerformanceReview } from '../../types';

// Extend the window interface for jsPDF
declare global {
    interface Window {
        jspdf: any;
    }
}

const Reports: React.FC = () => {
    const [isLoading, setIsLoading] = useState(true);
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [reviews, setReviews] = useState<PerformanceReview[]>([]);
    const [departments, setDepartments] = useState<string[]>([]);
    
    // AI Insights
    const [isGenerating, setIsGenerating] = useState(false);
    const [turnoverReport, setTurnoverReport] = useState('');
    
    useEffect(() => {
        const initializeReportData = async () => {
            setIsLoading(true);
            try {
                const [empData, reviewData] = await Promise.all([api.getEmployees(), api.getAllPerformanceReviews()]);
                setEmployees(empData);
                setReviews(reviewData);

                const uniqueDepts = ['All', ...Array.from(new Set(empData.map(e => e.department)))];
                setDepartments(uniqueDepts);
            } catch (error) {
                console.error("Failed to load report data", error);
            } finally {
                setIsLoading(false);
            }
        };
        initializeReportData();
    }, []);

    const handleGenerateTurnoverReport = async () => {
        setIsGenerating(true);
        setTurnoverReport('');
        try {
            const employeeDataForPrompt = employees.map(emp => {
                const latestReview = reviews
                    .filter(r => r.employeeId === emp.id)
                    .sort((a, b) => new Date(b.reviewDate).getTime() - new Date(a.reviewDate).getTime())[0];

                const tenure = (new Date().getTime() - new Date(emp.dateOfJoining).getTime()) / (1000 * 3600 * 24 * 365);

                return {
                    name: emp.name,
                    jobTitle: emp.jobTitle,
                    tenure: tenure,
                    rating: latestReview?.rating,
                };
            });
            const report = await geminiService.generateTurnoverRiskReport(employeeDataForPrompt);
            setTurnoverReport(report);

        } catch (error) {
            console.error("Failed to generate turnover report", error);
            setTurnoverReport('Error: Could not generate the report. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };


    if (isLoading) {
        return <Card><p className="text-center text-slate-500 dark:text-slate-400">Loading reports...</p></Card>;
    }

    return (
        <div className="space-y-8">
            <h3 className="text-2xl font-semibold text-slate-900 dark:text-white">Company Analytics & Reports</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <Card>
                     <h4 className="text-lg font-medium text-slate-900 dark:text-white">AI-Powered Insights</h4>
                     <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Generate advanced analytics using AI.</p>
                     <Button onClick={handleGenerateTurnoverReport} isLoading={isGenerating} className="mt-6">
                        Generate Turnover Risk Report
                    </Button>
                    {turnoverReport && (
                        <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg">
                            <h5 className="font-semibold mb-2 text-slate-800 dark:text-slate-200">Turnover Risk Assessment</h5>
                            <div className="prose prose-sm dark:prose-invert max-w-none prose-p:font-light prose-headings:font-medium">
                                {turnoverReport.split('\n').map((line, i) => (
                                    <p key={i}>{line}</p>
                                ))}
                            </div>
                        </div>
                    )}
                </Card>
                 <Card>
                    <h4 className="text-lg font-medium text-slate-900 dark:text-white">Automated Compliance Monitoring</h4>
                    <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Real-time status of key compliance metrics (simulated).</p>
                    <div className="mt-6 space-y-4">
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Indian Labor Law Adherence</span>
                            <Badge color="green">OK</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">Overtime Hours Check</span>
                            <Badge color="green">OK</Badge>
                        </div>
                        <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-slate-700 dark:text-slate-300">GDPR Data Compliance</span>
                            <Badge color="green">OK</Badge>
                        </div>
                    </div>
                </Card>
            </div>
            
        </div>
    );
};

export default Reports;