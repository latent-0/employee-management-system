import React, { useEffect, useRef } from 'react';

interface ParticleBackgroundProps {
    particleColor?: string;
    lineColor?: string;
    animateToCircle?: boolean;
    startInCircleState?: boolean;
}

// Fix: Moved Particle class outside the component scope so the type is available for the useRef hook.
class Particle {
    x: number;
    y: number;
    directionX: number;
    directionY: number;
    size: number;
    targetX: number = 0;
    targetY: number = 0;

    constructor(x: number, y: number, directionX: number, directionY: number, size: number) {
        this.x = x;
        this.y = y;
        this.directionX = directionX;
        this.directionY = directionY;
        this.size = size;
    }

    draw(ctx: CanvasRenderingContext2D, particleColor: string) {
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2, false);
        ctx.fillStyle = particleColor;
        ctx.fill();
    }

    update(
        canvas: HTMLCanvasElement,
        ctx: CanvasRenderingContext2D,
        particleColor: string,
        animateToCircle: boolean,
        mouse: { x: number | null; y: number | null; radius: number }
    ) {
        if (animateToCircle) {
            // Animate towards the circle position
            let dx = this.targetX - this.x;
            let dy = this.targetY - this.y;
            let distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance > 1) {
                this.x += dx * 0.03; // Easing factor
                this.y += dy * 0.03;
            }

        } else {
            // Normal behavior
            if (this.x > canvas.width || this.x < 0) {
                this.directionX = -this.directionX;
            }
            if (this.y > canvas.height || this.y < 0) {
                this.directionY = -this.directionY;
            }

            // Mouse collision
            if (mouse.x !== null && mouse.y !== null) {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                if (distance < mouse.radius + this.size) {
                    if (mouse.x < this.x && this.x < canvas.width - this.size * 10) {
                        this.x += 3;
                    }
                    if (mouse.x > this.x && this.x > this.size * 10) {
                        this.x -= 3;
                    }
                    if (mouse.y < this.y && this.y < canvas.height - this.size * 10) {
                        this.y += 3;
                    }
                    if (mouse.y > this.y && this.y > this.size * 10) {
                        this.y -= 3;
                    }
                }
            }

            this.x += this.directionX;
            this.y += this.directionY;
        }
        this.draw(ctx, particleColor);
    }
}


const ParticleBackground: React.FC<ParticleBackgroundProps> = ({
    particleColor: customParticleColor,
    lineColor: customLineColor,
    animateToCircle = false,
    startInCircleState = false,
}) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const animationFrameId = useRef<number>();
    const particlesRef = useRef<Particle[]>([]);
    const mouse = useRef<{ x: number | null; y: number | null; radius: number }>({
        x: null,
        y: null,
        radius: 120
    });

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const isDarkMode = document.documentElement.classList.contains('dark');
        const particleColor = customParticleColor || (isDarkMode ? 'rgba(226, 232, 240, 0.7)' : 'rgba(15, 23, 42, 0.8)');
        const lineColor = customLineColor || (isDarkMode ? 'rgba(226, 232, 240, 0.08)' : 'rgba(15, 23, 42, 0.1)');

        const setCanvasSize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };
        setCanvasSize();

        const handleMouseMove = (event: MouseEvent) => {
            mouse.current.x = event.x;
            mouse.current.y = event.y;
        };
        
        const handleMouseOut = () => {
            mouse.current.x = null;
            mouse.current.y = null;
        }

        window.addEventListener('mousemove', handleMouseMove);
        window.addEventListener('mouseout', handleMouseOut);

        function init() {
            let tempParticles: Particle[] = [];
            let numberOfParticles = (canvas.height * canvas.width) / 7000;
            const radius = canvas.height * 0.8;
            const centerX = canvas.width + radius * 0.35;
            const centerY = canvas.height + radius * 0.35;

            for (let i = 0; i < numberOfParticles; i++) {
                let size = Math.random() * 1.5 + 0.5;
                let x = (Math.random() * ((innerWidth - size * 2) - (size * 2)) + size * 2);
                let y = (Math.random() * ((innerHeight - size * 2) - (size * 2)) + size * 2);
                let directionX = (Math.random() * 0.64) - 0.32;
                let directionY = (Math.random() * 0.64) - 0.32;
                
                const angle = (i / numberOfParticles) * Math.PI * 2;
                const targetX = centerX + radius * Math.cos(angle);
                const targetY = centerY + radius * Math.sin(angle);

                if (startInCircleState) {
                    x = targetX;
                    y = targetY;
                    directionX = 0;
                    directionY = 0;
                }

                let particle = new Particle(x, y, directionX, directionY, size);
                particle.targetX = targetX;
                particle.targetY = targetY;
                
                tempParticles.push(particle);
            }
            particlesRef.current = tempParticles;
        }

        function connect() {
            if (!ctx) return;
            let opacityValue = 1;
            for (let a = 0; a < particlesRef.current.length; a++) {
                for (let b = a; b < particlesRef.current.length; b++) {
                    let distance = ((particlesRef.current[a].x - particlesRef.current[b].x) * (particlesRef.current[a].x - particlesRef.current[b].x)) +
                        ((particlesRef.current[a].y - particlesRef.current[b].y) * (particlesRef.current[a].y - particlesRef.current[b].y));
                    
                    if (distance < 10000) { 
                        opacityValue = 1 - (distance / 10000);
                        ctx.strokeStyle = lineColor.replace(/, [0-9.]+\)$/, `, ${opacityValue})`);
                        ctx.lineWidth = 1;
                        ctx.beginPath();
                        ctx.moveTo(particlesRef.current[a].x, particlesRef.current[a].y);
                        ctx.lineTo(particlesRef.current[b].x, particlesRef.current[b].y);
                        ctx.stroke();
                    }
                }
            }
        }

        function animate() {
            if (!ctx) return;
            ctx.clearRect(0, 0, innerWidth, innerHeight);
            for (let i = 0; i < particlesRef.current.length; i++) {
                particlesRef.current[i].update(canvas, ctx, particleColor, animateToCircle || startInCircleState, mouse.current);
            }
            connect();
            animationFrameId.current = requestAnimationFrame(animate);
        }
        
        const handleResize = () => {
            setCanvasSize();
            mouse.current.radius = (canvas.height / 80) * (canvas.width / 80);
            init();
        }

        window.addEventListener('resize', handleResize);
        
        init();
        animate();

        return () => {
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseout', handleMouseOut);
            window.removeEventListener('resize', handleResize);
            if (animationFrameId.current) {
                cancelAnimationFrame(animationFrameId.current);
            }
        };
    }, [customParticleColor, customLineColor, animateToCircle, startInCircleState]);

    return <canvas ref={canvasRef} className="absolute top-0 left-0 w-full h-full z-0" />;
};

export default ParticleBackground;