import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import type { GameState, Player, RoleType } from '../../../shared/types';
import { supabase } from '../lib/supabaseClient';

// Singleton socket for MVP simplicity
export const socket: Socket = io(import.meta.env.VITE_SOCKET_URL || 'http://localhost:3001');

export const useGameState = () => {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [myPlayer, setMyPlayer] = useState<Player | null>(null);
    const [isStoryteller, setIsStoryteller] = useState(false);

    // Night phase specific
    const [isAwake, setIsAwake] = useState(false);
    const [actionStepInfo, setActionStepInfo] = useState<any>(null);
    const [investigationResult, setInvestigationResult] = useState<string | undefined>();
    const [winner, setWinner] = useState<'Good' | 'Evil' | null>(null);

    useEffect(() => {
        socket.on('room_state_update', (data: { gameState: GameState }) => {
            setGameState(data.gameState);

            const me = data.gameState.players.find(p => p.socketId === socket.id);
            if (me) setMyPlayer(me);

            if (data.gameState.hostSessionId === socket.id) {
                setIsStoryteller(true);
            }
        });

        socket.on('role_assigned', (data: { role: RoleType }) => {
            setMyPlayer(prev => prev ? { ...prev, role: data.role } : null);
        });

        socket.on('game_started', () => {
            // triggers UI shift internally because phase will become 'night' in next state update
        });

        socket.on('action_requested', (stepInfo: any) => {
            // Storyteller receives this mostly
            setActionStepInfo(stepInfo);
        });

        socket.on('wake_player', () => {
            setIsAwake(true);
            setInvestigationResult(undefined);
        });

        socket.on('sleep_player', () => {
            setIsAwake(false);
        });

        socket.on('action_result', (data) => {
            if (data.result) setInvestigationResult(data.result);
        });

        socket.on('game_over', (data: { winner: 'Good' | 'Evil' }) => {
            setWinner(data.winner);
        });

        // Auto-reconnect logic
        const savedRoom = localStorage.getItem('yaksha_room');
        if (savedRoom && supabase) {
            supabase.auth.getUser().then(({ data }) => {
                if (data.user) {
                    socket.emit('rejoin_room', { roomCode: savedRoom, userId: data.user.id }, (res: any) => {
                        if (res.error) {
                            console.warn('Rejoin failed:', res.error);
                            localStorage.removeItem('yaksha_room');
                        }
                    });
                }
            });
        }

        return () => {
            socket.off('room_state_update');
            socket.off('role_assigned');
            socket.off('game_started');
            socket.off('action_requested');
            socket.off('wake_player');
            socket.off('sleep_player');
            socket.off('action_result');
            socket.off('game_over');
        };
    }, []);

    return {
        gameState,
        myPlayer,
        isStoryteller,
        isAwake,
        actionStepInfo,
        investigationResult,
        winner
    };
};
