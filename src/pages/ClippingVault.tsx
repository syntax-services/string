import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Lock, LogOut, Download, Copy, Check, 
  Shield, Flame, Sparkles, Clock, AlertCircle, ArrowUpRight,
  Zap, Play, CheckCircle2, Trash2, RotateCcw, Archive
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
  },
  usman: {
    pass: "usm_K9#xL77Vpw32NM",
    name: "Usman Growth Suite",
    role: "Growth Content Specialist",
    badge: "USMAN SUITE (SLOTS 7 & 8)"
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
  addedTime?: string;
  batchTag?: string;
}

export interface CampaignSlot {
  campaignId: string;
  campaignName: string;
  category: string;
  status: string;
  payout: string;
  batches?: string[];
  clips: CampaignClip[];
}

// 1:1 DEDICATED CAMPAIGN CONFIGURATION (Ready for incoming drop)
// When new clips arrive, simply drop the .mp4 files into public/campaigns/ and populate this array.
const CEO_CAMPAIGNS: CampaignSlot[] = [
  {
    "campaignId": "ceo_zeds_dead_flagship",
    "campaignName": "Flagship Channel: Zeds Dead (7:00 PM Prime Drop)",
    "category": "Mainstage Production, Lasers & Bass Drops (Whop / Deadbeats)",
    "status": "Live & Active (Strict CEO Exclusive)",
    "payout": "$3.50 / 1k Views ($175 Max)",
    "batches": [
      "All Drops",
      "7:00 PM Prime Drop (New)",
      "Morning Drop (Posted)"
    ],
    "clips": [
      {
        "id": "zeds_dead_11",
        "addedTime": "Oct 01, 2026 • 06:45 PM",
        "batchTag": "7:00 PM Prime Drop (New)",
        "title": "Ante Up Hip Hop Flip Hits Different 🥊 @zedsdead #shorts",
        "duration": "0:13",
        "quality": "1080x1920 (9:16 Master HD)",
        "videoSrc": "/campaigns/zeds_dead/zeds_dead_11_ante_up_drop.mp4?v=prime7pm",
        "description": "Zeds Dead dropping the iconic Ante Up flip live in Miami! That crowd reaction says it all 🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMFestival #Dubstep #AnteUp #HipHopRemix",
        "hashtags": [
          "#ZedsDead",
          "#BassMusic",
          "#EDMFestival",
          "#Dubstep",
          "#FestivalSeason"
        ],
        "payoutRate": "$3.50 / 1k Views (Clipr Agency)",
        "loopNote": "Engineered 13s high-APV loop for 7:00 PM posting. Mined from unreleased concert master (Ante Up Final.mp4)."
      },
      {
        "id": "zeds_dead_12",
        "addedTime": "Oct 01, 2026 • 06:45 PM",
        "batchTag": "7:00 PM Prime Drop (New)",
        "title": "Shook Ones Dubstep Flip is Filthy 🗽 @zedsdead #shorts",
        "duration": "0:14",
        "quality": "1080x1920 (9:16 Master HD)",
        "videoSrc": "/campaigns/zeds_dead/zeds_dead_12_shook_ones_sub.mp4?v=prime7pm",
        "description": "Classic Mobb Deep 'Shook Ones' chopped into heavy festival sub-bass. Pure perfection from Dylan & Zach!\n\n@zedsdead\n\n#ZedsDead #MobbDeep #ShookOnes #BassMusic #Dubstep #EDM",
        "hashtags": [
          "#ZedsDead",
          "#BassMusic",
          "#EDMFestival",
          "#Dubstep",
          "#FestivalSeason"
        ],
        "payoutRate": "$3.50 / 1k Views (Clipr Agency)",
        "loopNote": "Engineered 14s high-APV loop for 7:00 PM posting. Mined from unreleased concert master (Shook Ones FINAL.mp4)."
      },
      {
        "id": "zeds_dead_13",
        "addedTime": "Oct 01, 2026 • 06:45 PM",
        "batchTag": "7:00 PM Prime Drop (New)",
        "title": "The Most Melodic Build In Dance Music 🎻 @zedsdead #shorts",
        "duration": "0:13",
        "quality": "1080x1920 (9:16 Master HD)",
        "videoSrc": "/campaigns/zeds_dead/zeds_dead_13_sinatra_bridge.mp4?v=prime7pm",
        "description": "The orchestral melodic breakdown in Zeds Dead's Sinatra remix. Pure goosebumps every single time!\n\n@zedsdead\n\n#ZedsDead #MelodicDubstep #EDMFestival #FestivalSeason #BassMusic",
        "hashtags": [
          "#ZedsDead",
          "#BassMusic",
          "#EDMFestival",
          "#Dubstep",
          "#FestivalSeason"
        ],
        "payoutRate": "$3.50 / 1k Views (Clipr Agency)",
        "loopNote": "Engineered 13s high-APV loop for 7:00 PM posting. Mined from unreleased concert master (Sinatra Full FINAL.mp4)."
      },
      {
        "id": "zeds_dead_14",
        "addedTime": "Oct 01, 2026 • 06:45 PM",
        "batchTag": "7:00 PM Prime Drop (New)",
        "title": "When The Second Drop Knocks Your Breath Out 💨 @zedsdead #shorts",
        "duration": "0:14",
        "quality": "1080x1920 (9:16 Master HD)",
        "videoSrc": "/campaigns/zeds_dead/zeds_dead_14_sinatra_drop2.mp4?v=prime7pm",
        "description": "Nobody expects the second drop switch-up! Turn your volume all the way up for this one 🔊\n\n@zedsdead\n\n#ZedsDead #BassDrop #EDMFestival #Dubstep #HeadphonesOn",
        "hashtags": [
          "#ZedsDead",
          "#BassMusic",
          "#EDMFestival",
          "#Dubstep",
          "#FestivalSeason"
        ],
        "payoutRate": "$3.50 / 1k Views (Clipr Agency)",
        "loopNote": "Engineered 14s high-APV loop for 7:00 PM posting. Mined from unreleased concert master (SINATRA SHORT FINAL.mp4)."
      },
      {
        "id": "zeds_dead_15",
        "addedTime": "Oct 01, 2026 • 06:45 PM",
        "batchTag": "7:00 PM Prime Drop (New)",
        "title": "Insane FPV Drone Speed Run Through The Rig 🚀 @zedsdead #shorts",
        "duration": "0:14",
        "quality": "1080x1920 (9:16 Master HD)",
        "videoSrc": "/campaigns/zeds_dead/zeds_dead_15_fpv_jamboree_speed.mp4?v=prime7pm",
        "description": "FPV drone hitting maximum velocity threading between the stage trusses during Zeds Dead's live show!\n\n@zedsdead\n\n#ZedsDead #FPVDrone #StageDesign #ConcertProduction #EDMFestival",
        "hashtags": [
          "#ZedsDead",
          "#BassMusic",
          "#EDMFestival",
          "#Dubstep",
          "#FestivalSeason"
        ],
        "payoutRate": "$3.50 / 1k Views (Clipr Agency)",
        "loopNote": "Engineered 14s high-APV loop for 7:00 PM posting. Mined from unreleased concert master (FPV RAW 14.mov)."
      },
      {
        "id": "zeds_dead_16",
        "addedTime": "Oct 01, 2026 • 06:45 PM",
        "batchTag": "7:00 PM Prime Drop (New)",
        "title": "Inside The Floating Laser Pyramid 📐 @zedsdead #shorts",
        "duration": "0:13",
        "quality": "1080x1920 (9:16 Master HD)",
        "videoSrc": "/campaigns/zeds_dead/zeds_dead_16_fpv_jamboree_pyramid.mp4?v=prime7pm",
        "description": "Drone camera floating inside the neon pyramid structure above the crowd. The visual geometry is insane!\n\n@zedsdead\n\n#ZedsDead #LaserShow #VisualArts #StageCraft #BassMusic",
        "hashtags": [
          "#ZedsDead",
          "#BassMusic",
          "#EDMFestival",
          "#Dubstep",
          "#FestivalSeason"
        ],
        "payoutRate": "$3.50 / 1k Views (Clipr Agency)",
        "loopNote": "Engineered 13s high-APV loop for 7:00 PM posting. Mined from unreleased concert master (FPV RAW 16.mov)."
      },
      {
        "id": "zeds_dead_17",
        "addedTime": "Oct 01, 2026 • 06:45 PM",
        "batchTag": "7:00 PM Prime Drop (New)",
        "title": "The Red Rocks Stadium Lighting Masterclass 🏟️ @zedsdead #shorts",
        "duration": "0:14",
        "quality": "1080x1920 (9:16 Master HD)",
        "videoSrc": "/campaigns/zeds_dead/zeds_dead_17_fpv_jamboree_finale.mp4?v=prime7pm",
        "description": "Full stadium arena view as the lighting rig ignites in red and gold. Legendary amphitheatre moments.\n\n@zedsdead\n\n#ZedsDead #RedRocks #DeadRocks #EDMFamily #BassHead",
        "hashtags": [
          "#ZedsDead",
          "#BassMusic",
          "#EDMFestival",
          "#Dubstep",
          "#FestivalSeason"
        ],
        "payoutRate": "$3.50 / 1k Views (Clipr Agency)",
        "loopNote": "Engineered 14s high-APV loop for 7:00 PM posting. Mined from unreleased concert master (FPV RAW 18.mov)."
      },
      {
        "id": "zeds_dead_18",
        "addedTime": "Oct 01, 2026 • 06:45 PM",
        "batchTag": "7:00 PM Prime Drop (New)",
        "title": "Drone Dive Right Behind The DJ Decks 🛸 @zedsdead #shorts",
        "duration": "0:13",
        "quality": "1080x1920 (9:16 Master HD)",
        "videoSrc": "/campaigns/zeds_dead/zeds_dead_18_fpv_n1_dive.mp4?v=prime7pm",
        "description": "Cinematic drone dive pulling right past the DJ monitors into the sea of fans. The atmosphere is electric!\n\n@zedsdead\n\n#ZedsDead #DJBooth #FPVLife #EDMWorld #FestivalStage",
        "hashtags": [
          "#ZedsDead",
          "#BassMusic",
          "#EDMFestival",
          "#Dubstep",
          "#FestivalSeason"
        ],
        "payoutRate": "$3.50 / 1k Views (Clipr Agency)",
        "loopNote": "Engineered 13s high-APV loop for 7:00 PM posting. Mined from unreleased concert master (FPV RAW 4.mov)."
      },
      {
        "id": "zeds_dead_19",
        "addedTime": "Oct 01, 2026 • 06:45 PM",
        "batchTag": "7:00 PM Prime Drop (New)",
        "title": "Piercing Cyan Laser Canopy Over The Valley ⚡ @zedsdead #shorts",
        "duration": "0:13",
        "quality": "1080x1920 (9:16 Master HD)",
        "videoSrc": "/campaigns/zeds_dead/zeds_dead_19_fpv_n2_beam.mp4?v=prime7pm",
        "description": "Cyan laser beams piercing through mountain fog into the night sky. True art in electronic stagecraft.\n\n@zedsdead\n\n#ZedsDead #Lasers #StageDesign #EDMFestival #Dubstep",
        "hashtags": [
          "#ZedsDead",
          "#BassMusic",
          "#EDMFestival",
          "#Dubstep",
          "#FestivalSeason"
        ],
        "payoutRate": "$3.50 / 1k Views (Clipr Agency)",
        "loopNote": "Engineered 13s high-APV loop for 7:00 PM posting. Mined from unreleased concert master (FPV RAW 11.mov)."
      },
      {
        "id": "zeds_dead_20",
        "addedTime": "Oct 01, 2026 • 06:45 PM",
        "batchTag": "7:00 PM Prime Drop (New)",
        "title": "The Ultimate Festival Finale Drop 🎇 @zedsdead #shorts",
        "duration": "0:14",
        "quality": "1080x1920 (9:16 Master HD)",
        "videoSrc": "/campaigns/zeds_dead/zeds_dead_20_fpv_n2_grand_finale.mp4?v=prime7pm",
        "description": "Full pyrotechnics, blinding strobes, and heavy bass to close out the weekend. The energy will give you chills!\n\n@zedsdead\n\n#ZedsDead #FinaleDrop #FestivalSeason #Dubstep #PyroShow",
        "hashtags": [
          "#ZedsDead",
          "#BassMusic",
          "#EDMFestival",
          "#Dubstep",
          "#FestivalSeason"
        ],
        "payoutRate": "$3.50 / 1k Views (Clipr Agency)",
        "loopNote": "Engineered 14s high-APV loop for 7:00 PM posting. Mined from unreleased concert master (FPV RAW 13.mov)."
      },
      {
        "id": "zeds_dead_01",
        "addedTime": "Oct 01, 2026 • 12:40 PM",
        "batchTag": "Morning Drop (Posted)",
        "title": "The Lighting At This Festival Was Unreal 🤯 @zedsdead #shorts",
        "duration": "0:13",
        "quality": "1080x1920 (9:16 Master HD)",
        "videoSrc": "/campaigns/zeds_dead/zeds_dead_01_phuket_ascent.mp4?v=master1",
        "description": "The stage lighting and crowd energy at Zeds Dead Miami is completely unmatched. Peak electronic music vibes! ⚡\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMFestival #Dubstep #FestivalSeason #MiamiMusic",
        "hashtags": [
          "#ZedsDead",
          "#BassMusic",
          "#EDMFestival",
          "#Dubstep",
          "#FestivalSeason"
        ],
        "payoutRate": "$3.50 / 1k Views (Clipr Agency)",
        "loopNote": "Engineered 13s high-APV loop. Sourced from unique concert master (Phuket To Colors .mp4)."
      },
      {
        "id": "zeds_dead_02",
        "addedTime": "Oct 01, 2026 • 12:40 PM",
        "batchTag": "Morning Drop (Posted)",
        "title": "Wait For The Hardest Drop in Miami 🔊 @zedsdead #shorts",
        "duration": "0:14",
        "quality": "1080x1920 (9:16 Master HD)",
        "videoSrc": "/campaigns/zeds_dead/zeds_dead_02_colors_drop.mp4?v=master1",
        "description": "Wait until this drop hits! Pure sub-bass bliss from Dylan & Zach live at Factory Town Miami.\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMFestival #Dubstep #FactoryTown #BassDrop",
        "hashtags": [
          "#ZedsDead",
          "#BassMusic",
          "#EDMFestival",
          "#Dubstep",
          "#FestivalSeason"
        ],
        "payoutRate": "$3.50 / 1k Views (Clipr Agency)",
        "loopNote": "Engineered 14s high-APV loop. Sourced from unique concert master (Phuket To Colors .mp4)."
      },
      {
        "id": "zeds_dead_03",
        "addedTime": "Oct 01, 2026 • 12:40 PM",
        "batchTag": "Morning Drop (Posted)",
        "title": "How It Feels In The Front Row 🌌 @zedsdead #shorts",
        "duration": "0:14",
        "quality": "1080x1920 (9:16 Master HD)",
        "videoSrc": "/campaigns/zeds_dead/zeds_dead_03_euphoria_finale.mp4?v=master1",
        "description": "Standing in the front row when Zeds Dead drops pure melodic dubstep. The entire crowd moving as one!\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMFestival #Dubstep #FestivalSeason #EDMFamily",
        "hashtags": [
          "#ZedsDead",
          "#BassMusic",
          "#EDMFestival",
          "#Dubstep",
          "#FestivalSeason"
        ],
        "payoutRate": "$3.50 / 1k Views (Clipr Agency)",
        "loopNote": "Engineered 14s high-APV loop. Sourced from unique concert master (Phuket To Colors .mp4)."
      },
      {
        "id": "zeds_dead_04",
        "addedTime": "Oct 01, 2026 • 12:40 PM",
        "batchTag": "Morning Drop (Posted)",
        "title": "Sinatra Into Heavy Bass Transition 🎙️ @zedsdead #shorts",
        "duration": "0:13",
        "quality": "1080x1920 (9:16 Master HD)",
        "videoSrc": "/campaigns/zeds_dead/zeds_dead_04_sinatra_groove.mp4?v=master1",
        "description": "Classic Frank Sinatra vocal chopped straight into a devastating bassline. Only Zeds Dead could pull this off so cleanly!\n\n@zedsdead\n\n#ZedsDead #BassMusic #Dubstep #EDM #Sinatra #Remix",
        "hashtags": [
          "#ZedsDead",
          "#BassMusic",
          "#EDMFestival",
          "#Dubstep",
          "#FestivalSeason"
        ],
        "payoutRate": "$3.50 / 1k Views (Clipr Agency)",
        "loopNote": "Engineered 13s high-APV loop. Sourced from unique concert master (Sinatra Full FINAL.mp4)."
      },
      {
        "id": "zeds_dead_05",
        "addedTime": "Oct 01, 2026 • 12:40 PM",
        "batchTag": "Morning Drop (Posted)",
        "title": "Look At That Laser Ceiling 🚨 @zedsdead #shorts",
        "duration": "0:14",
        "quality": "1080x1920 (9:16 Master HD)",
        "videoSrc": "/campaigns/zeds_dead/zeds_dead_05_laser_breakdown.mp4?v=master1",
        "description": "Every laser perfectly synchronized to the kick and snare. This is what peak live electronic production looks like.\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMFestival #Lasers #StageDesign #Dubstep",
        "hashtags": [
          "#ZedsDead",
          "#BassMusic",
          "#EDMFestival",
          "#Dubstep",
          "#FestivalSeason"
        ],
        "payoutRate": "$3.50 / 1k Views (Clipr Agency)",
        "loopNote": "Engineered 14s high-APV loop. Sourced from unique concert master (Sinatra Full FINAL.mp4)."
      },
      {
        "id": "zeds_dead_06",
        "addedTime": "Oct 01, 2026 • 12:40 PM",
        "batchTag": "Morning Drop (Posted)",
        "title": "This Sub Bass Shook The Entire Venue 📳 @zedsdead #shorts",
        "duration": "0:14",
        "quality": "1080x1920 (9:16 Master HD)",
        "videoSrc": "/campaigns/zeds_dead/zeds_dead_06_sub_pressure.mp4?v=master1",
        "description": "Put on headphones right now! The sub-bass frequency on this ID was rattling the entire structure.\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMFestival #Dubstep #SubBass #HeadphonesRecommended",
        "hashtags": [
          "#ZedsDead",
          "#BassMusic",
          "#EDMFestival",
          "#Dubstep",
          "#FestivalSeason"
        ],
        "payoutRate": "$3.50 / 1k Views (Clipr Agency)",
        "loopNote": "Engineered 14s high-APV loop. Sourced from unique concert master (SINATRA SHORT FINAL.mp4)."
      },
      {
        "id": "zeds_dead_07",
        "addedTime": "Oct 01, 2026 • 12:40 PM",
        "batchTag": "Morning Drop (Posted)",
        "title": "Dirtiest Hip Hop Flip in Dance Music 💀 @zedsdead #shorts",
        "duration": "0:13",
        "quality": "1080x1920 (9:16 Master HD)",
        "videoSrc": "/campaigns/zeds_dead/zeds_dead_07_biggie_flip.mp4?v=master1",
        "description": "When Biggie Smalls gets flipped into a 140 BPM dubstep banger! The bounce on this rhythm is contagious.\n\n@zedsdead\n\n#ZedsDead #Biggie #HipHopRemix #BassMusic #Dubstep #FestivalSeason",
        "hashtags": [
          "#ZedsDead",
          "#BassMusic",
          "#EDMFestival",
          "#Dubstep",
          "#FestivalSeason"
        ],
        "payoutRate": "$3.50 / 1k Views (Clipr Agency)",
        "loopNote": "Engineered 13s high-APV loop. Sourced from unique concert master (Biggie edit final.mp4)."
      },
      {
        "id": "zeds_dead_08",
        "addedTime": "Oct 01, 2026 • 12:40 PM",
        "batchTag": "Morning Drop (Posted)",
        "title": "When Jay Z Hits The Sub Bass 🗽 @zedsdead #shorts",
        "duration": "0:14",
        "quality": "1080x1920 (9:16 Master HD)",
        "videoSrc": "/campaigns/zeds_dead/zeds_dead_08_hova_overload.mp4?v=master1",
        "description": "That Jay Z vocal chop right before the sub bass drops in. Factory Town went absolutely ballistic!\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMFestival #Dubstep #JayZ #FestivalVibes",
        "hashtags": [
          "#ZedsDead",
          "#BassMusic",
          "#EDMFestival",
          "#Dubstep",
          "#FestivalSeason"
        ],
        "payoutRate": "$3.50 / 1k Views (Clipr Agency)",
        "loopNote": "Engineered 14s high-APV loop. Sourced from unique concert master (Jay Z Final.mp4)."
      },
      {
        "id": "zeds_dead_09",
        "addedTime": "Oct 01, 2026 • 12:40 PM",
        "batchTag": "Morning Drop (Posted)",
        "title": "FPV Drone Dive Through The Laser Rig 🛸 @zedsdead #shorts",
        "duration": "0:14",
        "quality": "1080x1920 (9:16 Master HD)",
        "videoSrc": "/campaigns/zeds_dead/zeds_dead_09_pyramid_flight.mp4?v=master1",
        "description": "High-speed FPV drone dive carving through the stage lighting pyramids. The future of concert cinematography!\n\n@zedsdead\n\n#ZedsDead #FPVDrone #StageProduction #ConcertCinematography #Lasers",
        "hashtags": [
          "#ZedsDead",
          "#BassMusic",
          "#EDMFestival",
          "#Dubstep",
          "#FestivalSeason"
        ],
        "payoutRate": "$3.50 / 1k Views (Clipr Agency)",
        "loopNote": "Engineered 14s high-APV loop. Sourced from unique concert master (FPV RAW 17.mov)."
      },
      {
        "id": "zeds_dead_10",
        "addedTime": "Oct 01, 2026 • 12:40 PM",
        "batchTag": "Morning Drop (Posted)",
        "title": "View From Inside The DJ Cockpit 🎛️ @zedsdead #shorts",
        "duration": "0:14",
        "quality": "1080x1920 (9:16 Master HD)",
        "videoSrc": "/campaigns/zeds_dead/zeds_dead_10_cockpit_command.mp4?v=master1",
        "description": "Ever wonder what it looks like from behind the decks looking out at a sea of thousands of festival fans? Here it is.\n\n@zedsdead\n\n#ZedsDead #DJLife #EDMFestival #BehindTheDecks #BassMusic #FestivalStage",
        "hashtags": [
          "#ZedsDead",
          "#BassMusic",
          "#EDMFestival",
          "#Dubstep",
          "#FestivalSeason"
        ],
        "payoutRate": "$3.50 / 1k Views (Clipr Agency)",
        "loopNote": "Engineered 14s high-APV loop. Sourced from unique concert master (FPV RAW 5.mov)."
      }
    ]
  }
];

const HABEEB_CAMPAIGNS: CampaignSlot[] = [
  {
    "campaignId": "habeeb_bubsy_ugc",
    "campaignName": "Campaign Drop Gamma (Habeeb Slot 1)",
    "category": "Bubsy 4D Next-Gen Revival & Retro Nostalgia (Clipr Agency)",
    "status": "Live & Active (Strict Habeeb Exclusive)",
    "payout": "$1,000 / 1M Views ($500 Max)",
    "batches": [
      "All Drops",
      "Narrative-Complete Drop (Sentence Boundaries)"
    ],
    "clips": [
      {
        "id": "bubsy_ugc_01",
        "addedTime": "Sep 30, 2026 • 08:45 PM",
        "batchTag": "Narrative-Complete Drop (Sentence Boundaries)",
        "title": "Gaming's Biggest Joke Just Got A Redemption Arc 💀 #shorts",
        "duration": "0:14",
        "quality": "1080x1920 (9:16 Vertical HD)",
        "videoSrc": "/campaigns/bubsy_ugc/bubsy_ugc_01.mp4?v=narrative_fix",
        "description": "I genuinely wasn't expecting this to be this good... Bubsy has spent 30 years being the punchline of gaming, and now they drop this?! 🤯\\n\\n#Bubsy #Bubsy4D #Gaming #Platformer #GamingCommunity",
        "hashtags": [
          "#Bubsy",
          "#Bubsy4D",
          "#Gaming",
          "#Platformer",
          "#GamingCommunity"
        ],
        "payoutRate": "$1,000 / 1M Views ($500 Max)",
        "loopNote": "14.1s complete-thought narrative cut ending at natural silence breath with balanced US gaming beat."
      },
      {
        "id": "bubsy_ugc_02",
        "addedTime": "Sep 30, 2026 • 08:45 PM",
        "batchTag": "Narrative-Complete Drop (Sentence Boundaries)",
        "title": "We Got A New Bubsy Game Before GTA 6... 🤯 #shorts",
        "duration": "0:14",
        "quality": "1080x1920 (9:16 Vertical HD)",
        "videoSrc": "/campaigns/bubsy_ugc/bubsy_ugc_02.mp4?v=narrative_fix",
        "description": "Nobody had 'Bubsy comeback' on their 2026 gaming bingo card. But look at this rail bounce and glide combo! Genuinely smooth gameplay.\\n\\n#Bubsy #Bubsy4D #Gaming #GamingShorts #RetroGaming",
        "hashtags": [
          "#Bubsy",
          "#Bubsy4D",
          "#Gaming",
          "#GamingShorts",
          "#RetroGaming"
        ],
        "payoutRate": "$1,000 / 1M Views ($500 Max)",
        "loopNote": "14.4s full sentence resolution with smooth outro audio."
      },
      {
        "id": "bubsy_ugc_03",
        "addedTime": "Sep 30, 2026 • 08:45 PM",
        "batchTag": "Narrative-Complete Drop (Sentence Boundaries)",
        "title": "This Cannot Be A Real Video Game 💀 #shorts #gaming",
        "duration": "0:15",
        "quality": "1080x1920 (9:16 Vertical HD)",
        "videoSrc": "/campaigns/bubsy_ugc/bubsy_ugc_03.mp4?v=narrative_fix",
        "description": "Playing through this level had me questioning reality. Who playtested this back in the 90s?! Pure chaotic nostalgia.\\n\\n#gamingmemes #retrogaming #ps1 #ragequit #gamers",
        "hashtags": [
          "#gamingmemes",
          "#retrogaming",
          "#ps1",
          "#ragequit",
          "#gamers"
        ],
        "payoutRate": "$1,000 / 1M Views ($500 Max)",
        "loopNote": "15.5s complete sentence setup and full comedic rant landing."
      },
      {
        "id": "bubsy_ugc_04",
        "addedTime": "Sep 30, 2026 • 08:45 PM",
        "batchTag": "Narrative-Complete Drop (Sentence Boundaries)",
        "title": "The Final Jump Broke My Soul 💔 #shorts #gaming",
        "duration": "0:13",
        "quality": "1080x1920 (9:16 Vertical HD)",
        "videoSrc": "/campaigns/bubsy_ugc/bubsy_ugc_04.mp4?v=narrative_fix",
        "description": "That last platform is pure psychological warfare. My controller was in serious danger of being thrown across the room.\\n\\n#ragequit #funnygaming #gamefail #comedy #shorts",
        "hashtags": [
          "#ragequit",
          "#funnygaming",
          "#gamefail",
          "#comedy",
          "#shorts"
        ],
        "payoutRate": "$1,000 / 1M Views ($500 Max)",
        "loopNote": "12.5s complete reaction ending in clean speech silence."
      },
      {
        "id": "bubsy_ugc_05",
        "addedTime": "Sep 30, 2026 • 08:45 PM",
        "batchTag": "Narrative-Complete Drop (Sentence Boundaries)",
        "title": "Worst Camera Controls In Gaming History 🎥 #shorts",
        "duration": "0:16",
        "quality": "1080x1920 (9:16 Vertical HD)",
        "videoSrc": "/campaigns/bubsy_ugc/bubsy_ugc_05.mp4?v=narrative_fix",
        "description": "You literally have to pray to make this landing because the camera insists on looking everywhere except where you're jumping!\\n\\n#gamersoftiktok #retrogames #fail #funny #gamerhumor",
        "hashtags": [
          "#gamersoftiktok",
          "#retrogames",
          "#fail",
          "#funny",
          "#gamerhumor"
        ],
        "payoutRate": "$1,000 / 1M Views ($500 Max)",
        "loopNote": "15.8s complete camera rant with full context and no cutoff."
      },
      {
        "id": "bubsy_ugc_06",
        "addedTime": "Sep 30, 2026 • 08:45 PM",
        "batchTag": "Narrative-Complete Drop (Sentence Boundaries)",
        "title": "These Voicelines Are 100% Unhinged 😭 #shorts #gaming",
        "duration": "0:11",
        "quality": "1080x1920 (9:16 Vertical HD)",
        "videoSrc": "/campaigns/bubsy_ugc/bubsy_ugc_06.mp4?v=narrative_fix",
        "description": "The writers were having an absolute field day in the recording booth. You can't make this stuff up!\\n\\n#voiceacting #nostalgia #90sgames #funnyclips #videogames",
        "hashtags": [
          "#voiceacting",
          "#nostalgia",
          "#90sgames",
          "#funnyclips",
          "#videogames"
        ],
        "payoutRate": "$1,000 / 1M Views ($500 Max)",
        "loopNote": "11.0s complete dialogue punchline clip."
      },
      {
        "id": "bubsy_ugc_07",
        "addedTime": "Sep 30, 2026 • 08:45 PM",
        "batchTag": "Narrative-Complete Drop (Sentence Boundaries)",
        "title": "Accidental Speedrun Glitch In Bubsy ⚡ #shorts #speedrun",
        "duration": "0:15",
        "quality": "1080x1920 (9:16 Vertical HD)",
        "videoSrc": "/campaigns/bubsy_ugc/bubsy_ugc_07.mp4?v=narrative_fix",
        "description": "One wrong input and Bubsy accelerates to the speed of light. Speedrunners take notes on this movement!\\n\\n#speedrun #glitch #gamingglitches #gameplay #funnymoments",
        "hashtags": [
          "#speedrun",
          "#glitch",
          "#gamingglitches",
          "#gameplay",
          "#funnymoments"
        ],
        "payoutRate": "$1,000 / 1M Views ($500 Max)",
        "loopNote": "15.4s complete glitch demonstration and commentary."
      },
      {
        "id": "bubsy_ugc_08",
        "addedTime": "Sep 30, 2026 • 08:45 PM",
        "batchTag": "Narrative-Complete Drop (Sentence Boundaries)",
        "title": "2 Hours Of Suffering For This Ending 💀 #shorts",
        "duration": "0:11",
        "quality": "1080x1920 (9:16 Vertical HD)",
        "videoSrc": "/campaigns/bubsy_ugc/bubsy_ugc_08.mp4?v=narrative_fix",
        "description": "The emotional damage after spending hours trying to beat this section. Pure classic gaming pain.\\n\\n#rage #fail #gameover #pain #gamers",
        "hashtags": [
          "#rage",
          "#fail",
          "#gameover",
          "#pain",
          "#gamers"
        ],
        "payoutRate": "$1,000 / 1M Views ($500 Max)",
        "loopNote": "11.0s full conclusion and reaction landing."
      },
      {
        "id": "bubsy_ugc_09",
        "addedTime": "Sep 30, 2026 • 08:45 PM",
        "batchTag": "Narrative-Complete Drop (Sentence Boundaries)",
        "title": "Give The Level Designer Life In Prison 💀 #shorts #gaming",
        "duration": "0:14",
        "quality": "1080x1920 (9:16 Vertical HD)",
        "videoSrc": "/campaigns/bubsy_ugc/bubsy_ugc_09.mp4?v=narrative_fix",
        "description": "They placed spikes in places that defy the Geneva convention. Unforgivable 90s game design!\\n\\n#gameplayclips #retrogaming #gamingcommunity #leveldesign #viralgaming",
        "hashtags": [
          "#gameplayclips",
          "#retrogaming",
          "#gamingcommunity",
          "#leveldesign",
          "#viralgaming"
        ],
        "payoutRate": "$1,000 / 1M Views ($500 Max)",
        "loopNote": "14.3s complete sentence breakdown of level design."
      },
      {
        "id": "bubsy_ugc_10",
        "addedTime": "Sep 30, 2026 • 08:45 PM",
        "batchTag": "Narrative-Complete Drop (Sentence Boundaries)",
        "title": "The Silent Acceptance Of Defeat 🤐 #shorts #ragequit",
        "duration": "0:12",
        "quality": "1080x1920 (9:16 Vertical HD)",
        "videoSrc": "/campaigns/bubsy_ugc/bubsy_ugc_10.mp4?v=narrative_fix",
        "description": "When the rage transcends screaming and turns into quiet contemplation of your life choices.\\n\\n#ragequit #relatable #gamer #funny #shorts",
        "hashtags": [
          "#ragequit",
          "#relatable",
          "#gamer",
          "#funny",
          "#shorts"
        ],
        "payoutRate": "$1,000 / 1M Views ($500 Max)",
        "loopNote": "11.6s full final resolution of the play session."
      }
    ]
  },
  {
    "campaignId": "habeeb_camp_2",
    "campaignName": "Campaign Drop Delta (Habeeb Slot 2)",
    "category": "Cinema, Suspense & Cult Lore",
    "status": "Standby For Drop",
    "payout": "$850 - $1,200 / 1M Views",
    "batches": [
      "All Drops"
    ],
    "clips": []
  }
];

const LILSHEY_CAMPAIGNS: CampaignSlot[] = [
  {
    "campaignId": "lilshey_camp_1",
    "campaignName": "Channel 1: Viral Gaming & Rage Moments (10 Starter Shorts)",
    "category": "Retro Gaming Nostalgia, Rage Quits & Meme Commentary",
    "status": "Live & Active (Lilshey Exclusive)",
    "payout": "$1,000 / 1M Views (Starter Bounty)",
    "batches": [
      "All Drops",
      "Starter Channel Pack (10 Shorts)"
    ],
    "clips": [
      {
        "id": "lilshey_gaming_01",
        "addedTime": "Sep 30, 2026 • 05:20 PM",
        "batchTag": "Starter Channel Pack (10 Shorts)",
        "title": "PlayStation 1 Games Were A Fever Dream 💀 #shorts #gaming",
        "duration": "0:13",
        "quality": "1080x1920 (9:16 Vertical HD)",
        "videoSrc": "/campaigns/lilshey_starter/lilshey_gaming_01.mp4",
        "description": "Who approved this game in the 90s?! The camera controls alone deserve prison time 😭🎮\\n\\n#gaming #retrogaming #ps1 #ragequit #gamermoments",
        "hashtags": [
          "#gaming",
          "#retrogaming",
          "#ps1",
          "#ragequit",
          "#gamermoments"
        ],
        "payoutRate": "$1,000 / 1M Views (Starter Bounty)",
        "loopNote": "Engineered 13s seamless high-APV loop with impact punchline."
      },
      {
        "id": "lilshey_gaming_02",
        "addedTime": "Sep 30, 2026 • 05:20 PM",
        "batchTag": "Starter Channel Pack (10 Shorts)",
        "title": "How Did Anyone Actually Beat This Game?! 😭 #shorts #gaming",
        "duration": "0:14",
        "quality": "1080x1920 (9:16 Vertical HD)",
        "videoSrc": "/campaigns/lilshey_starter/lilshey_gaming_02.mp4",
        "description": "Physics took a complete vacation on this level. My last two braincells trying to make this jump.\\n\\n#gaming #gamer #funnygaming #rage #throwbackgaming",
        "hashtags": [
          "#gaming",
          "#gamer",
          "#funnygaming",
          "#rage",
          "#throwbackgaming"
        ],
        "payoutRate": "$1,000 / 1M Views (Starter Bounty)",
        "loopNote": "Engineered 13.5s high-retention rage loop."
      },
      {
        "id": "lilshey_gaming_03",
        "addedTime": "Sep 30, 2026 • 05:20 PM",
        "batchTag": "Starter Channel Pack (10 Shorts)",
        "title": "My Anger Issues Cannot Handle This Game 🤬 #shorts #ragequit",
        "duration": "0:13",
        "quality": "1080x1920 (9:16 Vertical HD)",
        "videoSrc": "/campaigns/lilshey_starter/lilshey_gaming_03.mp4",
        "description": "The 3-second jump delay is diabolical work. How was this sold for $50 in 1996?!\\n\\n#ragequit #funnygamermoments #retrogames #gamingmemes #epicfail",
        "hashtags": [
          "#ragequit",
          "#funnygamermoments",
          "#retrogames",
          "#gamingmemes",
          "#epicfail"
        ],
        "payoutRate": "$1,000 / 1M Views (Starter Bounty)",
        "loopNote": "Engineered 12.5s rapid loop with instant restart."
      },
      {
        "id": "lilshey_gaming_04",
        "addedTime": "Sep 30, 2026 • 05:20 PM",
        "batchTag": "Starter Channel Pack (10 Shorts)",
        "title": "The NPC Just Watched Me Suffer 💀 #shorts #gaming",
        "duration": "0:13",
        "quality": "1080x1920 (9:16 Vertical HD)",
        "videoSrc": "/campaigns/lilshey_starter/lilshey_gaming_04.mp4",
        "description": "He didn't even flinch. Cold-blooded 90s game mechanics at their finest.\\n\\n#gaminglife #videogames #meme #comedygaming #classicgames",
        "hashtags": [
          "#gaminglife",
          "#videogames",
          "#meme",
          "#comedygaming",
          "#classicgames"
        ],
        "payoutRate": "$1,000 / 1M Views (Starter Bounty)",
        "loopNote": "Engineered 13s comedy timing loop."
      },
      {
        "id": "lilshey_gaming_05",
        "addedTime": "Sep 30, 2026 • 05:20 PM",
        "batchTag": "Starter Channel Pack (10 Shorts)",
        "title": "Worst Camera Angle in Gaming History 🎥 #shorts #gaming",
        "duration": "0:13",
        "quality": "1080x1920 (9:16 Vertical HD)",
        "videoSrc": "/campaigns/lilshey_starter/lilshey_gaming_05.mp4",
        "description": "Who gave the cameraman a blindfold? You literally have to guess where the platform is!\\n\\n#gamersoftiktok #retrogamingcommunity #fail #funny #gamerhumor",
        "hashtags": [
          "#gamersoftiktok",
          "#retrogamingcommunity",
          "#fail",
          "#funny",
          "#gamerhumor"
        ],
        "payoutRate": "$1,000 / 1M Views (Starter Bounty)",
        "loopNote": "Engineered 13s high-retention blind jump cut."
      },
      {
        "id": "lilshey_gaming_06",
        "addedTime": "Sep 30, 2026 • 05:20 PM",
        "batchTag": "Starter Channel Pack (10 Shorts)",
        "title": "The Voicelines Are Completely Unhinged 😭 #shorts #gaming",
        "duration": "0:13",
        "quality": "1080x1920 (9:16 Vertical HD)",
        "videoSrc": "/campaigns/lilshey_starter/lilshey_gaming_06.mp4",
        "description": "The voice acting in 90s games was either Shakespeare or an absolute hostage situation.\\n\\n#gamingclips #nostalgia #90skids #voiceacting #funnyclips",
        "hashtags": [
          "#gamingclips",
          "#nostalgia",
          "#90skids",
          "#voiceacting",
          "#funnyclips"
        ],
        "payoutRate": "$1,000 / 1M Views (Starter Bounty)",
        "loopNote": "Engineered 13s voiceline punchline loop."
      },
      {
        "id": "lilshey_gaming_07",
        "addedTime": "Sep 30, 2026 • 05:20 PM",
        "batchTag": "Starter Channel Pack (10 Shorts)",
        "title": "A Speedrunner's Absolute Worst Nightmare ⚡ #shorts #speedrun",
        "duration": "0:13",
        "quality": "1080x1920 (9:16 Vertical HD)",
        "videoSrc": "/campaigns/lilshey_starter/lilshey_gaming_07.mp4",
        "description": "One tap of the D-pad and you're launched into the fifth dimension at Mach 3.\\n\\n#speedrun #glitch #gamingglitches #gameplay #funnymoments",
        "hashtags": [
          "#speedrun",
          "#glitch",
          "#gamingglitches",
          "#gameplay",
          "#funnymoments"
        ],
        "payoutRate": "$1,000 / 1M Views (Starter Bounty)",
        "loopNote": "Engineered 12.5s glitch-momentum loop."
      },
      {
        "id": "lilshey_gaming_08",
        "addedTime": "Sep 30, 2026 • 05:20 PM",
        "batchTag": "Starter Channel Pack (10 Shorts)",
        "title": "Missing The Final Jump After 2 Hours 💔 #shorts #gaming",
        "duration": "0:13",
        "quality": "1080x1920 (9:16 Vertical HD)",
        "videoSrc": "/campaigns/lilshey_starter/lilshey_gaming_08.mp4",
        "description": "The sound of pure internal screaming. Hide your controllers before attempting this.\\n\\n#rage #fail #gameover #pain #gamers",
        "hashtags": [
          "#rage",
          "#fail",
          "#gameover",
          "#pain",
          "#gamers"
        ],
        "payoutRate": "$1,000 / 1M Views (Starter Bounty)",
        "loopNote": "Engineered 13s heartbreak-fail loop."
      },
      {
        "id": "lilshey_gaming_09",
        "addedTime": "Sep 30, 2026 • 05:20 PM",
        "batchTag": "Starter Channel Pack (10 Shorts)",
        "title": "Give The Level Designer A Life Sentence 💀 #shorts #gaming",
        "duration": "0:13",
        "quality": "1080x1920 (9:16 Vertical HD)",
        "videoSrc": "/campaigns/lilshey_starter/lilshey_gaming_09.mp4",
        "description": "They woke up, chose pure violence, and shipped it on a CD-ROM. Unforgivable!\\n\\n#gameplayclips #retrogaming #gamingcommunity #leveldesign #viralgaming",
        "hashtags": [
          "#gameplayclips",
          "#retrogaming",
          "#gamingcommunity",
          "#leveldesign",
          "#viralgaming"
        ],
        "payoutRate": "$1,000 / 1M Views (Starter Bounty)",
        "loopNote": "Engineered 12.5s level design rage loop."
      },
      {
        "id": "lilshey_gaming_10",
        "addedTime": "Sep 30, 2026 • 05:20 PM",
        "batchTag": "Starter Channel Pack (10 Shorts)",
        "title": "The Final Stage of Gamer Rage 🤐 #shorts #ragequit",
        "duration": "0:13",
        "quality": "1080x1920 (9:16 Vertical HD)",
        "videoSrc": "/campaigns/lilshey_starter/lilshey_gaming_10.mp4",
        "description": "Not even screaming anymore, just pure empty silence. We have all been there.\\n\\n#ragequit #relatable #gamer #funny #shorts",
        "hashtags": [
          "#ragequit",
          "#relatable",
          "#gamer",
          "#funny",
          "#shorts"
        ],
        "payoutRate": "$1,000 / 1M Views (Starter Bounty)",
        "loopNote": "Engineered 12.5s silent-rage loop."
      }
    ]
  },
  {
    "campaignId": "lilshey_camp_2",
    "campaignName": "Channel 2: Cinema & Viral Trends",
    "category": "High-Virality Entertainment",
    "status": "Standby For Drop",
    "payout": "$1,000 / 1M Views",
    "batches": [
      "All Drops"
    ],
    "clips": []
  }
];

const USMAN_CAMPAIGNS: CampaignSlot[] = [
  {
    "campaignId": "usman_camp_1",
    "campaignName": "Channel 1: Festival Drops & Stage Spectacle (10 Starter Shorts)",
    "category": "EDM Festival, Epic Stage Visuals & Bass Overload",
    "status": "Live & Active (Usman Exclusive)",
    "payout": "$1,000 / 1M Views (Starter Bounty)",
    "batches": [
      "All Drops",
      "Starter Channel Pack (10 Shorts)"
    ],
    "clips": [
      {
        "id": "usman_stage_01",
        "addedTime": "Sep 30, 2026 • 05:20 PM",
        "batchTag": "Starter Channel Pack (10 Shorts)",
        "title": "When The Bass Dropped At 3AM in Miami 🤯 #shorts #edm",
        "duration": "0:13",
        "quality": "1080x1920 (9:16 Vertical HD)",
        "videoSrc": "/campaigns/usman_starter/usman_stage_01.mp4",
        "description": "Miami Factory Town was on another frequency when this drop hit. Unbelievable crowd energy!\\n\\n#EDM #Festival #Dubstep #BassMusic #MiamiNightlife",
        "hashtags": [
          "#EDM",
          "#Festival",
          "#Dubstep",
          "#BassMusic",
          "#MiamiNightlife"
        ],
        "payoutRate": "$1,000 / 1M Views (Starter Bounty)",
        "loopNote": "Engineered 13s festival crowd eruption loop."
      },
      {
        "id": "usman_stage_02",
        "addedTime": "Sep 30, 2026 • 05:20 PM",
        "batchTag": "Starter Channel Pack (10 Shorts)",
        "title": "Can Your Speakers Handle This Low End? 🔊 #shorts #bass",
        "duration": "0:14",
        "quality": "1080x1920 (9:16 Vertical HD)",
        "videoSrc": "/campaigns/usman_starter/usman_stage_02.mp4",
        "description": "Put your headphones on right now. The sub frequencies on this drop will shake your soul!\\n\\n#bassboosted #subwoofer #edmfestival #rave #drops",
        "hashtags": [
          "#bassboosted",
          "#subwoofer",
          "#edmfestival",
          "#rave",
          "#drops"
        ],
        "payoutRate": "$1,000 / 1M Views (Starter Bounty)",
        "loopNote": "Engineered 13.5s sub-bass frequency test loop."
      },
      {
        "id": "usman_stage_03",
        "addedTime": "Sep 30, 2026 • 05:20 PM",
        "batchTag": "Starter Channel Pack (10 Shorts)",
        "title": "Lighting Design Synced To Perfection ✨ #shorts #lasers",
        "duration": "0:14",
        "quality": "1080x1920 (9:16 Vertical HD)",
        "videoSrc": "/campaigns/usman_starter/usman_stage_03.mp4",
        "description": "Every single laser beam hitting precisely on the transient. This is true stage engineering.\\n\\n#lasershow #production #festivalvibes #edmfamily #visuals",
        "hashtags": [
          "#lasershow",
          "#production",
          "#festivalvibes",
          "#edmfamily",
          "#visuals"
        ],
        "payoutRate": "$1,000 / 1M Views (Starter Bounty)",
        "loopNote": "Engineered 14s laser-sync visual loop."
      },
      {
        "id": "usman_stage_04",
        "addedTime": "Sep 30, 2026 • 05:20 PM",
        "batchTag": "Starter Channel Pack (10 Shorts)",
        "title": "Vintage 1950s Vocal Flipped Into Heavy Bass 🤯 #shorts #remix",
        "duration": "0:13",
        "quality": "1080x1920 (9:16 Vertical HD)",
        "videoSrc": "/campaigns/usman_starter/usman_stage_04.mp4",
        "description": "Taking timeless retro vocals and turning them into an absolute festival destroyer!\\n\\n#remix #bassmusic #dubstepdrop #edmlife #festivalbanger",
        "hashtags": [
          "#remix",
          "#bassmusic",
          "#dubstepdrop",
          "#edmlife",
          "#festivalbanger"
        ],
        "payoutRate": "$1,000 / 1M Views (Starter Bounty)",
        "loopNote": "Engineered 13s vintage flip drop loop."
      },
      {
        "id": "usman_stage_05",
        "addedTime": "Sep 30, 2026 • 05:20 PM",
        "batchTag": "Starter Channel Pack (10 Shorts)",
        "title": "The Tension Buildup Was Illegal ⚡ #shorts #edmfestival",
        "duration": "0:14",
        "quality": "1080x1920 (9:16 Vertical HD)",
        "videoSrc": "/campaigns/usman_starter/usman_stage_05.mp4",
        "description": "That 15-second riser had the entire arena holding their breath before the floor erupted.\\n\\n#drop #crowdreactions #festivalenergy #raveculture #electronicmusic",
        "hashtags": [
          "#drop",
          "#crowdreactions",
          "#festivalenergy",
          "#raveculture",
          "#electronicmusic"
        ],
        "payoutRate": "$1,000 / 1M Views (Starter Bounty)",
        "loopNote": "Engineered 13.5s riser suspense loop."
      },
      {
        "id": "usman_stage_06",
        "addedTime": "Sep 30, 2026 • 05:20 PM",
        "batchTag": "Starter Channel Pack (10 Shorts)",
        "title": "Front Row At The Mainstage Pyro Drop 🔥 #shorts #festivals",
        "duration": "0:13",
        "quality": "1080x1920 (9:16 Vertical HD)",
        "videoSrc": "/campaigns/usman_starter/usman_stage_06.mp4",
        "description": "You can literally feel the heat through the screen when the flame cannons fire off!\\n\\n#pyro #mainstage #festivalgoer #festivalseason #basshead",
        "hashtags": [
          "#pyro",
          "#mainstage",
          "#festivalgoer",
          "#festivalseason",
          "#basshead"
        ],
        "payoutRate": "$1,000 / 1M Views (Starter Bounty)",
        "loopNote": "Engineered 12.5s pyro impact loop."
      },
      {
        "id": "usman_stage_07",
        "addedTime": "Sep 30, 2026 • 05:20 PM",
        "batchTag": "Starter Channel Pack (10 Shorts)",
        "title": "Biggie Flow Over Monster Basslines 🎤 #shorts #hiphop #edm",
        "duration": "0:13",
        "quality": "1080x1920 (9:16 Vertical HD)",
        "videoSrc": "/campaigns/usman_starter/usman_stage_07.mp4",
        "description": "10,000 people screaming every bar together. When hip-hop meets underground bass culture!\\n\\n#hiphopremix #rapmusic #bassdrop #crowdchorus #festivals",
        "hashtags": [
          "#hiphopremix",
          "#rapmusic",
          "#bassdrop",
          "#crowdchorus",
          "#festivals"
        ],
        "payoutRate": "$1,000 / 1M Views (Starter Bounty)",
        "loopNote": "Engineered 13s lyrical drop loop."
      },
      {
        "id": "usman_stage_08",
        "addedTime": "Sep 30, 2026 • 05:20 PM",
        "batchTag": "Starter Channel Pack (10 Shorts)",
        "title": "Smoothest BPM Transition You Will Hear Today 🎧 #shorts #djskills",
        "duration": "0:13",
        "quality": "1080x1920 (9:16 Vertical HD)",
        "videoSrc": "/campaigns/usman_starter/usman_stage_08.mp4",
        "description": "Flawless tempo transition right into the heaviest drop of the night. Masterclass behind the decks!\\n\\n#djtips #mixmag #djlifestyle #clubmusic #bangers",
        "hashtags": [
          "#djtips",
          "#mixmag",
          "#djlifestyle",
          "#clubmusic",
          "#bangers"
        ],
        "payoutRate": "$1,000 / 1M Views (Starter Bounty)",
        "loopNote": "Engineered 13s BPM shift loop."
      },
      {
        "id": "usman_stage_09",
        "addedTime": "Sep 30, 2026 • 05:20 PM",
        "batchTag": "Starter Channel Pack (10 Shorts)",
        "title": "FPV Drone Dive Through Red Rocks Stage 🛸 #shorts #cinematic",
        "duration": "0:14",
        "quality": "1080x1920 (9:16 Vertical HD)",
        "videoSrc": "/campaigns/usman_starter/usman_stage_09.mp4",
        "description": "Insane piloting skills threading the needle through the lighting trusses at Dead Rocks!\\n\\n#fpvdrone #dronecinematography #redrocks #visualeffects #epic",
        "hashtags": [
          "#fpvdrone",
          "#dronecinematography",
          "#redrocks",
          "#visualeffects",
          "#epic"
        ],
        "payoutRate": "$1,000 / 1M Views (Starter Bounty)",
        "loopNote": "Engineered 13.5s FPV dive loop."
      },
      {
        "id": "usman_stage_10",
        "addedTime": "Sep 30, 2026 • 05:20 PM",
        "batchTag": "Starter Channel Pack (10 Shorts)",
        "title": "Why Red Rocks Is The Best Venue on Earth 🏔️ #shorts #concert",
        "duration": "0:13",
        "quality": "1080x1920 (9:16 Vertical HD)",
        "videoSrc": "/campaigns/usman_starter/usman_stage_10.mp4",
        "description": "Natural red monolith rocks towering over 10,000 raving music fans. Pure magic!\\n\\n#redrocksamphitheatre #concertphotography #livemusic #musicfestival #bucketlist",
        "hashtags": [
          "#redrocksamphitheatre",
          "#concertphotography",
          "#livemusic",
          "#musicfestival",
          "#bucketlist"
        ],
        "payoutRate": "$1,000 / 1M Views (Starter Bounty)",
        "loopNote": "Engineered 13s aerial venue loop."
      }
    ]
  },
  {
    "campaignId": "usman_camp_2",
    "campaignName": "Channel 2: Stage Lore & FPV Dynamics",
    "category": "Drone Flybys & Lighting Engineering",
    "status": "Standby For Drop",
    "payout": "$1,000 / 1M Views",
    "batches": [
      "All Drops"
    ],
    "clips": []
  }
];

// Lazy-Loaded Deferred Video Component (Loads video byte streams only when triggered)
function DeferredVideoCard({ 
  clip, 
  isSelected, 
  onToggleSelect,
  onOffload,
  onRestore,
  isOffloaded
}: { 
  clip: CampaignClip; 
  isSelected?: boolean; 
  onToggleSelect?: () => void;
  onOffload?: () => void;
  onRestore?: () => void;
  isOffloaded?: boolean;
}) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [copiedTitle, setCopiedTitle] = useState(false);
  const [copiedDesc, setCopiedDesc] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const handleStartStream = () => {
    setIsLoaded(true);
  };

  useEffect(() => {
    if (isLoaded && videoRef.current) {
      const vid = videoRef.current;
      vid.load();
      vid.muted = isMuted;
      vid.play()
        .then(() => setIsPlaying(true))
        .catch(() => {
          // Mobile browser autoplay policy fallback: mute and play smoothly
          vid.muted = true;
          setIsMuted(true);
          vid.play()
            .then(() => setIsPlaying(true))
            .catch(err => console.error("Playback start error:", err));
        });
    }
  }, [isLoaded]);

  const toggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      const nextMuted = !videoRef.current.muted;
      videoRef.current.muted = nextMuted;
      setIsMuted(nextMuted);
    }
  };

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
    <div className={`bg-[#10141e] border rounded-2xl overflow-hidden flex flex-col justify-between transition-all group shadow-xl ${
  isSelected ? "border-blue-500 ring-2 ring-blue-500/40 bg-[#0f1626]" : "border-[#1b2234] hover:border-blue-500/40"
}`}>
      <div>
        <div className="relative aspect-[9/16] max-h-[340px] bg-black overflow-hidden flex items-center justify-center">
          {isLoaded ? (
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              <video
                ref={videoRef}
                src={clip.videoSrc}
                controls
                playsInline
                loop
                preload="auto"
                className="w-full h-full object-contain"
              >
                <source src={clip.videoSrc} type="video/mp4" />
                Your browser does not support the video tag.
              </video>
              {isMuted && isPlaying && (
                <button
                  onClick={toggleMute}
                  className="absolute bottom-12 left-1/2 -translate-x-1/2 bg-black/85 hover:bg-black text-white text-[11px] font-bold px-3.5 py-1.5 rounded-full border border-white/20 flex items-center gap-1.5 backdrop-blur-md shadow-lg transition-all animate-bounce z-10"
                >
                  🔇 Tap to Unmute
                </button>
              )}
            </div>
          ) : (
            <div 
              onClick={handleStartStream}
              className="w-full h-full bg-[#0a0d14] flex flex-col items-center justify-center cursor-pointer group-hover:bg-[#0e131d] transition-all"
            >
              <div className="w-12 h-12 rounded-full bg-blue-600/20 border border-blue-500/40 flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                <Play className="w-5 h-5 text-blue-400 fill-blue-400" />
              </div>
              <span className="text-xs font-semibold text-neutral-300">Click to Stream Clip</span>
              <span className="text-[10px] text-neutral-400 font-mono mt-0.5">{clip.duration} • {clip.quality}</span>
            </div>
          )}
          <div className="absolute top-2.5 left-2.5 bg-black/70 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-mono text-neutral-300 border border-white/10 pointer-events-none">
            {clip.duration}
          </div>
          <div className="absolute top-2.5 right-2.5 bg-emerald-500/80 backdrop-blur-md px-2 py-0.5 rounded-md text-[10px] font-bold text-white pointer-events-none">
            {clip.quality}
          </div>
        </div>

        <div className="p-4 space-y-3">
          {/* Top Row: Multi-Select Toggle & Bold Time Added */}
          <div className="flex items-center justify-between gap-2 flex-wrap pb-1 border-b border-[#1a2336]">
            {isOffloaded ? (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                <Archive className="w-3.5 h-3.5" />
                <span>POSTED / OFFLOADED</span>
              </div>
            ) : (
              <button
                onClick={onToggleSelect}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                  isSelected 
                    ? "bg-blue-600 text-white shadow-md shadow-blue-600/30" 
                    : "bg-[#141a27] text-neutral-400 hover:text-white border border-[#232d43]"
                }`}
              >
                <Check className={`w-3.5 h-3.5 ${isSelected ? "opacity-100" : "opacity-40"}`} />
                <span>{isSelected ? "Selected" : "Select"}</span>
              </button>
            )}

            {clip.addedTime && (
              <div className="flex items-center gap-1 px-2.5 py-1 rounded-md text-[11px] font-mono font-extrabold bg-emerald-500/15 border border-emerald-500/35 text-emerald-400">
                <Clock className="w-3.5 h-3.5" />
                <span>ADDED: <strong>{clip.addedTime}</strong></span>
              </div>
            )}
          </div>

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

        <div className="grid grid-cols-2 gap-2">
          <a
            href={clip.videoSrc}
            download
            className="py-2 px-3 rounded-xl bg-[#141926] hover:bg-[#1b2234] border border-[#1b2234] text-neutral-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download</span>
          </a>

          {isOffloaded ? (
            <button
              onClick={onRestore}
              className="py-2 px-3 rounded-xl bg-purple-600/25 hover:bg-purple-600/45 border border-purple-500/40 text-purple-200 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
              title="Restore clip to active workspace"
            >
              <RotateCcw className="w-3.5 h-3.5 text-purple-400" />
              <span>Restore</span>
            </button>
          ) : (
            <button
              onClick={onOffload}
              className="py-2 px-3 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 hover:text-white text-xs font-semibold flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]"
              title="Offload video (mark as posted to clear workspace)"
            >
              <Trash2 className="w-3.5 h-3.5 text-rose-400" />
              <span>Offload / Posted</span>
            </button>
          )}
        </div>
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
  const [selectedClipIds, setSelectedClipIds] = useState<string[]>([]);
  const [activeBatchFilter, setActiveBatchFilter] = useState<Record<string, string>>({});
  const [slotTab, setSlotTab] = useState<Record<string, "active" | "offloaded">>({});
  const [downloadToast, setDownloadToast] = useState<string>("");

  const [offloadedClipIds, setOffloadedClipIds] = useState<string[]>(() => {
    const user = localStorage.getItem("clipping_user") || "ceo";
    try {
      const saved = localStorage.getItem(`clipping_offloaded_${user}`);
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    if (!currentUser) return;
    try {
      const saved = localStorage.getItem(`clipping_offloaded_${currentUser}`);
      setOffloadedClipIds(saved ? JSON.parse(saved) : []);
    } catch {
      setOffloadedClipIds([]);
    }
    setSelectedClipIds([]);
  }, [currentUser]);

  const handleOffloadClips = (clipIds: string[]) => {
    if (!clipIds.length) return;
    const user = currentUser || "ceo";
    setOffloadedClipIds(prev => {
      const next = Array.from(new Set([...prev, ...clipIds]));
      try {
        localStorage.setItem(`clipping_offloaded_${user}`, JSON.stringify(next));
      } catch (e) {
        console.error("Storage save error:", e);
      }
      return next;
    });
    setSelectedClipIds(prev => prev.filter(id => !clipIds.includes(id)));
    setDownloadToast(`✓ Offloaded ${clipIds.length} posted ${clipIds.length === 1 ? "video" : "videos"} from your workspace.`);
    setTimeout(() => setDownloadToast(""), 4000);
  };

  const handleRestoreClip = (clipId: string) => {
    const user = currentUser || "ceo";
    setOffloadedClipIds(prev => {
      const next = prev.filter(id => id !== clipId);
      try {
        localStorage.setItem(`clipping_offloaded_${user}`, JSON.stringify(next));
      } catch (e) {
        console.error("Storage save error:", e);
      }
      return next;
    });
    setDownloadToast("✓ Restored video to active workspace.");
    setTimeout(() => setDownloadToast(""), 3000);
  };

  const handleRestoreAllInSlot = (slotClipIds: string[]) => {
    const user = currentUser || "ceo";
    setOffloadedClipIds(prev => {
      const next = prev.filter(id => !slotClipIds.includes(id));
      try {
        localStorage.setItem(`clipping_offloaded_${user}`, JSON.stringify(next));
      } catch (e) {
        console.error("Storage save error:", e);
      }
      return next;
    });
    setDownloadToast("✓ Restored all videos to active workspace.");
    setTimeout(() => setDownloadToast(""), 3000);
  };

  const handleToggleSelect = (clipId: string) => {
    setSelectedClipIds(prev => 
      prev.includes(clipId) ? prev.filter(id => id !== clipId) : [...prev, clipId]
    );
  };

  const handleSelectAllInCamp = (clips: CampaignClip[]) => {
    const allIds = clips.map(c => c.id);
    const allSelected = allIds.length > 0 && allIds.every(id => selectedClipIds.includes(id));
    if (allSelected) {
      setSelectedClipIds(prev => prev.filter(id => !allIds.includes(id)));
    } else {
      setSelectedClipIds(prev => Array.from(new Set([...prev, ...allIds])));
    }
  };

  const handleBulkDownload = (items: { url: string; name: string }[]) => {
    if (!items.length) return;
    setDownloadToast(`Starting download of ${items.length} clips...`);
    let idx = 0;
    const downloadNext = () => {
      if (idx >= items.length) {
        setDownloadToast(`✓ All ${items.length} videos downloaded successfully!`);
        setTimeout(() => setDownloadToast(""), 4000);
        return;
      }
      const item = items[idx];
      setDownloadToast(`⬇ Downloading ${idx + 1} of ${items.length}: ${item.name}...`);
      const a = document.createElement("a");
      a.href = item.url;
      a.download = item.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      idx++;
      setTimeout(downloadNext, 600);
    };
    downloadNext();
  };

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
  const campaigns = currentUser === "habeeb" ? HABEEB_CAMPAIGNS : currentUser === "lilshey" ? LILSHEY_CAMPAIGNS : currentUser === "usman" ? USMAN_CAMPAIGNS : CEO_CAMPAIGNS;

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
                {currentUser === "ceo" ? "CEO Executive Suite (2 Dedicated Campaign Slots)" : currentUser === "habeeb" ? "Habeeb Operations Vault (2 Dedicated Campaign Slots)" : currentUser === "lilshey" ? "Lilshey Viral Suite (2 Dedicated Campaign Slots)" : "Usman Growth Suite (2 Dedicated Campaign Slots)"}
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

        {/* Campaign Slots */}
        <div className="space-y-6">
          {campaigns.map((camp, idx) => {
            const currentTab = slotTab[camp.campaignId] || "active";
            const currentBatch = activeBatchFilter[camp.campaignId] || "all";

            // Partition into active vs offloaded for current user account
            const allActiveClips = camp.clips.filter(c => !offloadedClipIds.includes(c.id));
            const allOffloadedClips = camp.clips.filter(c => offloadedClipIds.includes(c.id));

            // Select clips to display based on active tab
            const targetClips = currentTab === "active" ? allActiveClips : allOffloadedClips;
            const visibleClips = targetClips.filter(c => 
              currentBatch === "all" || currentBatch === "All Drops" || c.batchTag === currentBatch
            );

            const selectedInCamp = visibleClips.filter(c => selectedClipIds.includes(c.id));
            const isAllSelected = visibleClips.length > 0 && visibleClips.every(c => selectedClipIds.includes(c.id));

            return (
              <div 
                key={camp.campaignId}
                className="bg-[#10141e] border border-[#1b2234] rounded-2xl p-6 shadow-xl space-y-4"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-[#1b2234] gap-3">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-bold">
                        Slot {idx + 1} // Dedicated
                      </span>
                      <span className="text-xs text-neutral-400">{camp.category}</span>
                    </div>
                    <h3 className="text-lg font-bold text-white">{camp.campaignName}</h3>
                  </div>

                  <div className="flex items-center gap-2.5 flex-wrap">
                    {/* Active vs Offloaded / Posted Tabs */}
                    <div className="flex items-center bg-[#0a0e17] p-1 rounded-xl border border-[#1b2336]">
                      <button
                        onClick={() => setSlotTab(prev => ({ ...prev, [camp.campaignId]: "active" }))}
                        className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                          currentTab === "active"
                            ? "bg-blue-600 text-white shadow-sm"
                            : "text-neutral-400 hover:text-white"
                        }`}
                      >
                        Active ({allActiveClips.length})
                      </button>
                      {allOffloadedClips.length > 0 && (
                        <button
                          onClick={() => setSlotTab(prev => ({ ...prev, [camp.campaignId]: "offloaded" }))}
                          className={`px-3 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                            currentTab === "offloaded"
                              ? "bg-purple-600 text-white shadow-sm"
                              : "text-purple-300 hover:text-purple-100"
                          }`}
                        >
                          <Archive className="w-3 h-3" />
                          <span>Posted / Offloaded ({allOffloadedClips.length})</span>
                        </button>
                      )}
                    </div>

                    <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1.5 rounded-lg">
                      {camp.payout}
                    </span>
                  </div>
                </div>

                {camp.clips.length > 0 ? (
                  <>
                    {/* Action Bar */}
                    {currentTab === "active" ? (
                      <div className="bg-[#0b0e17] border border-[#1b2337] rounded-xl p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-lg">
                        {/* Left: Select All button + Batch filters */}
                        <div className="flex items-center gap-2 flex-wrap">
                          <button
                            onClick={() => handleSelectAllInCamp(visibleClips)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                              isAllSelected
                                ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
                                : "bg-[#141b29] hover:bg-[#1a2336] text-neutral-300 border border-[#232f48]"
                            }`}
                          >
                            <Check className={`w-3.5 h-3.5 ${isAllSelected ? "opacity-100" : "opacity-40"}`} />
                            <span>{isAllSelected ? "Deselect All" : `Select All (${visibleClips.length})`}</span>
                          </button>

                          {/* Batch tag pills */}
                          {camp.batches && camp.batches.length > 0 && (
                            <div className="flex items-center gap-1.5 bg-[#101522] p-1 rounded-lg border border-[#1a2336]">
                              {camp.batches.map(batch => {
                                const isActive = (currentBatch === batch) || (batch === "All Drops" && currentBatch === "all");
                                return (
                                  <button
                                    key={batch}
                                    onClick={() => setActiveBatchFilter(prev => ({ ...prev, [camp.campaignId]: batch === "All Drops" ? "all" : batch }))}
                                    className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                                      isActive
                                        ? "bg-blue-600 text-white shadow-sm"
                                        : "text-neutral-400 hover:text-white"
                                    }`}
                                  >
                                    {batch}
                                  </button>
                                );
                              })}
                            </div>
                          )}
                        </div>

                        {/* Right: Actions (Download or Delete/Offload) */}
                        <div className="flex items-center gap-2 justify-end flex-wrap">
                          {selectedInCamp.length > 0 && (
                            <>
                              <button
                                onClick={() => handleBulkDownload(selectedInCamp.map(c => ({ url: c.videoSrc, name: `${c.id}.mp4` })))}
                                className="flex items-center gap-1.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-xs font-bold px-3.5 py-1.5 rounded-lg shadow-lg shadow-blue-600/30 transition-all active:scale-95"
                              >
                                <Download className="w-3.5 h-3.5" />
                                <span>Download Selected ({selectedInCamp.length})</span>
                              </button>

                              <button
                                onClick={() => handleOffloadClips(selectedInCamp.map(c => c.id))}
                                className="flex items-center gap-1.5 bg-rose-600/90 hover:bg-rose-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg shadow-rose-600/30 transition-all active:scale-95"
                                title="Offload selected clips from your active workspace"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                <span>Delete / Offload ({selectedInCamp.length})</span>
                              </button>
                            </>
                          )}

                          <button
                            onClick={() => handleBulkDownload(visibleClips.map(c => ({ url: c.videoSrc, name: `${c.id}.mp4` })))}
                            className="flex items-center gap-1.5 bg-[#141b29] hover:bg-[#1e273c] border border-[#232f48] text-white text-xs font-bold px-3.5 py-1.5 rounded-lg transition-all active:scale-95"
                          >
                            <Download className="w-3.5 h-3.5 text-blue-400" />
                            <span>Download All ({visibleClips.length})</span>
                          </button>
                        </div>
                      </div>
                    ) : (
                      /* Offloaded Tab Action Bar */
                      <div className="bg-[#0b0e17] border border-purple-900/40 rounded-xl p-3.5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 shadow-lg">
                        <div className="flex items-center gap-2 text-xs text-purple-300 font-medium">
                          <Archive className="w-4 h-4 text-purple-400" />
                          <span>Showing <strong>{visibleClips.length}</strong> videos offloaded for your account. You can restore or download them anytime.</span>
                        </div>

                        <div className="flex items-center gap-2 justify-end">
                          <button
                            onClick={() => handleRestoreAllInSlot(allOffloadedClips.map(c => c.id))}
                            className="flex items-center gap-1.5 bg-purple-600/30 hover:bg-purple-600/50 border border-purple-500/40 text-purple-200 hover:text-white text-xs font-bold px-3.5 py-1.5 rounded-lg transition-all"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Restore All to Workspace</span>
                          </button>

                          <button
                            onClick={() => handleBulkDownload(visibleClips.map(c => ({ url: c.videoSrc, name: `${c.id}.mp4` })))}
                            className="flex items-center gap-1.5 bg-[#141b29] hover:bg-[#1e273c] border border-[#232f48] text-white text-xs font-bold px-3.5 py-1.5 rounded-lg transition-all active:scale-95"
                          >
                            <Download className="w-3.5 h-3.5 text-blue-400" />
                            <span>Download All ({visibleClips.length})</span>
                          </button>
                        </div>
                      </div>
                    )}

                    {visibleClips.length > 0 ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                        {visibleClips.map(clip => (
                          <DeferredVideoCard 
                            key={clip.id} 
                            clip={clip} 
                            isSelected={selectedClipIds.includes(clip.id)}
                            onToggleSelect={() => handleToggleSelect(clip.id)}
                            onOffload={() => handleOffloadClips([clip.id])}
                            onRestore={() => handleRestoreClip(clip.id)}
                            isOffloaded={offloadedClipIds.includes(clip.id)}
                          />
                        ))}
                      </div>
                    ) : (
                      <div className="py-10 px-4 border border-[#232d43] bg-[#0c101a]/70 rounded-xl flex flex-col items-center justify-center text-center">
                        <div className="w-12 h-12 rounded-xl bg-purple-600/15 border border-purple-500/30 flex items-center justify-center mb-3">
                          <CheckCircle2 className="w-6 h-6 text-purple-400" />
                        </div>
                        <h4 className="text-sm font-bold text-white mb-1">
                          {currentTab === "active" ? "All Clips Posted & Offloaded! 🎉" : "No Offloaded Clips"}
                        </h4>
                        <p className="text-xs text-neutral-400 max-w-md mb-3">
                          {currentTab === "active" 
                            ? "Your workspace for this slot is clear. You can review, download, or restore any posted clips from the Offloaded tab anytime."
                            : "You haven't offloaded any clips in this campaign slot yet."}
                        </p>
                        {currentTab === "active" && allOffloadedClips.length > 0 && (
                          <button
                            onClick={() => setSlotTab(prev => ({ ...prev, [camp.campaignId]: "offloaded" }))}
                            className="px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold flex items-center gap-1.5 shadow-lg transition-all"
                          >
                            <Archive className="w-3.5 h-3.5" />
                            <span>View Offloaded Clips ({allOffloadedClips.length})</span>
                          </button>
                        )}
                      </div>
                    )}
                  </>
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
            );
          })}
        </div>

      </main>

      {/* Global Floating Action Bar for Selected Clips */}
      {selectedClipIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 bg-[#0e1422]/95 backdrop-blur-xl border border-blue-500/50 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 sm:gap-4 animate-in fade-in slide-in-from-bottom-5 flex-wrap justify-center">
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
            <span className="text-xs font-extrabold tracking-wide">
              {selectedClipIds.length} {selectedClipIds.length === 1 ? "Clip" : "Clips"} Selected
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const allClips = campaigns.flatMap(c => c.clips);
                const toDownload = allClips.filter(c => selectedClipIds.includes(c.id));
                handleBulkDownload(toDownload.map(c => ({ url: c.videoSrc, name: `${c.id}.mp4` })));
              }}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-lg shadow-blue-600/30 flex items-center gap-1.5 transition-all active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Download Selected</span>
            </button>

            <button
              onClick={() => handleOffloadClips(selectedClipIds)}
              className="bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-lg shadow-rose-600/30 flex items-center gap-1.5 transition-all active:scale-95"
              title="Offload selected clips from your account workspace"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Delete / Offload</span>
            </button>

            <button
              onClick={() => setSelectedClipIds([])}
              className="bg-[#192236] hover:bg-[#222e49] text-neutral-300 hover:text-white text-xs font-semibold px-3 py-2 rounded-xl transition-all"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      {downloadToast && (
        <div className="fixed bottom-6 right-6 bg-[#0c101a] border border-blue-500 text-white font-bold text-xs py-3 px-5 rounded-xl shadow-2xl z-50 flex items-center gap-2.5 animate-bounce">
          <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-ping" />
          <span>{downloadToast}</span>
        </div>
      )}
    </div>
  );
}
