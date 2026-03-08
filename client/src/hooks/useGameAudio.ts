import { useEffect, useRef } from 'react';
import { Howl } from 'howler';
import { useGameState } from './useGameState';

// We put placeholders for local files. The user can drop actual audio files into the public/audio/ folder later.
const SOUNDS = {
    lobbyDrums: new Howl({
        src: ['/audio/thovil-drums.mp3'], // Placeholder path
        loop: true,
        volume: 0.3,
    }),
    nightDrone: new Howl({
        src: ['/audio/horror-drone.mp3'],
        loop: true,
        volume: 0.2,
    }),
    dayAmbience: new Howl({
        src: ['/audio/village-day.mp3'],
        loop: true,
        volume: 0.4,
    }),
    gong: new Howl({
        src: ['/audio/gong.mp3'],
        volume: 0.8,
    })
};

export const useGameAudio = () => {
    const { gameState } = useGameState();
    const previousPhase = useRef<string>('lobby');

    useEffect(() => {
        if (!gameState) return;

        const currentPhase = gameState.phase;

        // Detect phase changes and transition audio
        if (currentPhase !== previousPhase.current) {
            // Fade out everything
            SOUNDS.lobbyDrums.fade(SOUNDS.lobbyDrums.volume(), 0, 1000);
            SOUNDS.nightDrone.fade(SOUNDS.nightDrone.volume(), 0, 1000);
            SOUNDS.dayAmbience.fade(SOUNDS.dayAmbience.volume(), 0, 1000);

            setTimeout(() => {
                SOUNDS.lobbyDrums.stop();
                SOUNDS.nightDrone.stop();
                SOUNDS.dayAmbience.stop();

                // Start new audio
                if (currentPhase === 'lobby') {
                    SOUNDS.lobbyDrums.play();
                    SOUNDS.lobbyDrums.fade(0, 0.3, 2000);
                } else if (currentPhase === 'night') {
                    SOUNDS.gong.play();
                    SOUNDS.nightDrone.play();
                    SOUNDS.nightDrone.fade(0, 0.2, 2000);
                } else if (currentPhase === 'day') {
                    SOUNDS.dayAmbience.play();
                    SOUNDS.dayAmbience.fade(0, 0.4, 2000);
                }
            }, 1000);

            previousPhase.current = currentPhase;
        }
    }, [gameState]);

    return null; // This hook doesn't return anything, just manages the side-effects
};
