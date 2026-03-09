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
import { SettingsModal } from './components/ui/SettingsModal';

function GameRouter() {
  const { gameState, myPlayer, isStoryteller, isAwake, investigationResult, winner } = useGameState();
  const [roleAcknowledged, setRoleAcknowledged] = useState(false);

  // Initialize Global Audio moves to App()

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

      const roleDescriptions: Record<string, string> = {
        'Mahasona': "The possessed villager. Your goal is to kill until Evil outnumbers Good. You are the source of the curse.",
        'Riri Yaka': "The Poisoner. Each night, choose a player to poison. Their powers will fail or reverse.",
        'Kalu Kumaraya': "The Seat Swapper. Each night, swap the physical seats of two players. Confuse their investigations.",
        'Kattandiya': "The Investigator. Each night, see if a player is 'RED SKULL' (Evil) or 'WHITE LAMP' (Good). Be careful if poisoned!",
        'Pirith Monk': "The Healer. Each night, choose a player to protect from the Mahasona. You cannot protect yourself.",
        'Vedda Hunter': "The Warrior. If the Mahasona kills you at night, you get one final revenge shot to take down a player.",
        'Gama Ralahamy': "The Village Head. You have the authority to speak first during the day's discussion.",
        'Townsfolk': "A simple villager. You have no powers but your vote and your voice. Find the demon!"
      };

      return wrapPage(
        <div className="flex flex-col items-center justify-center py-10 w-full">
          <RoleCard
            role={myPlayer.role}
            alignment={alignment as 'Good' | 'Evil'}
            description={roleDescriptions[myPlayer.role] || "A mysterious figure in the village."}
            isFlipped={false}
          />
          <HorrorButton className="mt-8" onClick={() => setRoleAcknowledged(true)}>
            Accept My Fate
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

  // Initialize Global Audio for the entire site (Login + Game)
  const { isMuted, toggleMute, volume, updateVolume } = useGameAudio();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [brightness, setBrightness] = useState(() => {
    const saved = localStorage.getItem('yaksha_brightness');
    return saved ? parseFloat(saved) : 1;
  });

  const updateBrightness = (val: number) => {
    setBrightness(val);
    localStorage.setItem('yaksha_brightness', String(val));
  };

  useEffect(() => {
    // Prevent global right-click to protect assets
    const preventContext = (e: MouseEvent) => e.preventDefault();
    window.addEventListener('contextmenu', preventContext);

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

      return () => {
        subscription.unsubscribe();
        window.removeEventListener('contextmenu', preventContext);
      };
    } else {
      setLoadingSession(false);
      return () => window.removeEventListener('contextmenu', preventContext);
    }
  }, []);

  const handleLogout = async () => {
    if (supabase) {
      await supabase.auth.signOut();
    }
  };

  const branding = (
    <>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 2, ease: "easeOut" }}
        className="w-full max-w-2xl mb-4 mt-2"
      >
        <img
          src="/assets/images/Mahasona-BoxArt.png"
          alt="Mahasona Ritual"
          className="w-full h-auto object-contain drop-shadow-[0_0_20px_rgba(139,0,0,0.4)]"
        />
      </motion.div>

      <motion.h1
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
        className="text-4xl md:text-5xl mb-6 mt-4 md:mt-8 flex flex-col gap-6 text-center items-center justify-center w-full"
      >
        <span className="font-mahasona text-4xl md:text-5xl mahasona-glow tracking-wide drop-shadow-[0_4px_15px_rgba(255,0,0,0.6)]">MAHASONA</span>
        <span className="font-shadows text-2xl md:text-4xl tracking-[0.5em] text-horror-accent pt-2 mt-2 border-t border-horror-accent/30 uppercase">Shadows of the Village</span>
      </motion.h1>
    </>
  );

  return (
    <div className="flex flex-col items-center min-h-screen p-4 overflow-x-hidden w-full">
      {!session && branding}

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1, duration: 0.8, ease: 'easeOut' }}
        className="mb-4 md:mb-6 flex gap-4 mt-4"
      >
        <HorrorButton
          variant="ghost"
          onClick={() => setShowInstructions(true)}
          className="text-xs tracking-[0.25em] text-horror-accent/70 hover:text-horror-accent border-horror-accent/20 hover:border-horror-accent/50"
        >
          📜 How to Play
        </HorrorButton>

        <HorrorButton
          variant="ghost"
          onClick={toggleMute}
          className="text-xs tracking-[0.25em] text-horror-accent/70 hover:text-horror-accent border-horror-accent/20 hover:border-horror-accent/50"
        >
          {isMuted ? '🔇 Unmute' : '🔊 Mute'}
        </HorrorButton>

        {session && (
          <>
            <HorrorButton
              variant="ghost"
              onClick={() => setIsSettingsOpen(true)}
              className="text-xs tracking-[0.25em] text-horror-accent/70 hover:text-horror-accent border-horror-accent/20 hover:border-horror-accent/50"
            >
              ⚙️ Settings
            </HorrorButton>

            <HorrorButton
              variant="ghost"
              onClick={handleLogout}
              className="text-xs tracking-[0.25em] text-red-500/70 hover:text-red-500 border-horror-accent/20 hover:border-horror-accent/50"
            >
              Logout
            </HorrorButton>
          </>
        )}
      </motion.div>

      <InstructionsModal isOpen={showInstructions} onClose={() => setShowInstructions(false)} />

      {loadingSession ? (
        <div className="text-white mt-10 tracking-widest uppercase animate-pulse">Contacting Spirits...</div>
      ) : session ? (
        <>
          <AnimatePresence mode="wait">
            <div style={{ filter: `brightness(${brightness})`, width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <GameRouter />
            </div>
          </AnimatePresence>
          <div className="mt-20 w-full flex flex-col items-center opacity-60 hover:opacity-100 transition-opacity duration-700">
            {branding}
          </div>
        </>
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

      <footer className="mt-auto pt-10 pb-4 w-full flex flex-col items-center opacity-30 hover:opacity-100 transition-opacity duration-700">
        <img
          src="/assets/HeaderIcon.png"
          alt="Creator Logo"
          className="w-12 h-12 object-contain mb-3 drop-shadow-[0_0_10px_rgba(139,0,0,0.5)]"
        />
        <div className="h-px w-24 bg-gradient-to-r from-transparent via-horror-accent/40 to-transparent mb-2"></div>
        <p className="font-body text-[10px] tracking-[0.4em] uppercase text-horror-accent">
          Created By tharaka gamage
        </p>
      </footer>

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        volume={volume}
        onVolumeChange={updateVolume}
        brightness={brightness}
        onBrightnessChange={updateBrightness}
        currentName={session?.user?.user_metadata?.player_name || 'Soul'}
      />
    </div>
  )
}

export default App;
