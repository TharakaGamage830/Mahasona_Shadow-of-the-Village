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
            selectedYaka: null,
            nightStep: 0,
            protectedPlayerId: null,
            poisonedPlayerId: null,
            swappedSeats: null,
            hunterRevengeTargetId: null,
            nomineeId: null,
            votes: {}
        };
    }

    addPlayer(socketId: string, name: string, userId: string, iconId: number) {
        if (this.state.players.some((p: Player) => p.userId === userId)) return false; // Already in room

        this.state.players.push({
            id: uuidv4(),
            userId,
            name,
            role: null,
            isAlive: true,
            isOnline: true,
            seatPosition: this.state.players.length,
            socketId,
            iconId
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

        // 1. Pick a Yaka helper type for this game
        const yakaTypes: ('Riri Yaka' | 'Kalu Kumaraya')[] = ['Riri Yaka', 'Kalu Kumaraya'];
        this.state.selectedYaka = yakaTypes[Math.floor(Math.random() * yakaTypes.length)];

        // 2. Build the role bag
        let bag: RoleType[] = [];

        // Always 1 Mahasona
        bag.push('Mahasona');

        // Always 1 of the selected Yaka
        bag.push(this.state.selectedYaka);

        // Power roles (Good)
        const powerRoles: RoleType[] = ['Kattandiya', 'Pirith Monk', 'Vedda Hunter', 'Gama Ralahamy'];

        // Fill based on player count (5-6: no hunter, 7+: all power roles)
        powerRoles.forEach(role => {
            if (role === 'Vedda Hunter' && pCount < 7) return;
            bag.push(role);
        });

        // Fill remaining with Villagers/Townsfolk
        while (bag.length < pCount) {
            bag.push('Townsfolk');
        }

        // Final safety check: if we somehow overfilled (unlikely with this logic), trim
        if (bag.length > pCount) {
            bag = bag.slice(0, pCount);
        }

        // 3. Shuffle bag
        for (let i = bag.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [bag[i], bag[j]] = [bag[j], bag[i]];
        }

        // 4. Assign Roles
        this.state.players.forEach((p: Player, i: number) => {
            p.role = bag[i];
            p.isAlive = true; // reset for new game
        });

        // 5. Randomize seat positions
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
