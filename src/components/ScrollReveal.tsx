'use client';

import React, { useEffect, useRef, useState } from 'react';

interface ScrollRevealProps {
    children: React.ReactNode;
    threshold?: number;
    delay?: number;
    className?: string;
}

const ScrollReveal: React.FC<ScrollRevealProps> = ({ 
    children, 
    threshold = 0.1, 
    delay = 0,
    className = ''
}) => {
    const [isVisible, setIsVisible] = useState(false);
    const domRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    setTimeout(() => {
                        setIsVisible(true);
                    }, delay);
                    if (domRef.current) {
                        observer.unobserve(domRef.current);
                    }
                }
            });
        }, { threshold });

        const currentElement = domRef.current;
        if (currentElement) {
            observer.observe(currentElement);
        }

        return () => {
            if (currentElement) {
                observer.unobserve(currentElement);
            }
        };
    }, [threshold, delay]);

    return (
        <div
            ref={domRef}
            className={`${className} ${isVisible ? 'animate-fade-up' : 'opacity-0'}`}
            style={{ transition: `opacity 0.6s ease-out, transform 0.6s ease-out` }}
        >
            {children}
        </div>
    );
};

export default ScrollReveal;
