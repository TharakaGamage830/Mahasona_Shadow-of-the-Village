import React, { useState } from 'react';
import type { RoleType } from '../../../../shared/types';
import { DarkPanel } from './DarkPanel';
import { motion } from 'framer-motion';

interface RoleCardProps {
    role: RoleType;
    alignment: 'Good' | 'Evil';
    description: string;
    isFlipped?: boolean;
}

export const RoleCard: React.FC<RoleCardProps> = ({
    role,
    alignment,
    description,
    isFlipped = true
}) => {
    const [flipped, setFlipped] = useState(isFlipped);

    const toggleFlip = () => setFlipped(!flipped);

    return (
        <div
            className="relative w-64 h-96 cursor-pointer mx-auto my-4 perspective-1000 group"
            onClick={toggleFlip}
        >
            <motion.div
                className="w-full h-full relative preserve-3d"
                initial={false}
                animate={{ rotateY: flipped ? 180 : 0 }}
                transition={{ duration: 0.8, type: 'spring', stiffness: 50, damping: 15 }}
                style={{ transformStyle: 'preserve-3d' }}
            >
                {/* Card Back (Hidden initially usually if revealed, but default start is unrevealed in some contexts) */}
                <div className="absolute w-full h-full backface-hidden">
                    <DarkPanel className="w-full h-full flex flex-col items-center justify-center border-horror-border border-4">
                        <div className="w-20 h-20 border-2 border-horror-primary rounded-full flex items-center justify-center glow-red">
                            <span className="text-4xl text-horror-primary">?</span>
                        </div>
                        <p className="mt-8 font-heading text-lg tracking-widest text-horror-accent text-center">
                            Reveal Role
                        </p>
                    </DarkPanel>
                </div>

                {/* Card Front (The actual role) */}
                <div
                    className="absolute w-full h-full backface-hidden"
                    style={{ transform: 'rotateY(180deg)' }}
                >
                    <DarkPanel
                        className="w-full h-full flex flex-col items-center p-4 border-4"
                        glowColor={alignment === 'Evil' ? 'red' : 'gold'}
                        title={role}
                    >
                        <div className={`text-sm mt-2 mb-2 uppercase tracking-widest font-heading ${alignment === 'Evil' ? 'text-red-500' : 'text-blue-200'}`}>
                            [ {alignment} ]
                        </div>

                        <div className="flex-1 w-full overflow-hidden mb-4 border-2 border-horror-border/30 rounded-sm">
                            <img
                                src={`/assets/images/${role.replace(/ /g, '')}-CardArt.png`}
                                alt={role}
                                className="w-full h-full object-cover"
                                onError={(e) => {
                                    const target = e.target as HTMLImageElement;
                                    if (role === 'Townsfolk') target.src = '/assets/images/Villager-CardArt.png';
                                    if (role === 'Pretaya') target.src = '/assets/images/Prethaya-CardArt.png';
                                }}
                            />
                        </div>

                        <div className="h-24 flex items-center justify-center text-center px-2 py-2 border-t border-horror-border/50 bg-black/40 w-full">
                            <p className="text-xs font-body leading-tight text-gray-300 italic">
                                "{description}"
                            </p>
                        </div>
                    </DarkPanel>
                </div>
            </motion.div>
        </div>
    );
};
