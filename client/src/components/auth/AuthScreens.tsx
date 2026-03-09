import React, { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { DarkPanel } from '../ui/DarkPanel';
import { HorrorButton } from '../ui/HorrorButton';
import { PROFILE_ICONS } from '../../constants/icons';

export const AuthScreens: React.FC = () => {
    const [view, setView] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [playerName, setPlayerName] = useState('');
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
                            player_name: playerName.toUpperCase()
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
                        <div className="w-full">
                            <input
                                type="text"
                                placeholder="YOUR PLAYER NAME"
                                value={playerName}
                                onChange={(e) => setPlayerName(e.target.value)}
                                className="w-full bg-black/60 border border-horror-border px-4 py-3 text-center tracking-widest text-lg focus:outline-none focus:border-horror-primary mb-2 uppercase"
                                required
                            />
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
                    <div className="w-full relative">
                        <input
                            type={showPassword ? "text" : "password"}
                            placeholder="DARK SEAL (PASSWORD)"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            className="w-full bg-black/60 border border-horror-border px-4 py-3 text-center tracking-widest text-lg focus:outline-none focus:border-horror-primary mb-2"
                            required
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-horror-accent/40 hover:text-horror-accent transition-colors p-2"
                        >
                            {showPassword ? (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path><path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path><path d="M6.61 6.61A13.52 13.52 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path><line x1="2" y1="2" x2="22" y2="22"></line></svg>
                            ) : (
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M1 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path><circle cx="12" cy="12" r="3"></circle></svg>
                            )}
                        </button>
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
