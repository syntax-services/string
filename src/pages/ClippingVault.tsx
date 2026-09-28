import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { 
  Lock, LogOut, Download, Copy, Check, 
  Shield, ExternalLink, Cloud
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
    badge: "HABEEB OPERATIONS"
  }
};

// Curated Hustle Tracks for Dual-Deck Crossfade Engine
const HUSTLE_TRACKS = [
  "/audio/koko_slowed_hustle.mp3",
  "/audio/wells_fargo_hustle.mp3",
  "/audio/seyi_billion_hustle.mp3",
  "/audio/seyi_chance_hustle.mp3"
];

const TARGET_VOLUME = 0.5; // Natural 50% grind volume
const CROSSFADE_TIME = 3.5; // 3.5s smooth overlap

export default function ClippingVault() {
  const [currentUser, setCurrentUser] = useState<string>(() => {
    return localStorage.getItem("clipping_user") || "";
  });
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");
  const [copied, setCopied] = useState(false);

  // Dual-Deck Crossfade References
  const deckARef = useRef<HTMLAudioElement | null>(null);
  const deckBRef = useRef<HTMLAudioElement | null>(null);
  const activeDeckRef = useRef<"A" | "B">("A");
  const isTransitioningRef = useRef(false);
  const trackIndexRef = useRef(0);

  useEffect(() => {
    if (!currentUser) return;

    const deckA = deckARef.current;
    const deckB = deckBRef.current;
    if (!deckA || !deckB) return;

    // Initialize Deck A
    deckA.src = HUSTLE_TRACKS[trackIndexRef.current];
    deckA.volume = 0;
    activeDeckRef.current = "A";

    // Smooth Initial Fade In
    deckA.play().then(() => {
      let v = 0;
      const fadeInInterval = setInterval(() => {
        v += 0.05;
        if (v >= TARGET_VOLUME) {
          deckA.volume = TARGET_VOLUME;
          clearInterval(fadeInInterval);
        } else {
          deckA.volume = v;
        }
      }, 70);
    }).catch(() => {
      const onUserGesture = () => {
        deckA.play().catch(() => {});
        window.removeEventListener("click", onUserGesture);
        window.removeEventListener("touchstart", onUserGesture);
      };
      window.addEventListener("click", onUserGesture);
      window.addEventListener("touchstart", onUserGesture);
    });

    const triggerCrossfade = () => {
      if (isTransitioningRef.current) return;
      isTransitioningRef.current = true;

      const activeEl = activeDeckRef.current === "A" ? deckA : deckB;
      const idleEl = activeDeckRef.current === "A" ? deckB : deckA;

      trackIndexRef.current = (trackIndexRef.current + 1) % HUSTLE_TRACKS.length;
      idleEl.src = HUSTLE_TRACKS[trackIndexRef.current];
      idleEl.currentTime = 0; // ALWAYS resets cleanly to 0
      idleEl.volume = 0;

      idleEl.play().then(() => {
        const steps = 30;
        const intervalTime = (CROSSFADE_TIME * 1000) / steps;
        let step = 0;

        const crossfadeInterval = setInterval(() => {
          step++;
          const progress = step / steps;

          // Outgoing fades down, incoming fades up
          activeEl.volume = Math.max(0, TARGET_VOLUME * (1 - progress));
          idleEl.volume = Math.min(TARGET_VOLUME, TARGET_VOLUME * progress);

          if (step >= steps) {
            clearInterval(crossfadeInterval);
            activeEl.pause();
            activeEl.currentTime = 0;
            activeEl.volume = 0;
            idleEl.volume = TARGET_VOLUME;

            activeDeckRef.current = activeDeckRef.current === "A" ? "B" : "A";
            isTransitioningRef.current = false;
          }
        }, intervalTime);
      }).catch(() => {
        isTransitioningRef.current = false;
      });
    };

    const handleTimeUpdate = (e: Event) => {
      const el = e.target as HTMLAudioElement;
      const currentActive = activeDeckRef.current === "A" ? deckA : deckB;
      if (el !== currentActive || isTransitioningRef.current) return;
      if (!el.duration || isNaN(el.duration)) return;

      if (el.currentTime >= (el.duration - CROSSFADE_TIME)) {
        triggerCrossfade();
      }
    };

    const handleEnded = () => {
      if (!isTransitioningRef.current) {
        triggerCrossfade();
      }
    };

    deckA.addEventListener("timeupdate", handleTimeUpdate);
    deckB.addEventListener("timeupdate", handleTimeUpdate);
    deckA.addEventListener("ended", handleEnded);
    deckB.addEventListener("ended", handleEnded);

    // Auto-pause when leaving tab/window, Auto-resume when coming back
    const handleVisibility = () => {
      const activeEl = activeDeckRef.current === "A" ? deckA : deckB;
      const idleEl = activeDeckRef.current === "A" ? deckB : deckA;

      if (document.hidden) {
        activeEl.pause();
        if (isTransitioningRef.current) idleEl.pause();
      } else {
        activeEl.play().catch(() => {});
        if (isTransitioningRef.current) idleEl.play().catch(() => {});
      }
    };

    const handleBlur = () => {
      const activeEl = activeDeckRef.current === "A" ? deckA : deckB;
      const idleEl = activeDeckRef.current === "A" ? deckB : deckA;
      activeEl.pause();
      if (isTransitioningRef.current) idleEl.pause();
    };

    const handleFocus = () => {
      const activeEl = activeDeckRef.current === "A" ? deckA : deckB;
      const idleEl = activeDeckRef.current === "A" ? deckB : deckA;
      activeEl.play().catch(() => {});
      if (isTransitioningRef.current) idleEl.play().catch(() => {});
    };

    document.addEventListener("visibilitychange", handleVisibility);
    window.addEventListener("blur", handleBlur);
    window.addEventListener("focus", handleFocus);

    return () => {
      deckA.removeEventListener("timeupdate", handleTimeUpdate);
      deckB.removeEventListener("timeupdate", handleTimeUpdate);
      deckA.removeEventListener("ended", handleEnded);
      deckB.removeEventListener("ended", handleEnded);
      document.removeEventListener("visibilitychange", handleVisibility);
      window.removeEventListener("blur", handleBlur);
      window.removeEventListener("focus", handleFocus);
    };
  }, [currentUser]);

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
    if (deckARef.current) deckARef.current.pause();
    if (deckBRef.current) deckBRef.current.pause();
    localStorage.removeItem("clipping_user");
    setCurrentUser("");
  };

  const sampleData = currentUser === "habeeb" ? {
    title: "Habeeb Operations Sample Video (Verification Loop)",
    file: "/samples/sample_video_habeeb.mp4",
    duration: "10s Seamless Loop",
    quality: "1080p 60fps HD Master",
    soundName: "1.0x Natural Audio",
    caption: "String Clipping Vault Sample Video for Habeeb Operations ⚡ #shorts\\n\\nVerified 10s loop clip ready for cloud sync testing.\\n\\n#string #clipping #habeeb #growth #shorts",
    loopNote: "Clean 10s loop boundary configured for APV verification"
  } : {
    title: "CEO Suite Sample Video (Verification Loop)",
    file: "/samples/sample_video_ceo.mp4",
    duration: "10s Seamless Loop",
    quality: "1080p 60fps HD Master",
    soundName: "1.0x Natural Audio",
    caption: "String Clipping Vault Sample Video for CEO Suite 🔥 #shorts\\n\\nVerified 10s loop clip ready for cloud sync testing.\\n\\n#string #clipping #ceo #monetization #shorts",
    loopNote: "Clean 10s loop boundary configured for APV verification"
  };

  const copyCaption = () => {
    navigator.clipboard.writeText(sampleData.caption);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
            Active Sample Verification & Crossfade Audio
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
        </motion.div>
      </div>
    );
  }

  const activeUserData = USERS[currentUser] || USERS.ceo;

  return (
    <div className="min-h-screen bg-[#0a0d14] text-white selection:bg-blue-600/30 pb-20">
      {/* Hidden Dual-Deck Hustle Audio Engine (Zero Mute/Controls - Pure Grind) */}
      <audio ref={deckARef} preload="auto" />
      <audio ref={deckBRef} preload="auto" />

      {/* String Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#0a0d14]/90 backdrop-blur-xl border-b border-[#1b2234] px-4 sm:px-8 py-3.5">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center font-bold text-blue-400">
              S
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
                Logged in as <strong className="text-white">{activeUserData.name}</strong> • PC: DESKTOP-1EVMQUD
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 bg-[#141926] hover:bg-[#1b2234] border border-[#1b2234] px-3.5 py-1.5 rounded-xl text-xs font-semibold text-neutral-300 hover:text-white transition-all"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Exit</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-8 pt-8 space-y-8">
        
        {/* Header Info */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-white">Sample Video Verification</h1>
            <p className="text-xs text-neutral-400 mt-1">
              Ended campaigns removed • Sample video ready for Google Drive public link sync
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-xs font-mono font-semibold px-3 py-1.5 rounded-lg">
              DESKTOP-1EVMQUD
            </span>
            <span className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-mono font-semibold px-3 py-1.5 rounded-lg">
              Crossfade Active
            </span>
          </div>
        </div>

        {/* Google Drive Link Instruction Card */}
        <section className="bg-gradient-to-r from-blue-950/20 to-emerald-950/20 border border-[#1e293b] rounded-2xl p-6">
          <div className="flex items-center gap-2 text-sm font-bold text-sky-400 mb-2">
            <Cloud className="w-4 h-4" />
            <span>Google Drive Public Folder & Video Linking</span>
          </div>
          <p className="text-xs text-neutral-400 leading-relaxed max-w-3xl mb-4">
            This machine is listed as <strong className="text-white">DESKTOP-1EVMQUD</strong> on Google Drive. 
            Once you open Google Drive on web or desktop, locate the folder or sample video, right-click &gt; <em>Share</em> &gt; set to <em>Anyone with the link</em> &gt; <em>Copy link</em>, and paste it to the assistant to bind it directly here.
          </p>
          <a
            href="https://drive.google.com/drive/u/0/my-drive"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-2 bg-[#141926] hover:bg-[#1b2234] border border-[#1e293b] text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all"
          >
            <span>Open Google Drive (DESKTOP-1EVMQUD)</span>
            <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
          </a>
        </section>

        {/* Sample Profile Video Card */}
        <section className="bg-[#10141e] border border-[#1b2234] rounded-2xl p-6 shadow-xl space-y-6">
          <div className="flex items-center justify-between border-b border-[#1b2234] pb-4">
            <div>
              <h2 className="text-lg font-bold text-white">{sampleData.title}</h2>
              <p className="text-xs text-neutral-400">{sampleData.quality} • {sampleData.duration}</p>
            </div>
            <span className="text-[11px] font-bold px-3 py-1 rounded-md bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              READY FOR LINKING
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
            {/* Video Player */}
            <div className="relative aspect-[9/16] max-h-[360px] bg-black rounded-xl overflow-hidden mx-auto w-full flex items-center justify-center border border-[#1b2234]">
              <video 
                src={sampleData.file}
                controls
                loop
                playsInline
                preload="metadata"
                className="w-full h-full object-contain"
              />
            </div>

            {/* Video Metadata & Actions */}
            <div className="space-y-4">
              <div className="bg-[#0a0d14] border border-[#1b2234] rounded-xl p-4">
                <span className="text-[10px] font-semibold tracking-wider uppercase text-blue-400 block mb-1">
                  Loop Architecture
                </span>
                <p className="text-xs text-neutral-300 font-mono">
                  {sampleData.loopNote}
                </p>
              </div>

              <div className="bg-[#0a0d14] border border-[#1b2234] rounded-xl p-4">
                <span className="text-[10px] font-semibold tracking-wider uppercase text-emerald-400 block mb-1">
                  Sample SEO Description
                </span>
                <p className="text-xs text-neutral-400 whitespace-pre-line font-sans leading-relaxed">
                  {sampleData.caption}
                </p>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  onClick={copyCaption}
                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-semibold py-3 px-4 rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20"
                >
                  {copied ? <Check className="w-4 h-4 text-emerald-300" /> : <Copy className="w-4 h-4" />}
                  <span>{copied ? "Caption Copied!" : "Copy Title & Caption"}</span>
                </button>

                <a
                  href={sampleData.file}
                  download
                  className="bg-[#141926] hover:bg-[#1b2234] border border-[#1b2234] text-neutral-300 hover:text-white font-semibold py-3 px-4 rounded-xl text-xs flex items-center gap-2 transition-all"
                >
                  <Download className="w-4 h-4" />
                  <span>Download</span>
                </a>
              </div>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}
