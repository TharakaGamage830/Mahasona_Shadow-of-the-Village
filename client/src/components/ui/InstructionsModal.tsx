import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HorrorButton } from './HorrorButton';

interface InstructionsModalProps {
    isOpen: boolean;
    onClose: () => void;
}

const roles = [
    {
        name: 'Townsfolk',
        side: 'Village',
        color: 'text-green-400',
        border: 'border-green-900/50',
        icon: '🏡',
        desc: 'A humble villager with no special power. Vote wisely during the Gam Maduwa to eliminate the demons hiding among you.',
    },
    {
        name: 'Vedamahattaya',
        side: 'Village',
        color: 'text-blue-300',
        border: 'border-blue-900/50',
        icon: '🔮',
        desc: 'The Seer. Each night you may peek at one player\'s true nature — good or evil.',
    },
    {
        name: 'Katawaliya',
        side: 'Village',
        color: 'text-yellow-300',
        border: 'border-yellow-900/50',
        icon: '🛡️',
        desc: 'The Protector. Each night you may shield one player from being killed by the demons.',
    },
    {
        name: 'Mahasona',
        side: 'Demon',
        color: 'text-red-400',
        border: 'border-red-900/60',
        icon: '💀',
        desc: 'A fearsome demon. Each night, pick a victim to devour. Works with the other evil players to outnumber the village.',
    },
    {
        name: 'Riri Yaka',
        side: 'Demon',
        color: 'text-red-400',
        border: 'border-red-900/60',
        icon: '🩸',
        desc: 'A blood demon who knows the identities of all other demons. Deceive the village during the day.',
    },
    {
        name: 'Kalu Kumaraya',
        side: 'Demon',
        color: 'text-purple-400',
        border: 'border-purple-900/60',
        icon: '🌑',
        desc: 'The Shadow Prince. A demon who can confuse a player\'s role investigation, making evil look innocent.',
    },
];

const steps = [
    { icon: '🌙', title: 'Night Falls', desc: 'All players close their eyes. The Storyteller wakes demons, special roles and the seer one by one to perform their secret actions.' },
    { icon: '☀️', title: 'Dawn Breaks', desc: 'Everyone opens their eyes. The Storyteller announces who, if anyone, was slain in the night.' },
    { icon: '🗣️', title: 'Gam Maduwa', desc: 'The village debates openly in the chat. Accuse, argue, and try to expose the demons before they expose you.' },
    { icon: '🗳️', title: 'The Vote', desc: 'Players nominate and vote on who to execute. The player with the most votes is eliminated and their role is revealed.' },
    { icon: '🔁', title: 'Repeat', desc: 'Night and day continue until one side wins.' },
];

export const InstructionsModal: React.FC<InstructionsModalProps> = ({ isOpen, onClose }) => {
    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    key="instructions-overlay"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4"
                    style={{ background: 'rgba(0,0,0,0.92)' }}
                    onClick={onClose}
                >
                    <motion.div
                        key="instructions-panel"
                        initial={{ opacity: 0, scale: 0.92, y: 30 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.92, y: 30 }}
                        transition={{ duration: 0.4, ease: 'easeOut' }}
                        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-black/95 border border-horror-primary/40 shadow-[0_0_40px_rgba(139,0,0,0.3)] rounded-sm"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Corner Accents */}
                        <div className="absolute top-0 left-0 w-3 h-3 border-t-2 border-l-2 border-horror-accent/60" />
                        <div className="absolute top-0 right-0 w-3 h-3 border-t-2 border-r-2 border-horror-accent/60" />
                        <div className="absolute bottom-0 left-0 w-3 h-3 border-b-2 border-l-2 border-horror-accent/60" />
                        <div className="absolute bottom-0 right-0 w-3 h-3 border-b-2 border-r-2 border-horror-accent/60" />

                        <div className="p-6 md:p-8">
                            {/* Header */}
                            <h2 className="font-heading text-horror-accent glow-gold text-2xl md:text-3xl tracking-widest uppercase text-center mb-1">
                                How to Play
                            </h2>
                            <p className="text-center text-gray-500 font-body text-sm mb-6 tracking-wider">
                                Yaksha Village — The Ancient Ritual
                            </p>

                            {/* Objective */}
                            <div className="bg-horror-primary/10 border border-horror-primary/30 rounded-sm p-4 mb-6 text-center">
                                <p className="font-body text-horror-text text-sm leading-relaxed">
                                    <span className="text-green-400 font-bold">Villagers</span> must identify and eliminate all demons before the demons{' '}
                                    <span className="text-red-400 font-bold">outnumber</span> the living good players.
                                    Demons win if they equal or outnumber the remaining village.
                                </p>
                            </div>

                            {/* Game Flow */}
                            <h3 className="font-heading text-horror-accent uppercase tracking-widest text-sm mb-3 border-b border-horror-border pb-2">
                                ⚔ The Ritual Cycle
                            </h3>
                            <div className="space-y-3 mb-6">
                                {steps.map((step, i) => (
                                    <div key={i} className="flex gap-3 items-start">
                                        <span className="text-xl flex-shrink-0 mt-0.5">{step.icon}</span>
                                        <div>
                                            <span className="font-heading text-horror-accent text-xs uppercase tracking-wider">{step.title} — </span>
                                            <span className="font-body text-gray-400 text-sm">{step.desc}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Roles */}
                            <h3 className="font-heading text-horror-accent uppercase tracking-widest text-sm mb-3 border-b border-horror-border pb-2">
                                🎭 Roles
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                                {roles.map((role) => (
                                    <div
                                        key={role.name}
                                        className={`bg-black/60 border ${role.border} rounded-sm p-3 flex gap-3 items-start`}
                                    >
                                        <span className="text-2xl flex-shrink-0">{role.icon}</span>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className={`font-heading uppercase tracking-wider text-xs ${role.color}`}>{role.name}</span>
                                                <span className={`text-[10px] font-body px-1.5 py-0.5 rounded ${role.side === 'Village' ? 'bg-green-900/40 text-green-400' : 'bg-red-900/40 text-red-400'}`}>
                                                    {role.side}
                                                </span>
                                            </div>
                                            <p className="font-body text-gray-400 text-xs leading-relaxed">{role.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Tips */}
                            <h3 className="font-heading text-horror-accent uppercase tracking-widest text-sm mb-3 border-b border-horror-border pb-2">
                                💡 Tips
                            </h3>
                            <ul className="space-y-2 mb-8">
                                {[
                                    'Demons know each other — pay attention to who defends whom.',
                                    'The Vedamahattaya should share clues carefully — revealing too early makes them a target.',
                                    'Demons should blend in and create false accusations during the day.',
                                    'The Katawaliya cannot protect themselves two nights in a row.',
                                    'A tied vote results in no execution — demons love ties!',
                                ].map((tip, i) => (
                                    <li key={i} className="flex gap-2 text-sm font-body text-gray-400">
                                        <span className="text-horror-accent flex-shrink-0">›</span>
                                        {tip}
                                    </li>
                                ))}
                            </ul>

                            <HorrorButton fullWidth variant="secondary" onClick={onClose}>
                                Close Scroll
                            </HorrorButton>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
};
