import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from '../../hooks/useAuth';
import { api } from '../../services/api';
import { geminiService } from '../../services/geminiService';
import type { Attendance as AttendanceType, Company } from '../../types';
import { AttendanceStatus } from '../../types';
import Card from '../ui/Card';
import Button from '../ui/Button';
import Badge from '../ui/Badge';
import Confetti from '../ui/Confetti';

type VerificationStep = 'idle' | 'location' | 'recognition' | 'clocking';

const imageUrlToBase64 = async (url: string): Promise<{ base64: string; mimeType: string }> => {
    // In a real-world scenario with potential CORS issues, 
    // this fetch might need to be routed through a backend proxy.
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(`Failed to fetch image from ${url}. Status: ${response.status}`);
    }
    const blob = await response.blob();
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onerror = reject;
        reader.onload = () => {
            const result = reader.result as string;
            const mimeType = blob.type;
            const base64 = result.substring(result.indexOf(',') + 1);
            resolve({ base64, mimeType });
        };
        reader.readAsDataURL(blob);
    });
};

const Attendance: React.FC = () => {
    const { user } = useAuth();
    const [attendance, setAttendance] = useState<AttendanceType[]>([]);
    const [company, setCompany] = useState<Company | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showConfetti, setShowConfetti] = useState(false);

    // Smart Attendance state
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [locationVerified, setLocationVerified] = useState(false);
    const [faceVerified, setFaceVerified] = useState(false);
    const [verificationStep, setVerificationStep] = useState<VerificationStep>('idle');
    const [verificationError, setVerificationError] = useState<string | null>(null);

    const getDistanceFromLatLonInMeters = (lat1: number, lon1: number, lat2: number, lon2: number) => {
        const R = 6371e3; // metres
        const φ1 = lat1 * Math.PI/180; // φ, λ in radians
        const φ2 = lat2 * Math.PI/180;
        const Δφ = (lat2-lat1) * Math.PI/180;
        const Δλ = (lon2-lon1) * Math.PI/180;

        const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ/2) * Math.sin(Δλ/2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

        return R * c; // distance in metres
    }

    useEffect(() => {
        if (user) {
            setIsLoading(true);
            Promise.all([
                api.getAttendanceForEmployee(user.id),
                api.getCompanyById(user.companyId)
            ]).then(([attendanceData, companyData]) => {
                 setAttendance(attendanceData.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
                 if (companyData) {
                    setCompany(companyData);
                 }
            }).catch(err => {
                console.error("Failed to fetch initial data", err);
                setError("Could not load attendance data.");
            }).finally(() => setIsLoading(false));
        }
    }, [user]);
    
    useEffect(() => {
        // Stop video stream when component unmounts
        return () => {
            if (videoRef.current?.srcObject) {
                (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
            }
        };
    }, []);

    const todayStr = new Date().toISOString().split('T')[0];
    const todaysAttendance = useMemo(() => attendance.find(a => a.date === todayStr), [attendance, todayStr]);
    const isGeofenceConfigured = company && company.latitude && company.longitude && company.radius;

    const cleanupVerification = () => {
        setVerificationStep('idle');
        setLocationVerified(false);
        setFaceVerified(false);
        if (videoRef.current?.srcObject) {
            (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
        }
    };

    const handleClockInOut = async () => {
        if (!user || !isGeofenceConfigured) return;
        setVerificationStep('location');
        setVerificationError(null);
        setLocationVerified(false);
        setFaceVerified(false);

        try {
            // 1. Get Geolocation
            const pos = await new Promise<GeolocationPosition>((resolve, reject) => {
                navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true });
            });
            const distance = getDistanceFromLatLonInMeters(
                pos.coords.latitude, pos.coords.longitude,
                company.latitude!, company.longitude!
            );

            if (distance > company.radius!) {
                throw new Error(`You must be within ${company.radius}m of the office. You are ~${Math.round(distance)}m away.`);
            }
            setLocationVerified(true);
            
            // 2. Get Profile Picture
            if (!user.avatarUrl) {
                throw new Error("You must have a profile picture set for facial recognition.");
            }
            const profileImageData = await imageUrlToBase64(user.avatarUrl);

            // 3. Start camera for face detection
            const stream = await navigator.mediaDevices.getUserMedia({ video: true });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await new Promise(resolve => videoRef.current!.onloadedmetadata = resolve);
            }
            
            // 4. Capture frame and analyze
            setVerificationStep('recognition');
            await new Promise(resolve => setTimeout(resolve, 1500)); // Wait for camera to adjust
            
            const video = videoRef.current;
            const canvas = canvasRef.current;
            if (!video || !canvas) throw new Error("Video elements not ready.");

            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            canvas.getContext('2d')?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
            
            const dataUrl = canvas.toDataURL('image/jpeg');
            const liveImageData = {
                mimeType: 'image/jpeg',
                base64: dataUrl.substring(dataUrl.indexOf(',') + 1)
            };

            const isMatch = await geminiService.verifyFaceMatch(liveImageData, profileImageData);
            if (!isMatch) {
                throw new Error("Facial recognition failed. Ensure you are in a well-lit area and match your profile picture.");
            }
            setFaceVerified(true);

            // 5. Mark attendance
            setVerificationStep('clocking');
            const updatedAttendance = await api.markAttendance(user.id, todayStr);
            setAttendance(prev => {
                const existingIndex = prev.findIndex(a => a.id === updatedAttendance.id);
                if (existingIndex > -1) {
                    const newAttendance = [...prev];
                    newAttendance[existingIndex] = updatedAttendance;
                    return newAttendance;
                }
                return [updatedAttendance, ...prev].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
            });

            // Celebrate clock-in
            if (!todaysAttendance) {
                 setShowConfetti(true);
                 setTimeout(() => setShowConfetti(false), 5000);
            }
            cleanupVerification();

        } catch (err: any) {
            if (err.name === 'PermissionDeniedError') {
                 setVerificationError("Camera and location access are required for Smart Attendance.");
            } else {
                 setVerificationError(err.message || "Verification failed. Please try again.");
            }
            cleanupVerification();
        }
    };
    
    const { text: clockButtonText, disabled: clockButtonDisabled, isLoading: clockButtonLoading } = useMemo(() => {
        if (!isGeofenceConfigured) return { text: 'Not Configured', disabled: true, isLoading: false };
        if (verificationStep !== 'idle') return { text: 'Verifying...', disabled: true, isLoading: true };
        if (!todaysAttendance) return { text: 'Smart Clock-In', disabled: false, isLoading: false };
        if (todaysAttendance.checkInTime && !todaysAttendance.checkOutTime) return { text: 'Smart Clock-Out', disabled: false, isLoading: false };
        return { text: 'Completed for Today', disabled: true, isLoading: false };
    }, [todaysAttendance, verificationStep, isGeofenceConfigured]);

    return (
        <div className="space-y-8">
            {showConfetti && <Confetti />}
            <canvas ref={canvasRef} className="hidden"></canvas>
            <Card>
                <div className="flex flex-col sm:flex-row justify-between sm:items-center">
                    <div>
                        <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Smart Attendance</h3>
                        {!isGeofenceConfigured ? (
                             <p className="mt-1 text-sm text-amber-600 dark:text-amber-400 font-light">
                                This feature has not been configured by your company admin yet.
                            </p>
                        ) : (
                           <>
                            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400 font-light">Uses live facial recognition and geofencing for secure clock-ins.</p>
                            <p className="mt-1 text-xs text-slate-400 dark:text-slate-500 font-light italic">Disclaimer: Facial recognition is a demonstration of AI capabilities and not a real biometric security system.</p>
                           </>
                        )}
                    </div>
                    <div className="mt-4 sm:mt-0">
                        <Button 
                            onClick={handleClockInOut} 
                            isLoading={clockButtonLoading} 
                            disabled={clockButtonDisabled}
                            className="w-full sm:w-auto"
                        >
                            {clockButtonText}
                        </Button>
                    </div>
                </div>
                {verificationStep !== 'idle' && (
                     <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg text-center">
                        <h4 className="font-medium text-slate-800 dark:text-slate-200 mb-4">Verification in Progress</h4>
                        <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                            <div className="relative w-48 h-36">
                                 <video ref={videoRef} autoPlay playsInline className="w-full h-full rounded-md object-cover" />
                                <div className="absolute inset-0 border-4 border-primary-500/50 rounded-md animate-pulse"></div>
                            </div>
                            <div className="text-left space-y-2">
                                <p className="text-sm flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                    <span className={locationVerified ? 'text-green-500' : 'animate-spin text-primary-500'}>
                                        {locationVerified ? <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>}
                                    </span>
                                     {locationVerified ? "Location Verified" : "Verifying location..."}
                                </p>
                                <p className="text-sm flex items-center gap-2 text-slate-600 dark:text-slate-300">
                                    <span className={faceVerified ? 'text-green-500' : (verificationStep === 'recognition' ? 'animate-spin text-primary-500' : 'text-slate-400')}>
                                         {faceVerified ? <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg> : <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>}
                                    </span>
                                    {faceVerified ? "Face Recognized" : (verificationStep === 'recognition' ? "Performing facial recognition..." : "Awaiting facial recognition...")}
                                </p>
                            </div>
                        </div>
                    </div>
                )}
                {verificationError && <p className="mt-4 text-sm text-center text-red-500">{verificationError}</p>}
                 {todaysAttendance && (
                    <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-lg flex justify-around text-center">
                        <div>
                            <p className="text-sm text-slate-500 dark:text-slate-400">Clock In</p>
                            <p className="text-lg font-medium text-slate-800 dark:text-slate-200">{todaysAttendance.checkInTime || '--:--'}</p>
                        </div>
                        <div>
                             <p className="text-sm text-slate-500 dark:text-slate-400">Clock Out</p>
                            <p className="text-lg font-medium text-slate-800 dark:text-slate-200">{todaysAttendance.checkOutTime || '--:--'}</p>
                        </div>
                    </div>
                )}
            </Card>

            <Card>
                <h3 className="text-xl font-semibold text-slate-900 dark:text-white">Attendance History</h3>
                {isLoading ? (
                    <p className="mt-4 text-center text-slate-500">Loading history...</p>
                ) : error ? (
                    <p className="mt-4 text-center text-red-500">{error}</p>
                ) : attendance.length === 0 ? (
                    <p className="mt-4 text-center text-slate-500 py-8">No attendance records found.</p>
                ) : (
                    <div className="mt-6 flow-root">
                        <div className="overflow-x-auto">
                            <div className="inline-block min-w-full py-2 align-middle">
                                <table className="min-w-full">
                                    <thead className="border-b border-slate-200 dark:border-slate-700">
                                        <tr>
                                            <th scope="col" className="py-4 pl-4 pr-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider sm:pl-0">Date</th>
                                            <th scope="col" className="px-3 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Status</th>
                                            <th scope="col" className="px-3 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Clock In</th>
                                            <th scope="col" className="px-3 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Clock Out</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {attendance.map((record) => (
                                            <tr key={record.id} className="border-b border-slate-200 dark:border-slate-800">
                                                <td className="whitespace-nowrap py-5 pl-4 pr-3 text-sm font-medium text-slate-900 dark:text-white sm:pl-0">{new Date(record.date).toLocaleDateString()}</td>
                                                <td className="whitespace-nowrap px-3 py-5 text-sm">
                                                    <Badge color={record.status === AttendanceStatus.PRESENT ? 'green' : 'red'}>
                                                        {record.status}
                                                    </Badge>
                                                </td>
                                                <td className="whitespace-nowrap px-3 py-5 text-sm text-slate-500 dark:text-slate-400">{record.checkInTime || 'N/A'}</td>
                                                <td className="whitespace-nowrap px-3 py-5 text-sm text-slate-500 dark:text-slate-400">{record.checkOutTime || 'N/A'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>
                )}
            </Card>
        </div>
    );
};

export default Attendance;