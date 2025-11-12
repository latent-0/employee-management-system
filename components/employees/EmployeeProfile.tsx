import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import { geminiService } from '../../services/geminiService';
import type { Employee } from '../../types';
import { UserRole } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';

interface EmployeeProfileProps {
    employeeId?: string | null;
}

// Helper to convert file to base64
const fileToBase64 = (file: File): Promise<{ base64: string; mimeType: string }> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const mimeType = result.substring(5, result.indexOf(';'));
            const base64 = result.substring(result.indexOf(',') + 1);
            resolve({ base64, mimeType });
        };
        reader.onerror = error => reject(error);
    });
};

const EmployeeProfile: React.FC<EmployeeProfileProps> = ({ employeeId }) => {
    const { user } = useAuth();
    const [employee, setEmployee] = useState<Employee | null>(null);
    const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    
    // Form state
    const [formData, setFormData] = useState<Partial<Employee>>({});
    const [isSaving, setIsSaving] = useState(false);

    // Photo upload state
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isVerifyingPhoto, setIsVerifyingPhoto] = useState(false);
    const [photoVerificationResult, setPhotoVerificationResult] = useState<{ status: 'success' | 'error' | 'idle', message: string }>({ status: 'idle', message: '' });

    // Removal Modal State
    const [showRemoveModal, setShowRemoveModal] = useState(false);
    const [removalReason, setRemovalReason] = useState("");
    const [isRemoving, setIsRemoving] = useState(false);
    
    const isHrManager = user?.role === UserRole.HR_MANAGER;
    const isViewingOwnProfile = !employeeId || user?.id === employeeId;
    
    const inputClasses = "mt-1 w-full rounded-md border-gray-300 shadow-sm sm:text-sm text-slate-900 dark:text-white dark:bg-gray-700 dark:border-gray-600";


    useEffect(() => {
        const fetchProfileData = async () => {
            const idToFetch = employeeId || user?.id;
            if (!idToFetch) return;

            setIsLoading(true);
            setError(null);
            try {
                const [empData, allEmpData] = await Promise.all([
                    api.getEmployeeById(idToFetch),
                    api.getEmployees()
                ]);
                
                if (empData) {
                    setEmployee(empData);
                    setFormData(empData);
                    setAllEmployees(allEmpData);
                } else {
                    setError("Could not find employee profile.");
                }
            } catch (err) {
                console.error("Failed to fetch employee profile", err);
                setError("An error occurred while fetching the profile.");
            } finally {
                setIsLoading(false);
            }
        };
        fetchProfileData();
    }, [employeeId, user]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsVerifyingPhoto(true);
        setPhotoVerificationResult({ status: 'idle', message: 'Verifying photo...' });

        try {
            const { base64, mimeType } = await fileToBase64(file);
            const result = await geminiService.verifyProfilePicture(base64, mimeType);

            if (result.isValid) {
                setFormData({ ...formData, avatarUrl: `data:${mimeType};base64,${base64}` });
                setPhotoVerificationResult({ status: 'success', message: result.reason });
            } else {
                setPhotoVerificationResult({ status: 'error', message: `Invalid photo: ${result.reason}` });
            }
        } catch (err) {
            console.error("Photo verification failed", err);
            setPhotoVerificationResult({ status: 'error', message: "Could not verify photo. Please try again." });
        } finally {
            setIsVerifyingPhoto(false);
        }
    };

    const handleSave = async () => {
        if (!employee) return;
        setIsSaving(true);
        try {
            const updatedProfile = await api.updateEmployeeProfile(employee.id, formData);
            setEmployee(updatedProfile);
            setIsEditing(false);
            setPhotoVerificationResult({ status: 'idle', message: '' }); // Reset photo message
        } catch (err) {
            console.error("Failed to update profile", err);
            alert("Failed to save changes. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    const handleCancel = () => {
        setFormData(employee || {});
        setIsEditing(false);
        setPhotoVerificationResult({ status: 'idle', message: '' }); // Reset photo message
    };

    const handleRemove = async () => {
        if (!employee || !removalReason) return;
        setIsRemoving(true);
        try {
            await api.removeEmployee(employee.id, removalReason);
            setShowRemoveModal(false);
            // Optionally, navigate away or show a success message
            alert(`${employee.name} has been scheduled for removal.`);
            // Refetch data to show termination status if needed
            const updatedEmployee = await api.getEmployeeById(employee.id);
             if (updatedEmployee) setEmployee(updatedEmployee);
        } catch (err) {
            console.error("Failed to remove employee", err);
            alert("Failed to remove employee. Please try again.");
        } finally {
            setIsRemoving(false);
        }
    };
    
    const getManagerName = (managerId?: string) => {
        if (!managerId) return 'N/A';
        return allEmployees.find(e => e.id === managerId)?.name || 'Unknown';
    };

    const managerOptions = allEmployees.filter(e => e.id !== employee?.id);

    if (isLoading) {
        return <Card><p className="text-center text-gray-500">Loading profile...</p></Card>;
    }

    if (error || !employee) {
        return <Card><p className="text-center text-red-500">{error || 'Profile not found.'}</p></Card>;
    }
    
    const renderField = (label: string, name: keyof Employee, type: 'text' | 'tel' | 'textarea' | 'select' = 'text', options?: {value: string, label: string}[]) => (
        <div className="sm:col-span-1">
            <dt className="text-sm font-medium text-gray-500 dark:text-gray-400">{label}</dt>
            {isEditing && (isViewingOwnProfile ? ['phone'].includes(name) : isHrManager) ? (
                type === 'textarea' ? (
                    <textarea name={name as string} value={String(formData[name] || '')} onChange={handleInputChange} rows={3} className={inputClasses}/>
                ) : type === 'select' ? (
                    <select name={name as string} value={String(formData[name] || '')} onChange={handleInputChange} className={inputClasses}>
                        {options?.map(opt => <option key={opt.value} value={opt.value}>{opt.label}</option>)}
                    </select>
                ) : (
                    <input type={type} name={name as string} value={String(formData[name] || '')} onChange={handleInputChange} className={inputClasses}/>
                )
            ) : (
                 <dd className="mt-1 text-sm text-gray-900 dark:text-white">{name === 'managerId' ? getManagerName(employee.managerId) : (employee[name] || 'Not provided')}</dd>
            )}
        </div>
    );

    const PhotoVerificationStatus = () => {
        if (!photoVerificationResult.message) return null;
        const color = photoVerificationResult.status === 'success' ? 'text-emerald-600 dark:text-emerald-400' :
                      photoVerificationResult.status === 'error' ? 'text-red-600 dark:text-red-400' :
                      'text-slate-500 dark:text-slate-400';
        return <p className={`mt-2 text-xs text-center ${color}`}>{photoVerificationResult.message}</p>;
    };

    return (
        <div className="space-y-6">
            <Card>
                {employee.scheduledDeletionDate && (
                     <div className="mb-4 p-4 bg-yellow-100 dark:bg-yellow-900/50 border-l-4 border-yellow-500 text-yellow-800 dark:text-yellow-200">
                        <p className="font-bold">Account Pending Deletion</p>
                        <p>This employee is scheduled for removal on {new Date(employee.scheduledDeletionDate).toLocaleDateString()}. Reason: "{employee.terminationReason}"</p>
                    </div>
                )}
                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between">
                    <div className="flex items-center">
                        <div className="relative">
                             <img className="h-24 w-24 rounded-full object-cover" src={formData.avatarUrl || employee.avatarUrl} alt={employee.name} />
                             {isEditing && isViewingOwnProfile && (
                                <div className="absolute -bottom-2 -right-2">
                                    <input type="file" accept="image/*" ref={fileInputRef} onChange={handlePhotoUpload} className="hidden" />
                                    <Button size="sm" variant="secondary" className="rounded-full !p-2" onClick={() => fileInputRef.current?.click()} disabled={isVerifyingPhoto}>
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.5L15.232 5.232z" /></svg>
                                    </Button>
                                </div>
                             )}
                        </div>
                        <div className="ml-4">
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{employee.name}</h2>
                            <p className="text-sm text-gray-500 dark:text-gray-400">{employee.jobTitle} - {employee.department}</p>
                            {isEditing && isViewingOwnProfile && <PhotoVerificationStatus />}
                        </div>
                    </div>
                    <div className="mt-4 sm:mt-0 flex flex-col sm:flex-row sm:space-x-2 w-full sm:w-auto gap-2 sm:gap-0">
                        {!isEditing ? (
                            <Button onClick={() => setIsEditing(true)} className="w-full sm:w-auto">Edit Profile</Button>
                        ) : (
                            <>
                                <Button onClick={handleSave} isLoading={isSaving} variant="primary" className="w-full sm:w-auto">Save</Button>
                                <Button onClick={handleCancel} variant="secondary" disabled={isSaving} className="w-full sm:w-auto">Cancel</Button>
                            </>
                        )}
                        {isHrManager && !isViewingOwnProfile && !employee.scheduledDeletionDate && (
                            <Button variant="danger" onClick={() => setShowRemoveModal(true)} className="w-full sm:w-auto">Remove Employee</Button>
                        )}
                    </div>
                </div>

                <div className="mt-6 border-t border-gray-200 dark:border-gray-700 pt-6">
                    <dl className="grid grid-cols-1 gap-x-4 gap-y-8 sm:grid-cols-2">
                        {renderField('Email address', 'email')}
                        {renderField('Date of Joining', 'dateOfJoining')}
                        {renderField('Phone', 'phone', 'tel')}
                        {renderField('Job Title', 'jobTitle')}
                        {renderField('Department', 'department')}
                        {renderField('Manager', 'managerId', 'select', [{value: '', label: 'None'}, ...managerOptions.map(e => ({ value: e.id, label: e.name }))])}
                    </dl>
                </div>
            </Card>

            <Card>
                <h3 className="text-lg font-medium leading-6 text-gray-900 dark:text-white">Documents</h3>
                <ul className="mt-4 divide-y divide-gray-200 dark:divide-gray-700">
                    <li className="py-3 flex justify-between items-center">
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Employment_Contract.pdf</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Uploaded on 2022-08-15</p>
                        </div>
                        <div className="flex items-center space-x-2">
                             <Badge color="green">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Blockchain Verified
                            </Badge>
                            <a href="#" className="text-primary-600 hover:text-primary-800 text-sm">Download</a>
                        </div>
                    </li>
                     <li className="py-3 flex justify-between items-center">
                        <div>
                            <p className="text-sm font-medium text-gray-900 dark:text-white">Degree_Certificate.pdf</p>
                            <p className="text-sm text-gray-500 dark:text-gray-400">Uploaded on 2022-08-16</p>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Badge color="green">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                                Blockchain Verified
                            </Badge>
                            <a href="#" className="text-primary-600 hover:text-primary-800 text-sm">Download</a>
                        </div>
                    </li>
                </ul>
            </Card>

            {/* Removal Modal */}
            {showRemoveModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-white">Remove {employee.name}</h3>
                        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            Please provide a reason for removal. The employee will be notified, and their account will be scheduled for permanent deletion in 10 days.
                        </p>
                        <div className="mt-4">
                            <label htmlFor="removalReason" className="block text-sm font-medium text-gray-700 dark:text-gray-300">Reason</label>
                            <textarea
                                id="removalReason"
                                value={removalReason}
                                onChange={(e) => setRemovalReason(e.target.value)}
                                rows={4}
                                className="mt-1 w-full rounded-md border-gray-300 shadow-sm sm:text-sm text-slate-900 dark:text-white dark:bg-gray-700 dark:border-gray-600"
                                placeholder="e.g., Resignation, End of contract, etc."
                            />
                        </div>
                        <div className="mt-6 flex justify-end space-x-3">
                            <Button variant="secondary" onClick={() => setShowRemoveModal(false)} disabled={isRemoving}>Cancel</Button>
                            <Button variant="danger" onClick={handleRemove} isLoading={isRemoving} disabled={!removalReason.trim()}>Confirm Removal</Button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EmployeeProfile;