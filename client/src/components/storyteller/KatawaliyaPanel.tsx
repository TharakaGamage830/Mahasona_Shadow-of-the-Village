import React, { useState } from 'react';
import { DarkPanel } from '../ui/DarkPanel';
import { HorrorButton } from '../ui/HorrorButton';
import { socket } from '../../hooks/useGameState';
import type { GameState } from '../../../../shared/types';
import { PROFILE_ICONS } from '../../constants/icons';

interface KatawaliyaPanelProps {
    gameState: GameState;
    onWakeSleep: (playerId: string | null) => void;
    onOverrideKill: (playerId: string) => void;
}

export const KatawaliyaPanel: React.FC<KatawaliyaPanelProps> = ({ gameState, onWakeSleep, onOverrideKill }) => {
    const [activePlayer, setActivePlayer] = useState<string | null>(null);

    const stepNames = [
        "Step 1: Yaka (Poison/Swap)",
        "Step 2: Kattandiya (Investigate)",
        "Step 3: Pirith Monk (Protect)",
        "Step 4: Mahasona (Kill)",
        "Step 5: Hunter (Revenge)",
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
                            <p className="text-gray-400 font-body text-sm italic">
                                Action: {gameState.nightStep < 4 ? "Wake the relevant soul, then advance when they finish their ritual." : "The night draws to a close."}
                            </p>

                            <div className="bg-black/50 border border-horror-border p-4">
                                <h4 className="text-horror-accent font-heading mb-2 text-xs">Ritual Progress</h4>
                                <div className="grid grid-cols-2 gap-2 text-[10px] uppercase tracking-widest">
                                    <div>Poisoned: <span className="text-red-500 font-bold">{gameState.players.find(p => p.id === gameState.poisonedPlayerId)?.name || 'None'}</span></div>
                                    <div>Protected: <span className="text-blue-400 font-bold">{gameState.players.find(p => p.id === gameState.protectedPlayerId)?.name || 'None'}</span></div>
                                    <div className="col-span-2">Swaps: <span className="text-yellow-600">{gameState.swappedSeats ? 'ACTIVE' : 'NONE'}</span></div>
                                </div>
                            </div>

                            <div className="flex flex-col gap-2">
                                <HorrorButton
                                    variant="secondary"
                                    className="w-full text-xs"
                                    onClick={() => {
                                        socket.emit('next_night_step', { roomId: gameState.roomId });
                                    }}
                                    disabled={gameState.nightStep >= 4}
                                >
                                    Next Night Step ({gameState.nightStep + 1}/5)
                                </HorrorButton>

                                <HorrorButton
                                    className="w-full text-xs"
                                    onClick={() => {
                                        socket.emit('start_day_phase', { roomId: gameState.roomId });
                                    }}
                                >
                                    🌅 End Night & Start Day
                                </HorrorButton>
                            </div>
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
                                    <div className="text-gray-400 mb-1 text-center font-heading tracking-widest uppercase text-[10px]">Village Verdict</div>
                                    <div className="flex justify-between items-center text-lg px-4">
                                        <span className="text-red-500 glow-red">
                                            BURN: {Object.values(gameState.votes).filter(v => v === 'up').length}
                                        </span>
                                        <span className="text-green-500">
                                            SPARE: {Object.values(gameState.votes).filter(v => v === 'down').length}
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
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 flex items-center justify-center border border-horror-border/30 bg-black/20 rounded">
                                    <svg
                                        viewBox="0 0 24 24"
                                        className="w-5 h-5 text-horror-primary"
                                        dangerouslySetInnerHTML={{ __html: PROFILE_ICONS[p.iconId]?.svg || PROFILE_ICONS[0].svg }}
                                    />
                                </div>
                                <div>
                                    <span className={`font-bold uppercase tracking-wider ${p.isAlive ? 'text-white' : 'text-gray-600 line-through'}`}>
                                        {p.name}
                                    </span>
                                    <span className="ml-2 text-[10px] text-horror-accent block uppercase opacity-60">{p.role}</span>
                                </div>
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
