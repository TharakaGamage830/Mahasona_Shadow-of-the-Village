export type RoleType =
    | 'Mahasona'
    | 'Riri Yaka'
    | 'Kalu Kumaraya'
    | 'Kattandiya'
    | 'Pirith Monk'
    | 'Vedda Hunter'
    | 'Gama Ralahamy'
    | 'Townsfolk';

export type Alignment = 'Good' | 'Evil';
export type RoleCategory = 'Demon' | 'Minion' | 'Townsfolk';

export interface Player {
    id: string; // uuid
    userId: string; // Persistent Supabase Auth ID
    name: string;
    role: RoleType | null;
    isAlive: boolean;
    isOnline: boolean;
    seatPosition: number;
    socketId: string;
    iconId: number;
}

export type GamePhase = 'lobby' | 'day' | 'night' | 'finished';

export type NightStepIdx = 0 | 1 | 2 | 3 | 4 | 5;
// 0: Yaka, 1: Kattandiya, 2: Pirith Monk, 3: Mahasona, 4: Hunter Revenge (if needed), 5: Resolution

export interface GameState {
    roomId: string;
    roomCode: string;
    phase: GamePhase;
    dayNumber: number;
    players: Player[];
    hostSessionId: string;
    hostUserId: string;

    // Night phase state
    selectedYaka: 'Riri Yaka' | 'Kalu Kumaraya' | null;
    nightStep: NightStepIdx;
    protectedPlayerId: string | null;
    poisonedPlayerId: string | null;
    swappedSeats: { [originalSeat: number]: number } | null;
    hunterRevengeTargetId: string | null;

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
