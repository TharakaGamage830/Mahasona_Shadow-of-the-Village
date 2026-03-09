import { GameRoom } from './GameRoom';
import { Player } from '../../../shared/types';

export class WinChecker {
    static checkWinCondition(room: GameRoom): { winner: 'Good' | 'Evil' | null, reason?: string } {
        const players = room.state.players;
        const alivePlayers = players.filter(p => p.isAlive);

        // 1. Good Condition: Is the Mahasona dead?
        const mahasona = players.find(p => p.role === 'Mahasona');
        if (mahasona && !mahasona.isAlive) {
            return { winner: 'Good', reason: 'The Mahasona was executed! The village is finally safe.' };
        }

        // 2. Evil Condition: Are living evil players >= living good players?
        const evilCount = alivePlayers.filter(p => ['Mahasona', 'Riri Yaka', 'Kalu Kumaraya'].includes(p.role || '')).length;
        const goodCount = alivePlayers.length - evilCount;

        if (evilCount >= goodCount && evilCount > 0) {
            return { winner: 'Evil', reason: 'The darkness consumes the village. Evil now outnumbers the survivors.' };
        }

        return { winner: null };
    }
}
