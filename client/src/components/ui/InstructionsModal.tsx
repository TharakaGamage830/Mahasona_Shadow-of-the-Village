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
        desc: 'A humble villager. You have no powers but your vote and your voice. Find the demon before dawn!',
    },
    {
        name: 'Kattandiya',
        side: 'Village',
        color: 'text-blue-300',
        border: 'border-blue-900/50',
        icon: '🕯️',
        desc: 'The Investigator. Each night, see if a player is "RED SKULL" (Evil) or "WHITE LAMP" (Good).',
    },
    {
        name: 'Pirith Monk',
        side: 'Village',
        color: 'text-yellow-300',
        border: 'border-yellow-900/50',
        icon: '📿',
        desc: 'The Healer. Each night, protect one player from the Mahasona. You cannot protect yourself.',
    },
    {
        name: 'Vedda Hunter',
        side: 'Village',
        color: 'text-orange-400',
        border: 'border-orange-900/50',
        icon: '🏹',
        desc: 'The Warrior. If killed by the Mahasona at night, you get a final revenge shot to take down anyone.',
    },
    {
        name: 'Gama Ralahamy',
        side: 'Village',
        color: 'text-cyan-300',
        border: 'border-cyan-900/50',
        icon: '📜',
        desc: 'The Village Head. You have the authority to speak first during the day discussion.',
    },
    {
        name: 'Mahasona',
        side: 'Evil',
        color: 'text-red-500',
        border: 'border-red-900/70',
        icon: '🏮',
        desc: 'The Great Demon. Each night, pick a victim to kill. Win if Evil equals or outnumbers Good.',
    },
    {
        name: 'Riri Yaka',
        side: 'Evil',
        color: 'text-red-400',
        border: 'border-red-900/60',
        icon: '🩸',
        desc: 'The Poisoner. Each night, poison a player to make their power fail or reverse its result.',
    },
    {
        name: 'Kalu Kumaraya',
        side: 'Evil',
        color: 'text-purple-400',
        border: 'border-purple-900/60',
        icon: '🌑',
        desc: 'The Seat Swapper. Each night, swap the physical seats of two players to confuse investigations.',
    },
];

const steps = [
    { icon: '🌙', title: 'Thovil Night', desc: 'The Yaka acts first, then the Kattandiya and Monk. Finally, the Mahasona strikes in secret.' },
    { icon: '☀️', title: 'Daybreak', desc: 'The village wakes. The Storyteller reveals who was lost. The Hunter may take a final revenge.' },
    { icon: '🗣️', title: 'Gam Maduwa', desc: 'The Gama Ralahamy leads the discussion. Accuse suspects and search for the truth.' },
    { icon: '⚖️', title: 'The Burning', desc: 'A vote is held at the tribunal. If the Mahasona is identified and burned, the Village Wins.' },
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
                            <h2 className="font-mahasona text-horror-accent glow-gold text-3xl md:text-4xl tracking-widest uppercase text-center mb-1">
                                How to Play
                            </h2>
                            <p className="font-shadows text-[10px] md:text-xs text-center text-gray-500 mb-6 tracking-[0.3em] uppercase opacity-70">
                                MAHASONA — Shadows of the Village
                            </p>

                            {/* Objective */}
                            <div className="bg-horror-primary/10 border border-horror-primary/30 rounded-sm p-4 mb-6 text-center">
                                <p className="font-body text-horror-text text-sm leading-relaxed">
                                    <span className="text-green-400 font-bold uppercase tracking-tight">The Village</span> must identify and burn the Mahasona.
                                    <span className="text-red-400 font-bold uppercase tracking-tight ml-2">The Evil</span> wins if they outnumber the living.
                                </p>
                            </div>

                            {/* Game Flow */}
                            <h3 className="font-heading text-horror-accent uppercase tracking-widest text-sm mb-3 border-b border-horror-border pb-2">
                                🏮 The Ritual Cycle
                            </h3>
                            <div className="space-y-3 mb-6">
                                {steps.map((step, i) => (
                                    <div key={i} className="flex gap-3 items-start">
                                        <span className="text-xl flex-shrink-0 mt-0.5">{step.icon}</span>
                                        <div>
                                            <span className="font-heading text-horror-accent text-xs uppercase tracking-wider">{step.title} — </span>
                                            <span className="font-body text-gray-400 text-sm italic">{step.desc}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Roles */}
                            <h3 className="font-heading text-horror-accent uppercase tracking-widest text-sm mb-3 border-b border-horror-border pb-2">
                                🎭 The Cast
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
                                            <p className="font-body text-gray-400 text-[11px] leading-relaxed">{role.desc}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            {/* Tips */}
                            <h3 className="font-heading text-horror-accent uppercase tracking-widest text-sm mb-3 border-b border-horror-border pb-2">
                                📜 Ancient Wisdom
                            </h3>
                            <ul className="space-y-2 mb-8">
                                {[
                                    'The Evil Team knows each other — watch for patterns in their voting.',
                                    'The Vedamahattaya (Storyteller) holds the ritual together — trust their guidance.',
                                    'Evil souls should weave false stories to survive the Gam Maduwa.',
                                    'The Pirith Monk cannot protect the same soul two nights in a row.',
                                    'A tied vote at the tribunal results in no execution. Time is your enemy!',
                                ].map((tip, i) => (
                                    <li key={i} className="flex gap-2 text-xs font-body text-gray-400">
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
