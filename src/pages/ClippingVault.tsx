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
    badge: "CEO SUITE (1:1 SPLIT)"
  },
  habeeb: {
    pass: "hab_gy#Xg9337gMKHsCk",
    name: "Habeeb Operations",
    role: "Senior Growth Clipper",
    badge: "HABEEB VAULT (1:1 SPLIT)"
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

// 1:1 FAIR SPLIT: Both users get access to ALL top campaigns, but with 100% UNIQUE CLIPS!
const CEO_CAMPAIGNS = [
  {
    campaignId: "jonas_ceo",
    campaignName: "Jonas Brothers - Burning Up Tour (MSG)",
    icon: Flame,
    category: "Pop Arena Concert Vocals",
    status: "1:1 Unique Split (CEO Set)",
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
        title: "When 20,000 Fans Take Over The Chorus ✨",
        duration: "15s (Engineered Loop)",
        quality: "1080p / 4K Master",
        videoUrl: "/video/jonas/jonas_clip5_arena_singalong.mp4",
        caption: "When 20,000 fans take over the chorus at Madison Square Garden ✨ #shorts\n\nThe entire Madison Square Garden arena singing the chorus word-for-word. Pure chills!\n\n#jonasbrothers #singalong #msg #liveperformance #crowdenergy #shorts",
        soundName: "Pure Arena Master (1.0x Natural)",
        payoutRate: "$1,000 / 1M Views",
        loopNote: "Acoustic crowd harmony cycles indefinitely"
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
        loopNote: "Bass drum drop loops back to second 0"
      }
    ]
  },
  {
    campaignId: "finddmo_ceo",
    campaignName: "Finddmo Twitch Stream Highlights",
    icon: Tv,
    category: "Twitch Gaming & IRL Comedy",
    status: "1:1 Unique Split (CEO Set)",
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
        loopNote: "Reaction laughter resets into setup"
      },
      {
        id: "finddmo_ceo_2",
        title: "Finddmo Clutch Play For The Win 🏀🔥",
        duration: "13s (Engineered Loop)",
        quality: "1080p 60fps HD",
        videoUrl: "/video/finddmo/finddmo_clip4_clutch_winner.mp4",
        caption: "Finddmo clutched up when everyone thought it was over 🏀🔥 #shorts\n\nFinddmo with the game-winning clutch shot! That court vision was insane.\n\nWatch live: twitch.tv/finddmo #finddmo #basketball #clutch #streamhighlights #sports #shorts",
        soundName: "Original Stream Audio (1.0x Natural)",
        payoutRate: "$850 / 1M Views",
        loopNote: "Buzzer beater loops into court sprint"
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
        loopNote: "Handshake greeting loops back naturally"
      }
    ]
  },
  {
    campaignId: "rodwave_ceo",
    campaignName: "Rod Wave - Don't Look Down Arena Tour",
    icon: Music2,
    category: "Soul Rap Arena Singalong",
    status: "1:1 Unique Split (CEO Set)",
    payout: "$750 - $1,000 / 1M Views",
    clips: [
      {
        id: "rodwave_ceo_1",
        title: "Arena Energy & Crowd Singalong 🕊️",
        duration: "15s (Engineered Loop)",
        quality: "1080p 60fps HD",
        videoUrl: "/video/rodwave/rodwave_clip1_arena_energy.mp4",
        caption: "Rod Wave Don’t Look Down Tour is about to be the best night of the year 🕊️ #shorts\n\nThe entire arena singing word for word! Who got tickets already?\n\n#rodwave #dontlookdowntour #tour #singalong #concerts #shorts",
        soundName: "Concert Mic Live Audio (1.0x)",
        payoutRate: "$1,000 / 1M Views",
        loopNote: "Chorus vocal loops into piano intro"
      },
      {
        id: "rodwave_ceo_2",
        title: "Sea of Flashlights Across The Arena ✨",
        duration: "15s (Engineered Loop)",
        quality: "1080p 60fps HD",
        videoUrl: "/video/rodwave/rodwave_clip3_crowd_lights.mp4",
        caption: "The entire arena lit up by flashlights at Rod Wave's show ✨ #shorts\n\nNobody connects with a crowd like Rod Wave. Look at these lights!\n\n#rodwave #crowdlights #concertlife #tour #shorts",
        soundName: "Concert Mic Live Audio (1.0x)",
        payoutRate: "$1,000 / 1M Views",
        loopNote: "Light wave carries across the loop"
      }
    ]
  },
  {
    campaignId: "hellraiser_ceo",
    campaignName: "Hellraiser Revival - October Horror Event",
    icon: Film,
    category: "Horror Jumpscare & Sound Design",
    status: "1:1 Unique Split (CEO Set)",
    payout: "$750 / 1M Views",
    clips: [
      {
        id: "hellraiser_ceo_1",
        title: "Chatterer Jumpscare & Hallway Chase 💀",
        duration: "14s (Engineered Loop)",
        quality: "1080p 60fps HD",
        videoUrl: "/video/hellraiser/clip1_chatterer_jumpscare.mp4",
        caption: "The Chatterer in Hellraiser Revival is genuinely terrifying 💀 #shorts\n\nOctober 8 cannot come sooner! Wear headphones for real horror.\n\n#hellraiserrevival #horrormovie #scaryclips #jumpscare #shorts",
        soundName: "Original Cinematic Audio (1.0x)",
        payoutRate: "$750 / 1M Views",
        loopNote: "Teeth chattering loops continuously"
      },
      {
        id: "hellraiser_ceo_2",
        title: "Headphones Warning - Extreme Sound Design 🎧",
        duration: "15s (Engineered Loop)",
        quality: "1080p 60fps HD",
        videoUrl: "/video/hellraiser/clip3_headphones_warning.mp4",
        caption: "Wear headphones for this because the sound design is completely unhinged 🎧 #shorts\n\nClive Barker's Hellraiser Revival is bringing back true cinema horror!\n\n#hellraiserrevival #horror #sounddesign #cinematic #shorts",
        soundName: "Original Cinematic Audio (1.0x)",
        payoutRate: "$750 / 1M Views",
        loopNote: "Ambient horror drone matches seam"
      }
    ]
  }
];

const HABEEB_CAMPAIGNS = [
  {
    campaignId: "jonas_habeeb",
    campaignName: "Jonas Brothers - Burning Up Tour (MSG)",
    icon: Flame,
    category: "Pop Arena Concert Vocals",
    status: "1:1 Unique Split (Habeeb Set)",
    payout: "$750 - $1,000 / 1M Views",
    clips: [
      {
        id: "jonas_hab_1",
        title: "Madison Square Garden Opening Intro Hype 🏟️",
        duration: "15s (Engineered Loop)",
        quality: "1080p / 4K Master",
        videoUrl: "/video/jonas/jonas_clip2_opening_hype.mp4",
        caption: "Madison Square Garden was completely shaking for the Jonas Brothers 😭 #shorts\n\nThe opening moments at MSG. 20,000 fans singing from balcony to floor!\n\n#jonasbrothers #joejonas #liveperformance #tour #concertvibes #msg #shorts",
        soundName: "Pure Arena Master (1.0x Natural)",
        payoutRate: "$1,000 / 1M Views",
        loopNote: "Pyro boom resets to opening arena rumble"
      },
      {
        id: "jonas_hab_2",
        title: "Joe Jonas Stage Charisma & Energy ⚡",
        duration: "15s (Engineered Loop)",
        quality: "1080p / 4K Master",
        videoUrl: "/video/jonas/jonas_clip4_joe_jonas_charisma.mp4",
        caption: "Joe Jonas really has the best stage presence in pop music 👏 #shorts\n\nJoe Jonas stage presence at Madison Square Garden during the Burning Up Tour. The crowd reaction was crazy!\n\n#joejonas #jonasbrothers #concertlife #tour #livemusic #shorts",
        soundName: "Pure Arena Master (1.0x Natural)",
        payoutRate: "$1,000 / 1M Views",
        loopNote: "Mic spin cuts into stage sprint"
      }
    ]
  },
  {
    campaignId: "finddmo_habeeb",
    campaignName: "Finddmo Twitch Stream Highlights",
    icon: Tv,
    category: "Twitch Gaming & IRL Comedy",
    status: "1:1 Unique Split (Habeeb Set)",
    payout: "$750 - $1,000 / 1M Views",
    clips: [
      {
        id: "finddmo_hab_1",
        title: "Finddmo Comedic Timing (MIB Skit) 🕶️",
        duration: "14s (Engineered Loop)",
        quality: "1080p 60fps HD",
        videoUrl: "/video/finddmo/finddmo_clip2_mib_skit.mp4",
        caption: "Finddmo really pulled out the Men In Black device mid-game 😭 #shorts\n\nFinddmo's comedic timing during creator events is undefeated! Full streams live at twitch.tv/finddmo\n\n#finddmo #twitchclips #streamer #funnyclips #comedy #shorts",
        soundName: "Original Stream Audio (1.0x Natural)",
        payoutRate: "$850 / 1M Views",
        loopNote: "Memory eraser flash restarts the loop"
      },
      {
        id: "finddmo_hab_2",
        title: "Finddmo The Ultimate Entertainer ✨",
        duration: "15s (Engineered Loop)",
        quality: "1080p 60fps HD",
        videoUrl: "/video/finddmo/finddmo_clip5_creator_showman.mp4",
        caption: "Finddmo always knows how to keep the crowd laughing during events 👏 #shorts\n\nOne of the most entertaining streamers on Twitch right now!\n\nFollow live: twitch.tv/finddmo #finddmo #twitchstream #comedy #streamhighlights #shorts",
        soundName: "Original Stream Audio (1.0x Natural)",
        payoutRate: "$850 / 1M Views",
        loopNote: "Crowd punchline loops into walk-up"
      }
    ]
  },
  {
    campaignId: "rodwave_habeeb",
    campaignName: "Rod Wave - Don't Look Down Arena Tour",
    icon: Music2,
    category: "Soul Rap Arena Singalong",
    status: "1:1 Unique Split (Habeeb Set)",
    payout: "$750 - $1,000 / 1M Views",
    clips: [
      {
        id: "rodwave_hab_1",
        title: "The Tour You Can Not Miss This Year 🔥",
        duration: "15s (Engineered Loop)",
        quality: "1080p 60fps HD",
        videoUrl: "/video/rodwave/rodwave_clip2_cant_miss_tour.mp4",
        caption: "Rod Wave Don’t Look Down Tour is the one show I am not missing this year 🔥 #shorts\n\nThat energy is completely unmatched! Live music hits different.\n\n#rodwave #dontlookdowntour #tour #livemusic #arena #shorts",
        soundName: "Concert Mic Live Audio (1.0x)",
        payoutRate: "$1,000 / 1M Views",
        loopNote: "Vocal sustain loops to intro beat"
      },
      {
        id: "rodwave_hab_2",
        title: "Great Gatsby Live Moment & Chills 🕊️",
        duration: "15s (Engineered Loop)",
        quality: "1080p 60fps HD",
        videoUrl: "/video/rodwave/rodwave_clip4_great_gatsby_live.mp4",
        caption: "When Rod Wave sings Great Gatsby live it gives goosebumps every time 🕊️ #shorts\n\nPure connection with the audience. Unmatched vibes!\n\n#rodwave #greatgatsby #goosebumps #livemusic #tour #shorts",
        soundName: "Concert Mic Live Audio (1.0x)",
        payoutRate: "$1,000 / 1M Views",
        loopNote: "Piano chord sustains across loop boundary"
      }
    ]
  },
  {
    campaignId: "hellraiser_habeeb",
    campaignName: "Hellraiser Revival - October Horror Event",
    icon: Film,
    category: "Horror Jumpscare & Sound Design",
    status: "1:1 Unique Split (Habeeb Set)",
    payout: "$750 / 1M Views",
    clips: [
      {
        id: "hellraiser_hab_1",
        title: "Doorway Chase - Don't Look Back 🚪",
        duration: "13s (Engineered Loop)",
        quality: "1080p 60fps HD",
        videoUrl: "/video/hellraiser/clip2_dont_look_back.mp4",
        caption: "Bro thought he was safe behind that door 😭 Clive Barker is back making real horror #shorts\n\nMy heart rate was at 180 BPM during this chase! October 8 release.\n\n#hellraiserrevival #horror #jumpscare #scaryclips #shorts",
        soundName: "Original Cinematic Audio (1.0x)",
        payoutRate: "$750 / 1M Views",
        loopNote: "Door slam echoes into hallway footstep"
      },
      {
        id: "hellraiser_hab_2",
        title: "Narrow Corner Escape Moment 😱",
        duration: "13s (Engineered Loop)",
        quality: "1080p 60fps HD",
        videoUrl: "/video/hellraiser/clip4_narrow_escape.mp4",
        caption: "Narrow corner escape in Hellraiser Revival had everyone jumping 😱 #shorts\n\nClive Barker's Hellraiser Revival is looking unreal!\n\n#hellraiserrevival #scary #horrormovie #chase #shorts",
        soundName: "Original Cinematic Audio (1.0x)",
        payoutRate: "$750 / 1M Views",
        loopNote: "Tension riser loops back seamlessly"
      }
    ]
  }
];

export default function ClippingVault() {
  const [currentUser, setCurrentUser] = useState<string | null>(() => {
    return localStorage.getItem("clipping_auth_user");
  });
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");

  // Background Audio State (Invisible, Natural 50% Volume)
  const [trackIndex, setTrackIndex] = useState(() => {
    const saved = localStorage.getItem("clipping_bg_track");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [isMuted, setIsMuted] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    audio.volume = isMuted ? 0 : 0.5;

    const savedPos = parseFloat(localStorage.getItem("clipping_bg_pos") || "0");
    if (!isNaN(savedPos) && savedPos > 0) {
      audio.currentTime = savedPos;
    }

    const playPromise = audio.play();
    if (playPromise !== undefined) {
      playPromise.catch(() => {
        const startOnInteraction = () => {
          if (audioRef.current) {
            audioRef.current.play().catch(() => {});
          }
          window.removeEventListener("click", startOnInteraction);
          window.removeEventListener("touchstart", startOnInteraction);
        };
        window.addEventListener("click", startOnInteraction);
        window.addEventListener("touchstart", startOnInteraction);
      });
    }

    const posInterval = setInterval(() => {
      if (audioRef.current && !audioRef.current.paused) {
        localStorage.setItem("clipping_bg_pos", audioRef.current.currentTime.toString());
      }
    }, 2000);

    return () => clearInterval(posInterval);
  }, [trackIndex]);

  const handleTrackEnded = () => {
    const next = (trackIndex + 1) % HUSTLE_TRACKS.length;
    setTrackIndex(next);
    localStorage.setItem("clipping_bg_track", next.toString());
    localStorage.setItem("clipping_bg_pos", "0");
  };

  const toggleMute = () => {
    if (audioRef.current) {
      const nextMuted = !isMuted;
      audioRef.current.volume = nextMuted ? 0 : 0.5;
      setIsMuted(nextMuted);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = usernameInput.trim().toLowerCase();
    const pass = passwordInput.trim();

    if (USERS[user] && USERS[user].pass === pass) {
      setCurrentUser(user);
      localStorage.setItem("clipping_auth_user", user);
      setAuthError("");
      
      if (audioRef.current) {
        audioRef.current.play().catch(() => {});
      }
    } else {
      setAuthError("Invalid access credentials. Check credentials with administrator.");
    }
  };

  const handleLogout = () => {
    setCurrentUser(null);
    localStorage.removeItem("clipping_auth_user");
  };

  const handleCopyCaption = (clip: ClipItem) => {
    navigator.clipboard.writeText(clip.caption);
    setCopiedId(clip.id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#0a0d14] text-white flex flex-col justify-center items-center p-4 selection:bg-blue-600/30">
        <audio
          ref={audioRef}
          src={HUSTLE_TRACKS[trackIndex].src}
          onEnded={handleTrackEnded}
          preload="auto"
        />

        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-[#10141e] border border-[#1b2234] rounded-2xl p-8 backdrop-blur-2xl shadow-2xl shadow-black/80"
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-blue-500/10 border border-blue-500/20 mb-6 mx-auto">
            <Shield className="w-6 h-6 text-blue-400" />
          </div>

          <h1 className="text-xl font-bold text-center tracking-tight text-white mb-1">
            String Growth Vault
          </h1>
          <p className="text-xs text-center text-neutral-400 mb-6">
            1:1 Fair Split Affiliate & Video Monetization Hub
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
                  Active User: {currentUser.toUpperCase()}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span className="text-xs text-neutral-400">Equal 1:1 Reach Split Across ALL 4 Campaigns</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-white">
                All 4 Top Campaigns Active • 100% Unique Non-Overlapping Clips
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl leading-relaxed">
                Both CEO and Habeeb run the same high-volume campaigns together (Jonas MSG, Finddmo, Rod Wave, Hellraiser) with dedicated 15-second loop cuts. Zero duplicate submission risk!
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
                    <h3 className="text-base sm:text-lg font-bold text-white">
                      {camp.campaignName}
                    </h3>
                    <p className="text-xs text-neutral-400">{camp.category} • {camp.status}</p>
                  </div>
                </div>
                <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-[#141926] text-blue-400 border border-[#1b2234] font-semibold">
                  {camp.clips.length} Unique Clips
                </span>
              </div>

              {/* Industrial BentoGrid of Video Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {camp.clips.map((clip) => (
                  <div
                    key={clip.id}
                    className="group bg-[#10141e] border border-[#1b2234] rounded-2xl overflow-hidden flex flex-col hover:border-blue-500/40 transition-all duration-200 shadow-xl shadow-black/50"
                  >
                    {/* 9:16 Video Player Container */}
                    <div className="relative aspect-[9/16] bg-black w-full overflow-hidden flex items-center justify-center">
                      <video
                        controls
                        playsInline
                        preload="none"
                        className="w-full h-full object-cover"
                      >
                        <source src={clip.videoUrl} type="video/mp4" />
                      </video>
                      <div className="absolute top-2.5 left-2.5 pointer-events-none">
                        <span className="text-[10px] font-mono font-bold bg-[#0a0d14]/80 backdrop-blur-md text-blue-400 border border-[#1b2234] px-2 py-0.5 rounded-md">
                          {clip.quality}
                        </span>
                      </div>
                      <div className="absolute top-2.5 right-2.5 pointer-events-none">
                        <span className="text-[10px] font-mono font-bold bg-[#0a0d14]/80 backdrop-blur-md text-white border border-[#1b2234] px-2 py-0.5 rounded-md">
                          {clip.duration}
                        </span>
                      </div>
                    </div>

                    {/* Card Content & Actions */}
                    <div className="p-4 flex flex-col flex-1 gap-3">
                      <div>
                        <h4 className="font-bold text-sm text-white line-clamp-1 group-hover:text-blue-400 transition-colors">
                          {clip.title}
                        </h4>
                        <p className="text-[11px] text-emerald-400 mt-0.5 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          Loop: {clip.loopNote}
                        </p>
                      </div>

                      {/* Pre-packaged Viral Caption & YouTube #shorts SEO */}
                      <div className="bg-[#0a0d14] border border-[#1b2234] rounded-xl p-3 text-xs text-neutral-300 line-clamp-4 leading-relaxed font-sans select-all">
                        {clip.caption}
                      </div>

                      {/* Action Buttons styled in String's Cobalt Blue */}
                      <div className="mt-auto pt-2 space-y-2">
                        <button
                          onClick={() => handleCopyCaption(clip)}
                          className={`w-full py-2.5 px-3 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 border transition-all ${
                            copiedId === clip.id
                              ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                              : "bg-[#141926] hover:bg-[#1b2234] text-neutral-200 border-[#1b2234] active:scale-[0.98]"
                          }`}
                        >
                          {copiedId === clip.id ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Title & Description Copied!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3.5 h-3.5 text-neutral-400" />
                              <span>Copy Title & SEO Tags</span>
                            </>
                          )}
                        </button>

                        <a
                          href={clip.videoUrl}
                          download
                          className="w-full py-2.5 px-3 rounded-xl text-xs font-semibold bg-blue-600 hover:bg-blue-500 text-white flex items-center justify-center gap-2 transition-all shadow-md shadow-blue-600/20 active:scale-[0.98]"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Download 1080p Clip</span>
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
