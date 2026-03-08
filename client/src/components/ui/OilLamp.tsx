import React from 'react';

interface OilLampProps {
    isLit: boolean;
    playerName: string;
    isPulsingRed?: boolean; // For when someone is nominated
    size?: 'sm' | 'md' | 'lg';
}

export const OilLamp: React.FC<OilLampProps> = ({
    isLit,
    playerName,
    isPulsingRed = false,
    size = 'md'
}) => {
    const sizeClasses = {
        sm: 'w-8 h-8',
        md: 'w-12 h-12',
        lg: 'w-16 h-16'
    };

    const textSize = {
        sm: 'text-xs',
        md: 'text-sm',
        lg: 'text-base'
    };

    return (
        <div className="flex flex-col items-center gap-2 group">
            <div className={`relative ${sizeClasses[size]}`}>
                {/* Lamp Base (placeholder SVG/Icon) */}
                <div className={`absolute bottom-0 w-full h-1/2 rounded-b-md ${isLit ? 'bg-horror-accent' : 'bg-gray-800'} border-b-2 border-horror-border`} />

                {/* Flame */}
                {isLit && (
                    <div className="absolute bottom-1/2 left-1/2 -translate-x-1/2 w-3 h-4 bg-yellow-500 rounded-full blur-[2px] animate-pulse">
                        <div className={`absolute inset-0 bg-white rounded-full scale-50 ${isPulsingRed ? 'glow-red' : 'glow-gold'}`}></div>
                    </div>
                )}

                {/* Extinguished Smoke */}
                {!isLit && (
                    <div className="absolute inset-0 flex items-end justify-center pb-4 opacity-50">
                        <div className="w-1 h-3 bg-gray-500 rounded-full animate-[ping_3s_ease-out_infinite]"></div>
                    </div>
                )}
            </div>
            <span className={`${textSize[size]} font-body ${isLit ? 'text-horror-text' : 'text-gray-600 line-through'} ${isPulsingRed ? 'text-red-500 animate-pulse' : ''} transition-colors`}>
                {playerName}
            </span>
        </div>
    );
};
