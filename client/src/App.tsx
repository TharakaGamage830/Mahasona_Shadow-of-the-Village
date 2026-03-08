import { useState, useEffect } from 'react';
import { supabase } from './lib/supabaseClient';
import { AuthScreens } from './components/auth/AuthScreens';
import type { Session } from '@supabase/supabase-js';
import { LobbyView } from './components/lobby/LobbyView';
import { useGameState, socket } from './hooks/useGameState';
import { useGameAudio } from './hooks/useGameAudio';
import { PlayerNightScreen } from './components/night/PlayerNightScreen';
import { KatawaliyaPanel } from './components/storyteller/KatawaliyaPanel';
import { RoleCard } from './components/ui/RoleCard';
import { HorrorButton } from './components/ui/HorrorButton';
import { TownSquare } from './components/day/TownSquare';
import { VotingUI } from './components/day/VotingUI';
import { motion, AnimatePresence } from 'framer-motion';
import { InstructionsModal } from './components/ui/InstructionsModal';

function GameRouter() {
  const { gameState, myPlayer, isStoryteller, isAwake, investigationResult, winner } = useGameState();
  const [roleAcknowledged, setRoleAcknowledged] = useState(false);

  // Initialize Global Audio
  useGameAudio();

  const pageVariants = {
    initial: { opacity: 0, scale: 0.95 },
    in: { opacity: 1, scale: 1 },
    out: { opacity: 0, scale: 1.05 }
  };

  const wrapPage = (content: React.ReactNode, key: string) => (
    <motion.div
      key={key}
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={{ type: "tween", ease: "anticipate", duration: 0.8 }}
      className="w-full flex-1 flex flex-col justify-center"
    >
      {content}
    </motion.div>
  );

  if (!gameState || gameState.phase === 'lobby') {
    return wrapPage(<LobbyView gameState={gameState} />, 'lobby');
  }

  // Storyteller View (Works across Day and Night)
  if (isStoryteller) {
    return wrapPage(
      <KatawaliyaPanel
        gameState={gameState}
        onWakeSleep={(playerId) => {
          socket.emit('storyteller_action', { type: playerId ? 'WAKE' : 'SLEEP', targetId: playerId });
        }}
        onOverrideKill={(playerId) => {
          socket.emit('storyteller_action', { type: 'FORCE_KILL', targetId: playerId });
        }}
      />, 'storyteller'
    );
  }

  if (gameState.phase === 'finished') {
    const isEvilWin = winner === 'Evil';
    return wrapPage(
      <div className="flex flex-col items-center justify-center space-y-6 text-center p-4 md:p-8 border-4 border-horror-border bg-black/90 w-full max-w-4xl mx-auto rounded-lg glow-red">
        <div className="w-full relative overflow-hidden rounded-md border-2 border-horror-border/50 shadow-2xl">
          <img
            src={`/assets/images/${winner}TeamWin-BoxArt.png`}
            alt={`${winner} Team Wins`}
            className="w-full h-auto object-contain max-h-[400px]"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent flex flex-col justify-end p-6">
            <h2 className={`text-4xl md:text-6xl font-heading ${isEvilWin ? 'text-red-600' : 'text-horror-accent'} tracking-tighter uppercase drop-shadow-[0_0_10px_rgba(0,0,0,1)]`}>
              {winner} Team Triumphs
            </h2>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-center gap-8 mt-4 bg-horror-bg/50 p-6 border border-horror-border/30 rounded-lg w-full">
          <div className="w-48 h-64 shrink-0 overflow-hidden border-2 border-horror-primary rounded-sm shadow- horror-glow">
            <img src="/assets/images/Mahasona-BoxArt.png" alt="Mahasona" className="w-full h-full object-cover" />
          </div>
          <div className="flex-1 text-left">
            <h3 className="text-2xl font-horror text-horror-primary mb-2">The Ritual Ends</h3>
            <p className="text-lg font-body text-gray-300 leading-relaxed">
              {isEvilWin
                ? "The village has been consumed by darkness. Mahasona's hunger remains unquenched."
                : "The curse is broken. The village survives another night of terror."}
            </p>
            <p className="mt-4 text-horror-accent/60 text-sm tracking-widest uppercase italic">
              Wait for the Vedamahattaya to disband the session...
            </p>
          </div>
        </div>
      </div>, 'finished'
    );
  }

  // Player View - Game in Progress
  if (myPlayer) {
    if (!roleAcknowledged && myPlayer.role) {
      // Show Role Reveal Screen first
      const alignment = ['Mahasona', 'Riri Yaka', 'Kalu Kumaraya'].includes(myPlayer.role) ? 'Evil' : 'Good';
      return wrapPage(
        <div className="flex flex-col items-center justify-center py-10 w-full">
          <RoleCard
            role={myPlayer.role}
            alignment={alignment as 'Good' | 'Evil'}
            description="Your secret role. Do not show this to anyone."
            isFlipped={false}
          />
          <HorrorButton className="mt-8" onClick={() => setRoleAcknowledged(true)}>
            I understand my role
          </HorrorButton>
        </div>, 'roleReveal'
      );
    }

    if (gameState.phase === 'night') {
      return wrapPage(
        <PlayerNightScreen
          gameState={gameState}
          myPlayer={myPlayer}
          isAwake={isAwake}
          investigationResult={investigationResult}
          onTargetSubmit={(t1, t2) => {
            socket.emit('night_action', {
              roomId: gameState.roomId,
              role: myPlayer.role,
              targetId: t1,
              secondaryTargetId: t2
            });
          }}
        />, 'night'
      );
    }

    // Day Phase View
    if (gameState.phase === 'day') {
      return wrapPage(
        <div className="w-full max-w-6xl mx-auto flex flex-col md:flex-row gap-6 py-4 md:py-8 h-full md:h-[700px]">
          <div className="w-full md:w-1/3 h-[400px] md:h-full">
            <TownSquare gameState={gameState} myPlayer={myPlayer} />
          </div>
          <div className="w-full md:w-2/3 h-auto md:h-full flex flex-col">
            <VotingUI gameState={gameState} myPlayer={myPlayer} />
          </div>
        </div>, 'day'
      );
    }
  }

  return <div className="text-white text-center">Loading...</div>;
}

function App() {
  const [showInstructions, setShowInstructions] = useState(false);
  const [session, setSession] = useState<Session | null>(null);
  const [loadingSession, setLoadingSession] = useState(true);

  useEffect(() => {
    if (supabase) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setLoadingSession(false);
      });

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((_event, session) => {
        setSession(session);
      });

      return () => subscription.unsubscribe();
    } else {
      setLoadingSession(false);
    }
  }, []);

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
  };

  return (
    <div className="flex flex-col items-center min-h-screen p-4 overflow-x-hidden w-full">
      <motion.h1
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="text-4xl md:text-6xl mb-2 mt-4 md:mt-8 flex flex-col md:flex-row gap-2 md:gap-4 text-center items-center justify-center w-full"
      >
        <span className="font-yaksha normal-case tracking-[0.2em] md:tracking-[0.3em] glow-red text-horror-primary">Yaksha</span>
        <span className="font-village blood-text-effect text-5xl md:text-7xl md:tracking-widest pt-0 md:pt-2">VILLAGE</span>
      </motion.h1>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8, ease: 'easeOut' }}
        className="mb-4 md:mb-6 flex gap-4"
      >
        <HorrorButton
          variant="ghost"
          onClick={() => setShowInstructions(true)}
          className="text-xs tracking-[0.25em] text-horror-accent/70 hover:text-horror-accent border-horror-accent/20 hover:border-horror-accent/50"
        >
          📜 How to Play
        </HorrorButton>

        {session && (
          <HorrorButton
            variant="ghost"
            onClick={handleLogout}
            className="text-xs tracking-[0.25em] text-red-500/70 hover:text-red-500 border-horror-accent/20 hover:border-horror-accent/50"
          >
            Logout
          </HorrorButton>
        )}
      </motion.div>

      <InstructionsModal isOpen={showInstructions} onClose={() => setShowInstructions(false)} />

      {loadingSession ? (
        <div className="text-white mt-10 tracking-widest uppercase animate-pulse">Contacting Spirits...</div>
      ) : session ? (
        <AnimatePresence mode="wait">
          <GameRouter />
        </AnimatePresence>
      ) : (
        <AnimatePresence mode="wait">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            transition={{ duration: 0.8 }}
            className="w-full"
          >
            <AuthScreens />
          </motion.div>
        </AnimatePresence>
      )}
    </div>
  )
}

export default App;
