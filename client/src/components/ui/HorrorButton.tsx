import React from 'react';

interface HorrorButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
    variant?: 'primary' | 'secondary' | 'ghost';
    fullWidth?: boolean;
}

export const HorrorButton: React.FC<HorrorButtonProps> = ({
    children,
    variant = 'primary',
    fullWidth = false,
    className = '',
    ...props
}) => {
    const baseStyles = 'px-6 py-3 font-heading uppercase tracking-widest transition-all duration-300 horror-border relative overflow-hidden group';

    const variants = {
        primary: 'bg-horror-bg text-horror-text hover:bg-horror-primary hover:text-white',
        secondary: 'bg-transparent text-horror-accent border-horror-accent hover:bg-horror-accent/20 hover:text-white',
        ghost: 'border-transparent hover:bg-white/10 text-gray-300'
    };

    return (
        <button
            className={`${baseStyles} ${variants[variant]} ${fullWidth ? 'w-full' : ''} ${className}`}
            {...props}
        >
            <span className="relative z-10">{children}</span>
            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity"></div>
        </button>
    );
};
