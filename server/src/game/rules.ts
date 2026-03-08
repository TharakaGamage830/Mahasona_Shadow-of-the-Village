import { RoleDistribution, RoleType } from '../../../shared/types';

export const GAME_RULES = {
    MIN_PLAYERS: 5,
    MAX_PLAYERS: 20,
    PRETAYA_VOTE_WEIGHT: 0.5,
};

export const NIGHT_ORDER: RoleType[] = [
    'Riri Yaka',     // Step 2: Minions wake (Riri & Kalu)
    'Kalu Kumaraya', // Step 3: Swap seats
    'Riri Yaka',     // Step 4: Poison player
    'Kattandiya',    // Step 5: Investigate alignment
    'Pirith Monk',   // Step 6: Protect player
    'Mahasona'       // Step 7: Kill player
];

export function getRoleDistribution(playerCount: number): RoleDistribution {
    if (playerCount >= 16) {
        return { demons: 1, minions: 3, outsiders: 3, townsfolk: playerCount - 7 };
    } else if (playerCount >= 13) {
        return { demons: 1, minions: 3, outsiders: 2, townsfolk: playerCount - 6 };
    } else if (playerCount >= 10) {
        return { demons: 1, minions: 2, outsiders: 2, townsfolk: playerCount - 5 };
    } else if (playerCount >= 7) {
        return { demons: 1, minions: 2, outsiders: 1, townsfolk: playerCount - 4 };
    } else {
        return { demons: 1, minions: 1, outsiders: 1, townsfolk: playerCount - 3 };
    }
}

export const ROLE_POOL: Record<'Demon' | 'Minion' | 'Outsider' | 'Townsfolk', RoleType[]> = {
    Demon: ['Mahasona'],
    Minion: ['Riri Yaka', 'Kalu Kumaraya'],
    Outsider: ['Pretaya'],
    Townsfolk: ['Kattandiya', 'Pirith Monk', 'Vedda Hunter', 'Gama Ralahamy', 'Townsfolk']
};
