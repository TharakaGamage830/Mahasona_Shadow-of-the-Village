export type RoleType = 'Mahasona' | 'Riri Yaka' | 'Kalu Kumaraya' | 'Kattandiya' | 'Pirith Monk' | 'Vedda Hunter' | 'Gama Ralahamy' | 'Pretaya' | 'Townsfolk';

export type Alignment = 'Good' | 'Evil';

export interface Player {
    id: string; // The supabaase/UUID
    name: string;
    role: RoleType | null;
    isAlive: boolean;
    seatPosition: number;
    socketId: string;
}

export type GamePhase = 'lobby' | 'day' | 'night';

export interface GameState {
    roomId: string;
    roomCode: string; // 6 chars
    phase: GamePhase;
    dayNumber: number;
    players: Player[];
    hostSessionId: string;
}

export interface RoomStateUpdate {
    gameState: GameState;
}

export interface NightActionPayload {
    roomId: string;
    actionData: any; // specific per role
}
