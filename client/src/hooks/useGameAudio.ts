import { useEffect, useRef, useState } from 'react';
import { Howl } from 'howler';
import { useGameState } from './useGameState';

// We put placeholders for local files. The user can drop actual audio files into the public/audio/ folder later.
const SOUNDS = {
    lobby: new Howl({
        src: ['/assets/music/LOBBY-MUSIC.mp3'],
        loop: true,
        volume: 0.15,
        html5: true, // Use HTML5 Audio for large files to avoid loading/autoplay blocks
    }),
    night: new Howl({
        src: ['/assets/music/NIGHT-PHASE-MUSIC.mp3'],
        loop: true,
        volume: 0.2,
        html5: true,
    }),
    day: new Howl({
        src: ['/assets/music/DAY-PHASE-MUSIC.mp3'],
        loop: true,
        volume: 0.25,
        html5: true,
    }),
    victory: new Howl({
        src: ['/assets/music/ENDING-MUSIC-VICTORY.mp3'],
        loop: true,
        volume: 0.4,
        html5: true,
    }),
    defeat: new Howl({
        src: ['/assets/music/ENDING-MUSIC-DEFEAT.mp3'],
        loop: true,
        volume: 0.4,
        html5: true,
    }),
};

export const useGameAudio = () => {
    const { gameState, winner } = useGameState();
    const [isMuted, setIsMuted] = useState(() => {
        return localStorage.getItem('yaksha_muted') === 'true';
    });
    const previousPhase = useRef<string | null>(null);

    const toggleMute = () => {
        const NewMuted = !isMuted;
        setIsMuted(NewMuted);
        localStorage.setItem('yaksha_muted', String(NewMuted));
        // @ts-ignore
        Howler.mute(NewMuted);
    };

    // Apply mute state on mount
    useEffect(() => {
        // @ts-ignore
        Howler.mute(isMuted);
    }, []);

    // Global interaction unlock for browsers
    useEffect(() => {
        const unlock = () => {
            // @ts-ignore
            if (Howler.ctx && Howler.ctx.state === 'suspended') {
                // @ts-ignore
                Howler.ctx.resume();
            }
            // Trigger play for the current phase manually once unlocked
            const currentPhase = gameState?.phase || 'lobby';
            if (currentPhase === 'lobby' && !SOUNDS.lobby.playing() && !isMuted) {
                SOUNDS.lobby.play();
                SOUNDS.lobby.fade(0, 0.15, 1000);
            }
            window.removeEventListener('click', unlock);
        };
        window.addEventListener('click', unlock);
        return () => window.removeEventListener('click', unlock);
    }, [gameState, isMuted]);

    useEffect(() => {
        // Default to 'lobby' if no game state exists (pre-login)
        const currentPhase = gameState?.phase || 'lobby';

        // Detect phase changes and transition audio
        if (currentPhase !== previousPhase.current) {
            // Fade out everything currently playing
            Object.values(SOUNDS).forEach(s => {
                if (s instanceof Howl && s.playing()) {
                    s.fade(s.volume(), 0, 1500);
                    setTimeout(() => s.stop(), 1500);
                }
            });

            setTimeout(() => {
                // Start new audio based on current phase
                if (currentPhase === 'lobby') {
                    if (!SOUNDS.lobby.playing() && !isMuted) {
                        SOUNDS.lobby.play();
                        SOUNDS.lobby.fade(0, 0.15, 2000);
                    }
                } else if (currentPhase === 'night') {
                    if (!isMuted) {
                        SOUNDS.night.play();
                        SOUNDS.night.fade(0, 0.2, 2000);
                    }
                } else if (currentPhase === 'day') {
                    if (!isMuted) {
                        SOUNDS.day.play();
                        SOUNDS.day.fade(0, 0.25, 2000);
                    }
                } else if (currentPhase === 'finished') {
                    if (!isMuted) {
                        if (winner === 'Good') {
                            SOUNDS.victory.play();
                            SOUNDS.victory.fade(0, 0.4, 2000);
                        } else if (winner === 'Evil') {
                            SOUNDS.defeat.play();
                            SOUNDS.defeat.fade(0, 0.4, 2000);
                        }
                    }
                }
            }, 1600);

            previousPhase.current = currentPhase;
        }
    }, [gameState, winner, isMuted]);

    return { isMuted, toggleMute };
};
