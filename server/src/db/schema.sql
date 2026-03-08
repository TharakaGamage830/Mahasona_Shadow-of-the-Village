-- Run this in the Supabase SQL editor for Yaksha Gama database

-- Create custom enum types
CREATE TYPE game_phase AS ENUM ('lobby', 'day', 'night');
CREATE TYPE room_status AS ENUM ('waiting', 'playing', 'finished');

-- Rooms table
CREATE TABLE IF NOT EXISTS rooms (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_code VARCHAR(6) UNIQUE NOT NULL,
  host_session_id VARCHAR NOT NULL,
  status room_status DEFAULT 'waiting'::room_status,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Players table
CREATE TABLE IF NOT EXISTS players (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  name VARCHAR(50) NOT NULL,
  role VARCHAR,
  is_alive BOOLEAN DEFAULT true,
  seat_position INTEGER,
  socket_id VARCHAR
);

-- Game State table
CREATE TABLE IF NOT EXISTS game_state (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id UUID REFERENCES rooms(id) ON DELETE CASCADE,
  phase game_phase DEFAULT 'lobby'::game_phase,
  day_number INTEGER DEFAULT 0,
  protected_player_id UUID NULL REFERENCES players(id) ON DELETE SET NULL,
  poisoned_player_id UUID NULL REFERENCES players(id) ON DELETE SET NULL,
  history_log JSONB DEFAULT '[]'::jsonb
);

-- Enable Realtime for rooms to detect changes from Server if needed
alter publication supabase_realtime add table rooms;
