import React, { useState, useEffect, useRef } from 'react';
import type { GameState, Player } from '../../../../shared/types';
import { HorrorButton } from '../ui/HorrorButton';
import { socket } from '../../hooks/useGameState';
import { PROFILE_ICONS } from '../../constants/icons';

interface TownSquareProps {
    gameState: GameState;
    myPlayer: Player;
}

export const TownSquare: React.FC<TownSquareProps> = ({ gameState, myPlayer }) => {
    const [messages, setMessages] = useState<{ sender: string, text: string, time: string }[]>([]);
    const [inputMsg, setInputMsg] = useState('');
    const chatRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleChat = (data: any) => {
            setMessages(prev => [...prev, {
                sender: data.senderName,
                text: data.message,
                time: new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }]);
        };

        socket.on('chat_broadcast', handleChat);
        return () => { socket.off('chat_broadcast', handleChat); };
    }, []);

    useEffect(() => {
        if (chatRef.current) {
            chatRef.current.scrollTop = chatRef.current.scrollHeight;
        }
    }, [messages]);

    const sendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputMsg.trim()) return;

        socket.emit('chat_message', {
            roomId: gameState.roomId,
            senderId: myPlayer.id,
            senderName: myPlayer.name,
            message: inputMsg
        });
        setInputMsg('');
    };

    return (
        <div className="flex flex-col h-full border border-horror-border bg-black/60 relative">
            <div className="p-2 border-b border-horror-border bg-horror-border/30 flex justify-between items-center">
                <h3 className="font-heading text-horror-accent tracking-widest text-xs">Town Square Whispers</h3>
                {gameState.players.find(p => p.role === 'Gama Ralahamy' && p.isAlive) && (
                    <span className="text-[10px] bg-horror-primary/20 text-horror-primary px-2 py-0.5 border border-horror-primary/30 rounded-full animate-pulse">
                        Village Head Present
                    </span>
                )}
            </div>

            <div ref={chatRef} className="flex-1 overflow-y-auto p-4 space-y-3 font-body text-gray-300">
                {messages.map((msg, i) => {
                    const sender = gameState.players.find(p => p.name === msg.sender);
                    return (
                        <div key={i} className={`flex flex-col ${msg.sender === myPlayer.name ? 'items-end' : 'items-start'}`}>
                            <div className="flex items-center gap-1 mb-1">
                                {sender && (
                                    <div className="w-4 h-4 flex items-center justify-center border border-horror-border/30 bg-black/40 rounded-[2px] opacity-60">
                                        <svg
                                            viewBox="0 0 24 24"
                                            className="w-3 h-3 text-horror-primary"
                                            dangerouslySetInnerHTML={{ __html: PROFILE_ICONS[sender.iconId]?.svg || PROFILE_ICONS[0].svg }}
                                        />
                                    </div>
                                )}
                                <span className="text-[10px] text-gray-600">{msg.sender} • {msg.time}</span>
                            </div>
                            <div className={`px-3 py-2 rounded-sm max-w-[80%] ${msg.sender === myPlayer.name ? 'bg-horror-border text-white' : 'bg-[#1a0f0f] border border-horror-border/50'}`}>
                                {msg.text}
                            </div>
                        </div>
                    );
                })}
                {messages.length === 0 && (
                    <div className="text-center text-gray-600 italic mt-10">The village is deadly quiet... Speak!</div>
                )}
            </div>

            <form onSubmit={sendMessage} className="p-2 border-t border-horror-border flex gap-2">
                <input
                    type="text"
                    value={inputMsg}
                    onChange={e => setInputMsg(e.target.value)}
                    placeholder="Whisper to the village..."
                    disabled={!myPlayer.isAlive}
                    className="flex-1 bg-black border border-horror-border/50 px-3 py-2 text-sm focus:outline-none focus:border-horror-primary disabled:opacity-50"
                />
                <HorrorButton type="submit" disabled={!myPlayer.isAlive || !inputMsg.trim()} className="px-4 py-2">
                    Send
                </HorrorButton>
            </form>
        </div>
    );
};
