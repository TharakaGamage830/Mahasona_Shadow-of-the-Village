import React from 'react';

interface DarkPanelProps {
    children: React.ReactNode;
    title?: React.ReactNode;
    className?: string;
    glowColor?: 'red' | 'gold' | 'none';
}

export const DarkPanel: React.FC<DarkPanelProps> = ({
    children,
    title,
    className = '',
    glowColor = 'none'
}) => {
    const glowStyles = {
        red: 'shadow-[0_0_15px_rgba(139,0,0,0.3)] border-horror-primary/50',
        gold: 'shadow-[0_0_15px_rgba(184,134,11,0.3)] border-horror-accent/50',
        none: 'border-horror-border'
    };

    return (
        <div className={`bg-black/80 backdrop-blur-md border border-t-2 ${glowStyles[glowColor]} rounded-sm p-6 relative overflow-hidden ${className}`}>
            {/* Decorative corner accents */}
            <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-horror-accent/40" />
            <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-horror-accent/40" />
            <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-horror-accent/40" />
            <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-horror-accent/40" />

            {title && (
                <h2 className="text-xl font-heading text-horror-accent mb-4 border-b border-horror-border/50 pb-2 text-center glowing-text flex items-center justify-center gap-3">
                    <span className="w-4 h-[1px] bg-horror-accent/30 inline-block"></span>
                    {title}
                    <span className="w-4 h-[1px] bg-horror-accent/30 inline-block"></span>
                </h2>
            )}

            <div className="relative z-10">
                {children}
            </div>
        </div>
    );
};
