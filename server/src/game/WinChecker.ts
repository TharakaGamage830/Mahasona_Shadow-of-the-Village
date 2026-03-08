import { GameRoom } from './GameRoom';
import { Player } from '../../../shared/types';

export class WinChecker {
    // Returns { winner: 'Good' | 'Evil' | null, reason?: string }
    static checkWinCondition(room: GameRoom): { winner: 'Good' | 'Evil' | null, reason?: string } {
        const players = room.state.players;
        const alivePlayers = players.filter(p => p.isAlive);

        // 1. Evil Condition: Are there 2 or fewer players alive?
        // Lore: "The evil team wins the MOMENT only 2 living players remain — even if Mahasona was nominated for execution that same day."
        if (alivePlayers.length <= 2) {
            return { winner: 'Evil', reason: 'Only two living souls remain. The Mahasona has massacred the village.' };
        }

        // 2. Good Condition: Is the Demon dead?
        const demon = players.find(p => ['Mahasona'].includes(p.role || ''));
        if (demon && !demon.isAlive) {
            return { winner: 'Good', reason: 'The Mahasona was executed! The village is finally safe.' };
        }

        return { winner: null };
    }
}
