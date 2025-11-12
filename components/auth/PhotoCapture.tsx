import React, { useRef, useEffect, useState } from 'react';
import { geminiService } from '../../services/geminiService';
import Button from '../ui/Button';

// Helper to convert canvas to base64 Data URL
const canvasToDataURL = (canvas: HTMLCanvasElement, mimeType: 'image/jpeg' | 'image/png'): string => {
    return canvas.toDataURL(mimeType);
};

// Helper to convert a file to a base64 Data URL
const fileToDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
    });
};


interface PhotoCaptureProps {
    onPhotoVerified: (dataUrl: string) => void;
    onBack: () => void;
}

const PhotoCapture: React.FC<PhotoCaptureProps> = ({ onPhotoVerified, onBack }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null); // For file upload
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [isVerifying, setIsVerifying] = useState(false);
    const [verificationResult, setVerificationResult] = useState<{ isValid: boolean; reason: string } | null>(null);
    
    useEffect(() => {
        const startCamera = async () => {
            // Only start camera if no image is captured/uploaded yet
            if (capturedImage) return;

            try {
                const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = mediaStream;
                }
                setStream(mediaStream);
            } catch (err) {
                console.error("Camera access denied", err);
                setError("Camera access is required. Please enable it in your browser settings or upload a photo instead.");
            }
        };
        startCamera();

        return () => {
            stream?.getTracks().forEach(track => track.stop());
        };
    }, [capturedImage]); // Rerun if capturedImage is reset

    const handleCapture = () => {
        if (!videoRef.current || !canvasRef.current) return;
        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        canvas.getContext('2d')?.drawImage(video, 0, 0, video.videoWidth, video.videoHeight);
        
        const dataUrl = canvasToDataURL(canvas, 'image/jpeg');
        setCapturedImage(dataUrl);
        handleVerify(dataUrl);
    };
    
    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const dataUrl = await fileToDataURL(file);
            setCapturedImage(dataUrl);
            await handleVerify(dataUrl);
        } catch (err) {
            console.error("File processing failed", err);
            setError("Could not process the uploaded file. Please try another one.");
        }
    };

    const handleVerify = async (dataUrl: string) => {
        setIsVerifying(true);
        setVerificationResult(null);
        setError(null);
        try {
            const mimeType = dataUrl.substring(5, dataUrl.indexOf(';'));
            const base64 = dataUrl.split(',')[1];
            const result = await geminiService.verifyProfilePicture(base64, mimeType);
            setVerificationResult(result);
            if (!result.isValid) {
                setError(result.reason);
            }
        } catch (err) {
            console.error("Verification failed", err);
            setError("Could not verify the photo. Please try again.");
        } finally {
            setIsVerifying(false);
        }
    };

    const handleRetake = () => {
        setCapturedImage(null);
        setVerificationResult(null);
        setError(null);
    };
    
    const handleConfirm = () => {
        if (capturedImage && verificationResult?.isValid) {
            onPhotoVerified(capturedImage);
        }
    };

    return (
        <div className="space-y-4 text-center">
            <div className="relative w-full aspect-square bg-slate-200 dark:bg-slate-800 rounded-lg overflow-hidden flex items-center justify-center">
                {error && !isVerifying && !capturedImage && <p className="text-sm text-red-500 p-4">{error}</p>}
                
                {capturedImage ? (
                    <img src={capturedImage} alt="Captured profile" className="w-full h-full object-cover" />
                ) : (
                    <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                )}

                <canvas ref={canvasRef} className="hidden" />
                
                {isVerifying && (
                    <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-white"></div>
                        <p className="text-white mt-2 text-sm">Verifying photo...</p>
                    </div>
                )}
            </div>

            {verificationResult && !isVerifying && (
                <p className={`text-sm ${verificationResult.isValid ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                    {verificationResult.reason}
                </p>
            )}

            {!capturedImage ? (
                 <div className="space-y-3">
                    <Button onClick={handleCapture} className="w-full" disabled={!stream}>
                        Capture Photo
                    </Button>
                    <div className="relative flex items-center">
                        <div className="flex-grow border-t border-slate-300 dark:border-slate-700"></div>
                        <span className="flex-shrink mx-4 text-slate-500 dark:text-slate-400 text-sm">OR</span>
                        <div className="flex-grow border-t border-slate-300 dark:border-slate-700"></div>
                    </div>
                    <input
                        type="file"
                        ref={fileInputRef}
                        onChange={handleFileUpload}
                        accept="image/png, image/jpeg"
                        className="hidden"
                    />
                    <Button variant="secondary" onClick={() => fileInputRef.current?.click()} className="w-full">
                        Upload from Device
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-4">
                    <Button variant="secondary" onClick={handleRetake} disabled={isVerifying}>
                        {verificationResult?.isValid ? 'Change Photo' : 'Try Again'}
                    </Button>
                    <Button 
                        onClick={handleConfirm} 
                        disabled={isVerifying || !verificationResult?.isValid}
                    >
                        Confirm & Sign Up
                    </Button>
                </div>
            )}
             <Button variant="secondary" size="sm" onClick={onBack} className="w-full !mt-6">
                Back to Details
            </Button>
        </div>
    );
};

export default PhotoCapture;