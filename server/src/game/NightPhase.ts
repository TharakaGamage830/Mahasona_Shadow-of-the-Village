import { GameRoom } from './GameRoom';
import { Player, NightStepIdx, RoleType } from '../../../shared/types';
import { NIGHT_ORDER } from './rules';

export class NightPhaseManager {
    private room: GameRoom;

    constructor(room: GameRoom) {
        this.room = room;
    }

    // Returns true if evil won right now
    checkEvilWin() {
        const alivePlayers = this.room.state.players.filter((p: Player) => p.isAlive);
        if (alivePlayers.length <= 2) {
            return true;
        }
        return false;
    }

    startNight() {
        this.room.state.phase = 'night';
        this.room.state.nightStep = 0; // Minions wake
        this.room.state.protectedPlayerId = null;
        this.room.state.poisonedPlayerId = null;
        this.room.state.swappedSeats = null;
        return this.getStepInfo();
    }

    nextStep(): boolean {
        if (this.room.state.nightStep < 6) {
            this.room.state.nightStep++;
            return true; // continue night
        }
        return false; // night ends
    }

    getStepInfo() {
        const rolesActive = this.getActiveRolesForStep(this.room.state.nightStep);
        return {
            step: this.room.state.nightStep,
            activeRoles: rolesActive
        };
    }

    // Returns the roles active at the given step index for NIGHT_ORDER
    private getActiveRolesForStep(step: number): RoleType[] {
        switch (step) {
            case 0: return ['Riri Yaka', 'Kalu Kumaraya']; // Step 0: Minions confirm each other
            case 1: return ['Kalu Kumaraya'];              // Step 1: Kalu Kumaraya swaps
            case 2: return ['Riri Yaka'];                  // Step 2: Riri Yaka poisons
            case 3: return ['Kattandiya'];                 // Step 3: Kattandiya investigates
            case 4: return ['Pirith Monk'];                // Step 4: Pirith Monk protects
            case 5: return ['Mahasona'];                   // Step 5: Mahasona kills
            case 6: return [];                             // Step 6: resolution
            default: return [];
        }
    }

    handleAction(role: RoleType, targetId: string, secondaryTargetId?: string): any {
        const target = this.room.state.players.find((p: Player) => p.id === targetId);
        if (!target) return { error: 'Target not found' };

        switch (role) {
            case 'Kalu Kumaraya':
                if (!secondaryTargetId) return { error: 'Need 2 targets to swap' };
                const target2 = this.room.state.players.find((p: Player) => p.id === secondaryTargetId);
                if (!target2) return { error: 'Secondary target not found' };
                this.room.state.swappedSeats = {
                    ...(this.room.state.swappedSeats || {}),
                    [target.seatPosition]: target2.seatPosition,
                    [target2.seatPosition]: target.seatPosition
                };
                return { success: true };

            case 'Riri Yaka':
                this.room.state.poisonedPlayerId = target.id;
                return { success: true };

            case 'Kattandiya':
                // Are we poisoned?
                const isPoisoned = this.room.state.players.find((p: Player) => p.role === 'Kattandiya')?.id === this.room.state.poisonedPlayerId;

                // Target's true alignment
                const targetIsEvil = ['Mahasona', 'Riri Yaka', 'Kalu Kumaraya'].includes(target.role || '');

                // Poison reverses the result!
                const showsEvil = isPoisoned ? !targetIsEvil : targetIsEvil;

                return { success: true, result: showsEvil ? 'RED SKULL' : 'WHITE LAMP' };

            case 'Pirith Monk':
                const monk = this.room.state.players.find((p: Player) => p.role === 'Pirith Monk');
                if (monk && monk.id === target.id) {
                    // Lore: Selflessness required. If Monk protects himself, protection SILENTLY FAILS.
                    return { success: true }; // Silent failure, but valid action
                }

                // Lore: If monk protects the Pretaya, the curse is lifted permanently!
                if (target.role === 'Pretaya') {
                    // We need a mechanic flag for this at the room state, but for now we'll handle standard protection
                    // They become a full voter conceptually.
                }

                // Lore: If monk protects a poisoned player, the poison is canceled and Monk's protection still holds.
                if (this.room.state.poisonedPlayerId === target.id) {
                    this.room.state.poisonedPlayerId = null;
                }

                this.room.state.protectedPlayerId = target.id;
                return { success: true };

            case 'Mahasona':
                const mahasona = this.room.state.players.find((p: Player) => p.role === 'Mahasona');
                if (mahasona && mahasona.id === target.id) {
                    return { error: 'Cannot target yourself' };
                }

                // Was the target protected by the Pirith Monk?
                if (this.room.state.protectedPlayerId === target.id) {
                    // Silently block the kill
                    return { success: true, note: 'kill blocked' };
                }

                // Perform kill
                target.isAlive = false;

                // Vedda Hunter death shot trigger (Hunter must be killed by DEMON)
                if (target.role === 'Vedda Hunter') {
                    return { success: true, special: 'VEDDA_HUNTER_SHOT', killed: target.id };
                }

                return { success: true, killed: target.id };

            default:
                return { error: 'Invalid action' };
        }
    }
}
