import React, { useEffect, useState } from 'react';

const Confetti: React.FC = () => {
    // Fix: Replaced JSX.Element with React.ReactElement to resolve namespace error.
    const [pieces, setPieces] = useState<React.ReactElement[]>([]);

    useEffect(() => {
        const colors = ['#f44336', '#e91e63', '#9c27b0', '#673ab7', '#3f51b5', '#2196f3', '#03a9f4', '#00bcd4', '#009688', '#4caf50', '#8bc34a', '#cddc39', '#ffeb3b', '#ffc107', '#ff9800', '#ff5722'];
        // Fix: Replaced JSX.Element with React.ReactElement to resolve namespace error.
        const newPieces: React.ReactElement[] = [];
        for (let i = 0; i < 150; i++) {
            const style: React.CSSProperties = {
                position: 'fixed',
                width: `${Math.random() * 8 + 4}px`,
                height: `${Math.random() * 15 + 5}px`,
                backgroundColor: colors[Math.floor(Math.random() * colors.length)],
                top: `${Math.random() * 110 - 10}%`,
                left: `${Math.random() * 100}%`,
                opacity: Math.random() + 0.5,
                transform: `rotate(${Math.random() * 360}deg)`,
                animation: `fall ${Math.random() * 4 + 3}s linear ${Math.random() * 2}s infinite`,
            };
            newPieces.push(<div key={i} style={style} className="confetti-piece" />);
        }
        setPieces(newPieces);
    }, []);

    const animationStyle = `
        @keyframes fall {
            to {
                transform: translateY(110vh) rotate(720deg);
                opacity: 0;
            }
        }
    `;

    return (
        <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-50 overflow-hidden">
            <style>{animationStyle}</style>
            {pieces}
        </div>
    );
};

export default Confetti;