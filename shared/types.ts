export type RoleType =
    | 'Mahasona'
    | 'Riri Yaka'
    | 'Kalu Kumaraya'
    | 'Kattandiya'
    | 'Pirith Monk'
    | 'Vedda Hunter'
    | 'Gama Ralahamy'
    | 'Pretaya'
    | 'Townsfolk';

export type Alignment = 'Good' | 'Evil';
export type RoleCategory = 'Demon' | 'Minion' | 'Outsider' | 'Townsfolk';

export interface Player {
    id: string; // uuid
    userId: string; // Persistent Supabase Auth ID
    name: string;
    role: RoleType | null;
    isAlive: boolean;
    isOnline: boolean;
    seatPosition: number;
    socketId: string;
}

export type GamePhase = 'lobby' | 'day' | 'night' | 'finished';

export type NightStepIdx = 0 | 1 | 2 | 3 | 4 | 5 | 6;
// 0: Minions, 1: Kalu Kumaraya, 2: Riri Yaka, 3: Kattandiya, 4: Pirith Monk, 5: Mahasona, 6: Resolution

export interface GameState {
    roomId: string;
    roomCode: string;
    phase: GamePhase;
    dayNumber: number;
    players: Player[];
    hostSessionId: string;
    hostUserId: string;

    // Night phase state
    nightStep: NightStepIdx;
    protectedPlayerId: string | null;
    poisonedPlayerId: string | null;
    swappedSeats: { [originalSeat: number]: number } | null;

    // Voting / Day phase
    nomineeId: string | null;
    votes: Record<string, 'up' | 'down'>;
}

export interface RoomStateUpdate {
    gameState: GameState;
}

export interface RoleDistribution {
    demons: number;
    minions: number;
    outsiders: number;
    townsfolk: number;
}
