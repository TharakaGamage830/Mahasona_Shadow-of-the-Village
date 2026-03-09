import React, { useState } from 'react';
import type { GameState, Player } from '../../../../shared/types';
import { DarkPanel } from '../ui/DarkPanel';
import { HorrorButton } from '../ui/HorrorButton';
import { socket } from '../../hooks/useGameState';
import { PROFILE_ICONS } from '../../constants/icons';

interface VotingUIProps {
    gameState: GameState;
    myPlayer: Player;
}

export const VotingUI: React.FC<VotingUIProps> = ({ gameState, myPlayer }) => {
    const [selectedNominee, setSelectedNominee] = useState<string | null>(null);

    const handleNominate = () => {
        if (selectedNominee && myPlayer.isAlive) {
            socket.emit('nominate_player', {
                roomId: gameState.roomId,
                targetId: selectedNominee,
                nominatorId: myPlayer.id
            });
            setSelectedNominee(null);
        }
    };

    const handleVote = (vote: 'up' | 'down') => {
        // Ghosts can't vote in this simple MVP (Pretaya aside, but keeping MVP simple)
        if (!myPlayer.isAlive) return;

        socket.emit('submit_vote', {
            roomId: gameState.roomId,
            voterId: myPlayer.id,
            voteValue: vote
        });
    };

    const nominee = gameState.players.find(p => p.id === gameState.nomineeId);
    const myVote = gameState.votes[myPlayer.id];

    return (
        <DarkPanel title="The Gam Maduwa (Tribunal)" glowColor="red" className="flex-1">
            {!gameState.nomineeId ? (
                <div className="flex flex-col gap-4">
                    <p className="font-body text-gray-400 text-sm mb-2 text-center">
                        Discuss the night's terrors. When ready, nominate a suspect for execution.
                    </p>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-[45vh] overflow-y-auto pr-2 custom-scrollbar">
                        {gameState.players.map(p => (
                            <button
                                key={p.id}
                                onClick={() => setSelectedNominee(p.id)}
                                disabled={!myPlayer.isAlive || !p.isAlive || p.id === myPlayer.id}
                                className={`p-2 text-left border transition-colors flex items-center gap-2 ${selectedNominee === p.id
                                    ? 'border-red-600 bg-red-900/30'
                                    : 'border-horror-border/40 bg-black/40 hover:border-horror-accent'
                                    } ${!p.isAlive ? 'opacity-30 line-through' : ''}`}
                            >
                                <div className="w-6 h-6 shrink-0 flex items-center justify-center border border-horror-border/30 bg-black/40">
                                    <svg
                                        viewBox="0 0 24 24"
                                        className={`w-4 h-4 ${p.id === myPlayer.id ? 'text-horror-accent' : 'text-horror-primary'}`}
                                        dangerouslySetInnerHTML={{ __html: PROFILE_ICONS[p.iconId]?.svg || PROFILE_ICONS[0].svg }}
                                    />
                                </div>
                                <div className="uppercase tracking-widest text-[10px] font-heading truncate">{p.name}</div>
                            </button>
                        ))}
                    </div>
                    <HorrorButton
                        disabled={!selectedNominee || !myPlayer.isAlive}
                        onClick={handleNominate}
                        className="mt-4"
                    >
                        Accuse Suspect
                    </HorrorButton>
                    {!myPlayer.isAlive && <p className="text-red-500 text-xs text-center">The dead cannot nominate.</p>}
                </div>
            ) : (
                <div className="flex flex-col items-center justify-center py-8">
                    <h3 className="font-heading text-red-500 text-xl tracking-[0.2em] mb-2 uppercase">Execution Node</h3>
                    <p className="font-body text-2xl text-white mb-8 blood-text-effect">{nominee?.name}</p>

                    <div className="flex gap-4 w-full justify-center">
                        <button
                            onClick={() => handleVote('down')}
                            disabled={!myPlayer.isAlive}
                            className={`p-4 border-2 w-32 font-heading uppercase tracking-widest transition-all ${myVote === 'down'
                                ? 'border-green-500 bg-green-900/40 text-green-400'
                                : 'border-horror-border text-gray-500 hover:border-white'
                                }`}
                        >
                            Spare
                        </button>
                        <button
                            onClick={() => handleVote('up')}
                            disabled={!myPlayer.isAlive}
                            className={`p-4 border-2 w-32 font-heading uppercase tracking-widest transition-all ${myVote === 'up'
                                ? 'border-red-500 bg-red-900/40 text-red-500 glow-red'
                                : 'border-horror-border text-gray-500 hover:border-red-500 hover:text-red-200'
                                }`}
                        >
                            Burn
                        </button>
                    </div>

                    <div className="mt-8 text-sm font-body text-gray-400">
                        Votes Cast: {Object.keys(gameState.votes).length} / {gameState.players.filter(p => p.isAlive).length}
                    </div>
                </div>
            )}
        </DarkPanel>
    );
};
