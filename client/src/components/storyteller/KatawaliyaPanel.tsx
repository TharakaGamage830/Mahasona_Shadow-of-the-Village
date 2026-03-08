import React, { useState } from 'react';
import { DarkPanel } from '../ui/DarkPanel';
import { HorrorButton } from '../ui/HorrorButton';
import { socket } from '../../hooks/useGameState';
import type { GameState } from '../../../../shared/types';

interface KatawaliyaPanelProps {
    gameState: GameState;
    onWakeSleep: (playerId: string | null) => void;
    onOverrideKill: (playerId: string) => void;
}

export const KatawaliyaPanel: React.FC<KatawaliyaPanelProps> = ({ gameState, onWakeSleep, onOverrideKill }) => {
    const [activePlayer, setActivePlayer] = useState<string | null>(null);

    const stepNames = [
        "Step 1: Minions Wake",
        "Step 2: Kalu Kumaraya Swap",
        "Step 3: Riri Yaka Poison",
        "Step 4: Kattandiya Investigate",
        "Step 5: Pirith Monk Protect",
        "Step 6: Mahasona Kill",
        "Resolution & Dawn"
    ];

    const handleWake = (playerId: string) => {
        setActivePlayer(playerId);
        onWakeSleep(playerId);
    };

    const handleSleep = () => {
        setActivePlayer(null);
        onWakeSleep(null);
    };

    return (
        <div className="w-full h-full p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
            <DarkPanel title="Katawaliya Control" glowColor="gold" className="overflow-y-auto">
                {gameState.phase === 'night' ? (
                    <>
                        <h3 className="font-heading text-xl text-horror-primary mb-4 glow-red">
                            {stepNames[gameState.nightStep]}
                        </h3>

                        <div className="space-y-4">
                            <p className="text-gray-400 font-body">Current Night Step Logic: Follow the scroll. Wake the active roles, let them target, then put them to sleep.</p>

                            <div className="bg-black/50 border border-horror-border p-4">
                                <h4 className="text-horror-accent font-heading mb-2">Trackers</h4>
                                <div className="grid grid-cols-2 gap-2 text-sm">
                                    <div>Poisoned: <span className="text-red-500">{gameState.poisonedPlayerId || 'None'}</span></div>
                                    <div>Protected: <span className="text-blue-400">{gameState.protectedPlayerId || 'None'}</span></div>
                                    <div className="col-span-2">Swaps: {gameState.swappedSeats ? 'Active' : 'None'}</div>
                                </div>
                            </div>

                            <HorrorButton
                                className="mt-6 w-full text-xs"
                                onClick={() => {
                                    socket.emit('start_day_phase', { roomId: gameState.roomId });
                                }}
                            >
                                Wake the Village (Start Day)
                            </HorrorButton>
                        </div>
                    </>
                ) : (
                    <div className="flex flex-col gap-4">
                        <h3 className="font-heading text-xl text-horror-primary mb-2 glow-red uppercase">
                            Day {gameState.dayNumber}
                        </h3>
                        <p className="text-sm text-gray-500 font-body leading-relaxed mb-4">
                            The village is awake. Monitor chat and voting. Execute players when the Gam Maduwa reaches a verdict.
                        </p>
                        <HorrorButton
                            className="w-full"
                            variant="secondary"
                            onClick={() => {
                                socket.emit('check_win_condition', { roomId: gameState.roomId });
                            }}
                        >
                            Check Win Condition
                        </HorrorButton>

                        {gameState.nomineeId && (
                            <div className="mt-4 border-t border-horror-border pt-4">
                                <h4 className="text-red-500 text-sm font-bold animate-pulse mb-2">ON TRIAL:</h4>
                                <p className="text-white text-xl uppercase font-heading mb-4">{gameState.players.find(p => p.id === gameState.nomineeId)?.name}</p>

                                <div className="bg-black/60 border border-horror-border/50 p-3 mb-4 text-sm font-body">
                                    <div className="text-gray-400 mb-1">Village Verdict (Pretaya votes = 0.5)</div>
                                    <div className="flex justify-between items-center text-lg">
                                        <span className="text-red-500 glow-red">
                                            BURN: {Object.entries(gameState.votes).filter(([_, v]) => v === 'up').reduce((acc, [idx, _]) => {
                                                const voter = gameState.players.find(p => p.id === idx);
                                                return acc + (voter?.role === 'Pretaya' ? 0.5 : 1);
                                            }, 0)}
                                        </span>
                                        <span className="text-green-500">
                                            SPARE: {Object.entries(gameState.votes).filter(([_, v]) => v === 'down').reduce((acc, [idx, _]) => {
                                                const voter = gameState.players.find(p => p.id === idx);
                                                return acc + (voter?.role === 'Pretaya' ? 0.5 : 1);
                                            }, 0)}
                                        </span>
                                    </div>
                                </div>

                                <HorrorButton
                                    className="mt-4 w-full"
                                    onClick={() => {
                                        socket.emit('execute_player', { roomId: gameState.roomId, targetId: gameState.nomineeId });
                                    }}
                                >
                                    EXECUTE TRIBUNAL VERDICT
                                </HorrorButton>
                            </div>
                        )}
                    </div>
                )}
            </DarkPanel>

            <DarkPanel title="Village Souls" glowColor="none" className="overflow-y-auto max-h-[70vh]">
                <div className="flex flex-col gap-2">
                    {gameState.players.map(p => (
                        <div key={p.id} className="p-3 border border-horror-border/50 bg-black/40 flex justify-between items-center group">
                            <div>
                                <span className={`font-bold ${p.isAlive ? 'text-white' : 'text-gray-600 line-through'}`}>
                                    {p.name}
                                </span>
                                <span className="ml-2 text-sm text-horror-accent">[{p.role}]</span>
                            </div>

                            <div className="flex gap-2">
                                {activePlayer === p.id ? (
                                    <button onClick={handleSleep} className="px-3 py-1 bg-horror-border text-white text-xs hover:bg-black uppercase tracking-wider">
                                        Sleep
                                    </button>
                                ) : (
                                    <button onClick={() => handleWake(p.id)} className="px-3 py-1 bg-horror-primary text-white text-xs hover:bg-red-700 uppercase tracking-wider">
                                        Wake
                                    </button>
                                )}

                                <button onDoubleClick={() => onOverrideKill(p.id)} className="px-2 py-1 bg-black border border-red-900 text-red-700 text-xs hover:bg-red-900 hover:text-white uppercase tracking-wider opacity-0 group-hover:opacity-100 transition-opacity" title="Double Click to Force Kill">
                                    Kill
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </DarkPanel>
        </div>
    );
};
