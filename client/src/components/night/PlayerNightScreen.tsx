import React, { useState } from 'react';
import type { GameState, Player } from '../../../../shared/types';
import { DarkPanel } from '../ui/DarkPanel';
import { HorrorButton } from '../ui/HorrorButton';

// Dummy description map. Would be expanded per role.
const ROLE_DESCRIPTIONS: Record<string, string> = {
    'Mahasona': 'You are the Demon. Each night, choose a player to kill. Your goal is to outnumber the good.',
    'Riri Yaka': 'You are the Poisoner. Choose a player; their power will fail or reverse its vision.',
    'Kalu Kumaraya': 'You are the Swapper. Select TWO players to swap their physical seat positions.',
    'Kattandiya': 'You are the Investigator. Choose a player to see if they are a RED SKULL (Evil) or WHITE LAMP (Good).',
    'Pirith Monk': 'You are the Healer. Choose a player to protect from the Mahasona. You cannot protect yourself.',
    'Vedda Hunter': 'You are the Warrior. If the Mahasona kills you, fire your final revenge shot now.',
    'Gama Ralahamy': 'You are the Village Head. You lead the day discussion. Use your voice well!',
    'Townsfolk': 'You are a humble villager. Sleep peacefully... if you can.'
};

interface PlayerNightScreenProps {
    gameState: GameState;
    myPlayer: Player;
    isAwake: boolean;
    onTargetSubmit: (target1: string, target2?: string) => void;
    investigationResult?: string;
}

export const PlayerNightScreen: React.FC<PlayerNightScreenProps> = ({
    gameState,
    myPlayer,
    isAwake,
    onTargetSubmit,
    investigationResult
}) => {
    const [selectedTarget, setSelectedTarget] = useState<string | null>(null);
    const [secondTarget, setSecondTarget] = useState<string | null>(null);

    const role = myPlayer.role || 'Townsfolk';
    const roleDesc = ROLE_DESCRIPTIONS[role] || '';

    const handleSelect = (id: string) => {
        if (role === 'Kalu Kumaraya') {
            if (!selectedTarget) setSelectedTarget(id);
            else if (selectedTarget !== id) setSecondTarget(id);
        } else {
            setSelectedTarget(id);
        }
    };

    const submit = () => {
        if (selectedTarget) {
            onTargetSubmit(selectedTarget, secondTarget || undefined);
            setSelectedTarget(null);
            setSecondTarget(null);
        }
    };

    // If sleep, show pitch black with minor ambient
    if (!isAwake) {
        return (
            <div className="fixed inset-0 bg-black z-50 flex items-center justify-center p-4">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_0%,rgba(13,0,0,1)_100%)] opacity-80" />
                <div className="text-center z-10 animate-pulse">
                    <p className="font-heading text-red-900/50 text-xl tracking-widest uppercase">The night is silent...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 bg-[#0a0000] z-50 p-4 pt-16 animate-fade-in flex flex-col">
            <div className="absolute top-0 inset-x-0 h-1 bg-red-900/40 glow-red animate-pulse" />

            <div className="flex-1 max-w-lg mx-auto w-full flex flex-col gap-6">
                <DarkPanel title={`Wake, ${role}`} glowColor="red">
                    <p className="text-gray-300 font-body text-center mb-4">
                        {roleDesc}
                    </p>

                    {investigationResult && (
                        <div className="p-4 bg-black/60 border border-horror-primary mb-4 text-center">
                            <span className="text-sm uppercase text-horror-accent tracking-widest font-heading mb-2 block">Vision</span>
                            <div className={`text-2xl font-bold ${investigationResult === 'RED SKULL' ? 'text-red-500 glow-red' : 'text-white'}`}>
                                {investigationResult}
                            </div>
                        </div>
                    )}

                    <div className="flex flex-col gap-2 mt-4 max-h-[40vh] overflow-y-auto">
                        {gameState.players.map(p => (
                            <button
                                key={p.id}
                                onClick={() => handleSelect(p.id)}
                                disabled={!p.isAlive || (myPlayer.id === p.id && role === 'Pirith Monk')}
                                className={`w-full p-4 text-left border transition-colors ${selectedTarget === p.id || secondTarget === p.id
                                    ? 'border-horror-primary bg-horror-primary/20 glow-red'
                                    : 'border-horror-border/50 bg-black/40 hover:bg-black'
                                    } ${!p.isAlive ? 'opacity-30 cursor-not-allowed' : ''}`}
                            >
                                <div className="flex justify-between items-center">
                                    <span className={`font-heading uppercase tracking-widest ${!p.isAlive ? 'line-through text-gray-500' : 'text-gray-200'}`}>
                                        {p.name}
                                    </span>
                                    {(selectedTarget === p.id || secondTarget === p.id) && (
                                        <span className="text-horror-primary">●</span>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>

                    <HorrorButton
                        className="mt-6 w-full"
                        onClick={submit}
                        disabled={!selectedTarget || (role === 'Kalu Kumaraya' && !secondTarget)}
                    >
                        Confirm Ritual
                    </HorrorButton>
                </DarkPanel>
            </div>
        </div>
    );
};
