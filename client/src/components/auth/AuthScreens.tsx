import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { DarkPanel } from '../ui/DarkPanel';
import { HorrorButton } from '../ui/HorrorButton';
import { PROFILE_ICONS } from '../../constants/icons';

export const AuthScreens: React.FC = () => {
    const [view, setView] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [playerName, setPlayerName] = useState('');
    const [selectedIconId, setSelectedIconId] = useState(0);
    const [loading, setLoading] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrorMsg('');

        if (!supabase) {
            setErrorMsg('Supabase is not configured. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to .env');
            return;
        }

        setLoading(true);

        try {
            if (view === 'register') {
                if (!playerName.trim()) {
                    throw new Error('Player Name is required for registration.');
                }
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        data: {
                            player_name: playerName.toUpperCase(),
                            icon_id: selectedIconId
                        }
                    }
                });
                if (error) throw error;
                // If email confirmation is off, sign up logs them in immediately setup
                setErrorMsg('Registration successful. If not auto-logged in, please check your email.');
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                });
                if (error) throw error;
            }
        } catch (error: any) {
            setErrorMsg(error.message || 'Authentication failed');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[80vh] w-full max-w-lg mx-auto p-4">
            <DarkPanel className="w-full text-center" title={view === 'login' ? "Return to the Village" : "Join the Ritual"}>
                <form onSubmit={handleAuth} className="space-y-6 flex flex-col items-center w-full">
                    {view === 'register' && (
                        <div className="w-full space-y-4">
                            <input
                                type="text"
                                placeholder="YOUR PLAYER NAME"
                                value={playerName}
                                onChange={(e) => setPlayerName(e.target.value)}
                                className="w-full bg-black/60 border border-horror-border px-4 py-3 text-center tracking-widest text-lg focus:outline-none focus:border-horror-primary mb-2 uppercase"
                                required
                            />

                            <div className="w-full">
                                <label className="block text-xs uppercase tracking-[0.3em] text-horror-accent mb-3 text-center">Select Your Totem</label>
                                <div className="flex gap-4 overflow-x-auto pb-4 px-2 custom-scrollbar mask-fade-edges">
                                    {PROFILE_ICONS.map(icon => (
                                        <button
                                            key={icon.id}
                                            type="button"
                                            onClick={() => setSelectedIconId(icon.id)}
                                            className={`min-w-[50px] h-[50px] flex items-center justify-center border-2 transition-all ${selectedIconId === icon.id ? 'border-horror-primary scale-110' : 'border-stone-800 opacity-40 hover:opacity-80'}`}
                                        >
                                            <svg viewBox="0 0 24 24" className="w-8 h-8" dangerouslySetInnerHTML={{ __html: icon.svg }} />
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="w-full">
                        <input
                            type="email"
                            placeholder="EMAIL ADDRESS"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full bg-black/60 border border-horror-border px-4 py-3 text-center tracking-widest text-lg focus:outline-none focus:border-horror-primary mb-2"
                            required
                        />
                    </div>
                    <div className="w-full">
                        <input
                            type="password"
                            placeholder="PASSWORD"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black/60 border border-horror-border px-4 py-3 text-center tracking-widest text-lg focus:outline-none focus:border-horror-primary mb-4"
                            required
                        />
                    </div>

                    {errorMsg && (
                        <div className="p-3 bg-red-900/40 border border-red-500 text-red-400 font-body text-sm w-full">
                            {errorMsg}
                        </div>
                    )}

                    <HorrorButton type="submit" fullWidth disabled={loading}>
                        {loading ? 'Consulting the Spirits...' : view === 'login' ? 'Enter' : 'Register Soul'}
                    </HorrorButton>

                    <button
                        type="button"
                        onClick={() => {
                            setView(view === 'login' ? 'register' : 'login');
                            setErrorMsg('');
                        }}
                        className="text-gray-500 font-body text-sm hover:text-white mt-4 border-b border-transparent hover:border-white transition-all pb-1 uppercase tracking-wider"
                    >
                        {view === 'login' ? "Don't have an account? Register" : "Already bound? Login"}
                    </button>
                </form>
            </DarkPanel>
        </div>
    );
};
