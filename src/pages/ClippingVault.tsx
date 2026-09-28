import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Lock, LogOut, Download, Copy, Check, Play, Pause, 
  Volume2, VolumeX, SkipForward, SkipBack, Music, 
  Cloud, Sparkles, Shield, User, Smartphone, Eye, ExternalLink
} from "lucide-react";

// User Credentials
const USERS: Record<string, { pass: string; name: string; role: string; badge: string }> = {
  ceo: {
    pass: "ceo_Wqe9LHp9RMnNrWRN",
    name: "CEO Executive",
    role: "Lead Strategist",
    badge: "CEO SUITE"
  },
  habeeb: {
    pass: "hab_gy#Xg9337gMKHsCk",
    name: "Habeeb Operations",
    role: "Senior Growth Clipper",
    badge: "HABEEB VAULT"
  }
};

// Hustle & Wealth Playlist with Synced Lyrics
const PLAYLIST = [
  {
    id: "tml_koko",
    title: "KOKO (Slowed & Reverb)",
    artist: "TML Vibez",
    theme: "Grace, Wealth & Relentless Hustle",
    duration: 180,
    lyrics: [
      { time: 0, text: "🎵 (Slowed & Reverb - TML Vibez) Grace & Paper Chasing..." },
      { time: 6, text: "Ori mi tete gbe mi debi ire, make my hustle pay double" },
      { time: 14, text: "Every day and night, we dey pursue the bag non-stop" },
      { time: 22, text: "Koko na money, no time for bad energy or distraction" },
      { time: 30, text: "Oluwa cover me, poverty must never locate our address" },
      { time: 40, text: "Steady on the grind, ten toes down till the bag is secured" },
      { time: 50, text: "From zero to billions, grace is speaking for the true believers" },
      { time: 65, text: "Keep moving, keep winning, we celebrate together at the peak" }
    ]
  },
  {
    id: "seyi_billion",
    title: "Billion Dollar Hustle",
    artist: "Seyi Vibez",
    theme: "Street Ambition & Multi-Million Glory",
    duration: 195,
    lyrics: [
      { time: 0, text: "🎵 Loseyi! Para mode activated for the bread..." },
      { time: 7, text: "Billion dollar dream, nobody can block what God has signed" },
      { time: 15, text: "Waking up before sunrise, putting in the work silently" },
      { time: 25, text: "Ehn ehn, won fe ko bo, but our engine is built for distance" },
      { time: 35, text: "Owo nla la fe ri, wire transfers and generational wealth" },
      { time: 48, text: "I say keep the focus sharp, let your results make the noise" },
      { time: 60, text: "Never stop believing, the global glory is already manifest" }
    ]
  },
  {
    id: "bella_wealth",
    title: "Cash Out & Elevate",
    artist: "Bella Shmurda",
    theme: "Youth Hustle, Elevation & Prosperity",
    duration: 170,
    lyrics: [
      { time: 0, text: "🎵 Bella Shmurda! Born for greatness, no looking back..." },
      { time: 8, text: "No sleep, no slacking, we run this marathon to the finish line" },
      { time: 18, text: "Every small step today is a giant empire tomorrow" },
      { time: 28, text: "Cash out legit, bless the family, change the whole story" },
      { time: 38, text: "Protect your peace, protect your focus, elevate higher" },
      { time: 50, text: "Success is the only option, failure is not on the menu" }
    ]
  },
  {
    id: "wizkid_blessed",
    title: "Blessed & Favored",
    artist: "Wizkid",
    theme: "Peace of Mind, Global Wealth & Longevity",
    duration: 210,
    lyrics: [
      { time: 0, text: "🎵 Big Wiz vibes... living life on God's frequency..." },
      { time: 9, text: "Say I pray for everybody, may your pockets never run dry" },
      { time: 19, text: "Steady stacking the wins, living life with pure peace of mind" },
      { time: 30, text: "Cold world outside, but we stay warm in favor and grace" },
      { time: 42, text: "Generational wealth in motion, worldwide respect and power" },
      { time: 55, text: "Grace is plenty, hustle is pure, victory is guaranteed" }
    ]
  }
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
}

const CEO_CAMPAIGNS = [
  {
    campaignId: "finddmo",
    campaignName: "Finddmo Twitch Stream (YouTube Shorts & TikTok)",
    status: "100% Brand Safe & Monitored",
    payout: "$750 - $1,000 / 1M Views",
    targetUser: "ceo",
    clips: [
      {
        id: "finddmo_1",
        title: "Finddmo Doing Anything For The Win 😂",
        duration: "30s",
        quality: "1080p 60fps HD",
        videoUrl: "/video/finddmo/finddmo_clip1_comedy_king.mp4",
        caption: "Finddmo's comedic timing during creator games is undefeated 😂 The energy on his streams is unmatched! Watch him live on Twitch: twitch.tv/finddmo #finddmo #twitch #streamer #creatorgame #basketball #twitchclips #shorts",
        soundName: "Original Stream Audio (1.0x Natural)",
        payoutRate: "$850 / 1M Views"
      },
      {
        id: "finddmo_2",
        title: "Finddmo Comedic Timing (MIB Skit) 🕶️",
        duration: "24s",
        quality: "1080p 60fps HD",
        videoUrl: "/video/finddmo/finddmo_clip2_mib_skit.mp4",
        caption: "Finddmo is hands down one of the most entertaining streamers on Twitch 😭 His live skits never miss! Catch the full streams live at twitch.tv/finddmo #finddmo #twitchstreamer #funnyclips #streamhighlights #shorts",
        soundName: "Original Stream Audio (1.0x Natural)",
        payoutRate: "$850 / 1M Views"
      },
      {
        id: "finddmo_3",
        title: "Finddmo Meets 6ft 5 Supporter In Public 🤝",
        duration: "21s",
        quality: "1080p 60fps HD",
        videoUrl: "/video/finddmo/finddmo_clip3_fan_interaction.mp4",
        caption: "Finddmo genuinely has the best community and fan interactions on IRL streams ✨ Always showing love to his supporters! Follow him live on Twitch: twitch.tv/finddmo #finddmo #irlstream #twitchmoments #viral #shorts",
        soundName: "Original Stream Audio (1.0x Natural)",
        payoutRate: "$850 / 1M Views"
      },
      {
        id: "finddmo_4",
        title: "Finddmo Clutch Play For The Win 🏀🔥",
        duration: "13s",
        quality: "1080p 60fps HD",
        videoUrl: "/video/finddmo/finddmo_clip4_clutch_winner.mp4",
        caption: "Finddmo clutched up when it mattered most 👏 That court vision was insane! Watch his live streams on Twitch: twitch.tv/finddmo #finddmo #clutch #basketball #twitchstreamer #sports #shorts",
        soundName: "Original Stream Audio (1.0x Natural)",
        payoutRate: "$850 / 1M Views"
      },
      {
        id: "finddmo_5",
        title: "Finddmo The Ultimate Entertainer ✨",
        duration: "21s",
        quality: "1080p 60fps HD",
        videoUrl: "/video/finddmo/finddmo_clip5_creator_showman.mp4",
        caption: "Finddmo always knows how to keep the crowd laughing during creator events 👏 Follow Finddmo on Twitch for daily live streams: twitch.tv/finddmo #finddmo #twitchstream #comedy #streamhighlights #shorts",
        soundName: "Original Stream Audio (1.0x Natural)",
        payoutRate: "$850 / 1M Views"
      }
    ]
  },
  {
    campaignId: "rodwave",
    campaignName: "Rod Wave - Don't Look Down Arena Tour",
    status: "Active Payout Window",
    payout: "$750 - $1,000 / 1M Views",
    targetUser: "ceo",
    clips: [
      {
        id: "rodwave_1",
        title: "Arena Energy & Crowd Singalong 🕊️",
        duration: "18s",
        quality: "1080p 60fps HD",
        videoUrl: "/video/rodwave/rodwave_clip1_arena_energy.mp4",
        caption: "Rod Wave Don’t Look Down Tour is about to be the best night of the year 🕊️ Who got their tickets already? #rodwave #dontlookdowntour #tour",
        soundName: "Concert Mic Live Audio (1.0x)",
        payoutRate: "$1,000 / 1M Views"
      },
      {
        id: "rodwave_2",
        title: "The Tour You Can Not Miss 🔥",
        duration: "19s",
        quality: "1080p 60fps HD",
        videoUrl: "/video/rodwave/rodwave_clip2_cant_miss_tour.mp4",
        caption: "Rod Wave Don’t Look Down Tour is the one show I am not missing this year 🔥 That energy is unmatched! #rodwave #dontlookdowntour",
        soundName: "Concert Mic Live Audio (1.0x)",
        payoutRate: "$1,000 / 1M Views"
      }
    ]
  }
];

const HABEEB_CAMPAIGNS = [
  {
    campaignId: "jonas",
    campaignName: "Jonas Brothers - Burning Up Tour (MSG)",
    status: "Exclusive Habeeb Campaign (Zero Collisions)",
    payout: "$750 - $1,000 / 1M Views",
    targetUser: "habeeb",
    clips: [
      {
        id: "jonas_1",
        title: "Nick Jonas 'Burnin Up' High Note Climax 🔥",
        duration: "18s",
        quality: "1080p / 4K Clean Master",
        videoUrl: "/video/jonas/jonas_clip1_burnin_up_energy.mp4",
        caption: "Nick Jonas hitting this note at Madison Square Garden had the whole arena screaming 🔥 Burnin’ Up live never gets old #jonasbrothers #burninup #nickjonas #msg #concert",
        soundName: "Pure Arena Master (1.0x Natural)",
        payoutRate: "$1,000 / 1M Views"
      },
      {
        id: "jonas_2",
        title: "Madison Square Garden Opening Intro Hype 🏟️",
        duration: "18s",
        quality: "1080p / 4K Clean Master",
        videoUrl: "/video/jonas/jonas_clip2_opening_hype.mp4",
        caption: "MSG was completely packed for the Jonas Brothers 😭 That energy was unreal! Who went to this tour? #jonasbrothers #joejonas #livemusic #tour #msg",
        soundName: "Pure Arena Master (1.0x Natural)",
        payoutRate: "$1,000 / 1M Views"
      },
      {
        id: "jonas_3",
        title: "S.O.S. Live Nostalgia in 2026 ❤️",
        duration: "17s",
        quality: "1080p / 4K Clean Master",
        videoUrl: "/video/jonas/jonas_clip3_sos_throwback.mp4",
        caption: "Hearing S.O.S. live in 2026 just hits completely different ❤️ Pure nostalgia #jonasbrothers #sos #burninguptour #concertvibes",
        soundName: "Pure Arena Master (1.0x Natural)",
        payoutRate: "$1,000 / 1M Views"
      },
      {
        id: "jonas_4",
        title: "Joe Jonas Stage Charisma & Energy ⚡",
        duration: "19s",
        quality: "1080p / 4K Clean Master",
        videoUrl: "/video/jonas/jonas_clip4_joe_jonas_charisma.mp4",
        caption: "Joe Jonas has stage presence like nobody else 👏 Madison Square Garden was shaking! #jonasbrothers #joejonas #concertlife #tour",
        soundName: "Pure Arena Master (1.0x Natural)",
        payoutRate: "$1,000 / 1M Views"
      },
      {
        id: "jonas_5",
        title: "20,000 Fans Screaming Every Word ✨",
        duration: "20s",
        quality: "1080p / 4K Clean Master",
        videoUrl: "/video/jonas/jonas_clip5_arena_singalong.mp4",
        caption: "When the whole arena takes over the chorus… nothing beats live music with the Jonas Brothers ✨ #jonasbrothers #liveperformance #singalong #msg",
        soundName: "Pure Arena Master (1.0x Natural)",
        payoutRate: "$1,000 / 1M Views"
      }
    ]
  },
  {
    campaignId: "hellraiser",
    campaignName: "Hellraiser Revival - October Horror Event",
    status: "Verified Monetization Ready",
    payout: "$750 / 1M Views",
    targetUser: "habeeb",
    clips: [
      {
        id: "hellraiser_1",
        title: "Chatterer Jumpscare & Hallway Chase 💀",
        duration: "14s",
        quality: "1080p 60fps HD",
        videoUrl: "/video/hellraiser/clip1_chatterer_jumpscare.mp4",
        caption: "The Chatterer in Hellraiser Revival is genuinely terrifying 💀 October 8 cannot come sooner #hellraiserrevival #horrormovie #scaryclips #shorts",
        soundName: "Original Cinematic Audio (1.0x)",
        payoutRate: "$750 / 1M Views"
      },
      {
        id: "hellraiser_2",
        title: "Doorway Chase - Don't Look Back 🚪",
        duration: "13s",
        quality: "1080p 60fps HD",
        videoUrl: "/video/hellraiser/clip2_dont_look_back.mp4",
        caption: "Bro thought he was safe behind that door 😭 Clive Barker is back making real horror #hellraiserrevival #horror #jumpscare",
        soundName: "Original Cinematic Audio (1.0x)",
        payoutRate: "$750 / 1M Views"
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

  const [trackIndex, setTrackIndex] = useState(() => {
    const saved = localStorage.getItem("clipping_music_track");
    return saved ? parseInt(saved, 10) : 0;
  });
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackTime, setPlaybackTime] = useState(() => {
    const saved = localStorage.getItem("clipping_music_pos");
    return saved ? parseFloat(saved) : 0;
  });
  const [isMuted, setIsMuted] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  useEffect(() => {
    localStorage.setItem("clipping_music_track", trackIndex.toString());
  }, [trackIndex]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (isPlaying) {
        setPlaybackTime(prev => {
          const currentTrack = PLAYLIST[trackIndex];
          const nextTime = (prev + 1) % currentTrack.duration;
          localStorage.setItem("clipping_music_pos", nextTime.toString());
          return nextTime;
        });
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isPlaying, trackIndex]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    const user = usernameInput.trim().toLowerCase();
    const pass = passwordInput.trim();

    if (USERS[user] && USERS[user].pass === pass) {
      setCurrentUser(user);
      localStorage.setItem("clipping_auth_user", user);
      setAuthError("");
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

  const currentTrack = PLAYLIST[trackIndex];
  const activeLyric = [...currentTrack.lyrics]
    .reverse()
    .find(l => playbackTime >= l.time) || currentTrack.lyrics[0];

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-[#07080c] text-white flex flex-col justify-center items-center p-4 selection:bg-[#00f0ff]/20">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="w-full max-w-md bg-[#0d0f17]/90 border border-white/10 rounded-2xl p-8 backdrop-blur-2xl shadow-2xl shadow-black/80"
        >
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-white/5 border border-white/10 mb-6 mx-auto">
            <Lock className="w-6 h-6 text-[#00f0ff]" />
          </div>

          <h1 className="text-xl font-bold text-center tracking-tight text-white mb-1">
            Affiliate Growth Vault
          </h1>
          <p className="text-xs text-center text-neutral-400 mb-6">
            Private Multi-User Clipping & Monetization Portal
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
                className="w-full bg-[#141724] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#00f0ff] transition-all"
                required
              />
            </div>

            <div>
              <label className="text-[11px] font-semibold tracking-wider uppercase text-neutral-400 mb-1.5 block">
                Encrypted Passcode
              </label>
              <input
                type="password"
                value={passwordInput}
                onChange={e => setPasswordInput(e.target.value)}
                placeholder="Enter unguessable key"
                className="w-full bg-[#141724] border border-white/10 rounded-xl px-4 py-3 text-sm text-white placeholder-neutral-500 focus:outline-none focus:border-[#00f0ff] transition-all"
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
              className="w-full bg-white text-black font-bold py-3.5 px-4 rounded-xl text-sm hover:bg-[#00f0ff] hover:text-black transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
            >
              <Shield className="w-4 h-4" />
              Authorize Secure Session
            </button>
          </form>

          <div className="mt-6 pt-6 border-t border-white/5 flex items-center justify-between text-[11px] text-neutral-500">
            <span>Encrypted Node v2.0</span>
            <span className="flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Vault Online
            </span>
          </div>
        </motion.div>
      </div>
    );
  }

  const activeUserData = USERS[currentUser] || USERS.ceo;
  const campaigns = currentUser === "habeeb" ? HABEEB_CAMPAIGNS : CEO_CAMPAIGNS;

  return (
    <div className="min-h-screen bg-[#07080c] text-white selection:bg-[#00f0ff]/20 pb-44">
      {/* Top Glassmorphic Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#07080c]/80 backdrop-blur-xl border-b border-white/5 px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center">
              <Sparkles className="w-4 h-4 text-[#00f0ff]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm sm:text-base tracking-tight text-white">
                  String Clipping Vault
                </span>
                <span className="text-[10px] uppercase font-mono tracking-wider px-2 py-0.5 rounded-full bg-[#00f0ff]/10 text-[#00f0ff] border border-[#00f0ff]/20">
                  {activeUserData.badge}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">
                Logged in as <strong className="text-white">{activeUserData.name}</strong> • 100% Brand Safe
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex items-center gap-2 bg-[#141724] border border-white/10 px-3 py-1.5 rounded-xl text-xs text-neutral-300">
              <Cloud className="w-3.5 h-3.5 text-emerald-400" />
              <span>4.4 TB Cloud Mirror: Active</span>
            </div>
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 bg-white/5 hover:bg-white/10 border border-white/10 px-3 py-1.5 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Campaign Bento Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-6 space-y-10">
        {/* Campaign Info Banner */}
        <section className="bg-gradient-to-r from-[#141724] via-[#0d0f17] to-[#141724] border border-white/10 rounded-2xl p-5 sm:p-6 relative overflow-hidden">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xs font-mono text-[#00f0ff] uppercase tracking-wider">
                  Target Account: {currentUser.toUpperCase()}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                <span className="text-xs text-neutral-400">No Cross-User Collisions</span>
              </div>
              <h2 className="text-lg sm:text-2xl font-bold tracking-tight text-white">
                {currentUser === "habeeb" ? "Jonas Brothers MSG & Revival Queue" : "Finddmo Twitch & Arena Tour Queue"}
              </h2>
              <p className="text-xs sm:text-sm text-neutral-400 mt-1 max-w-2xl">
                All clips are rendered with natural 1.0x master creator audio (zero pitch manipulation). Download straight to mobile camera roll and paste the certified viral hook captions.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-black/40 border border-white/10 px-4 py-2.5 rounded-xl">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block">Average Payout</span>
                <span className="text-base font-bold text-emerald-400">$750 - $1,000 / 1M</span>
              </div>
            </div>
          </div>
        </section>

        {/* Campaign Sections */}
        {campaigns.map((camp) => (
          <section key={camp.campaignId} className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-white/5">
              <div>
                <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                  <span>{camp.campaignName}</span>
                </h3>
                <p className="text-xs text-neutral-400">{camp.status} • Standard Clipper Payout: {camp.payout}</p>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded-lg bg-white/5 text-neutral-300 border border-white/10">
                {camp.clips.length} Vertical Clips
              </span>
            </div>

            {/* Industrial BentoGrid of Video Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {camp.clips.map((clip) => (
                <div
                  key={clip.id}
                  className="group bg-[#0d0f17] border border-white/10 rounded-2xl overflow-hidden flex flex-col hover:border-white/20 transition-all duration-300 shadow-xl shadow-black/40"
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
                      <span className="text-[10px] font-mono font-bold bg-black/70 backdrop-blur-md text-[#00f0ff] border border-white/10 px-2 py-0.5 rounded-md">
                        {clip.quality}
                      </span>
                    </div>
                    <div className="absolute top-2.5 right-2.5 pointer-events-none">
                      <span className="text-[10px] font-mono font-bold bg-black/70 backdrop-blur-md text-white border border-white/10 px-2 py-0.5 rounded-md">
                        {clip.duration}
                      </span>
                    </div>
                  </div>

                  {/* Card Content & Actions */}
                  <div className="p-4 flex flex-col flex-1 gap-3">
                    <div>
                      <h4 className="font-bold text-sm text-white line-clamp-1 group-hover:text-[#00f0ff] transition-colors">
                        {clip.title}
                      </h4>
                      <p className="text-[11px] text-neutral-400 mt-0.5">
                        Audio: {clip.soundName}
                      </p>
                    </div>

                    {/* Pre-packaged Viral Caption */}
                    <div className="bg-[#141724]/90 border border-white/5 rounded-xl p-3 text-xs text-neutral-300 line-clamp-3 leading-relaxed font-sans select-all">
                      {clip.caption}
                    </div>

                    {/* Action Buttons */}
                    <div className="mt-auto pt-2 space-y-2">
                      <button
                        onClick={() => handleCopyCaption(clip)}
                        className={`w-full py-2.5 px-3 rounded-xl text-xs font-bold flex items-center justify-center gap-2 border transition-all ${
                          copiedId === clip.id
                            ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                            : "bg-white/5 hover:bg-white/10 text-white border-white/10 active:scale-[0.98]"
                        }`}
                      >
                        {copiedId === clip.id ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span>Caption Copied!</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5 text-neutral-400" />
                            <span>Copy Caption & Hashtags</span>
                          </>
                        )}
                      </button>

                      <a
                        href={clip.videoUrl}
                        download
                        className="w-full py-2.5 px-3 rounded-xl text-xs font-bold bg-white text-black hover:bg-[#00f0ff] hover:text-black flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
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
        ))}
      </main>

      {/* Floating Afrobeats Hustle Player Dock */}
      <aside className="fixed bottom-4 left-4 right-4 max-w-4xl mx-auto z-50">
        <div className="bg-[#0d0f17]/95 border border-white/15 rounded-2xl p-3.5 backdrop-blur-2xl shadow-2xl shadow-black/90 flex flex-col gap-2.5">
          {/* Live Synced Lyrics Ticker */}
          <div className="flex items-center gap-2 bg-[#141724]/90 border border-white/5 px-3 py-1.5 rounded-xl text-xs overflow-hidden">
            <span className="flex items-center gap-1 text-[11px] font-mono text-[#00f0ff] font-bold uppercase shrink-0">
              <span className="w-1.5 h-1.5 rounded-full bg-[#00f0ff] animate-ping"></span>
              Hustle Lyrics:
            </span>
            <span className="text-neutral-200 truncate italic font-medium">
              "{activeLyric.text}"
            </span>
          </div>

          {/* Controls Bar */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-9 h-9 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center shrink-0">
                <Music className="w-4 h-4 text-[#00f0ff]" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-white truncate">
                  {currentTrack.title}
                </p>
                <p className="text-[10px] text-neutral-400 truncate">
                  {currentTrack.artist} • {currentTrack.theme}
                </p>
              </div>
            </div>

            {/* Media Controls */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => {
                  setTrackIndex(prev => (prev - 1 + PLAYLIST.length) % PLAYLIST.length);
                  setPlaybackTime(0);
                }}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-neutral-300"
                title="Previous Track"
              >
                <SkipBack className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="w-9 h-9 rounded-xl bg-white text-black hover:bg-[#00f0ff] flex items-center justify-center font-bold transition-all"
                title={isPlaying ? "Pause Hustle Track" : "Play Hustle Track"}
              >
                {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4 fill-current ml-0.5" />}
              </button>

              <button
                onClick={() => {
                  setTrackIndex(prev => (prev + 1) % PLAYLIST.length);
                  setPlaybackTime(0);
                }}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-neutral-300"
                title="Next Track"
              >
                <SkipForward className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => setIsMuted(!isMuted)}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-white/10 flex items-center justify-center text-neutral-300"
              >
                {isMuted ? <VolumeX className="w-3.5 h-3.5 text-neutral-500" /> : <Volume2 className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </aside>
    </div>
  );
}
