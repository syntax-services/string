import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Lock, LogOut, Download, Copy, Check, 
  Shield, Flame, Sparkles, Clock, AlertCircle, ArrowUpRight,
  Zap, Play, CheckCircle2
} from "lucide-react";

// User Credentials
const USERS: Record<string, { pass: string; name: string; role: string; badge: string }> = {
  ceo: {
    pass: "ceo_Wqe9LHp9RMnNrWRN",
    name: "CEO Executive",
    role: "Lead Strategist",
    badge: "CEO SUITE (SLOTS 1 & 2)"
  },
  habeeb: {
    pass: "hab_gy#Xg9337gMKHsCk",
    name: "Habeeb Operations",
    role: "Senior Growth Clipper",
    badge: "HABEEB VAULT (SLOTS 3 & 4)"
  },
  lilshey: {
    pass: "lil_9xK#v88Rzp22LM",
    name: "Lilshey Viral Suite",
    role: "Viral Content Specialist",
    badge: "LILSHEY SUITE (SLOTS 5 & 6)"
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

export interface CampaignClip {
  id: string;
  title: string;
  duration: string;
  quality: string;
  videoSrc: string; // Direct repository relative path e.g. /campaigns/campaign_name/clip1.mp4
  description: string; // Full YouTube video description with contextual summary and targeted hashtags
  hashtags?: string[]; // Optional tag array for quick keyword copying
  payoutRate: string;
  loopNote: string;
}

export interface CampaignSlot {
  campaignId: string;
  campaignName: string;
  category: string;
  status: string;
  payout: string;
  clips: CampaignClip[];
}

// 1:1 DEDICATED CAMPAIGN CONFIGURATION (Ready for incoming drop)
// When new clips arrive, simply drop the .mp4 files into public/campaigns/ and populate this array.
const CEO_CAMPAIGNS: CampaignSlot[] = [
  {
    campaignId: "ceo_tech_prologue",
    campaignName: "Channel 1: Tech Prologue (10 Shorts)",
    category: "Stage Architecture, Lasers & Drone Dynamics (Clipr Agency)",
    status: "Live & Active (Strict CEO Exclusive)",
    payout: "$3.50 / 1k Views ($175 Max)",
    clips: [
      {
        id: "tech_prologue_01",
        title: "Most Insane Production Ever 🤯 @zedsdead #shorts",
        duration: "0:14",
        quality: "1080x1920 (9:16 Vertical HD)",
        videoSrc: "/campaigns/tech_prologue/tech_prologue_01.mp4",
        description: "The production engineering behind Zeds Dead at Red Rocks is next level. That stage build is straight out of the year 3000! ⚡\\n\\n@zedsdead\\n\\n#ZedsDead #BassMusic #EDMFestival #Dubstep #FestivalSeason",
        hashtags: ["#ZedsDead","#BassMusic","#EDMFestival","#Dubstep","#FestivalSeason"],
        payoutRate: "$3.50 / 1k Views (Clipr Agency)",
        loopNote: "Engineered 14s loop with bold hook typography ('MOST INSANE PRODUCTION EVER') and seamless audio crossfade."
      },
      {
        id: "tech_prologue_02",
        title: "This Belongs On The Big Screen 🎥 @zedsdead #shorts",
        duration: "0:14",
        quality: "1080x1920 (9:16 Vertical HD)",
        videoSrc: "/campaigns/tech_prologue/tech_prologue_02.mp4",
        description: "Cinema-grade lighting and drone choreography at Red Rocks. Zeds Dead shows are a masterclass in visual design.\\n\\n@zedsdead\\n\\n#ZedsDead #BassMusic #EDMFestival #Dubstep #FestivalSeason",
        hashtags: ["#ZedsDead","#BassMusic","#EDMFestival","#Dubstep","#FestivalSeason"],
        payoutRate: "$3.50 / 1k Views (Clipr Agency)",
        loopNote: "Engineered 14s loop with bold hook typography ('THIS BELONGS ON THE BIG SCREEN') and seamless audio crossfade."
      },
      {
        id: "tech_prologue_03",
        title: "Stage Design From The Year 3000 🛸 @zedsdead #shorts",
        duration: "0:14",
        quality: "1080x1920 (9:16 Vertical HD)",
        videoSrc: "/campaigns/tech_prologue/tech_prologue_03.mp4",
        description: "The futuristic custom spaceship cockpit DJ booth built for Zeds Dead. Look at those control consoles! 🛰️\\n\\n@zedsdead\\n\\n#ZedsDead #BassMusic #EDMFestival #Dubstep #FestivalSeason",
        hashtags: ["#ZedsDead","#BassMusic","#EDMFestival","#Dubstep","#FestivalSeason"],
        payoutRate: "$3.50 / 1k Views (Clipr Agency)",
        loopNote: "Engineered 14s loop with bold hook typography ('STAGE DESIGN FROM YEAR 3000') and seamless audio crossfade."
      },
      {
        id: "tech_prologue_04",
        title: "Flame Cannons At 140 BPM 🔥 @zedsdead #shorts",
        duration: "0:14",
        quality: "1080x1920 (9:16 Vertical HD)",
        videoSrc: "/campaigns/tech_prologue/tech_prologue_04.mp4",
        description: "Every single pyrotechnic burst timed to milliseconds. The live audio engineering here is unbelievable.\\n\\n@zedsdead\\n\\n#ZedsDead #BassMusic #EDMFestival #Dubstep #FestivalSeason",
        hashtags: ["#ZedsDead","#BassMusic","#EDMFestival","#Dubstep","#FestivalSeason"],
        payoutRate: "$3.50 / 1k Views (Clipr Agency)",
        loopNote: "Engineered 14s loop with bold hook typography ('FLAME CANNONS AT 140 BPM') and seamless audio crossfade."
      },
      {
        id: "tech_prologue_05",
        title: "FPV Drone Flight Path Over 10,000 Fans 🚁 @zedsdead #shorts",
        duration: "0:14",
        quality: "1080x1920 (9:16 Vertical HD)",
        videoSrc: "/campaigns/tech_prologue/tech_prologue_05.mp4",
        description: "The precision needed to fly an FPV drone through concert lasers and over 10,000 screaming fans at Red Rocks! 🤯\\n\\n@zedsdead\\n\\n#ZedsDead #BassMusic #EDMFestival #Dubstep #FestivalSeason",
        hashtags: ["#ZedsDead","#BassMusic","#EDMFestival","#Dubstep","#FestivalSeason"],
        payoutRate: "$3.50 / 1k Views (Clipr Agency)",
        loopNote: "Engineered 14s loop with bold hook typography ('FPV DRONE FLIGHT PATH') and seamless audio crossfade."
      },
      {
        id: "tech_prologue_06",
        title: "Red Rocks Natural Acoustic Power 🗿 @zedsdead #shorts",
        duration: "0:14",
        quality: "1080x1920 (9:16 Vertical HD)",
        videoSrc: "/campaigns/tech_prologue/tech_prologue_06.mp4",
        description: "Bass bouncing off 300-million-year-old red sandstone monoliths. There is no venue on earth with acoustics like this.\\n\\n@zedsdead\\n\\n#ZedsDead #BassMusic #EDMFestival #Dubstep #FestivalSeason",
        hashtags: ["#ZedsDead","#BassMusic","#EDMFestival","#Dubstep","#FestivalSeason"],
        payoutRate: "$3.50 / 1k Views (Clipr Agency)",
        loopNote: "Engineered 14s loop with bold hook typography ('RED ROCKS ACOUSTIC TESTING') and seamless audio crossfade."
      },
      {
        id: "tech_prologue_07",
        title: "Sub-Bass Frequency Test 🔊 @zedsdead #shorts",
        duration: "0:14",
        quality: "1080x1920 (9:16 Vertical HD)",
        videoSrc: "/campaigns/tech_prologue/tech_prologue_07.mp4",
        description: "Listen to that sub-bass resonance. Turn your sound up to feel what 120,000 watts of PK Sound feels like! ⚡\\n\\n@zedsdead\\n\\n#ZedsDead #BassMusic #EDMFestival #Dubstep #FestivalSeason",
        hashtags: ["#ZedsDead","#BassMusic","#EDMFestival","#Dubstep","#FestivalSeason"],
        payoutRate: "$3.50 / 1k Views (Clipr Agency)",
        loopNote: "Engineered 14s loop with bold hook typography ('SUB-BASS FREQUENCY CHECK') and seamless audio crossfade."
      },
      {
        id: "tech_prologue_08",
        title: "360° Stage Orbit Visuals 🌐 @zedsdead #shorts",
        duration: "0:14",
        quality: "1080x1920 (9:16 Vertical HD)",
        videoSrc: "/campaigns/tech_prologue/tech_prologue_08.mp4",
        description: "A 360-degree sweep of the entire Dead Rocks stage setup. Look at how the LED floor syncs with the bassline!\\n\\n@zedsdead\\n\\n#ZedsDead #BassMusic #EDMFestival #Dubstep #FestivalSeason",
        hashtags: ["#ZedsDead","#BassMusic","#EDMFestival","#Dubstep","#FestivalSeason"],
        payoutRate: "$3.50 / 1k Views (Clipr Agency)",
        loopNote: "Engineered 14s loop with bold hook typography ('360° STAGE ORBIT') and seamless audio crossfade."
      },
      {
        id: "tech_prologue_09",
        title: "Next-Gen Concert Display Tech ⚡ @zedsdead #shorts",
        duration: "0:14",
        quality: "1080x1920 (9:16 Vertical HD)",
        videoSrc: "/campaigns/tech_prologue/tech_prologue_09.mp4",
        description: "The curved LED panoramic screens wrapping the amphitheater. The visuals make the amphitheater look like an alien spaceship!\\n\\n@zedsdead\\n\\n#ZedsDead #BassMusic #EDMFestival #Dubstep #FestivalSeason",
        hashtags: ["#ZedsDead","#BassMusic","#EDMFestival","#Dubstep","#FestivalSeason"],
        payoutRate: "$3.50 / 1k Views (Clipr Agency)",
        loopNote: "Engineered 14s loop with bold hook typography ('LED CURVATURE DISPLAY TECH') and seamless audio crossfade."
      },
      {
        id: "tech_prologue_10",
        title: "Zeds Dead Shows Are Pure Cinema 🎬 @zedsdead #shorts",
        duration: "0:14",
        quality: "1080x1920 (9:16 Vertical HD)",
        videoSrc: "/campaigns/tech_prologue/tech_prologue_10.mp4",
        description: "Combining cinema-grade live direction with cutting-edge bass music. Zeds Dead sets the industry benchmark.\\n\\n@zedsdead\\n\\n#ZedsDead #BassMusic #EDMFestival #Dubstep #FestivalSeason",
        hashtags: ["#ZedsDead","#BassMusic","#EDMFestival","#Dubstep","#FestivalSeason"],
        payoutRate: "$3.50 / 1k Views (Clipr Agency)",
        loopNote: "Engineered 14s loop with bold hook typography ('ZEDS DEAD SHOWS ARE CINEMA') and seamless audio crossfade."
      }
    ]
  },
  {
    campaignId: "ceo_viral_clips",
    campaignName: "Channel 2: Viral Clips (10 Shorts)",
    category: "Bass Drops, Crowd Energy & Viral FOMO (Clipr Agency)",
    status: "Live & Active (Strict CEO Exclusive)",
    payout: "$3.50 / 1k Views ($175 Max)",
    clips: [
      {
        id: "viral_clips_01",
        title: "Wait For The Drop... 🔥 @zedsdead #shorts",
        duration: "0:14",
        quality: "1080x1920 (9:16 Vertical HD)",
        videoSrc: "/campaigns/viral_clips/viral_clips_01.mp4",
        description: "What the h*ll did I just watch?! 🤯 Zeds Dead live at Red Rocks Amphitheatre was pure insanity. Wear headphones for that bass! 🔥\\n\\n@zedsdead\\n\\n#ZedsDead #BassMusic #EDMFestival #Dubstep #FestivalSeason",
        hashtags: ["#ZedsDead","#BassMusic","#EDMFestival","#Dubstep","#FestivalSeason"],
        payoutRate: "$3.50 / 1k Views (Clipr Agency)",
        loopNote: "Engineered 14s loop with bold hook typography ('WAIT FOR THE DROP...') and seamless audio crossfade."
      },
      {
        id: "viral_clips_02",
        title: "Look At This Crowd... 🤯 @zedsdead #shorts",
        duration: "0:14",
        quality: "1080x1920 (9:16 Vertical HD)",
        videoSrc: "/campaigns/viral_clips/viral_clips_02.mp4",
        description: "Red Rocks Amphitheatre was completely packed for Zeds Dead! The energy here is undefeated 🔥\\n\\n@zedsdead\\n\\n#ZedsDead #BassMusic #EDMFestival #Dubstep #FestivalSeason",
        hashtags: ["#ZedsDead","#BassMusic","#EDMFestival","#Dubstep","#FestivalSeason"],
        payoutRate: "$3.50 / 1k Views (Clipr Agency)",
        loopNote: "Engineered 14s loop with bold hook typography ('LOOK AT THIS CROWD...') and seamless audio crossfade."
      },
      {
        id: "viral_clips_03",
        title: "What The H*ll Am I Looking At?! 😱 @zedsdead #shorts",
        duration: "0:14",
        quality: "1080x1920 (9:16 Vertical HD)",
        videoSrc: "/campaigns/viral_clips/viral_clips_03.mp4",
        description: "10,000 people moving as one single wave under the lasers! Zeds Dead crowds are unmatched.\\n\\n@zedsdead\\n\\n#ZedsDead #BassMusic #EDMFestival #Dubstep #FestivalSeason",
        hashtags: ["#ZedsDead","#BassMusic","#EDMFestival","#Dubstep","#FestivalSeason"],
        payoutRate: "$3.50 / 1k Views (Clipr Agency)",
        loopNote: "Engineered 14s loop with bold hook typography ('WHAT THE H*LL AM I LOOKING AT') and seamless audio crossfade."
      },
      {
        id: "viral_clips_04",
        title: "The Bass Is About To Hit 🔊 @zedsdead #shorts",
        duration: "0:14",
        quality: "1080x1920 (9:16 Vertical HD)",
        videoSrc: "/campaigns/viral_clips/viral_clips_04.mp4",
        description: "Bass you can actually feel in your chest. Wear your best headphones and crank the volume up! 🎧\\n\\n@zedsdead\\n\\n#ZedsDead #BassMusic #EDMFestival #Dubstep #FestivalSeason",
        hashtags: ["#ZedsDead","#BassMusic","#EDMFestival","#Dubstep","#FestivalSeason"],
        payoutRate: "$3.50 / 1k Views (Clipr Agency)",
        loopNote: "Engineered 14s loop with bold hook typography ('THIS BASS IS ABOUT TO HIT') and seamless audio crossfade."
      },
      {
        id: "viral_clips_05",
        title: "POV: You Chose The Right Festival 🎪 @zedsdead #shorts",
        duration: "0:14",
        quality: "1080x1920 (9:16 Vertical HD)",
        videoSrc: "/campaigns/viral_clips/viral_clips_05.mp4",
        description: "When the bass drops and 10,000 people lose their minds together! Pure festival magic with Zeds Dead ✨\\n\\n@zedsdead\\n\\n#ZedsDead #BassMusic #EDMFestival #Dubstep #FestivalSeason",
        hashtags: ["#ZedsDead","#BassMusic","#EDMFestival","#Dubstep","#FestivalSeason"],
        payoutRate: "$3.50 / 1k Views (Clipr Agency)",
        loopNote: "Engineered 14s loop with bold hook typography ('POV: YOU CHOSE RIGHT FESTIVAL') and seamless audio crossfade."
      },
      {
        id: "viral_clips_06",
        title: "The Hardest Drop Of The Night 💀 @zedsdead #shorts",
        duration: "0:14",
        quality: "1080x1920 (9:16 Vertical HD)",
        videoSrc: "/campaigns/viral_clips/viral_clips_06.mp4",
        description: "Zeds Dead dropping absolute filth at Red Rocks. Hands down the heaviest drop of the entire weekend! 🔥\\n\\n@zedsdead\\n\\n#ZedsDead #BassMusic #EDMFestival #Dubstep #FestivalSeason",
        hashtags: ["#ZedsDead","#BassMusic","#EDMFestival","#Dubstep","#FestivalSeason"],
        payoutRate: "$3.50 / 1k Views (Clipr Agency)",
        loopNote: "Engineered 14s loop with bold hook typography ('HARDEST DROP OF THE NIGHT') and seamless audio crossfade."
      },
      {
        id: "viral_clips_07",
        title: "Everyone Was Waiting For This Drop ⏳ @zedsdead #shorts",
        duration: "0:14",
        quality: "1080x1920 (9:16 Vertical HD)",
        videoSrc: "/campaigns/viral_clips/viral_clips_07.mp4",
        description: "The tension in the crowd right before this drop was electric. Zeds Dead live is something else! ⚡\\n\\n@zedsdead\\n\\n#ZedsDead #BassMusic #EDMFestival #Dubstep #FestivalSeason",
        hashtags: ["#ZedsDead","#BassMusic","#EDMFestival","#Dubstep","#FestivalSeason"],
        payoutRate: "$3.50 / 1k Views (Clipr Agency)",
        loopNote: "Engineered 14s loop with bold hook typography ('EVERYONE WAS WAITING FOR THIS') and seamless audio crossfade."
      },
      {
        id: "viral_clips_08",
        title: "This Is Why People Love Zeds Dead ❤️ @zedsdead #shorts",
        duration: "0:14",
        quality: "1080x1920 (9:16 Vertical HD)",
        videoSrc: "/campaigns/viral_clips/viral_clips_08.mp4",
        description: "From 2009 to now, Zeds Dead continues to dominate festival mainstages across the globe. Kings of bass! 👑\\n\\n@zedsdead\\n\\n#ZedsDead #BassMusic #EDMFestival #Dubstep #FestivalSeason",
        hashtags: ["#ZedsDead","#BassMusic","#EDMFestival","#Dubstep","#FestivalSeason"],
        payoutRate: "$3.50 / 1k Views (Clipr Agency)",
        loopNote: "Engineered 14s loop with bold hook typography ('WHY PEOPLE LOVE ZEDS DEAD') and seamless audio crossfade."
      },
      {
        id: "viral_clips_09",
        title: "The Crowd Lost Their Entire Minds 🤯 @zedsdead #shorts",
        duration: "0:14",
        quality: "1080x1920 (9:16 Vertical HD)",
        videoSrc: "/campaigns/viral_clips/viral_clips_09.mp4",
        description: "When the pyro hits at the exact same second as the sub-bass! Dead Rocks was pure insanity 🔥\\n\\n@zedsdead\\n\\n#ZedsDead #BassMusic #EDMFestival #Dubstep #FestivalSeason",
        hashtags: ["#ZedsDead","#BassMusic","#EDMFestival","#Dubstep","#FestivalSeason"],
        payoutRate: "$3.50 / 1k Views (Clipr Agency)",
        loopNote: "Engineered 14s loop with bold hook typography ('THE CROWD LOST THEIR MINDS') and seamless audio crossfade."
      },
      {
        id: "viral_clips_10",
        title: "You Can Feel The Energy Through The Screen ⚡ @zedsdead #shorts",
        duration: "0:14",
        quality: "1080x1920 (9:16 Vertical HD)",
        videoSrc: "/campaigns/viral_clips/viral_clips_10.mp4",
        description: "Turn your brightness up, put your headphones on, and experience Zeds Dead live at Red Rocks! 🎧🔥\\n\\n@zedsdead\\n\\n#ZedsDead #BassMusic #EDMFestival #Dubstep #FestivalSeason",
        hashtags: ["#ZedsDead","#BassMusic","#EDMFestival","#Dubstep","#FestivalSeason"],
        payoutRate: "$3.50 / 1k Views (Clipr Agency)",
        loopNote: "Engineered 14s loop with bold hook typography ('FEEL THE ENERGY THROUGH SCREEN') and seamless audio crossfade."
      }
    ]
  }
];

const HABEEB_CAMPAIGNS: CampaignSlot[] = [
  {
    campaignId: "habeeb_bubsy_ugc",
    campaignName: "Bubsy 4D [UGC] 2 — High-APV 12s Viral Shorts (10 Clips)",
    category: "Gaming Platformer & Redemption Arc (Clipster / Atari)",
    status: "Live & Active (Strict Habeeb Exclusive)",
    payout: "$1,500 / 1M Views ($1,500 Profile Cap)",
    clips: [
      {
        id: "bubsy_ugc_01",
        title: "Gaming's biggest joke just got a redemption arc 💀 #shorts",
        duration: "0:12",
        quality: "1080x1920 (9:16 Vertical HD)",
        videoSrc: "/campaigns/bubsy_ugc/bubsy_ugc_01.mp4",
        description: "I genuinely wasn't expecting this to be this good... Bubsy has spent 30 years being the punchline of gaming, and now they drop a genuinely incredible 3D platformer?! 🤯\n\n#Bubsy #Bubsy4D #Gaming #Platformer #GamingCommunity",
        hashtags: ["#Bubsy","#Bubsy4D","#Gaming","#Platformer","#GamingCommunity"],
        payoutRate: "$1,500 / 1M Views (Clipster / Atari)",
        loopNote: "12s ultra-high APV loop. High-speed wall running and glide movement. Seamless audio fade."
      },
      {
        id: "bubsy_ugc_02",
        title: "We got a new Bubsy game before GTA 6... 🤯 #shorts",
        duration: "0:12",
        quality: "1080x1920 (9:16 Vertical HD)",
        videoSrc: "/campaigns/bubsy_ugc/bubsy_ugc_02.mp4",
        description: "Nobody had 'Bubsy comeback' on their 2026 gaming bingo card. But look at this movement tech! Genuinely one of the smoothest platformers I've played recently.\n\n#Bubsy #Bubsy4D #Gaming #GamingShorts #RetroGaming",
        hashtags: ["#Bubsy","#Bubsy4D","#Gaming","#Platformer","#GamingCommunity"],
        payoutRate: "$1,500 / 1M Views (Clipster / Atari)",
        loopNote: "11.8s loop. Viral GTA 6 meme hook. Smooth air gliding and rail bounce combo."
      },
      {
        id: "bubsy_ugc_03",
        title: "The internet's favorite punching bag is back 👀 #shorts",
        duration: "0:12",
        quality: "1080x1920 (9:16 Vertical HD)",
        videoSrc: "/campaigns/bubsy_ugc/bubsy_ugc_03.mp4",
        description: "Imagine being roasted for 30 straight years and then dropping a 3D platformer with movement mechanics this fluid. The comeback story is crazy!\n\n#Bubsy #Bubsy4D #IndieGames #Platformer #Gamer",
        hashtags: ["#Bubsy","#Bubsy4D","#Gaming","#Platformer","#GamingCommunity"],
        payoutRate: "$1,500 / 1M Views (Clipster / Atari)",
        loopNote: "12s loop. Rapid air-dash chaining and coin collection combo."
      },
      {
        id: "bubsy_ugc_04",
        title: "The worst mascot in gaming got the biggest glow up ever 🎮 #shorts",
        duration: "0:12",
        quality: "1080x1920 (9:16 Vertical HD)",
        videoSrc: "/campaigns/bubsy_ugc/bubsy_ugc_04.mp4",
        description: "From gaming's biggest meme to one of the cleanest 3D platformers of 2026. The physics and momentum in Bubsy 4D feel unbelievable.\n\n#Bubsy #Bubsy4D #GamingCommunity #Platformer #Shorts",
        hashtags: ["#Bubsy","#Bubsy4D","#Gaming","#Platformer","#GamingCommunity"],
        payoutRate: "$1,500 / 1M Views (Clipster / Atari)",
        loopNote: "12s loop. Precision jump pad chaining and vertical climb sequence."
      },
      {
        id: "bubsy_ugc_05",
        title: "Nobody had 'Bubsy comeback' on their 2026 bingo card 😭 #shorts",
        duration: "0:12",
        quality: "1080x1920 (9:16 Vertical HD)",
        videoSrc: "/campaigns/bubsy_ugc/bubsy_ugc_05.mp4",
        description: "I can't believe I'm saying this, but Bubsy 4D might genuinely be one of the best platformers this year. That momentum system is addictive!\n\n#Bubsy #Bubsy4D #GamerLife #Speedrun #Gaming",
        hashtags: ["#Bubsy","#Bubsy4D","#Gaming","#Platformer","#GamingCommunity"],
        payoutRate: "$1,500 / 1M Views (Clipster / Atari)",
        loopNote: "12s loop. High velocity slope slide into wall climb transition."
      },
      {
        id: "bubsy_ugc_06",
        title: "Imagine if gaming's biggest punchline dropped a good game 🐱 #shorts",
        duration: "0:12",
        quality: "1080x1920 (9:16 Vertical HD)",
        videoSrc: "/campaigns/bubsy_ugc/bubsy_ugc_06.mp4",
        description: "If you like Sonic, Crash Bandicoot, or Mario Odyssey, you have to try this. The controls are tight, fast, and responsive.\n\n#Bubsy #Bubsy4D #Sonic #CrashBandicoot #GamingShorts",
        hashtags: ["#Bubsy","#Bubsy4D","#Gaming","#Platformer","#GamingCommunity"],
        payoutRate: "$1,500 / 1M Views (Clipster / Atari)",
        loopNote: "12s loop. Sonic/Crash platformer comparison angle. Flawless loop seam."
      },
      {
        id: "bubsy_ugc_07",
        title: "The mascot everyone roasted for 30 years just did this... 🔥 #shorts",
        duration: "0:12",
        quality: "1080x1920 (9:16 Vertical HD)",
        videoSrc: "/campaigns/bubsy_ugc/bubsy_ugc_07.mp4",
        description: "Who knew 2026 would be the year Bubsy redeemed himself?! Atari and Fabraz completely cooked with the movement tech here.\n\n#Bubsy #Bubsy4D #Gaming #Gameplay #VideoGames",
        hashtags: ["#Bubsy","#Bubsy4D","#Gaming","#Platformer","#GamingCommunity"],
        payoutRate: "$1,500 / 1M Views (Clipster / Atari)",
        loopNote: "11.5s ultra-tight loop. Loop APV targeted for >140%."
      },
      {
        id: "bubsy_ugc_08",
        title: "How did THIS franchise end up making a good game?! 🤯 #shorts",
        duration: "0:12",
        quality: "1080x1920 (9:16 Vertical HD)",
        videoSrc: "/campaigns/bubsy_ugc/bubsy_ugc_08.mp4",
        description: "I was convinced this was going to be a disaster, but the game is actually incredible. The boss fights and level design are peak.\n\n#Bubsy #Bubsy4D #GamingReview #Platformer #Shorts",
        hashtags: ["#Bubsy","#Bubsy4D","#Gaming","#Platformer","#GamingCommunity"],
        payoutRate: "$1,500 / 1M Views (Clipster / Atari)",
        loopNote: "12s loop. High shock-value question hook. Wall kick dynamic."
      },
      {
        id: "bubsy_ugc_09",
        title: "Gaming's biggest underdog just pulled off the impossible 🚀 #shorts",
        duration: "0:12",
        quality: "1080x1920 (9:16 Vertical HD)",
        videoSrc: "/campaigns/bubsy_ugc/bubsy_ugc_09.mp4",
        description: "30 years as the punchline of the internet, and now Bubsy is back with elite 3D platforming. Respect to the developers for this redemption!\n\n#Bubsy #Bubsy4D #Underdog #GamingCommunity #Shorts",
        hashtags: ["#Bubsy","#Bubsy4D","#Gaming","#Platformer","#GamingCommunity"],
        payoutRate: "$1,500 / 1M Views (Clipster / Atari)",
        loopNote: "12s loop. Underdog narrative angle. High-flying jump arc."
      },
      {
        id: "bubsy_ugc_10",
        title: "Wait... why is the new Bubsy game actually this fun? 👀 #shorts",
        duration: "0:12",
        quality: "1080x1920 (9:16 Vertical HD)",
        videoSrc: "/campaigns/bubsy_ugc/bubsy_ugc_10.mp4",
        description: "I went in expecting a meme and came out hooked. The gliding and time-trial mechanics make this so satisfying to master!\n\n#Bubsy #Bubsy4D #GamingLife #Platformer #Gamer",
        hashtags: ["#Bubsy","#Bubsy4D","#Gaming","#Platformer","#GamingCommunity"],
        payoutRate: "$1,500 / 1M Views (Clipster / Atari)",
        loopNote: "11.5s loop. Genuine discovery tone strictly adhering to UGC Brief rules."
      }
    ]
  },
  {
    campaignId: "habeeb_camp_2",
    campaignName: "Campaign Drop Delta (Habeeb Slot 2)",
    category: "Cinema, Suspense & Cult Lore",
    status: "Standby For Drop",
    payout: "$850 - $1,200 / 1M Views",
    clips: []
  }
];

const LILSHEY_CAMPAIGNS: CampaignSlot[] = [
  {
    campaignId: "lilshey_camp_1",
    campaignName: "Campaign Drop Epsilon (Lilshey Slot 1)",
    category: "High-Virality Entertainment & Gaming",
    status: "Standby For Drop",
    payout: "$1,000 / 1M Views",
    clips: []
  },
  {
    campaignId: "lilshey_camp_2",
    campaignName: "Campaign Drop Zeta (Lilshey Slot 2)",
    category: "Cinema, Lifestyle & Viral Trends",
    status: "Standby For Drop",
    payout: "$1,000 / 1M Views",
    clips: []
  }
];

// Lazy-Loaded Deferred Video Component (Loads video byte streams only when triggered)
function DeferredVideoCard({ clip }: { clip: CampaignClip }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [copiedDesc, setCopiedDesc] = useState(false);

  const handleCopyTitle = () => {
    navigator.clipboard.writeText(clip.title);
    setCopiedTitle(true);
    setTimeout(() => setCopiedTitle(false), 2000);
  };

  const handleCopyDesc = () => {
    navigator.clipboard.writeText(clip.description);
    setCopiedDesc(true);
    setTimeout(() => setCopiedDesc(false), 2000);
  };

  return (
    <div className="bg-[#10141e] border border-[#1b2234] hover:border-blue-500/40 rounded-2xl overflow-hidden flex flex-col justify-between transition-all group shadow-xl">
      <div>
        <div className="relative aspect-[9/16] max-h-[320px] bg-black overflow-hidden flex items-center justify-center">
          {isLoaded ? (
            <video
              src={clip.videoSrc}
              controls
              autoPlay
              loop
              playsInline
              preload="metadata"
              className="w-full h-full object-contain"
            />
          ) : (
            <div 
              onClick={() => setIsLoaded(true)}
              className="w-full h-full bg-[#0a0d14] flex flex-col items-center justify-center cursor-pointer group-hover:bg-[#0e131d] transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Play className="w-5 h-5 text-blue-400 fill-blue-400" />
              </div>
              <span className="text-xs font-semibold text-neutral-300">Click to Stream Clip</span>
              <span className="text-[10px] text-neutral-400 font-mono mt-0.5">{clip.duration} • {clip.quality}</span>
            </div>
          )}
          <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-mono text-neutral-300 border border-white/10">
            {clip.duration}
          </div>
          <div className="absolute top-2.5 right-2.5 bg-emerald-500/80 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-bold text-white">
            {clip.quality}
          </div>
        </div>

        <div className="p-4 space-y-3">
          <div>
            <span className="text-[10px] font-mono text-blue-400 uppercase tracking-wider font-semibold block mb-0.5">
              YouTube Shorts Title
            </span>
            <h4 className="font-bold text-sm text-white line-clamp-2 group-hover:text-blue-400 transition-colors">
              {clip.title}
            </h4>
          </div>

          <div className="bg-[#0a0d14] border border-[#1b2234] rounded-xl p-2.5 space-y-1">
            <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-wider block">
              Description & Hashtags
            </span>
            <p className="text-[11px] text-neutral-300 font-sans leading-relaxed line-clamp-3 whitespace-pre-wrap">
              {clip.description}
            </p>
          </div>

          <div className="bg-[#0a0d14] border border-[#1b2234] rounded-xl p-2.5 space-y-1">
            <div className="text-[10px] text-neutral-400 flex items-center justify-between">
              <span className="font-semibold text-neutral-300">Loop Architecture</span>
              <span className="text-emerald-400 font-bold">{clip.payoutRate}</span>
            </div>
            <p className="text-[11px] text-blue-300 font-mono leading-tight">
              {clip.loopNote}
            </p>
          </div>
        </div>
      </div>

      <div className="p-4 pt-0 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={handleCopyTitle}
            className="py-2.5 px-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs transition-all flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/20 active:scale-[0.98]"
          >
            {copiedTitle ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedTitle ? "Title Copied!" : "Copy Title"}</span>
          </button>

          <button
            onClick={handleCopyDesc}
            className="py-2.5 px-3 rounded-xl bg-[#1e2638] hover:bg-[#253046] border border-[#2a364f] text-neutral-200 font-semibold text-xs transition-all flex items-center justify-center gap-1.5 active:scale-[0.98]"
          >
            {copiedDesc ? <Check className="w-3.5 h-3.5 text-emerald-300" /> : <Copy className="w-3.5 h-3.5" />}
            <span>{copiedDesc ? "Desc Copied!" : "Copy Desc & Tags"}</span>
          </button>
        </div>

        <a
          href={clip.videoSrc}
          download
          className="w-full py-2 px-3 rounded-xl bg-[#141926] hover:bg-[#1b2234] border border-[#1b2234] text-neutral-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Direct Clip Download</span>
        </a>
      </div>
    </div>
  );
}

export default function ClippingVault() {
  const [currentUser, setCurrentUser] = useState<string>(() => {
    return localStorage.getItem("clipping_user") || "";
  });
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authError, setAuthError] = useState("");

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

    deckA.src = HUSTLE_TRACKS[trackIndexRef.current];
    deckA.volume = 0;
    activeDeckRef.current = "A";

    // Initial Fade In
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
      idleEl.currentTime = 0;
      idleEl.volume = 0;

      idleEl.play().then(() => {
        const steps = 30;
        const intervalTime = (CROSSFADE_TIME * 1000) / steps;
        let step = 0;

        const crossfadeInterval = setInterval(() => {
          step++;
          const progress = step / steps;

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

    return () => {
      deckA.removeEventListener("timeupdate", handleTimeUpdate);
      deckB.removeEventListener("timeupdate", handleTimeUpdate);
      deckA.removeEventListener("ended", handleEnded);
      deckB.removeEventListener("ended", handleEnded);
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
            1:1 Fair Split • Ultra-Fast Standby Mode
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
            <span>Direct Repo Video Bundling</span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              Ultra-Fast Loading
            </span>
          </div>
        </motion.div>
      </div>
    );
  }

  const activeUserData = USERS[currentUser] || USERS.ceo;
  const campaigns = currentUser === "habeeb" ? HABEEB_CAMPAIGNS : currentUser === "lilshey" ? LILSHEY_CAMPAIGNS : CEO_CAMPAIGNS;

  return (
    <div className="min-h-screen bg-[#0a0d14] text-white selection:bg-blue-600/30 pb-20">
      {/* Hidden Dual-Deck Hustle Audio Engine (Non-Stop Background Playback) */}
      <audio ref={deckARef} preload="auto" />
      <audio ref={deckBRef} preload="auto" />

      {/* String Top Navigation Bar */}
      <header className="sticky top-0 z-40 bg-[#0a0d14]/90 backdrop-blur-xl border-b border-[#1b2234] px-4 sm:px-8 py-3.5">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
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
                Logged in as <strong className="text-white">{activeUserData.name}</strong> • 1:1 Campaign Distribution
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
      <main className="max-w-7xl mx-auto px-4 sm:px-8 pt-8 space-y-8">
        
        {/* Standby Banner */}
        <section className="bg-gradient-to-r from-blue-950/30 via-[#10141e] to-emerald-950/20 border border-[#1b2234] rounded-2xl p-6 sm:p-7 relative overflow-hidden shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-5">
            <div>
              <div className="flex items-center gap-2 mb-2">
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping"></span>
                <span className="text-xs font-mono text-amber-400 uppercase tracking-wider font-bold">
                  PORTAL ARMED // STANDBY FOR CAMPAIGN DROP
                </span>
              </div>
              <h1 className="text-xl sm:text-3xl font-extrabold tracking-tight text-white">
                {currentUser === "ceo" ? "CEO Executive Suite (2 Dedicated Campaign Slots)" : "Habeeb Operations Vault (2 Dedicated Campaign Slots)"}
              </h1>
              <p className="text-xs sm:text-sm text-neutral-400 mt-2 max-w-2xl leading-relaxed">
                All ended campaigns and demo clips have been cleared. Videos will be committed directly with the repository for zero external dependencies and instant progressive streaming.
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="bg-[#0a0d14] border border-[#1b2234] px-4 py-3 rounded-xl text-right">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-semibold">Allocated Slots</span>
                <span className="text-base font-bold text-blue-400">2 Unique Campaigns</span>
              </div>
              <div className="bg-[#0a0d14] border border-[#1b2234] px-4 py-3 rounded-xl text-right">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider block font-semibold">Standard Rate</span>
                <span className="text-base font-bold text-emerald-400">$1,000 / 1M</span>
              </div>
            </div>
          </div>
        </section>

        {/* YouTube Shorts High-Yield Farming Playbook (Always Primed) */}
        <section className="bg-[#10141e] border border-[#1b2234] rounded-2xl p-5 sm:p-6">
          <div className="flex items-center gap-2 text-sm font-bold text-sky-400 mb-3">
            <Zap className="w-4 h-4 text-amber-400" />
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

        {/* Campaign Slots (Empty State / Ready for Drop) */}
        <div className="space-y-6">
          {campaigns.map((camp, idx) => (
            <div 
              key={camp.campaignId}
              className="bg-[#10141e] border border-[#1b2234] rounded-2xl p-6 shadow-xl space-y-4"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1b2234] gap-2">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
                      Slot {idx + 1} // Dedicated
                    </span>
                    <span className="text-xs text-neutral-400">{camp.category}</span>
                  </div>
                  <h3 className="text-lg font-bold text-white">{camp.campaignName}</h3>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded-lg">
                    {camp.payout}
                  </span>
                </div>
              </div>

              {camp.clips.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                  {camp.clips.map(clip => (
                    <DeferredVideoCard key={clip.id} clip={clip} />
                  ))}
                </div>
              ) : (
                <div className="py-12 px-4 border border-dashed border-[#1b2234] rounded-xl flex flex-col items-center justify-center text-center bg-[#0a0d14]/50">
                  <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center mb-3">
                    <Clock className="w-5 h-5 text-blue-400" />
                  </div>
                  <h4 className="text-sm font-bold text-white mb-1">Awaiting Campaign Footage</h4>
                  <p className="text-xs text-neutral-400 max-w-md leading-relaxed">
                    This dedicated campaign slot is primed. As soon as the new campaign drops, video clips will appear here ready with instant copy captions, engineered loops, and direct downloads.
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>

      </main>
    </div>
  );
}
