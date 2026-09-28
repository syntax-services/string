import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Lock, LogOut, Download, Copy, Check, 
  Volume2, VolumeX, Shield, Sparkles, CheckCircle2, 
  ExternalLink, Layers, ArrowUpRight, Flame, Tv, Music2, Film
} from "lucide-react";

// User Credentials
const USERS: Record<string, { pass: string; name: string; role: string; badge: string }> = {
  ceo: {
    pass: "ceo_Wqe9LHp9RMnNrWRN",
    name: "CEO Executive",
    role: "Lead Strategist",
    badge: "CEO SUITE (JONAS + FINDDMO)"
  },
  habeeb: {
    pass: "hab_gy#Xg9337gMKHsCk",
    name: "Habeeb Operations",
    role: "Senior Growth Clipper",
    badge: "HABEEB VAULT (ROD WAVE + HELLRAISER)"
  }
};

// Curated Hustle & Wealth Background Tracks (Trimmed to exact motivational verses)
const HUSTLE_TRACKS = [
  { id: "koko", src: "/audio/koko_slowed_hustle.mp3", title: "KOKO (Slowed & Reverb)" },
  { id: "wells_fargo", src: "/audio/wells_fargo_hustle.mp3", title: "Wells Fargo Hustle" },
  { id: "seyi_billion", src: "/audio/seyi_billion_hustle.mp3", title: "Billion Dollar Hustle" },
  { id: "seyi_chance", src: "/audio/seyi_chance_hustle.mp3", title: "Chance (Na Ham) Hustle" }
];

interface ClipItem {
  id: string;
  title: string;
  duration: string;
  quality: string;
  videoUrl: string;
  caption: string;
  soundName: string;
  payoutRate: string;
  loopNote: string;
}

// 1:1 UNIQUE CAMPAIGN ALLOCATION: 2 Dedicated Campaigns per User (Equal Reach & Zero Cannibalization)
// CEO: Jonas Brothers MSG Tour (Pop/Rock Arena) + Finddmo Twitch Streams (IRL/Gaming Comedy) -> 10 Clips
// HABEEB: Rod Wave Arena Tour (Hip-Hop/Soul Arena) + Hellraiser Horror Revival (Cult Movie Horror) -> 10 Clips
const CEO_CAMPAIGNS = [
  {
    campaignId: "jonas_ceo",
    campaignName: "Jonas Brothers - Burning Up Tour (MSG)",
    icon: Flame,
    category: "Pop Arena Concert Vocals",
    status: "Exclusive CEO Campaign 1",
    payout: "$750 - $1,000 / 1M Views",
    clips: [
      {
        id: "jonas_ceo_1",
        title: "Nick Jonas 'Burnin Up' High Note Climax 🔥",
        duration: "15s (Engineered Loop)",
        quality: "1080p / 4K Master",
        videoUrl: "/video/jonas/jonas_clip1_burnin_up_energy.mp4",
        caption: "Nick Jonas hitting this note live at MSG had 20,000 people screaming 🔥 #shorts\n\nNick Jonas hitting the legendary high note during Burnin' Up live at Madison Square Garden. Pure arena energy!\n\n#jonasbrothers #nickjonas #msg #burninup #concertmoments #livemusic #shorts",
        soundName: "Pure Arena Master (1.0x Natural)",
        payoutRate: "$1,000 / 1M Views",
        loopNote: "Crowd cheer at end loops cleanly into intro scream"
      },
      {
        id: "jonas_ceo_2",
        title: "Madison Square Garden Opening Intro Hype 🏟️",
        duration: "15s (Engineered Loop)",
        quality: "1080p / 4K Master",
        videoUrl: "/video/jonas/jonas_clip2_opening_hype.mp4",
        caption: "Madison Square Garden was completely shaking for the Jonas Brothers 😭 #shorts\n\nThe opening moments at MSG. 20,000 fans singing from balcony to floor!\n\n#jonasbrothers #joejonas #liveperformance #tour #concertvibes #msg #shorts",
        soundName: "Pure Arena Master (1.0x Natural)",
        payoutRate: "$1,000 / 1M Views",
        loopNote: "Arena blackout beat drops into opening synth"
      },
      {
        id: "jonas_ceo_3",
        title: "Hearing S.O.S. Live in 2026 Hits Different ❤️",
        duration: "15s (Engineered Loop)",
        quality: "1080p / 4K Master",
        videoUrl: "/video/jonas/jonas_clip3_sos_throwback.mp4",
        caption: "Hearing S.O.S. live in 2026 hits completely different ❤️ #shorts\n\nPure nostalgia hearing S.O.S. live at Madison Square Garden. Early 2000s classics live in an arena!\n\n#jonasbrothers #sos #nostalgia #throwbacksongs #concert #shorts",
        soundName: "Pure Arena Master (1.0x Natural)",
        payoutRate: "$1,000 / 1M Views",
        loopNote: "Bass drum drop cycles seamlessly to second 0"
      },
      {
        id: "jonas_ceo_4",
        title: "Joe Jonas Stage Charisma & Energy ⚡",
        duration: "15s (Engineered Loop)",
        quality: "1080p / 4K Master",
        videoUrl: "/video/jonas/jonas_clip4_joe_jonas_charisma.mp4",
        caption: "Joe Jonas really has the best stage presence in pop music 👏 #shorts\n\nJoe Jonas stage presence at Madison Square Garden during the Burning Up Tour. The crowd reaction was crazy!\n\n#joejonas #jonasbrothers #concertlife #tour #livemusic #shorts",
        soundName: "Pure Arena Master (1.0x Natural)",
        payoutRate: "$1,000 / 1M Views",
        loopNote: "Center stage spin cuts back to stage sprint"
      },
      {
        id: "jonas_ceo_5",
        title: "When 20,000 Fans Take Over The Chorus ✨",
        duration: "15s (Engineered Loop)",
        quality: "1080p / 4K Master",
        videoUrl: "/video/jonas/jonas_clip5_arena_singalong.mp4",
        caption: "When 20,000 fans take over the chorus at Madison Square Garden ✨ #shorts\n\nThe entire Madison Square Garden arena singing the chorus word-for-word. Pure chills!\n\n#jonasbrothers #singalong #msg #liveperformance #crowdenergy #shorts",
        soundName: "Pure Arena Master (1.0x Natural)",
        payoutRate: "$1,000 / 1M Views",
        loopNote: "Acoustic crowd harmony cycles continuously"
      }
    ]
  },
  {
    campaignId: "finddmo_ceo",
    campaignName: "Finddmo Twitch Stream Highlights",
    icon: Tv,
    category: "Twitch Gaming & IRL Comedy",
    status: "Exclusive CEO Campaign 2",
    payout: "$750 - $1,000 / 1M Views",
    clips: [
      {
        id: "finddmo_ceo_1",
        title: "Finddmo Doing Anything For The Win 😂",
        duration: "15s (Engineered Loop)",
        quality: "1080p 60fps HD",
        videoUrl: "/video/finddmo/finddmo_clip1_comedy_king.mp4",
        caption: "Finddmo's comedic timing during creator games is undefeated 😂 #shorts\n\nFinddmo doing whatever it takes to win creator games! The stream energy is unmatched.\n\nWatch live: twitch.tv/finddmo #finddmo #twitch #streamer #creatorgame #shorts",
        soundName: "Original Stream Audio (1.0x Natural)",
        payoutRate: "$850 / 1M Views",
        loopNote: "Punchline laughter cycles into setup"
      },
      {
        id: "finddmo_ceo_2",
        title: "Finddmo Comedic Timing (MIB Device Skit) 🕶️",
        duration: "14s (Engineered Loop)",
        quality: "1080p 60fps HD",
        videoUrl: "/video/finddmo/finddmo_clip2_mib_skit.mp4",
        caption: "Finddmo really pulled out the Men In Black device mid-game 😭 #shorts\n\nFinddmo's comedic timing during creator events is undefeated! Full streams live at twitch.tv/finddmo\n\n#finddmo #twitchclips #streamer #funnyclips #comedy #shorts",
        soundName: "Original Stream Audio (1.0x Natural)",
        payoutRate: "$850 / 1M Views",
        loopNote: "Memory wipe flash resets back to intro stare"
      },
      {
        id: "finddmo_ceo_3",
        title: "When Finddmo Meets A 6ft 5 Supporter In Public 🤝",
        duration: "15s (Engineered Loop)",
        quality: "1080p 60fps HD",
        videoUrl: "/video/finddmo/finddmo_clip3_fan_interaction.mp4",
        caption: "When Finddmo meets a 6ft 5 supporter on stream 🤝 #shorts\n\nFinddmo showing genuine love to his supporters during IRL streams. Most grounded creator on Twitch!\n\nFollow live: twitch.tv/finddmo #finddmo #irlstream #wholesome #twitchmoments #viral #shorts",
        soundName: "Original Stream Audio (1.0x Natural)",
        payoutRate: "$850 / 1M Views",
        loopNote: "Handshake slap connects to first greeting"
      },
      {
        id: "finddmo_ceo_4",
        title: "Finddmo Clutch Play For The Win 🏀🔥",
        duration: "13s (Engineered Loop)",
        quality: "1080p 60fps HD",
        videoUrl: "/video/finddmo/finddmo_clip4_clutch_winner.mp4",
        caption: "Finddmo clutched up when everyone thought it was over 🏀🔥 #shorts\n\nFinddmo with the game-winning clutch shot! That court vision was insane.\n\nWatch live: twitch.tv/finddmo #finddmo #basketball #clutch #streamhighlights #sports #shorts",
        soundName: "Original Stream Audio (1.0x Natural)",
        payoutRate: "$850 / 1M Views",
        loopNote: "Game winner swish loops back to crossover start"
      },
      {
        id: "finddmo_ceo_5",
        title: "Finddmo The Ultimate Entertainer ✨",
        duration: "15s (Engineered Loop)",
        quality: "1080p 60fps HD",
        videoUrl: "/video/finddmo/finddmo_clip5_creator_showman.mp4",
        caption: "Finddmo always knows how to keep the crowd laughing during events 👏 #shorts\n\nOne of the most entertaining streamers on Twitch right now!\n\nFollow live: twitch.tv/finddmo #finddmo #twitchstream #comedy #streamhighlights #shorts",
        soundName: "Original Stream Audio (1.0x Natural)",
        payoutRate: "$850 / 1M Views",
        loopNote: "Mic drop audio resets to walkup"
      }
    ]
  }
];

const HABEEB_CAMPAIGNS = [
  {
    campaignId: "rodwave_habeeb",
    campaignName: "Rod Wave - Don't Look Down Arena Tour",
    icon: Music2,
    category: "Soulful Hip-Hop Arena Anthems",
    status: "Exclusive Habeeb Campaign 1",
    payout: "$750 - $1,000 / 1M Views",
    clips: [
      {
        id: "rodwave_hab_1",
        title: "Rod Wave Arena Energy & Singalong 🕊️",
        duration: "15s (Engineered Loop)",
        quality: "1080p / 4K Master",
        videoUrl: "/video/rodwave/rodwave_clip1_arena_energy.mp4",
        caption: "Rod Wave Don’t Look Down Tour is about to be the best night of the year 🕊️ #shorts\n\nThe entire arena singing word for word! Who got tickets already?\n\n#rodwave #dontlookdowntour #tour #singalong #concerts #shorts",
        soundName: "Master Arena Sound (1.0x Natural)",
        payoutRate: "$1,000 / 1M Views",
        loopNote: "Soul vocal run loops back to first note"
      },
      {
        id: "rodwave_hab_2",
        title: "The Tour You Can Not Miss This Year 🔥",
        duration: "15s (Engineered Loop)",
        quality: "1080p / 4K Master",
        videoUrl: "/video/rodwave/rodwave_clip2_cant_miss_tour.mp4",
        caption: "Rod Wave Don’t Look Down Tour is the one show I am not missing this year 🔥 #shorts\n\nThat energy is completely unmatched! Live music hits different.\n\n#rodwave #dontlookdowntour #tour #livemusic #arena #shorts",
        soundName: "Master Arena Sound (1.0x Natural)",
        payoutRate: "$1,000 / 1M Views",
        loopNote: "Heavy 808 drop aligns with bar 1"
      },
      {
        id: "rodwave_hab_3",
        title: "Sea of Flashlights Across The Arena ✨",
        duration: "15s (Engineered Loop)",
        quality: "1080p / 4K Master",
        videoUrl: "/video/rodwave/rodwave_clip3_crowd_lights.mp4",
        caption: "The entire arena lit up by flashlights at Rod Wave's show ✨ #shorts\n\nNobody connects with a crowd like Rod Wave. Look at these lights!\n\n#rodwave #crowdlights #concertlife #tour #shorts",
        soundName: "Master Arena Sound (1.0x Natural)",
        payoutRate: "$1,000 / 1M Views",
        loopNote: "Phone torch glow rotates seamlessly"
      },
      {
        id: "rodwave_hab_4",
        title: "Great Gatsby Live Moment & Chills 🕊️",
        duration: "15s (Engineered Loop)",
        quality: "1080p / 4K Master",
        videoUrl: "/video/rodwave/rodwave_clip4_great_gatsby_live.mp4",
        caption: "When Rod Wave sings Great Gatsby live it gives goosebumps every time 🕊️ #shorts\n\nPure connection with the audience. Unmatched vibes!\n\n#rodwave #greatgatsby #goosebumps #livemusic #tour #shorts",
        soundName: "Master Arena Sound (1.0x Natural)",
        payoutRate: "$1,000 / 1M Views",
        loopNote: "Harmonic hum bridges start and finish"
      },
      {
        id: "rodwave_hab_5",
        title: "Rod Wave Best Night Ever Live Anthems 🏟️",
        duration: "14s (Engineered Loop)",
        quality: "1080p / 4K Master",
        videoUrl: "/video/rodwave/rodwave_clip5_best_night_ever.mp4",
        caption: "Singing Rod Wave anthems at the top of your lungs in an arena hits different 🏟️ #shorts\n\nPure emotion and energy from the Don't Look Down Tour.\n\n#rodwave #concertvibes #soulful #hiphop #viral #shorts",
        soundName: "Master Arena Sound (1.0x Natural)",
        payoutRate: "$1,000 / 1M Views",
        loopNote: "Stage smoke bloom fades to intro lights"
      }
    ]
  },
  {
    campaignId: "hellraiser_habeeb",
    campaignName: "Hellraiser - Clive Barker Horror Revival",
    icon: Film,
    category: "Atmospheric Cinema Horror & Lore",
    status: "Exclusive Habeeb Campaign 2",
    payout: "$800 - $1,200 / 1M Views",
    clips: [
      {
        id: "hellraiser_hab_1",
        title: "Chatterer Jumpscare & Hallway Chase 💀",
        duration: "14s (Engineered Loop)",
        quality: "1080p / 4K Master",
        videoUrl: "/video/hellraiser/clip1_chatterer_jumpscare.mp4",
        caption: "The Chatterer in Hellraiser Revival is genuinely terrifying 💀 #shorts\n\nOctober 8 cannot come sooner! Wear headphones for real horror.\n\n#hellraiserrevival #horrormovie #scaryclips #jumpscare #shorts",
        soundName: "Original Cinematic Audio (1.0x Natural)",
        payoutRate: "$1,000 / 1M Views",
        loopNote: "Teeth chattering sound matches first click"
      },
      {
        id: "hellraiser_hab_2",
        title: "Doorway Chase - Don't Look Back 🚪",
        duration: "13s (Engineered Loop)",
        quality: "1080p / 4K Master",
        videoUrl: "/video/hellraiser/clip2_dont_look_back.mp4",
        caption: "Bro thought he was safe behind that door 😭 Clive Barker is back making real horror #shorts\n\nMy heart rate was at 180 BPM during this chase! October 8 release.\n\n#hellraiserrevival #horror #jumpscare #scaryclips #shorts",
        soundName: "Original Cinematic Audio (1.0x Natural)",
        payoutRate: "$1,000 / 1M Views",
        loopNote: "Door slam reverb loops to footsteps"
      },
      {
        id: "hellraiser_hab_3",
        title: "Headphones Warning - Extreme Sound Design 🎧",
        duration: "15s (Engineered Loop)",
        quality: "1080p / 4K Master",
        videoUrl: "/video/hellraiser/clip3_headphones_warning.mp4",
        caption: "Wear headphones for this because the sound design is completely unhinged 🎧 #shorts\n\nClive Barker's Hellraiser Revival is bringing back true cinema horror!\n\n#hellraiserrevival #horror #sounddesign #cinematic #shorts",
        soundName: "Original Cinematic Audio (1.0x Natural)",
        payoutRate: "$1,000 / 1M Views",
        loopNote: "Whispering chain echo loops into drone"
      },
      {
        id: "hellraiser_hab_4",
        title: "Narrow Corner Escape Moment 😱",
        duration: "13s (Engineered Loop)",
        quality: "1080p / 4K Master",
        videoUrl: "/video/hellraiser/clip4_narrow_escape.mp4",
        caption: "Narrow corner escape in Hellraiser Revival had everyone jumping 😱 #shorts\n\nClive Barker's Hellraiser Revival is looking unreal!\n\n#hellraiserrevival #scary #horrormovie #chase #shorts",
        soundName: "Original Cinematic Audio (1.0x Natural)",
        payoutRate: "$1,000 / 1M Views",
        loopNote: "Gasp breath resets to shadow pass"
      },
      {
        id: "hellraiser_hab_5",
        title: "Clive Barker's Dark Masterpiece Returns 🩸",
        duration: "15s (Engineered Loop)",
        quality: "1080p / 4K Master",
        videoUrl: "/video/hellraiser/clip5_clive_barker_return.mp4",
        caption: "The master of dark fantasy Clive Barker is officially back 🩸 #shorts\n\nHellraiser Revival promises the most intense horror experience of the decade.\n\n#hellraiser #clivebarker #horrorcommunity #cinematic #shorts",
        soundName: "Original Cinematic Audio (1.0x Natural)",
        payoutRate: "$1,000 / 1M Views",
        loopNote: "Lament configuration chime loops endlessly"
      }
    ]
  }
];

export default function ClippingVault() {
  const [currentUser, setCurrentUser] = useState<string>(() => {
    return localStorage.getItem("clipping_user") || "";
  });
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");

  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [trackIndex, setTrackIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!currentUser) return;
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = isMuted ? 0 : 0.5;

    const savedTime = localStorage.getItem("hustle_time");
    if (savedTime && !isNaN(parseFloat(savedTime))) {
      audio.currentTime = parseFloat(savedTime);
    }

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        const onFirstInteraction = () => {
          audio.play().catch(() => {});
          window.removeEventListener("click", onFirstInteraction);
          window.removeEventListener("touchstart", onFirstInteraction);
        };
        window.addEventListener("click", onFirstInteraction);
        window.addEventListener("touchstart", onFirstInteraction);
      });
    }

    const interval = setInterval(() => {
      if (audio && !audio.paused) {
        localStorage.setItem("hustle_time", audio.currentTime.toString());
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [currentUser, trackIndex]);

  const toggleMute = () => {
    if (!audioRef.current) return;
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioRef.current.volume = nextMuted ? 0 : 0.5;
  };

  const handleTrackEnded = () => {
    setTrackIndex((prev) => (prev + 1) % HUSTLE_TRACKS.length);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = usernameInput.trim().toLowerCase();
    const cred = USERS[user];

    if (cred && cred.pass === passwordInput.trim()) {
      setCurrentUser(user);
      localStorage.setItem("clipping_user", user);
      setAuthError("");
    } else {
      setAuthError("Invalid access credentials. Unauthorized user.");
    }
  };

  const handleLogout = () => {
    if (audioRef.current) audioRef.current.pause();
    localStorage.removeItem("clipping_user");
    setCurrentUser("");
  };

  const copyToClipboard = (clip: ClipItem) => {
    navigator.clipboard.writeText(clip.caption);
    setCopiedId(clip.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0a0d14] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-[#10141e] border border-[#1b2234] rounded-2xl p-8 shadow-2xl relative overflow-hidden"
        >
          <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-6 mx-auto">
            <Shield className="w-6 h-6 text-blue-400" />
          </div>

          <h1 className="text-xl font-bold text-center text-white mb-1.5 tracking-tight">
            String Clipping Vault
          </h1>
          <p className="text-xs text-center text-neutral-400 mb-6 font-medium">
            1:1 Fair Split • 2 Dedicated Campaigns Per User
          </p>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="text-[11px] font-semibold tracking-wider uppercase text-neutral-400 mb-1.5 block">
                User Identity
              </label>
              <input
                type="text"
                value={usernameInput}
                onChange={e => setUsernameInput(e.target.value)}
                placeholder="ceo or habeeb"
                className="w-full bg-[#0a0d14] border border-[#1b2234] rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 transition-all"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold tracking-wider uppercase text-neutral-400 mb-1.5 block">
                Encrypted Key
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                placeholder="Enter unguessable key"
                className="w-full bg-[#0a0d14] border border-[#1b2234] rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-blue-500 transition-all"
                required
              />
            </div>

            {authError && (
              <p className="text-xs text-rose-400 bg-rose-500/10 border border-rose-500/20 p-2.5 rounded-lg">
                {authError}
              </p>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3.5 px-4 rounded-xl text-sm transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/25 active:scale-[0.98]"
            >
              <Lock className="w-4 h-4" />
              Authorize Secure Session
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-[#1b2234] flex items-center justify-between text-[11px] text-neutral-400">
            <span>1:1 Equal Reach Split</span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Encrypted Session
            </span>
          </div>
        </motion.div>
      </div>
    );
  }

  const activeUserData = USERS[currentUser] || USERS.ceo;
  const campaigns = currentUser === "habeeb" ? HABEEB_CAMPAIGNS : CEO_CAMPAIGNS;

  return (
    <div className="min-h-screen bg-[#0a0d14] text-white selection:bg-blue-600/30 pb-20">
      <audio
        ref={audioRef}
        src={HUSTLE_TRACKS[trackIndex].src}
        onEnded={handleTrackEnded}
        preload="auto"
      />

      {/* String Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#0a0d14]/90 backdrop-blur-xl border-b border-[#1b2234] px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-blue-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base tracking-tight text-white">
                  String Vault
                </span>
                <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
                  {activeUserData.badge}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Logged in as <strong className="text-white">{activeUserData.name}</strong> • 1:1 Campaign Distribution
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={toggleMute}
              className="w-8 h-8 rounded-xl bg-[#141926] hover:bg-[#1b2234] border border-[#1b2234] flex items-center justify-center text-neutral-300 hover:text-white transition-all"
              title={isMuted ? "Unmute background atmosphere (50%)" : "Mute background atmosphere"}
            >
              {isMuted ? <VolumeX className="w-4 h-4 text-neutral-500" /> : <Volume2 className="w-4 h-4 text-blue-400" />}
            </button>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 bg-[#141926] hover:bg-[#1b2234] border border-[#1b2234] px-3 py-1.5 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Campaign Bento Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 space-y-10">
        {/* Campaign Info Header */}
        <section className="bg-[#10141e] border border-[#1b2234] rounded-2xl p-5 sm:p-6 relative overflow-hidden shadow-xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-blue-400 uppercase tracking-wider font-semibold">
                  User: {currentUser.toUpperCase()}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span className="text-xs text-neutral-400">1:1 Two Unique Dedicated Campaigns Allocation</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-white">
                {currentUser === "ceo" ? "CEO Suite: Jonas Brothers + Finddmo Twitch" : "Habeeb Operations: Rod Wave + Hellraiser Revival"}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl leading-relaxed">
                2 dedicated, non-overlapping campaigns per user with 5 loop clips each (10 clips total). Equal reach, equal earning potential ($1,000/1M views), and zero audience cannibalization!
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-[#0a0d14] border border-[#1b2234] px-4 py-2.5 rounded-xl">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-medium">Standard Payout</span>
                <span className="text-base font-bold text-emerald-400">$750 - $1,000 / 1M</span>
              </div>
            </div>
          </div>
        </section>

        {/* YouTube Shorts High-Yield Farming Playbook */}
        <section className="bg-gradient-to-r from-blue-950/20 to-emerald-950/20 border border-[#1e293b] rounded-2xl p-5 sm:p-6">
          <div className="flex items-center gap-2 text-sm font-bold text-sky-400 mb-3">
            <span>⚡</span>
            <span>YouTube Shorts 1k - 3k Views Guaranteed Strategy (4-6 Uploads/Day)</span>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
            <div className="bg-[#0d111a] border border-[#1e2638] rounded-xl p-3.5">
              <h4 className="text-xs font-bold text-white mb-1">1. 48-Hour Account Warming</h4>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Do not upload immediately on brand new channels! Watch 5-10 Shorts daily in your niche, like & comment. Signals real human usage so views aren't frozen at 0.
              </p>
            </div>
            <div className="bg-[#0d111a] border border-[#1e2638] rounded-xl p-3.5">
              <h4 className="text-xs font-bold text-white mb-1">2. 15s Engineered Loop (APV &gt; 100%)</h4>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                YouTube prioritizes Average Percentage Viewed. Because these clips loop seamlessly at 13-15s, viewers watch 1.3x before realizing, triggering viral distribution.
              </p>
            </div>
            <div className="bg-[#0d111a] border border-[#1e2638] rounded-xl p-3.5">
              <h4 className="text-xs font-bold text-white mb-1">3. 0% Volume Audio Overlay Trick</h4>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                When uploading in the YouTube mobile app, tap 'Add Sound', select a #1 trending audio track, tap 'Volume', set Added Sound to 0% and Original Sound to 100%.
              </p>
            </div>
            <div className="bg-[#0d111a] border border-[#1e2638] rounded-xl p-3.5">
              <h4 className="text-xs font-bold text-white mb-1">4. Drip Schedule (WAT to US Peak)</h4>
              <p className="text-[11px] text-neutral-400 leading-relaxed">
                Post 4-6 clips/day spaced 2.5 to 3.5 hours apart. Prime Nigerian upload windows for US viewership: 1:00 PM, 4:00 PM, 7:00 PM, 10:00 PM, 1:00 AM WAT.
              </p>
            </div>
          </div>
        </section>

        {/* Campaign Sections */}
        {campaigns.map((camp) => {
          const IconComp = camp.icon;
          return (
            <section key={camp.campaignId} className="space-y-4">
              <div className="flex items-center justify-between pb-2 border-b border-[#1b2234]">
                <div className="flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-600/10 border border-blue-500/20 flex items-center justify-center">
                    <IconComp className="w-3.5 h-3.5 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-white">{camp.campaignName}</h3>
                    <p className="text-[11px] text-neutral-400">{camp.category} • {camp.status}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href="https://drive.google.com/drive/u/0/my-drive"
                    target="_blank"
                    rel="noreferrer"
                    className="text-[11px] text-neutral-400 hover:text-white bg-[#10141e] border border-[#1b2234] px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-all"
                  >
                    <span>Google Drive Folder</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Clip Cards Bento Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {camp.clips.map((clip) => (
                  <div 
                    key={clip.id}
                    className="bg-[#10141e] border border-[#1b2234] hover:border-blue-500/40 rounded-2xl overflow-hidden flex flex-col justify-between transition-all group shadow-lg"
                  >
                    <div>
                      {/* Video Player */}
                      <div className="relative aspect-[9/16] max-h-[320px] bg-black overflow-hidden flex items-center justify-center">
                        <video 
                          src={clip.videoUrl}
                          controls
                          loop
                          playsInline
                          preload="metadata"
                          className="w-full h-full object-contain"
                        />
                        <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-mono text-neutral-300 border border-white/10">
                          {clip.duration}
                        </div>
                        <div className="absolute top-2.5 right-2.5 bg-emerald-500/80 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-bold text-white">
                          {clip.quality}
                        </div>
                      </div>

                      {/* Clip Details */}
                      <div className="p-4 space-y-3">
                        <h4 className="font-bold text-sm text-white line-clamp-1 group-hover:text-blue-400 transition-colors">
                          {clip.title}
                        </h4>

                        <div className="bg-[#0a0d14] border border-[#1b2234] rounded-xl p-2.5 space-y-1">
                          <div className="text-[10px] text-neutral-400 flex items-center justify-between">
                            <span className="font-semibold text-neutral-300">Loop Mechanics</span>
                            <span className="text-emerald-400 font-bold">{clip.payoutRate}</span>
                          </div>
                          <p className="text-[11px] text-blue-300 font-mono leading-tight">
                            {clip.loopNote}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="p-4 pt-0 space-y-2">
                      <button
                        onClick={() => copyToClipboard(clip)}
                        className="w-full py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 active:scale-[0.98]"
                      >
                        {copiedId === clip.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-300" />
                            <span>Title & SEO Caption Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy Title & SEO Caption</span>
                          </>
                        )}
                      </button>

                      <div className="flex items-center gap-2">
                        <a
                          href={clip.videoUrl}
                          download
                          className="flex-1 py-2 px-3 rounded-xl bg-[#141926] hover:bg-[#1b2234] border border-[#1b2234] text-neutral-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Direct Clip</span>
                        </a>

                        <a
                          href="https://drive.google.com/drive/u/0/my-drive"
                          target="_blank"
                          rel="noreferrer"
                          className="py-2 px-3 rounded-xl bg-[#141926] hover:bg-[#1b2234] border border-[#1b2234] text-neutral-400 hover:text-white text-xs font-semibold flex items-center justify-center transition-all"
                          title="Open in Google Drive"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </main>
    </div>
  );
}
