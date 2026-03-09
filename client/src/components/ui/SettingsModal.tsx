import React, { useState } from 'react';
import { HorrorButton } from './HorrorButton';
import { supabase } from '../../lib/supabaseClient';

interface SettingsModalProps {
    isOpen: boolean;
    onClose: () => void;
    volume: number;
    onVolumeChange: (val: number) => void;
    brightness: number;
    onBrightnessChange: (val: number) => void;
    currentName: string;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
    isOpen,
    onClose,
    volume,
    onVolumeChange,
    brightness,
    onBrightnessChange,
    currentName
}) => {
    const [newName, setNewName] = useState(currentName);
    const [newPassword, setNewPassword] = useState('');
    const [status, setStatus] = useState<{ type: 'success' | 'error', msg: string } | null>(null);

    if (!isOpen) return null;

    const handleUpdateName = async () => {
        if (!supabase) return;
        const { error } = await supabase.auth.updateUser({
            data: { player_name: newName }
        });
        if (error) setStatus({ type: 'error', msg: error.message });
        else setStatus({ type: 'success', msg: 'Name updated! Refresh to see changes.' });
    };

    const handleUpdatePassword = async () => {
        if (!supabase) return;
        if (newPassword.length < 6) {
            setStatus({ type: 'error', msg: 'Password must be at least 6 characters' });
            return;
        }
        const { error } = await supabase.auth.updateUser({ password: newPassword });
        if (error) setStatus({ type: 'error', msg: error.message });
        else setStatus({ type: 'success', msg: 'Password updated successfully!' });
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <div className="w-full max-w-md bg-stone-900 border-2 border-horror-border p-8 shadow-[0_0_50px_rgba(0,0,0,1)] relative overflow-hidden font-body">
                {/* Background Texture */}
                <div className="absolute inset-0 opacity-10 pointer-events-none bg-[url('https://www.transparenttextures.com/patterns/dark-leather.png')]"></div>

                <div className="relative z-10">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="font-heading text-2xl text-horror-primary glow-red uppercase tracking-widest">Village Settings</h2>
                        <button onClick={onClose} className="text-gray-500 hover:text-white transition-colors text-2xl">&times;</button>
                    </div>

                    {status && (
                        <div className={`p-3 mb-4 text-xs uppercase tracking-widest border ${status.type === 'success' ? 'border-green-800 bg-green-900/20 text-green-400' : 'border-red-800 bg-red-900/20 text-red-400'}`}>
                            {status.msg}
                        </div>
                    )}

                    <div className="space-y-6">
                        {/* Audio Volume */}
                        <div>
                            <label className="block text-xs uppercase tracking-widest text-horror-accent mb-2">Soul Resonance (Volume)</label>
                            <input
                                type="range"
                                min="0" max="1" step="0.01"
                                value={volume}
                                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                                className="w-full h-1 bg-stone-800 appearance-none cursor-pointer accent-horror-primary"
                            />
                        </div>

                        {/* Brightness (Gamma) */}
                        <div>
                            <label className="block text-xs uppercase tracking-widest text-horror-accent mb-2">Ritual Sight (Brightness)</label>
                            <input
                                type="range"
                                min="0.5" max="1.5" step="0.01"
                                value={brightness}
                                onChange={(e) => onBrightnessChange(parseFloat(e.target.value))}
                                className="w-full h-1 bg-stone-800 appearance-none cursor-pointer accent-horror-primary"
                            />
                        </div>

                        <hr className="border-stone-800" />

                        {/* Account Management */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">Rename Soul</label>
                                <div className="flex gap-2">
                                    <input
                                        type="text"
                                        value={newName}
                                        onChange={(e) => setNewName(e.target.value)}
                                        className="flex-1 bg-black border border-horror-border/30 p-2 text-sm text-white focus:border-horror-primary outline-none"
                                    />
                                    <button onClick={handleUpdateName} className="bg-stone-800 px-4 text-[10px] uppercase hover:bg-stone-700 transition-colors">Update</button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] uppercase tracking-widest text-gray-500 mb-1">New Seal (Password)</label>
                                <div className="flex gap-2">
                                    <input
                                        type="password"
                                        placeholder="Min 6 chars"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="flex-1 bg-black border border-horror-border/30 p-2 text-sm text-white focus:border-horror-primary outline-none"
                                    />
                                    <button onClick={handleUpdatePassword} className="bg-stone-800 px-4 text-[10px] uppercase hover:bg-stone-700 transition-colors">Update</button>
                                </div>
                            </div>
                        </div>
                    </div>

                    <HorrorButton onClick={onClose} className="w-full mt-8" variant="secondary">Return to Village</HorrorButton>
                </div>
            </div>
        </div>
    );
};
