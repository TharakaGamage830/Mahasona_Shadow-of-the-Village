import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
// @ts-ignore
import { createClient } from '@supabase/supabase-js';

dotenv.config();

const app = express();
app.use(cors({
    origin: process.env.CORS_ORIGIN || '*'
}));
app.use(express.json());

const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: process.env.CORS_ORIGIN || '*',
        methods: ['GET', 'POST']
    },
    transports: ['websocket'],
    allowEIO3: true
});

const PORT = process.env.PORT || 3001;

// Setup single Supabase client instance
const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';
// In tests or missing envs we don't strictly crash, but log warings
const supabase = (supabaseUrl && supabaseKey) ? createClient(supabaseUrl, supabaseKey) : null;
if (!supabase) {
    console.warn("Supabase credentials not found in .env, persistent state will not work");
}

app.get('/api/health', async (req, res) => {
    let dbStatus = 'Disconnected';
    if (supabase) {
        try {
            // Check if we can reach supabase
            const { data, error } = await supabase.from('players').select('count', { count: 'exact', head: true });
            dbStatus = error ? `Error: ${error.message}` : 'Connected';
        } catch (e) {
            dbStatus = 'Connection Failed';
        }
    }

    res.status(200).json({
        status: 'ok',
        message: 'Yaksha Gama Server is running',
        database: dbStatus,
        supabase_initialized: !!supabase
    });
});

// A basic route to create a room via REST
app.post('/api/rooms', async (req, res) => {
    const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
    // Here we would create room in supabase
    res.status(201).json({ roomCode });
});

import { GameRoom } from './game/GameRoom';
import { NightPhaseManager } from './game/NightPhase';

// Basic in-memory store for Phase 1/2
const rooms: Record<string, GameRoom> = {};
const nightManagers: Record<string, NightPhaseManager> = {};

io.on('connection', (socket) => {
    console.log('Player connected:', socket.id);

    socket.on('create_room', (data, callback) => {
        const roomCode = Math.random().toString(36).substring(2, 8).toUpperCase();
        const room = new GameRoom(roomCode, socket.id, data.userId);
        rooms[roomCode] = room;
        room.addPlayer(socket.id, data.playerName || 'Storyteller', data.userId, data.iconId || 0);
        socket.join(roomCode);

        // Emitting the initial state to the host so the UI can render
        io.to(roomCode).emit('room_state_update', { gameState: rooms[roomCode].state });

        if (callback) callback({ roomCode });
    });

    socket.on('join_room', (data, callback) => {
        const room = rooms[data.roomCode];
        if (room) {
            if (room.state.phase !== 'lobby') {
                if (callback) callback({ error: 'Game already started' });
                return;
            }

            const success = room.addPlayer(socket.id, data.playerName, data.userId, data.iconId || 0);
            if (success) {
                socket.join(data.roomCode);
                io.to(data.roomCode).emit('room_state_update', { gameState: room.state });
                if (callback) callback({ success: true, gameState: room.state });
            } else {
                if (callback) callback({ error: 'Name heavily conflicts or Already Joined' });
            }
        } else {
            if (callback) callback({ error: 'Room not found' });
        }
    });

    socket.on('leave_room', (data) => {
        const room = rooms[data.roomCode];
        if (room) {
            room.removePlayer(data.userId);
            socket.leave(data.roomCode);
            io.to(data.roomCode).emit('room_state_update', { gameState: room.state });
        }
    });

    socket.on('start_game', (data) => {
        const room = rooms[data.roomCode];
        if (room && room.state.hostSessionId === socket.id && room.state.players.length >= 5) {
            room.distributeRoles();

            nightManagers[data.roomCode] = new NightPhaseManager(room);
            const nightInfo = nightManagers[data.roomCode].startNight();

            // Inform clients
            io.to(data.roomCode).emit('game_started');
            io.to(data.roomCode).emit('room_state_update', { gameState: room.state });

            // Privately send roles to each player socket
            room.state.players.forEach(p => {
                io.to(p.socketId).emit('role_assigned', { role: p.role });
            });

            // Tell Storyteller first step
            io.to(room.state.hostSessionId).emit('action_requested', nightInfo);
        }
    });

    socket.on('disconnect', () => {
        console.log('Socket disconnected:', socket.id);
        for (const roomCode in rooms) {
            const room = rooms[roomCode];
            let changed = false;

            // Notice we do NOT delete the host, we just let them reconnect later.

            const player = room.state.players.find(p => p.socketId === socket.id);
            if (player) {
                room.removePlayer(player.userId);
                changed = true;
            }

            if (changed) {
                io.to(roomCode).emit('room_state_update', { gameState: room.state });
            }
        }
    });

    socket.on('rejoin_room', (data, callback) => {
        const room = rooms[data.roomCode];
        if (room) {
            if (room.state.hostUserId === data.userId) {
                room.state.hostSessionId = socket.id;
                socket.join(data.roomCode);
                io.to(data.roomCode).emit('room_state_update', { gameState: room.state });
                if (callback) callback({ success: true, gameState: room.state });
                return;
            }

            const player = room.state.players.find(p => p.userId === data.userId);
            if (player) {
                player.socketId = socket.id;
                player.isOnline = true;
                socket.join(data.roomCode);
                io.to(data.roomCode).emit('room_state_update', { gameState: room.state });
                if (callback) callback({ success: true, gameState: room.state });

                // Resend role privately if game has started
                if (room.state.phase !== 'lobby') {
                    io.to(player.socketId).emit('role_assigned', { role: player.role });
                }
            } else {
                if (callback) callback({ error: 'Player not found in room' });
            }
        } else {
            if (callback) callback({ error: 'Room not found' });
        }
    });

    // --- PHASE 3: DAY PHASE & VOTING ---

    socket.on('start_day_phase', (data) => {
        const room = Object.values(rooms).find(r => r.state.roomId === data.roomId);
        if (room && room.state.hostSessionId === socket.id) {
            room.state.phase = 'day';
            room.state.dayNumber += 1;
            room.state.nomineeId = null;
            room.state.votes = {};
            io.to(room.state.roomCode).emit('room_state_update', { gameState: room.state });
            io.to(room.state.roomCode).emit('phase_transition', { phase: 'day', dayNumber: room.state.dayNumber });
        }
    });

    socket.on('chat_message', (data) => {
        const room = Object.values(rooms).find(r => r.state.roomId === data.roomId);
        if (room) {
            io.to(room.state.roomCode).emit('chat_broadcast', {
                senderId: data.senderId,
                senderName: data.senderName,
                message: data.message,
                timestamp: new Date().toISOString()
            });
        }
    });

    socket.on('nominate_player', (data) => {
        const room = Object.values(rooms).find(r => r.state.roomId === data.roomId);
        if (room) {
            room.state.nomineeId = data.targetId;
            room.state.votes = {}; // reset votes
            io.to(room.state.roomCode).emit('room_state_update', { gameState: room.state });
            io.to(room.state.roomCode).emit('nomination_started', { nomineeId: data.targetId, nominatorId: data.nominatorId });
        }
    });

    socket.on('submit_vote', (data) => {
        const room = Object.values(rooms).find(r => r.state.roomId === data.roomId);
        if (room && room.state.nomineeId) {
            room.state.votes[data.voterId] = data.voteValue;
            io.to(room.state.roomCode).emit('vote_update', { votes: room.state.votes });
            io.to(room.state.roomCode).emit('room_state_update', { gameState: room.state });
        }
    });

    socket.on('execute_player', (data) => {
        const room = Object.values(rooms).find(r => r.state.roomId === data.roomId);
        if (room && room.state.hostSessionId === socket.id) {
            const target = room.state.players.find(p => p.id === data.targetId);
            if (target) {
                target.isAlive = false;
                room.state.nomineeId = null;
                room.state.votes = {};
                io.to(room.state.roomCode).emit('room_state_update', { gameState: room.state });

                // Triggers Win Check from Storyteller panel eventually
            }
        }
    });

    socket.on('check_win_condition', (data) => {
        const room = Object.values(rooms).find(r => r.state.roomId === data.roomId);
        if (room && room.state.hostSessionId === socket.id) {
            const WinChecker = require('./game/WinChecker').WinChecker;
            const winResult = WinChecker.checkWinCondition(room);
            if (winResult.winner) {
                room.state.phase = 'finished';
                io.to(room.state.roomCode).emit('room_state_update', { gameState: room.state });
                io.to(room.state.roomCode).emit('game_over', winResult);
            }
        }
    });

    // --- NIGHT PHASE ACTIONS ---

    socket.on('storyteller_action', (data) => {
        const room = Object.values(rooms).find(r => r.state.hostSessionId === socket.id);
        if (!room) return;

        if (data.type === 'WAKE') {
            const player = room.state.players.find(p => p.id === data.targetId);
            if (player) {
                io.to(player.socketId).emit('wake_player');
            }
        } else if (data.type === 'SLEEP') {
            const player = room.state.players.find(p => p.id === data.targetId);
            if (player) {
                io.to(player.socketId).emit('sleep_player');
            } else if (!data.targetId) {
                // Sleep ALL if no target specified
                io.to(room.state.roomCode).emit('sleep_player');
            }
        } else if (data.type === 'FORCE_KILL') {
            const target = room.state.players.find(p => p.id === data.targetId);
            if (target) {
                target.isAlive = false;
                io.to(room.state.roomCode).emit('room_state_update', { gameState: room.state });
            }
        }
    });

    socket.on('next_night_step', (data) => {
        const room = Object.values(rooms).find(r => r.state.roomId === data.roomId);
        if (room && room.state.hostSessionId === socket.id) {
            const manager = nightManagers[room.state.roomCode];
            if (manager) {
                manager.nextStep();
                io.to(room.state.roomCode).emit('room_state_update', { gameState: room.state });
                socket.emit('action_requested', manager.getStepInfo());
            }
        }
    });

    socket.on('night_action', (data) => {
        const room = Object.values(rooms).find(r => r.state.roomId === data.roomId);
        if (!room) return;

        const manager = nightManagers[room.state.roomCode];
        if (manager) {
            const result = manager.handleAction(data.role, data.targetId, data.secondaryTargetId);
            socket.emit('action_result', result);
            io.to(room.state.roomCode).emit('room_state_update', { gameState: room.state });
        }
    });
});

server.listen(PORT, () => {
    console.log(`Server listening on port ${PORT}`);
});
