import { GameRoom } from './GameRoom';
import { Player, NightStepIdx, RoleType } from '../../../shared/types';
import { NIGHT_ORDER } from './rules';

export class NightPhaseManager {
    private room: GameRoom;

    constructor(room: GameRoom) {
        this.room = room;
    }

    startNight() {
        this.room.state.phase = 'night';
        this.room.state.nightStep = 0; // Yaka acts
        this.room.state.protectedPlayerId = null;
        this.room.state.poisonedPlayerId = null;
        this.room.state.swappedSeats = null;
        this.room.state.hunterRevengeTargetId = null;
        return this.getStepInfo();
    }

    nextStep(): boolean {
        // Step 4 is Hunter Revenge, only active if pending.
        const maxSteps = this.room.state.hunterRevengeTargetId === 'PENDING' ? 5 : 4;
        if (this.room.state.nightStep < maxSteps - 1) {
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

    private getActiveRolesForStep(step: number): RoleType[] {
        switch (step) {
            case 0: return [this.room.state.selectedYaka || 'Riri Yaka'];
            case 1: return ['Kattandiya'];
            case 2: return ['Pirith Monk'];
            case 3: return ['Mahasona'];
            case 4: return ['Vedda Hunter']; // Only if hunterRevengeTargetId is 'PENDING'
            default: return [];
        }
    }

    handleAction(role: RoleType, targetId: string, secondaryTargetId?: string): any {
        const target = this.room.state.players.find((p: Player) => p.id === targetId);
        if (!target && role !== 'Vedda Hunter') return { error: 'Target not found' };

        switch (role) {
            case 'Kalu Kumaraya':
                if (!secondaryTargetId) return { error: 'Need 2 targets to swap' };
                const target2 = this.room.state.players.find((p: Player) => p.id === secondaryTargetId);
                if (!target2) return { error: 'Secondary target not found' };

                // Swap physical seats
                const s1 = target!.seatPosition;
                const s2 = target2.seatPosition;
                target!.seatPosition = s2;
                target2.seatPosition = s1;

                this.room.state.swappedSeats = {
                    ...(this.room.state.swappedSeats || {}),
                    [s1]: s2,
                    [s2]: s1
                };
                return { success: true };

            case 'Riri Yaka':
                this.room.state.poisonedPlayerId = target!.id;
                return { success: true };

            case 'Kattandiya':
                const investigator = this.room.state.players.find(p => p.role === 'Kattandiya');
                const isPoisoned = investigator?.id === this.room.state.poisonedPlayerId;

                const targetIsEvil = ['Mahasona', 'Riri Yaka', 'Kalu Kumaraya'].includes(target!.role || '');
                const showsEvil = isPoisoned ? !targetIsEvil : targetIsEvil;
                return { success: true, result: showsEvil ? 'RED SKULL' : 'WHITE LAMP' };

            case 'Pirith Monk':
                const monk = this.room.state.players.find(p => p.role === 'Pirith Monk');
                if (monk?.id === this.room.state.poisonedPlayerId) {
                    return { success: true, note: 'poisoned' }; // Fail silently or with note
                }
                if (monk?.id === target!.id) {
                    return { success: true, note: 'self-prot-blocked' };
                }
                this.room.state.protectedPlayerId = target!.id;
                return { success: true };

            case 'Mahasona':
                if (this.room.state.protectedPlayerId === target!.id) {
                    return { success: true, killed: null }; // Saved!
                }

                target!.isAlive = false;
                if (target!.role === 'Vedda Hunter') {
                    this.room.state.hunterRevengeTargetId = 'PENDING';
                    return { success: true, killed: target!.id, special: 'HUNTER_REVENGE' };
                }
                return { success: true, killed: target!.id };

            case 'Vedda Hunter':
                if (this.room.state.hunterRevengeTargetId === 'PENDING') {
                    const revengeTarget = this.room.state.players.find(p => p.id === targetId);
                    if (revengeTarget) {
                        revengeTarget.isAlive = false;
                        this.room.state.hunterRevengeTargetId = targetId;
                        return { success: true, killed: targetId };
                    }
                }
                return { error: 'No revenge pending' };

            default:
                return { error: 'Invalid action' };
        }
    }
}
