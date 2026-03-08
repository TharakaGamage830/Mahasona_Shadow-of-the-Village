import { Server, Socket } from 'socket.io';
import { GameState, Player, RoleType } from '../../../shared/types';
import { getRoleDistribution, ROLE_POOL } from './rules';
import { v4 as uuidv4 } from 'uuid';

export class GameRoom {
    public state: GameState;

    constructor(roomCode: string, hostSocketId: string, hostUserId: string) {
        this.state = {
            roomId: uuidv4(),
            roomCode,
            phase: 'lobby',
            dayNumber: 0,
            players: [],
            hostSessionId: hostSocketId,
            hostUserId: hostUserId,
            nightStep: 0,
            protectedPlayerId: null,
            poisonedPlayerId: null,
            swappedSeats: null,
            nomineeId: null,
            votes: {}
        };
    }

    addPlayer(socketId: string, name: string, userId: string) {
        if (this.state.players.some((p: Player) => p.userId === userId)) return false; // Already in room

        this.state.players.push({
            id: uuidv4(),
            userId,
            name,
            role: null,
            isAlive: true,
            isOnline: true,
            seatPosition: this.state.players.length,
            socketId
        });
        return true;
    }

    removePlayer(userId: string) {
        // We do not physically remove the player if the game has started,
        // we just mark them offline. For lobby, we can remove them.
        if (this.state.phase === 'lobby') {
            this.state.players = this.state.players.filter((p: Player) => p.userId !== userId);
        } else {
            const player = this.state.players.find((p: Player) => p.userId === userId);
            if (player) {
                player.isOnline = false;
            }
        }
    }

    distributeRoles() {
        const pCount = this.state.players.length;
        const distribution = getRoleDistribution(pCount);

        // Build bag
        let bag: RoleType[] = [];
        bag.push(ROLE_POOL.Demon[0]); // Mahasona

        // Choose minions
        const minionPool = [...ROLE_POOL.Minion];
        for (let i = 0; i < distribution.minions; i++) {
            const rIndex = Math.floor(Math.random() * minionPool.length);
            // If we run out of unique minions, start over (though for now we only have 2, so it triggers early)
            const role = minionPool.splice(rIndex, 1)[0] || ROLE_POOL.Minion[Math.floor(Math.random() * ROLE_POOL.Minion.length)];
            bag.push(role);
        }

        // Choose outsiders
        for (let i = 0; i < distribution.outsiders; i++) {
            bag.push(ROLE_POOL.Outsider[0]); // Currently only Pretaya
        }

        // Choose Townsfolk
        const tfPool = [...ROLE_POOL.Townsfolk];
        for (let i = 0; i < distribution.townsfolk; i++) {
            if (tfPool.length > 0) {
                const rIndex = Math.floor(Math.random() * tfPool.length);
                bag.push(tfPool.splice(rIndex, 1)[0]);
            } else {
                bag.push('Townsfolk');
            }
        }

        // Shuffle bag
        for (let i = bag.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [bag[i], bag[j]] = [bag[j], bag[i]];
        }

        // Assign
        this.state.players.forEach((p: Player, i: number) => {
            p.role = bag[i];
        });

        // Randomize seat positions
        const seats = Array.from({ length: pCount }, (_, i) => i);
        for (let i = seats.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [seats[i], seats[j]] = [seats[j], seats[i]];
        }
        this.state.players.forEach((p: Player, i: number) => {
            p.seatPosition = seats[i];
        });
    }
}
