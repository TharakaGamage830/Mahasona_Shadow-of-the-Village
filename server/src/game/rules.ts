import { RoleDistribution, RoleType } from '../../../shared/types';

export const GAME_RULES = {
    MIN_PLAYERS: 5,
    MAX_PLAYERS: 20,
    PRETAYA_VOTE_WEIGHT: 0.5,
};

export const NIGHT_ORDER: RoleType[] = [
    'Riri Yaka',     // Step 0: Yaka acts (Kalu or Riri)
    'Kattandiya',    // Step 1: Investigator alignment
    'Pirith Monk',   // Step 2: Healer protection
    'Mahasona'       // Step 3: Demon kill
];

export function getRoleDistribution(playerCount: number): RoleDistribution {
    // 5-6 players: 1D, 1Y, 1I, 1H, 0V, (n-4)Villagers
    // 7-20 players: 1D, 1Y, 1I, 1H, 1V, (n-5)Villagers

    if (playerCount >= 7) {
        return { demons: 1, minions: 1, outsiders: 0, townsfolk: playerCount - 2 }; // townsfolk includes I, H, V
    } else {
        return { demons: 1, minions: 1, outsiders: 0, townsfolk: playerCount - 2 };
    }
}

export const ROLE_POOL: Record<'Demon' | 'Minion' | 'Townsfolk', RoleType[]> = {
    Demon: ['Mahasona'],
    Minion: ['Riri Yaka', 'Kalu Kumaraya'],
    Townsfolk: ['Kattandiya', 'Pirith Monk', 'Vedda Hunter', 'Gama Ralahamy', 'Townsfolk']
};
