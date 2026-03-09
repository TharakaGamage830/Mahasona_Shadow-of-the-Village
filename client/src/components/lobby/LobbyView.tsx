import React, { useState, useEffect } from 'react';
import { HorrorButton } from '../ui/HorrorButton';
import { DarkPanel } from '../ui/DarkPanel';
import { socket } from '../../hooks/useGameState';
import { supabase } from '../../lib/supabaseClient';
import { PROFILE_ICONS } from '../../constants/icons';

interface LobbyViewProps {
    gameState: any; // We'll just pass it down to avoid double socket subscriptions
}

export const LobbyView: React.FC<LobbyViewProps> = ({ gameState }) => {
    const [playerName, setPlayerName] = useState('');
    const [userId, setUserId] = useState('');
    const [iconId, setIconId] = useState(0);
    const [roomCodeInput, setRoomCodeInput] = useState('');
    const [view, setView] = useState<'menu' | 'join' | 'waiting'>('menu');
    const [errorVisible, setErrorVisible] = useState(false);

    useEffect(() => {
        if (supabase) {
            supabase.auth.getUser().then(({ data }) => {
                if (data.user) {
                    setUserId(data.user.id);
                    setPlayerName(data.user.user_metadata?.player_name || data.user.email?.split('@')[0] || 'Unknown Soul');
                    setIconId(data.user.user_metadata?.icon_id || 0);
                }
            });
        }
    }, []);

    // Auto-transition to waiting if gameState is already here (e.g., host re-renders)
    useEffect(() => {
        if (gameState && gameState.roomCode) {
            setView('waiting');
        }
    }, [gameState]);

    const handleCreateRoom = () => {
        socket.emit('create_room', { userId, playerName, iconId }, (res: any) => {
            if (res.roomCode) {
                localStorage.setItem('yaksha_room', res.roomCode);
                setView('waiting');
            }
        });
    };

    const handleJoinRoom = () => {
        if (roomCodeInput.length === 6 && playerName && userId) {
            socket.emit('join_room', { roomCode: roomCodeInput, playerName, userId, iconId }, (res: any) => {
                if (res.error) {
                    setErrorVisible(true);
                    setTimeout(() => setErrorVisible(false), 3000);
                } else {
                    localStorage.setItem('yaksha_room', roomCodeInput);
                    setView('waiting');
                }
            });
        }
    };

    const handleStartGame = () => {
        if (gameState && gameState.roomCode) {
            socket.emit('start_game', { roomCode: gameState.roomCode });
        }
    };

    const handleLeaveRoom = () => {
        if (gameState && gameState.roomCode) {
            socket.emit('leave_room', { roomCode: gameState.roomCode, userId });
            localStorage.removeItem('yaksha_room');
            setView('menu');
        }
    };

    const handleCopyCode = () => {
        if (gameState?.roomCode) {
            navigator.clipboard.writeText(gameState.roomCode);
        }
    };

    const handlePasteCode = async () => {
        const text = await navigator.clipboard.readText();
        if (text && text.length === 6) {
            setRoomCodeInput(text.toUpperCase());
        }
    };

    const takenIcons = gameState?.players?.map((p: any) => p.iconId) || [];

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-lg mx-auto p-4">
            {view === 'menu' && (
                <DarkPanel className="w-full text-center" title={
                    <div className="flex flex-col items-center py-2">
                        <span className="font-mahasona text-3xl md:text-4xl mahasona-glow tracking-wide drop-shadow-[0_2px_10px_rgba(255,0,0,0.5)]">MAHASONA</span>
                        <span className="font-shadows text-xs md:text-sm text-horror-accent mt-1 tracking-[0.4em] uppercase opacity-90 border-t border-horror-accent/20 pt-1 w-full max-w-[200px]">Shadows of the Village</span>
                    </div>
                }>
                    <p className="mb-4 font-body text-gray-400">
                        Welcome, <span className="text-white font-bold">{playerName}</span>. Choose your totem:
                    </p>

                    <div className="w-full mb-8">
                        <div className="flex gap-4 overflow-x-auto pb-4 px-2 custom-scrollbar mask-fade-edges">
                            {PROFILE_ICONS.map(icon => (
                                <button
                                    key={icon.id}
                                    type="button"
                                    onClick={() => setIconId(icon.id)}
                                    className={`min-w-[50px] h-[50px] flex items-center justify-center border-2 transition-all shrink-0 ${iconId === icon.id ? 'border-horror-primary scale-110 bg-horror-primary/10' : 'border-stone-800 opacity-40 hover:opacity-80'}`}
                                >
                                    <svg viewBox="0 0 24 24" className="w-8 h-8" dangerouslySetInnerHTML={{ __html: icon.svg }} />
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-6">
                        <HorrorButton fullWidth onClick={handleCreateRoom}>
                            Create New Room (Storyteller)
                        </HorrorButton>

                        <div className="relative py-4">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-horror-border"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-horror-bg text-gray-500 font-heading">OR JOIN</span>
                            </div>
                        </div>

                        <HorrorButton variant="secondary" fullWidth onClick={() => setView('join')} disabled={!playerName}>
                            Join Existing Room
                        </HorrorButton>
                    </div>
                </DarkPanel>
            )}

            {view === 'join' && (
                <DarkPanel className="w-full text-center" title="Join Ritual">
                    <div className="space-y-6">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="ROOM CODE"
                                value={roomCodeInput}
                                onChange={(e) => setRoomCodeInput(e.target.value.toUpperCase())}
                                maxLength={6}
                                className="w-full bg-black/60 border border-horror-border px-4 py-3 text-center uppercase tracking-widest text-xl focus:outline-none focus:border-horror-primary glow-red text-horror-primary font-bold pr-12"
                            />
                            <button
                                onClick={handlePasteCode}
                                className="absolute right-2 top-1/2 -translate-y-1/2 text-[10px] bg-horror-border/40 hover:bg-horror-border p-1 px-2 uppercase tracking-tighter rounded"
                                title="Paste Code"
                            >
                                Paste
                            </button>
                        </div>

                        <div className="w-full">
                            <label className="block text-[10px] uppercase tracking-[0.3em] text-horror-accent mb-3 text-center opacity-60">Pick Your Totem</label>
                            <div className="flex gap-4 overflow-x-auto pb-4 px-2 custom-scrollbar mask-fade-edges">
                                {PROFILE_ICONS.map(icon => {
                                    const isTaken = takenIcons.includes(icon.id);
                                    return (
                                        <button
                                            key={icon.id}
                                            type="button"
                                            disabled={isTaken}
                                            onClick={() => setIconId(icon.id)}
                                            className={`min-w-[50px] h-[50px] flex items-center justify-center border-2 transition-all shrink-0 ${iconId === icon.id ? 'border-horror-primary scale-110 bg-horror-primary/10' : isTaken ? 'border-red-900/40 opacity-10 cursor-not-allowed' : 'border-stone-800 opacity-40 hover:opacity-80'}`}
                                        >
                                            <svg viewBox="0 0 24 24" className="w-8 h-8" dangerouslySetInnerHTML={{ __html: icon.svg }} />
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                        {errorVisible && <p className="text-red-500 text-sm font-bold">Failed to join. Invalid Code or Name taken.</p>}
                        <div className="flex gap-4">
                            <HorrorButton variant="ghost" onClick={() => setView('menu')} className="flex-1">
                                Back
                            </HorrorButton>
                            <HorrorButton onClick={handleJoinRoom} className="flex-1">
                                Enter
                            </HorrorButton>
                        </div>
                    </div>
                </DarkPanel>
            )}

            {view === 'waiting' && gameState && (
                <DarkPanel className="w-full text-center flex flex-col animate-fade-in" glowColor="red">
                    <div className="flex items-center justify-center gap-4 mb-2">
                        <h2 className="text-4xl font-heading text-horror-primary glow-red tracking-[0.2em]">
                            {gameState.roomCode}
                        </h2>
                        <button
                            onClick={handleCopyCode}
                            className="bg-horror-border/20 hover:bg-horror-border/40 p-2 border border-horror-border/40 rounded transition-colors group"
                            title="Copy Code"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-60 group-hover:opacity-100"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                        </button>
                    </div>
                    <p className="text-sm font-body text-gray-400 mb-8 uppercase tracking-widest">
                        Room Code
                    </p>

                    <div className="bg-black/40 border border-horror-border/50 p-4 mb-8 min-h-[200px]">
                        <h3 className="font-heading text-horror-accent mb-4 border-b border-horror-accent/30 pb-2">
                            Gathered Souls ({gameState.players.length}/20)
                        </h3>
                        <ul className="space-y-2">
                            {gameState.players.map((p: any) => (
                                <li key={p.id} className="font-body text-lg text-gray-300 flex items-center justify-between bg-white/5 p-2 px-4 rounded border border-white/5">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 flex items-center justify-center border border-horror-border/50 bg-black/60 rounded">
                                            <svg
                                                viewBox="0 0 24 24"
                                                className="w-5 h-5 text-horror-primary"
                                                dangerouslySetInnerHTML={{ __html: PROFILE_ICONS[p.iconId]?.svg || PROFILE_ICONS[0].svg }}
                                            />
                                        </div>
                                        <span className="uppercase tracking-widest text-sm">{p.name}</span>
                                    </div>
                                    <span className="text-horror-accent/40 text-[10px] uppercase">Bound</span>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="mt-auto">
                        {gameState.hostSessionId === socket.id ? (
                            <HorrorButton fullWidth onClick={handleStartGame} disabled={gameState.players.length < 5}>
                                {gameState.players.length < 5 ? `Need ${5 - gameState.players.length} more` : 'Begin Ritual'}
                            </HorrorButton>
                        ) : (
                            <p className="text-xs text-gray-500 animate-pulse font-body mb-4">
                                Waiting for Vedamahattaya to begin the Thovil...
                            </p>
                        )}

                        <HorrorButton
                            variant="ghost"
                            size="sm"
                            onClick={handleLeaveRoom}
                            className="mt-4 text-gray-500 hover:text-red-500 border-none"
                        >
                            ← Leave Room
                        </HorrorButton>
                    </div>
                </DarkPanel>
            )}
        </div>
    );
};
