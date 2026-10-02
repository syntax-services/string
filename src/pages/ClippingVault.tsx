import React, { useState, useEffect, useRef } from "react";
import {
  motion, AnimatePresence } from "framer-motion";
import { 
  Lock, LogOut, Download, Copy, Check, 
  Shield, Flame, Sparkles, Clock, AlertCircle, ArrowUpRight,
  Zap, Play, CheckCircle2, Trash2, RotateCcw, Archive,
  Volume2, VolumeX, SkipForward, Pause, Disc3, Music
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

export interface AlbumTrack {
  id: string;
  title: string;
  artist: string;
  album: string;
  src: string;
  duration: number;
}

// 16-Track Master Album: Tml Vibez - A Street Kid's Diary (Disk 2) [Released Oct 2, 2026]
const TML_VIBEZ_ALBUM: AlbumTrack[] = [
  { id: "tml_01", title: "Eyes On Me", artist: "Tml Vibez", album: "A Street Kid's Diary (Disk 2)", src: "/audio/tml_01_eyes_on_me.mp3", duration: 179 },
  { id: "tml_02", title: "Delilah (feat. Vory)", artist: "Tml Vibez", album: "A Street Kid's Diary (Disk 2)", src: "/audio/tml_02_delilah.mp3", duration: 128 },
  { id: "tml_03", title: "Hello (feat. Victony)", artist: "Tml Vibez", album: "A Street Kid's Diary (Disk 2)", src: "/audio/tml_03_hello_victony.mp3", duration: 147 },
  { id: "tml_04", title: "Poku", artist: "Tml Vibez", album: "A Street Kid's Diary (Disk 2)", src: "/audio/tml_04_poku.mp3", duration: 142 },
  { id: "tml_05", title: "Diamond or Gold", artist: "Tml Vibez", album: "A Street Kid's Diary (Disk 2)", src: "/audio/tml_05_diamond_or_gold.mp3", duration: 138 },
  { id: "tml_06", title: "Gentleman", artist: "Tml Vibez", album: "A Street Kid's Diary (Disk 2)", src: "/audio/tml_06_gentleman.mp3", duration: 130 },
  { id: "tml_07", title: "Shuperu (feat. Ayo Maff & Shoday)", artist: "Tml Vibez", album: "A Street Kid's Diary (Disk 2)", src: "/audio/tml_07_shuperu.mp3", duration: 156 },
  { id: "tml_08", title: "SHON PE (Count Your Money)", artist: "Tml Vibez", album: "A Street Kid's Diary (Disk 2)", src: "/audio/tml_08_shon_pe_count_money.mp3", duration: 149 },
  { id: "tml_09", title: "CnF (Gbewa)", artist: "Tml Vibez", album: "A Street Kid's Diary (Disk 2)", src: "/audio/tml_09_cnf_gbewa.mp3", duration: 155 },
  { id: "tml_10", title: "Mashe", artist: "Tml Vibez", album: "A Street Kid's Diary (Disk 2)", src: "/audio/tml_10_mashe.mp3", duration: 157 },
  { id: "tml_11", title: "Allow Me (feat. Lasmid)", artist: "Tml Vibez", album: "A Street Kid's Diary (Disk 2)", src: "/audio/tml_11_allow_me.mp3", duration: 158 },
  { id: "tml_12", title: "Close To You", artist: "Tml Vibez", album: "A Street Kid's Diary (Disk 2)", src: "/audio/tml_12_close_to_you.mp3", duration: 114 },
  { id: "tml_13", title: "Eko (feat. Blaqbonez)", artist: "Tml Vibez", album: "A Street Kid's Diary (Disk 2)", src: "/audio/tml_13_eko_blaqbonez.mp3", duration: 151 },
  { id: "tml_14", title: "Sexy Mama (feat. Mavo)", artist: "Tml Vibez", album: "A Street Kid's Diary (Disk 2)", src: "/audio/tml_14_sexy_mama.mp3", duration: 160 },
  { id: "tml_15", title: "Burst My Head", artist: "Tml Vibez", album: "A Street Kid's Diary (Disk 2)", src: "/audio/tml_15_burst_my_head.mp3", duration: 139 },
  { id: "tml_16", title: "Radio", artist: "Tml Vibez", album: "A Street Kid's Diary (Disk 2)", src: "/audio/tml_16_radio.mp3", duration: 165 }
];

const TARGET_VOLUME = 0.55; // Crisp background volume

function shuffleTracks<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

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
    "campaignId": "ceo_zeds_dead_daily_oct2",
    "campaignName": "Channel 1: Zeds Dead (Today's 25 Unique Drops - Oct 2)",
    "category": "Mainstage Production, Lasers & Drone Acrobatics (Clipr Agency)",
    "status": "Live & Active (Strict CEO Exclusive)",
    "payout": "$3.50 / 1k Views ($175 Max)",
    "batches": [
      "All Drops",
      "Today's 25 Unique Drops (Oct 2)"
    ],
    "clips": [
      {
        "id": "zeds_dead_oct2_01",
        "addedTime": "Oct 02, 2026 • 09:20 AM",
        "batchTag": "Today's 25 Unique Drops (Oct 2)",
        "title": "Ante Up Second Bounce Drop Was Vicious 🥊 @zedsdead #shorts",
        "duration": "0:13",
        "quality": "1080x1920 (9:16 Master HD)",
        "videoSrc": "/campaigns/zeds_dead/zeds_dead_oct2_01_ante_up_bounce.mp4?v=oct2",
        "description": "When the Ante Up flip switches into that second dubstep bounce! Dylan & Zach tore Factory Town apart with this ID 🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMFestival #Dubstep #AnteUp #HipHopRemix",
        "hashtags": [
          "#ZedsDead",
          "#BassMusic",
          "#EDMFestival",
          "#Dubstep",
          "#FestivalSeason"
        ],
        "payoutRate": "$3.50 / 1k Views (Clipr Agency)",
        "loopNote": "100% unique visual cut (13s). Sourced from unreleased concert asset (Ante Up Final.mp4)."
      },
      {
        "id": "zeds_dead_oct2_02",
        "addedTime": "Oct 02, 2026 • 09:20 AM",
        "batchTag": "Today's 25 Unique Drops (Oct 2)",
        "title": "Biggie Smalls Into 140 BPM Heavy Bass 👑 @zedsdead #shorts",
        "duration": "0:13",
        "quality": "1080x1920 (9:16 Master HD)",
        "videoSrc": "/campaigns/zeds_dead/zeds_dead_oct2_02_biggie_vocal_intro.mp4?v=oct2",
        "description": "The vocal buildup of the Biggie edit before the drop. The suspense in the crowd was unreal!\n\n@zedsdead\n\n#ZedsDead #BiggieSmalls #Dubstep #BassMusic #HipHopFlip #EDM",
        "hashtags": [
          "#ZedsDead",
          "#BassMusic",
          "#EDMFestival",
          "#Dubstep",
          "#FestivalSeason"
        ],
        "payoutRate": "$3.50 / 1k Views (Clipr Agency)",
        "loopNote": "100% unique visual cut (13s). Sourced from unreleased concert asset (Biggie edit final.mp4)."
      },
      {
        "id": "zeds_dead_oct2_03",
        "addedTime": "Oct 02, 2026 • 09:20 AM",
        "batchTag": "Today's 25 Unique Drops (Oct 2)",
        "title": "Jay Z Strobe Buildup At 3 AM In Miami 🗽 @zedsdead #shorts",
        "duration": "0:13",
        "quality": "1080x1920 (9:16 Master HD)",
        "videoSrc": "/campaigns/zeds_dead/zeds_dead_oct2_03_jayz_sub_pressure.mp4?v=oct2",
        "description": "3 AM in Miami and Zeds Dead drops the Jay Z buildup with blinding strobes. Pure rave energy!\n\n@zedsdead\n\n#ZedsDead #JayZ #FactoryTown #MiamiRave #Dubstep #BassMusic",
        "hashtags": [
          "#ZedsDead",
          "#BassMusic",
          "#EDMFestival",
          "#Dubstep",
          "#FestivalSeason"
        ],
        "payoutRate": "$3.50 / 1k Views (Clipr Agency)",
        "loopNote": "100% unique visual cut (13s). Sourced from unreleased concert asset (Jay Z Final.mp4)."
      },
      {
        "id": "zeds_dead_oct2_04",
        "addedTime": "Oct 02, 2026 • 09:20 AM",
        "batchTag": "Today's 25 Unique Drops (Oct 2)",
        "title": "Mobb Deep Drums Live At Factory Town 🥁 @zedsdead #shorts",
        "duration": "0:13",
        "quality": "1080x1920 (9:16 Master HD)",
        "videoSrc": "/campaigns/zeds_dead/zeds_dead_oct2_04_shook_ones_drum_intro.mp4?v=oct2",
        "description": "Those classic Mobb Deep snares echoing across the outdoor amphitheatre. Nobody flips hip hop like Zeds Dead.\n\n@zedsdead\n\n#ZedsDead #MobbDeep #ShookOnes #HipHopDubstep #BassMusic #MiamiEDM",
        "hashtags": [
          "#ZedsDead",
          "#BassMusic",
          "#EDMFestival",
          "#Dubstep",
          "#FestivalSeason"
        ],
        "payoutRate": "$3.50 / 1k Views (Clipr Agency)",
        "loopNote": "100% unique visual cut (13s). Sourced from unreleased concert asset (Shook Ones FINAL.mp4)."
      },
      {
        "id": "zeds_dead_oct2_05",
        "addedTime": "Oct 02, 2026 • 09:20 AM",
        "batchTag": "Today's 25 Unique Drops (Oct 2)",
        "title": "The Rolling Snare Buildup That Shook Miami 🌪️ @zedsdead #shorts",
        "duration": "0:14",
        "quality": "1080x1920 (9:16 Master HD)",
        "videoSrc": "/campaigns/zeds_dead/zeds_dead_oct2_05_phuket_rolling_snare.mp4?v=oct2",
        "description": "The accelerated rolling snare riser building up tension right before the colors drop! Pure mastery.\n\n@zedsdead\n\n#ZedsDead #SnareRoll #BassDrop #EDMFestival #Dubstep #BuildUp",
        "hashtags": [
          "#ZedsDead",
          "#BassMusic",
          "#EDMFestival",
          "#Dubstep",
          "#FestivalSeason"
        ],
        "payoutRate": "$3.50 / 1k Views (Clipr Agency)",
        "loopNote": "100% unique visual cut (14s). Sourced from unreleased concert asset (Phuket To Colors .mp4)."
      },
      {
        "id": "zeds_dead_oct2_06",
        "addedTime": "Oct 02, 2026 • 09:20 AM",
        "batchTag": "Today's 25 Unique Drops (Oct 2)",
        "title": "Floating In Deep Purple Lasers 💜 @zedsdead #shorts",
        "duration": "0:14",
        "quality": "1080x1920 (9:16 Master HD)",
        "videoSrc": "/campaigns/zeds_dead/zeds_dead_oct2_06_phuket_purple_break.mp4?v=oct2",
        "description": "The hypnotic purple laser canopy bathing the crowd during the melodic breakdown. Mesmerizing visual design!\n\n@zedsdead\n\n#ZedsDead #PurpleLasers #MelodicBass #VisualDesign #FestivalLights",
        "hashtags": [
          "#ZedsDead",
          "#BassMusic",
          "#EDMFestival",
          "#Dubstep",
          "#FestivalSeason"
        ],
        "payoutRate": "$3.50 / 1k Views (Clipr Agency)",
        "loopNote": "100% unique visual cut (14s). Sourced from unreleased concert asset (Phuket To Colors .mp4)."
      },
      {
        "id": "zeds_dead_oct2_07",
        "addedTime": "Oct 02, 2026 • 09:20 AM",
        "batchTag": "Today's 25 Unique Drops (Oct 2)",
        "title": "The Entire Miami Crowd Singing Along 🗣️ @zedsdead #shorts",
        "duration": "0:14",
        "quality": "1080x1920 (9:16 Master HD)",
        "videoSrc": "/campaigns/zeds_dead/zeds_dead_oct2_07_phuket_crowd_outro.mp4?v=oct2",
        "description": "Thousands of fans singing the melody word for word as the set reaches its emotional climax. Incredible unity!\n\n@zedsdead\n\n#ZedsDead #CrowdSingalong #FestivalFamily #EDMCommunity #Unforgettable",
        "hashtags": [
          "#ZedsDead",
          "#BassMusic",
          "#EDMFestival",
          "#Dubstep",
          "#FestivalSeason"
        ],
        "payoutRate": "$3.50 / 1k Views (Clipr Agency)",
        "loopNote": "100% unique visual cut (14s). Sourced from unreleased concert asset (Phuket To Colors .mp4)."
      },
      {
        "id": "zeds_dead_oct2_08",
        "addedTime": "Oct 02, 2026 • 09:20 AM",
        "batchTag": "Today's 25 Unique Drops (Oct 2)",
        "title": "Big Band Brass Cut Into Dubstep Chords 🎺 @zedsdead #shorts",
        "duration": "0:14",
        "quality": "1080x1920 (9:16 Master HD)",
        "videoSrc": "/campaigns/zeds_dead/zeds_dead_oct2_08_sinatra_brass_climax.mp4?v=oct2",
        "description": "Frank Sinatra's big-band horn section diced directly into heavyweight dubstep stabs. Masterclass production!\n\n@zedsdead\n\n#ZedsDead #FrankSinatra #BrassFlip #BigBandEDM #DubstepRemix",
        "hashtags": [
          "#ZedsDead",
          "#BassMusic",
          "#EDMFestival",
          "#Dubstep",
          "#FestivalSeason"
        ],
        "payoutRate": "$3.50 / 1k Views (Clipr Agency)",
        "loopNote": "100% unique visual cut (14s). Sourced from unreleased concert asset (Sinatra Full FINAL.mp4)."
      },
      {
        "id": "zeds_dead_oct2_09",
        "addedTime": "Oct 02, 2026 • 09:20 AM",
        "batchTag": "Today's 25 Unique Drops (Oct 2)",
        "title": "Rapid Tempo Switch That Caught Everyone Off Guard 🚨 @zedsdead #shorts",
        "duration": "0:14",
        "quality": "1080x1920 (9:16 Master HD)",
        "videoSrc": "/campaigns/zeds_dead/zeds_dead_oct2_09_sinatra_fast_tempo.mp4?v=oct2",
        "description": "Dylan and Zach pulling off an insane double-time tempo acceleration live on the decks. Watch the crowd erupt!\n\n@zedsdead\n\n#ZedsDead #TempoSwitch #DJSkills #Dubstep #BassHead",
        "hashtags": [
          "#ZedsDead",
          "#BassMusic",
          "#EDMFestival",
          "#Dubstep",
          "#FestivalSeason"
        ],
        "payoutRate": "$3.50 / 1k Views (Clipr Agency)",
        "loopNote": "100% unique visual cut (14s). Sourced from unreleased concert asset (SINATRA SHORT FINAL.mp4)."
      },
      {
        "id": "zeds_dead_oct2_10",
        "addedTime": "Oct 02, 2026 • 09:20 AM",
        "batchTag": "Today's 25 Unique Drops (Oct 2)",
        "title": "Drone Spiraling Down 60 Feet Through Trussing 🌀 @zedsdead #shorts",
        "duration": "0:14",
        "quality": "1080x1920 (9:16 Master HD)",
        "videoSrc": "/campaigns/zeds_dead/zeds_dead_oct2_10_jamboree_spiral_14.mp4?v=oct2",
        "description": "Insane precision FPV pilot diving down through three layers of aluminum trussing without touching a wire!\n\n@zedsdead\n\n#ZedsDead #FPVDrone #PrecisionFlight #StageRigging #ExtremeCinematography",
        "hashtags": [
          "#ZedsDead",
          "#BassMusic",
          "#EDMFestival",
          "#Dubstep",
          "#FestivalSeason"
        ],
        "payoutRate": "$3.50 / 1k Views (Clipr Agency)",
        "loopNote": "100% unique visual cut (14s). Sourced from unreleased concert asset (FPV RAW 14.mov)."
      },
      {
        "id": "zeds_dead_oct2_11",
        "addedTime": "Oct 02, 2026 • 09:20 AM",
        "batchTag": "Today's 25 Unique Drops (Oct 2)",
        "title": "Incredible Flyby of Massive Subwoofer Arrays 🔊 @zedsdead #shorts",
        "duration": "0:14",
        "quality": "1080x1920 (9:16 Master HD)",
        "videoSrc": "/campaigns/zeds_dead/zeds_dead_oct2_11_jamboree_speaker_sweep_15.mp4?v=oct2",
        "description": "Flying right in front of the giant PK Sound subwoofer stacks. You can literally see the air vibrating!\n\n@zedsdead\n\n#ZedsDead #PKSound #Subwoofers #BassMusic #FestivalRig",
        "hashtags": [
          "#ZedsDead",
          "#BassMusic",
          "#EDMFestival",
          "#Dubstep",
          "#FestivalSeason"
        ],
        "payoutRate": "$3.50 / 1k Views (Clipr Agency)",
        "loopNote": "100% unique visual cut (14s). Sourced from unreleased concert asset (FPV RAW 15.mov)."
      },
      {
        "id": "zeds_dead_oct2_12",
        "addedTime": "Oct 02, 2026 • 09:20 AM",
        "batchTag": "Today's 25 Unique Drops (Oct 2)",
        "title": "Sky-High Dive Across The Amphitheatre Bowl 🦅 @zedsdead #shorts",
        "duration": "0:14",
        "quality": "1080x1920 (9:16 Master HD)",
        "videoSrc": "/campaigns/zeds_dead/zeds_dead_oct2_12_jamboree_bowl_dive_15.mp4?v=oct2",
        "description": "FPV drone climbing high above the arena before rocketing down towards the DJ platform. Breathtaking angle!\n\n@zedsdead\n\n#ZedsDead #Amphitheatre #DroneDive #ConcertVisuals #EpicShots",
        "hashtags": [
          "#ZedsDead",
          "#BassMusic",
          "#EDMFestival",
          "#Dubstep",
          "#FestivalSeason"
        ],
        "payoutRate": "$3.50 / 1k Views (Clipr Agency)",
        "loopNote": "100% unique visual cut (14s). Sourced from unreleased concert asset (FPV RAW 15.mov)."
      },
      {
        "id": "zeds_dead_oct2_13",
        "addedTime": "Oct 02, 2026 • 09:20 AM",
        "batchTag": "Today's 25 Unique Drops (Oct 2)",
        "title": "Inches From The CDJs And Mixer Decks 🎚️ @zedsdead #shorts",
        "duration": "0:13",
        "quality": "1080x1920 (9:16 Master HD)",
        "videoSrc": "/campaigns/zeds_dead/zeds_dead_oct2_13_jamboree_mixer_closeup_16.mp4?v=oct2",
        "description": "Close-up drone flyby passing right over the Pioneer DJ setup. The level of flight control is astonishing!\n\n@zedsdead\n\n#ZedsDead #PioneerDJ #CDJ3000 #BehindTheDecks #DJGear",
        "hashtags": [
          "#ZedsDead",
          "#BassMusic",
          "#EDMFestival",
          "#Dubstep",
          "#FestivalSeason"
        ],
        "payoutRate": "$3.50 / 1k Views (Clipr Agency)",
        "loopNote": "100% unique visual cut (13s). Sourced from unreleased concert asset (FPV RAW 16.mov)."
      },
      {
        "id": "zeds_dead_oct2_14",
        "addedTime": "Oct 02, 2026 • 09:20 AM",
        "batchTag": "Today's 25 Unique Drops (Oct 2)",
        "title": "Giant Neon Laser Arc Over The Stage 🌈 @zedsdead #shorts",
        "duration": "0:14",
        "quality": "1080x1920 (9:16 Master HD)",
        "videoSrc": "/campaigns/zeds_dead/zeds_dead_oct2_14_jamboree_laser_arc_17.mp4?v=oct2",
        "description": "Hovering directly under a rainbow laser arch spanning 120 feet across the stage width. Cinema quality!\n\n@zedsdead\n\n#ZedsDead #LaserArch #StageLighting #ConcertProduction #EDMVisuals",
        "hashtags": [
          "#ZedsDead",
          "#BassMusic",
          "#EDMFestival",
          "#Dubstep",
          "#FestivalSeason"
        ],
        "payoutRate": "$3.50 / 1k Views (Clipr Agency)",
        "loopNote": "100% unique visual cut (14s). Sourced from unreleased concert asset (FPV RAW 17.mov)."
      },
      {
        "id": "zeds_dead_oct2_15",
        "addedTime": "Oct 02, 2026 • 09:20 AM",
        "batchTag": "Today's 25 Unique Drops (Oct 2)",
        "title": "Pulsing Strobe Flight Run Towards The Front ⚡ @zedsdead #shorts",
        "duration": "0:13",
        "quality": "1080x1920 (9:16 Master HD)",
        "videoSrc": "/campaigns/zeds_dead/zeds_dead_oct2_15_jamboree_pulse_approach_18.mp4?v=oct2",
        "description": "Drone racing towards the stage front apron as blinding white blinders pulse in rhythm. Epic pacing!\n\n@zedsdead\n\n#ZedsDead #Strobes #DroneRacing #FestivalVibes #BassNation",
        "hashtags": [
          "#ZedsDead",
          "#BassMusic",
          "#EDMFestival",
          "#Dubstep",
          "#FestivalSeason"
        ],
        "payoutRate": "$3.50 / 1k Views (Clipr Agency)",
        "loopNote": "100% unique visual cut (13s). Sourced from unreleased concert asset (FPV RAW 18.mov)."
      },
      {
        "id": "zeds_dead_oct2_16",
        "addedTime": "Oct 02, 2026 • 09:20 AM",
        "batchTag": "Today's 25 Unique Drops (Oct 2)",
        "title": "Testing The Massive LED Monolith Wall 🖥️ @zedsdead #shorts",
        "duration": "0:14",
        "quality": "1080x1920 (9:16 Master HD)",
        "videoSrc": "/campaigns/zeds_dead/zeds_dead_oct2_16_n1_led_wall_1.mp4?v=oct2",
        "description": "Night 1 stage technicians calibrating the massive 8K LED back wall. The resolution from the drone is staggering!\n\n@zedsdead\n\n#ZedsDead #LEDWall #StageTech #ConcertEngineering #DeadRocks",
        "hashtags": [
          "#ZedsDead",
          "#BassMusic",
          "#EDMFestival",
          "#Dubstep",
          "#FestivalSeason"
        ],
        "payoutRate": "$3.50 / 1k Views (Clipr Agency)",
        "loopNote": "100% unique visual cut (14s). Sourced from unreleased concert asset (FPV RAW 1.mov)."
      },
      {
        "id": "zeds_dead_oct2_17",
        "addedTime": "Oct 02, 2026 • 09:20 AM",
        "batchTag": "Today's 25 Unique Drops (Oct 2)",
        "title": "Amber Laser Grid Cutting The Night Sky 🌌 @zedsdead #shorts",
        "duration": "0:13",
        "quality": "1080x1920 (9:16 Master HD)",
        "videoSrc": "/campaigns/zeds_dead/zeds_dead_oct2_17_n1_amber_laser_field_3.mp4?v=oct2",
        "description": "Rare amber and gold laser diodes shooting straight into the Colorado sky during tour dress rehearsal.\n\n@zedsdead\n\n#ZedsDead #AmberLasers #LaserDiode #RedRocks #ColoradoEDM",
        "hashtags": [
          "#ZedsDead",
          "#BassMusic",
          "#EDMFestival",
          "#Dubstep",
          "#FestivalSeason"
        ],
        "payoutRate": "$3.50 / 1k Views (Clipr Agency)",
        "loopNote": "100% unique visual cut (13s). Sourced from unreleased concert asset (FPV RAW 3.mov)."
      },
      {
        "id": "zeds_dead_oct2_18",
        "addedTime": "Oct 02, 2026 • 09:20 AM",
        "batchTag": "Today's 25 Unique Drops (Oct 2)",
        "title": "Eerie Beauty Of The Empty Arena Before Showtime 🏟️ @zedsdead #shorts",
        "duration": "0:13",
        "quality": "1080x1920 (9:16 Master HD)",
        "videoSrc": "/campaigns/zeds_dead/zeds_dead_oct2_18_n1_empty_bowl_sweep_4.mp4?v=oct2",
        "description": "The calm before the storm. Sweeping across the empty red sandstone benches before 10,000 bassheads arrive.\n\n@zedsdead\n\n#ZedsDead #CalmBeforeTheStorm #RedRocksAmphitheatre #BassCulture #LiveMusic",
        "hashtags": [
          "#ZedsDead",
          "#BassMusic",
          "#EDMFestival",
          "#Dubstep",
          "#FestivalSeason"
        ],
        "payoutRate": "$3.50 / 1k Views (Clipr Agency)",
        "loopNote": "100% unique visual cut (13s). Sourced from unreleased concert asset (FPV RAW 4.mov)."
      },
      {
        "id": "zeds_dead_oct2_19",
        "addedTime": "Oct 02, 2026 • 09:20 AM",
        "batchTag": "Today's 25 Unique Drops (Oct 2)",
        "title": "From The Front Row Riser Looking Straight Up ⬆️ @zedsdead #shorts",
        "duration": "0:14",
        "quality": "1080x1920 (9:16 Master HD)",
        "videoSrc": "/campaigns/zeds_dead/zeds_dead_oct2_19_n1_center_riser_5.mp4?v=oct2",
        "description": "Drone pulling a steep vertical climb right from the front barricade straight into the lighting rig.\n\n@zedsdead\n\n#ZedsDead #VerticalClimb #FPVDrone #StageCraft #BassShow",
        "hashtags": [
          "#ZedsDead",
          "#BassMusic",
          "#EDMFestival",
          "#Dubstep",
          "#FestivalSeason"
        ],
        "payoutRate": "$3.50 / 1k Views (Clipr Agency)",
        "loopNote": "100% unique visual cut (14s). Sourced from unreleased concert asset (FPV RAW 5.mov)."
      },
      {
        "id": "zeds_dead_oct2_20",
        "addedTime": "Oct 02, 2026 • 09:20 AM",
        "batchTag": "Today's 25 Unique Drops (Oct 2)",
        "title": "Inside The Futuristic Spaceship DJ Cockpit 🛸 @zedsdead #shorts",
        "duration": "0:14",
        "quality": "1080x1920 (9:16 Master HD)",
        "videoSrc": "/campaigns/zeds_dead/zeds_dead_oct2_20_n2_spaceship_cockpit_6.mp4?v=oct2",
        "description": "Look at the custom spaceship console built for the Dead Rocks stage design. Straight out of sci-fi cinema!\n\n@zedsdead\n\n#ZedsDead #SpaceshipCockpit #StageDesign #Futuristic #SciFiEDM",
        "hashtags": [
          "#ZedsDead",
          "#BassMusic",
          "#EDMFestival",
          "#Dubstep",
          "#FestivalSeason"
        ],
        "payoutRate": "$3.50 / 1k Views (Clipr Agency)",
        "loopNote": "100% unique visual cut (14s). Sourced from unreleased concert asset (FPV RAW 6.mov)."
      },
      {
        "id": "zeds_dead_oct2_21",
        "addedTime": "Oct 02, 2026 • 09:20 AM",
        "batchTag": "Today's 25 Unique Drops (Oct 2)",
        "title": "The Massive Laser Pyramid Fully Activated 📐 @zedsdead #shorts",
        "duration": "0:14",
        "quality": "1080x1920 (9:16 Master HD)",
        "videoSrc": "/campaigns/zeds_dead/zeds_dead_oct2_21_n2_laser_pyramid_ceiling_6.mp4?v=oct2",
        "description": "The moment the full laser pyramid rig reaches 100% output. A solid ceiling of emerald green beams!\n\n@zedsdead\n\n#ZedsDead #LaserPyramid #FullPower #EDMProduction #FestivalStage",
        "hashtags": [
          "#ZedsDead",
          "#BassMusic",
          "#EDMFestival",
          "#Dubstep",
          "#FestivalSeason"
        ],
        "payoutRate": "$3.50 / 1k Views (Clipr Agency)",
        "loopNote": "100% unique visual cut (14s). Sourced from unreleased concert asset (FPV RAW 6.mov)."
      },
      {
        "id": "zeds_dead_oct2_22",
        "addedTime": "Oct 02, 2026 • 09:20 AM",
        "batchTag": "Today's 25 Unique Drops (Oct 2)",
        "title": "Crimson Lasers Slicing Through Thick Mountain Fog 🌫️ @zedsdead #shorts",
        "duration": "0:14",
        "quality": "1080x1920 (9:16 Master HD)",
        "videoSrc": "/campaigns/zeds_dead/zeds_dead_oct2_22_n2_crimson_fog_sea_7.mp4?v=oct2",
        "description": "Heavy atmospheric cryo fog rolling down the natural rocks illuminated in blood red. Hauntingly gorgeous!\n\n@zedsdead\n\n#ZedsDead #CryoFog #Atmosphere #CrimsonLasers #StageArt",
        "hashtags": [
          "#ZedsDead",
          "#BassMusic",
          "#EDMFestival",
          "#Dubstep",
          "#FestivalSeason"
        ],
        "payoutRate": "$3.50 / 1k Views (Clipr Agency)",
        "loopNote": "100% unique visual cut (14s). Sourced from unreleased concert asset (FPV RAW 7.mov)."
      },
      {
        "id": "zeds_dead_oct2_23",
        "addedTime": "Oct 02, 2026 • 09:20 AM",
        "batchTag": "Today's 25 Unique Drops (Oct 2)",
        "title": "Freefall Drone Descent Right Over The Center Sub 🎯 @zedsdead #shorts",
        "duration": "0:13",
        "quality": "1080x1920 (9:16 Master HD)",
        "videoSrc": "/campaigns/zeds_dead/zeds_dead_oct2_23_n2_truss_vertical_drop_8.mp4?v=oct2",
        "description": "Freefalling down from the main speaker cluster right down to stage floor level. Heart-pounding perspective!\n\n@zedsdead\n\n#ZedsDead #FreefallDrone #ExtremeFPV #AdrenalineRush #StageFlight",
        "hashtags": [
          "#ZedsDead",
          "#BassMusic",
          "#EDMFestival",
          "#Dubstep",
          "#FestivalSeason"
        ],
        "payoutRate": "$3.50 / 1k Views (Clipr Agency)",
        "loopNote": "100% unique visual cut (13s). Sourced from unreleased concert asset (FPV RAW 8.mov)."
      },
      {
        "id": "zeds_dead_oct2_24",
        "addedTime": "Oct 02, 2026 • 09:20 AM",
        "batchTag": "Today's 25 Unique Drops (Oct 2)",
        "title": "100 Strobes Firing Simultaneously In Total Darkness ⚡ @zedsdead #shorts",
        "duration": "0:13",
        "quality": "1080x1920 (9:16 Master HD)",
        "videoSrc": "/campaigns/zeds_dead/zeds_dead_oct2_24_n2_white_strobe_blizzard_9.mp4?v=oct2",
        "description": "When the entire lighting rig goes completely pitch black before hitting you with a whiteout strobe blizzard!\n\n@zedsdead\n\n#ZedsDead #Whiteout #StrobeBlizzard #FestivalLighting #RaveMoments",
        "hashtags": [
          "#ZedsDead",
          "#BassMusic",
          "#EDMFestival",
          "#Dubstep",
          "#FestivalSeason"
        ],
        "payoutRate": "$3.50 / 1k Views (Clipr Agency)",
        "loopNote": "100% unique visual cut (13s). Sourced from unreleased concert asset (FPV RAW 9.mov)."
      },
      {
        "id": "zeds_dead_oct2_25",
        "addedTime": "Oct 02, 2026 • 09:20 AM",
        "batchTag": "Today's 25 Unique Drops (Oct 2)",
        "title": "Full 360 Colosseum Panorama Over The Amphitheatre 🏟️ @zedsdead #shorts",
        "duration": "0:14",
        "quality": "1080x1920 (9:16 Master HD)",
        "videoSrc": "/campaigns/zeds_dead/zeds_dead_oct2_25_n2_colosseum_panorama_10.mp4?v=oct2",
        "description": "The ultimate panoramic shot showing the entire venue illuminated in full production splendor. Iconic finale!\n\n@zedsdead\n\n#ZedsDead #ColosseumShot #360Panorama #Amphitheatre #GrandFinale",
        "hashtags": [
          "#ZedsDead",
          "#BassMusic",
          "#EDMFestival",
          "#Dubstep",
          "#FestivalSeason"
        ],
        "payoutRate": "$3.50 / 1k Views (Clipr Agency)",
        "loopNote": "100% unique visual cut (14s). Sourced from unreleased concert asset (FPV RAW 10.mov)."
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
      "Today's 15 Masterclass Narrative Drops (Oct 2)"
    ],
    "clips": [
      {
            "id": "bubsy_oct2_01",
            "addedTime": "Oct 02, 2026 • 01:45 PM",
            "batchTag": "Today's 15 Masterclass Narrative Drops (Oct 2)",
            "title": "Bubsy 4D - The Mascot We All Thought Was Dead Is Finally Back! 🐱🔥 #shorts",
            "duration": "0:20",
            "quality": "1080x1920 (9:16 Master Short)",
            "videoSrc": "/campaigns/bubsy_ugc/bubsy_oct2_01.mp4?v=oct2_unique_v2",
            "description": "Atari really brought back Bubsy the Bobcat in 2026! Clean momentum, vertical wall climbing, and hilarious self-aware dialogue! 🚀\n\n#Bubsy4D #Atari #GamingNews #RetroComeback #SteamGames",
            "hashtags": [
                  "#Bubsy4D",
                  "#Atari",
                  "#GamingNews",
                  "#RetroComeback",
                  "#SteamGames"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "20s complete opening hook and mascot comeback narrative ending at natural sentence silence."
      },
      {
            "id": "bubsy_oct2_02",
            "addedTime": "Oct 02, 2026 • 01:45 PM",
            "batchTag": "Today's 15 Masterclass Narrative Drops (Oct 2)",
            "title": "How Bubsy 4D Solved 30 Years of Broken Platforming 🕹️ #shorts",
            "duration": "0:22",
            "quality": "1080x1920 (9:16 Master Short)",
            "videoSrc": "/campaigns/bubsy_ugc/bubsy_oct2_02.mp4?v=oct2_unique_v2",
            "description": "They fixed the one thing everyone hated about 90s Bubsy: momentum control! Now you can chain air glides into full-speed rail slides effortlessly. 🐱💨\n\n#GameDev #Platformer #Mechanics #RetroGaming #IndieGame",
            "hashtags": [
                  "#GameDev",
                  "#Platformer",
                  "#Mechanics",
                  "#RetroGaming",
                  "#IndieGame"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "22s full second half breakdown of modernized momentum physics ending in clean outro."
      },
      {
            "id": "bubsy_oct2_03",
            "addedTime": "Oct 02, 2026 • 01:45 PM",
            "batchTag": "Today's 15 Masterclass Narrative Drops (Oct 2)",
            "title": "Return of The Legendary 90s Bobcat Nobody Asked For... But It Slaps! 💀 #shorts",
            "duration": "0:30",
            "quality": "1080x1920 (9:16 Master Short)",
            "videoSrc": "/campaigns/bubsy_ugc/bubsy_oct2_03.mp4?v=oct2_unique_v2",
            "description": "Who asked for a Bubsy game in 2026? Nobody. But did they cook with this gameplay loop? Absolutely! 🐱🔥\n\n#gamingmemes #retrogaming #gamereview #funnymoments #nostalgia",
            "hashtags": [
                  "#gamingmemes",
                  "#retrogaming",
                  "#gamereview",
                  "#funnymoments",
                  "#nostalgia"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "30s complete narrative on the hilarious irony of Bubsy's unexpected comeback."
      },
      {
            "id": "bubsy_oct2_04",
            "addedTime": "Oct 02, 2026 • 01:45 PM",
            "batchTag": "Today's 15 Masterclass Narrative Drops (Oct 2)",
            "title": "Bubsy 4D Might Be Gaming's Biggest Redemption Story Ever 🤯 #shorts",
            "duration": "0:28",
            "quality": "1080x1920 (9:16 Master Short)",
            "videoSrc": "/campaigns/bubsy_ugc/bubsy_oct2_04.mp4?v=oct2_unique_v2",
            "description": "Bubsy spent decades being remembered as one of the biggest disasters in video game history. But this new reboot completely rewrote the playbook! 🕹️\n\n#gamingnews #redemptionarc #gamersoftiktok #retrogaming #gamingcommunity",
            "hashtags": [
                  "#gamingnews",
                  "#redemptionarc",
                  "#gamersoftiktok",
                  "#retrogaming",
                  "#gamingcommunity"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "28s complete historical comparison from 90s flop to 2026 redemption ending at clean silence."
      },
      {
            "id": "bubsy_oct2_05",
            "addedTime": "Oct 02, 2026 • 01:45 PM",
            "batchTag": "Today's 15 Masterclass Narrative Drops (Oct 2)",
            "title": "Why Modern Speedrunners Love The New Momentum Physics ⚡ #shorts",
            "duration": "0:25",
            "quality": "1080x1920 (9:16 Master Short)",
            "videoSrc": "/campaigns/bubsy_ugc/bubsy_oct2_05.mp4?v=oct2_unique_v2",
            "description": "Speedrunners are finding out that chaining wall kicks and ceiling launches creates an unbeatable flow state! Atari actually made something special here. 🚀\n\n#speedrun #gametok #physics #gameplay #viralgaming",
            "hashtags": [
                  "#speedrun",
                  "#gametok",
                  "#physics",
                  "#gameplay",
                  "#viralgaming"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "25s full unbroken speedrun analysis and mechanics breakdown ending in clean resolution."
      },
      {
            "id": "bubsy_oct2_06",
            "addedTime": "Oct 02, 2026 • 01:45 PM",
            "batchTag": "Today's 15 Masterclass Narrative Drops (Oct 2)",
            "title": "They Turned Gaming's Most Hated Mascot Into A Fun 3D Platformer 🎮 #shorts",
            "duration": "0:34",
            "quality": "1080x1920 (9:16 Master Short)",
            "videoSrc": "/campaigns/bubsy_ugc/bubsy_oct2_06.mp4?v=oct2_unique_v2",
            "description": "Taking a mascot that practically ended 90s platformers and turning him into a genuinely fast-paced, fluid acrobatic parkour game? You have to respect the turnaround! 🐱💨\n\n#videogames #parkour #indiegame #atari #gameplay",
            "hashtags": [
                  "#videogames",
                  "#parkour",
                  "#indiegame",
                  "#atari",
                  "#gameplay"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "34s complete narrative on modern platforming acrobatics and parkour feel."
      },
      {
            "id": "bubsy_oct2_07",
            "addedTime": "Oct 02, 2026 • 01:45 PM",
            "batchTag": "Today's 15 Masterclass Narrative Drops (Oct 2)",
            "title": "Why Bubsy 4D Is Dividing The Entire Gaming Industry Right Now ⚖️ #shorts",
            "duration": "0:41",
            "quality": "1080x1920 (9:16 Master Short)",
            "videoSrc": "/campaigns/bubsy_ugc/bubsy_oct2_07.mp4?v=oct2_unique_v2",
            "description": "Mixed scores from professional critics, but the player community is going wild over the momentum mechanics! Are critics missing the point of self-aware satire? 💥\n\n#gamingcommunity #gamereviews #steamgames #gamingdrama #shorts",
            "hashtags": [
                  "#gamingcommunity",
                  "#gamereviews",
                  "#steamgames",
                  "#gamingdrama",
                  "#shorts"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "41s complete industry review breakdown: critics vs actual player sentiment."
      },
      {
            "id": "bubsy_oct2_08",
            "addedTime": "Oct 02, 2026 • 01:45 PM",
            "batchTag": "Today's 15 Masterclass Narrative Drops (Oct 2)",
            "title": "Bubsy 4D Dropped On Steam & The Movement Tech Is Pure Chaos 🚀 #shorts",
            "duration": "0:35",
            "quality": "1080x1920 (9:16 Master Short)",
            "videoSrc": "/campaigns/bubsy_ugc/bubsy_oct2_08.mp4?v=oct2_unique_v2",
            "description": "Check out Bubsy 4D live on Steam right now! Glide physics, wall bounces, and aerial launches make this an unexpected hidden gem. 🐱\n\n#steamrelease #pcgaming #speedrunner #platformer #mustplay",
            "hashtags": [
                  "#steamrelease",
                  "#pcgaming",
                  "#speedrunner",
                  "#platformer",
                  "#mustplay"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "35s complete Steam launch gameplay showcase highlighting momentum physics."
      },
      {
            "id": "bubsy_oct2_09",
            "addedTime": "Oct 02, 2026 • 01:45 PM",
            "batchTag": "Today's 15 Masterclass Narrative Drops (Oct 2)",
            "title": "How Do You Reboot A Game Everyone Hated? The Bizarre Genius of Bubsy 4D 💡 #shorts",
            "duration": "0:33",
            "quality": "1080x1920 (9:16 Master Short)",
            "videoSrc": "/campaigns/bubsy_ugc/bubsy_oct2_09.mp4?v=oct2_unique_v2",
            "description": "Atari and the team at Fabraz knew exactly what people thought of Bubsy, and instead of hiding it, they leaned 100% into the meme and built amazing mechanics underneath! 🎯\n\n#gamedesign #devlog #gaminghistory #retrogaming #indiegames",
            "hashtags": [
                  "#gamedesign",
                  "#devlog",
                  "#gaminghistory",
                  "#retrogaming",
                  "#indiegames"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "33s complete narrative breakdown of self-aware satire game design."
      },
      {
            "id": "bubsy_oct2_10",
            "addedTime": "Oct 02, 2026 • 01:45 PM",
            "batchTag": "Today's 15 Masterclass Narrative Drops (Oct 2)",
            "title": "Mascot Platformers Were HUGE In The 90s... And One Just Returned 🐱 #shorts",
            "duration": "0:35",
            "quality": "1080x1920 (9:16 Master Short)",
            "videoSrc": "/campaigns/bubsy_ugc/bubsy_oct2_10.mp4?v=oct2_unique_v2",
            "description": "Back when every studio wanted their own Sonic or Mario, Bubsy stood out as the weirdest cat on the block. Seeing this aesthetic in 2026 feels like a fever dream in the best way possible! 🕹️\n\n#90skids #retrogaming #nostalgia #playstation #classicgaming",
            "hashtags": [
                  "#90skids",
                  "#retrogaming",
                  "#nostalgia",
                  "#playstation",
                  "#classicgaming"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "35s complete 90s mascot era nostalgic narrative comparison."
      },
      {
            "id": "bubsy_oct2_11",
            "addedTime": "Oct 02, 2026 • 01:45 PM",
            "batchTag": "Today's 15 Masterclass Narrative Drops (Oct 2)",
            "title": "The One Gaming Mascot Nobody Expected To Make A Comeback 🔥 #shorts",
            "duration": "0:32",
            "quality": "1080x1920 (9:16 Master Short)",
            "videoSrc": "/campaigns/bubsy_ugc/bubsy_oct2_11.mp4?v=oct2_unique_v2",
            "description": "If you told gamers 5 years ago that Bubsy would have one of the tightest platforming momentum loops in 2026, they would have called you crazy. Never count out the bobcat! 🐾\n\n#unexpected #gaminglife #gamingfacts #gamingshorts #bobcat",
            "hashtags": [
                  "#unexpected",
                  "#gaminglife",
                  "#gamingfacts",
                  "#gamingshorts",
                  "#bobcat"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "32s complete turnaround narrative on gaming's most unexpected modern reboot."
      },
      {
            "id": "bubsy_oct2_12",
            "addedTime": "Oct 02, 2026 • 01:45 PM",
            "batchTag": "Today's 15 Masterclass Narrative Drops (Oct 2)",
            "title": "The Most Underrated Platformer Returns! 1992 vs 2026 (Part 1) ⚡ #shorts",
            "duration": "0:43",
            "quality": "1080x1920 (9:16 Master Short)",
            "videoSrc": "/campaigns/bubsy_ugc/bubsy_oct2_12.mp4?v=oct2_unique_v2",
            "description": "Back in 1992, Bubsy made waves on the Super Nintendo and Genesis. Here is how that 16-bit history led all the way to this brand new 4D playground! 🎮\n\n#snes #sega #retrogaming #evolution #gaminglore",
            "hashtags": [
                  "#snes",
                  "#sega",
                  "#retrogaming",
                  "#evolution",
                  "#gaminglore"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "43s complete Part 1 narrative on Bubsy's 1992 16-bit origins leading to 4D."
      },
      {
            "id": "bubsy_oct2_13",
            "addedTime": "Oct 02, 2026 • 01:45 PM",
            "batchTag": "Today's 15 Masterclass Narrative Drops (Oct 2)",
            "title": "Is Bubsy 4D Actually Worth Playing In 2026? The Honest Verdict (Part 2) 🏆 #shorts",
            "duration": "0:44",
            "quality": "1080x1920 (9:16 Master Short)",
            "videoSrc": "/campaigns/bubsy_ugc/bubsy_oct2_13.mp4?v=oct2_unique_v2",
            "description": "The complete breakdown of whether you should grab Bubsy 4D on Steam. Great music, self-deprecating humor, and genuine speedrunner level design! 🌟\n\n#gameverdict #gamereview #gamingrecommendations #indiegame #worthit",
            "hashtags": [
                  "#gameverdict",
                  "#gamereview",
                  "#gamingrecommendations",
                  "#indiegame",
                  "#worthit"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "44s complete Part 2 verdict covering controls, soundtrack, and replay value."
      },
      {
            "id": "bubsy_oct2_14",
            "addedTime": "Oct 02, 2026 • 01:45 PM",
            "batchTag": "Today's 15 Masterclass Narrative Drops (Oct 2)",
            "title": "What If I Told You Gaming's Most Controversial Mascot Is Actually Fire? 👀 #shorts",
            "duration": "0:26",
            "quality": "1080x1920 (9:16 Master Short)",
            "videoSrc": "/campaigns/bubsy_ugc/bubsy_oct2_14.mp4?v=oct2_unique_v2",
            "description": "Bubsy has had so much hate thrown his way for 3 decades, but once you start chaining these rail-slide combos, you can't put the controller down! 🐱🕹️\n\n#controversial #gamingopinions #funnymoments #gameplay #shorts",
            "hashtags": [
                  "#controversial",
                  "#gamingopinions",
                  "#funnymoments",
                  "#gameplay",
                  "#shorts"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "26s punchy complete narrative challenging the internet's hatred of Bubsy."
      },
      {
            "id": "bubsy_oct2_15",
            "addedTime": "Oct 02, 2026 • 01:45 PM",
            "batchTag": "Today's 15 Masterclass Narrative Drops (Oct 2)",
            "title": "Sonic Had A Forgotten 90s Rival... And He Just Came Back 👀 #shorts",
            "duration": "0:28",
            "quality": "1080x1920 (9:16 Master Short)",
            "videoSrc": "/campaigns/bubsy_ugc/bubsy_oct2_15.mp4?v=oct2_unique_v2",
            "description": "Before the mascot wars cooled off, Bubsy was actively marketed as the edgy rival to Sonic the Hedgehog. Look at how they reimagined the sonic-speed running in full 3D! 💨\n\n#sonicthehedgehog #rivalry #retrogaming #gaminghistory #rivals",
            "hashtags": [
                  "#sonicthehedgehog",
                  "#rivalry",
                  "#retrogaming",
                  "#gaminghistory",
                  "#rivals"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "28s complete historical rivalry narrative: Sonic vs Bubsy 1993 to 2026."
      }
]
  },
  {
    "campaignId": "habeeb_zeds_music",
    "campaignName": "Zeds Dead Music Clipping (Official Electronic/Bass Tour)",
    "category": "Electronic & Bass Music (Deadbeats Records)",
    "status": "Live & Active (Strict Habeeb Exclusive)",
    "payout": "$1,000 / 1M Views ($500 Max)",
    "batches": [
      "All Drops",
      "Today's 20 Music Drops (Oct 2)"
    ],
    "clips": [
      {
            "id": "habeeb_zeds_01",
            "addedTime": "Oct 02, 2026 • 02:30 PM",
            "batchTag": "Today's 20 Music Drops (Oct 2)",
            "title": "Deep Melodic Bass Rolling Through Miami Night Air 🌊 @zedsdead #shorts",
            "duration": "0:16",
            "quality": "1080x1920 (9:16 Vertical HD)",
            "videoSrc": "/campaigns/habeeb_zeds/habeeb_zeds_01.mp4?v=oct2_music",
            "description": "The contrast between silky atmospheric chords and chest-thumping sub-bass in Factory Town. Pure bliss! 🌴🔊\n\n#bassmusic #melodicdubstep #miaminights #festivalseason #zedsdead",
            "hashtags": [
                  "#bassmusic",
                  "#melodicdubstep",
                  "#miaminights",
                  "#festivalseason",
                  "#zedsdead"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "16s melodic chord progression floating over rolling sub pressure."
      },
      {
            "id": "habeeb_zeds_02",
            "addedTime": "Oct 02, 2026 • 02:30 PM",
            "batchTag": "Today's 20 Music Drops (Oct 2)",
            "title": "Rolling Festival Drums That Had 10,000 Moving 🥁 @zedsdead #shorts",
            "duration": "0:16",
            "quality": "1080x1920 (9:16 Vertical HD)",
            "videoSrc": "/campaigns/habeeb_zeds/habeeb_zeds_02.mp4?v=oct2_music",
            "description": "Syncopated percussion breaks building up into another wave of bass. Zeds Dead always knows how to control pacing! ⚡🕺\n\n#drumandbass #dnbdrops #ravefamily #festivalvibes #edm",
            "hashtags": [
                  "#drumandbass",
                  "#dnbdrops",
                  "#ravefamily",
                  "#festivalvibes",
                  "#edm"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "16s driving drum break sequence connecting two massive drops."
      },
      {
            "id": "habeeb_zeds_03",
            "addedTime": "Oct 02, 2026 • 02:30 PM",
            "batchTag": "Today's 20 Music Drops (Oct 2)",
            "title": "Surviving The 4:30 AM Sunrise Bass Finale 🌅 @zedsdead #shorts",
            "duration": "0:16",
            "quality": "1080x1920 (9:16 Vertical HD)",
            "videoSrc": "/campaigns/habeeb_zeds/habeeb_zeds_03.mp4?v=oct2_music",
            "description": "The sky was turning amber and the subwoofers were still rattling the fence line. Miami Music Week survivors know! ☀️🔥\n\n#sunriseset #afterhours #miamimusicweek #factorytown #basslife",
            "hashtags": [
                  "#sunriseset",
                  "#afterhours",
                  "#miamimusicweek",
                  "#factorytown",
                  "#basslife"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "16s sunrise set climax with amber sky and continuous sub rumble."
      },
      {
            "id": "habeeb_zeds_04",
            "addedTime": "Oct 02, 2026 • 02:30 PM",
            "batchTag": "Today's 20 Music Drops (Oct 2)",
            "title": "Sinatra Vocals Floating Over Pure 40Hz Bass Pressure 🎙️ @zedsdead #shorts",
            "duration": "0:16",
            "quality": "1080x1920 (9:16 Vertical HD)",
            "videoSrc": "/campaigns/habeeb_zeds/habeeb_zeds_04.mp4?v=oct2_music",
            "description": "Vintage crooner vocals pitched and reverberating through thousands of watts of sub power. Iconic remix! 🎩🔊\n\n#franksinatra #vintagevibes #remixculture #bassboost #musicmashup",
            "hashtags": [
                  "#franksinatra",
                  "#vintagevibes",
                  "#remixculture",
                  "#bassboost",
                  "#musicmashup"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "16s vintage vocal resonance over deep sub frequencies."
      },
      {
            "id": "habeeb_zeds_05",
            "addedTime": "Oct 02, 2026 • 02:30 PM",
            "batchTag": "Today's 20 Music Drops (Oct 2)",
            "title": "Full Brass Section Hook With Heavy Half-Time Wobble 🎷 @zedsdead #shorts",
            "duration": "0:16",
            "quality": "1080x1920 (9:16 Vertical HD)",
            "videoSrc": "/campaigns/habeeb_zeds/habeeb_zeds_05.mp4?v=oct2_music",
            "description": "Listen to that brass wobble! The half-time groove had the entire venue locked in pure rhythm. 💃🕺\n\n#wobble #halftime #brass #dubstepdrop #groove",
            "hashtags": [
                  "#wobble",
                  "#halftime",
                  "#brass",
                  "#dubstepdrop",
                  "#groove"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "16s brass section wobble progression with live sync."
      },
      {
            "id": "habeeb_zeds_06",
            "addedTime": "Oct 02, 2026 • 02:30 PM",
            "batchTag": "Today's 20 Music Drops (Oct 2)",
            "title": "Notorious B.I.G. Flow Into Relentless Sub Pressure 👑 @zedsdead #shorts",
            "duration": "0:16",
            "quality": "1080x1920 (9:16 Vertical HD)",
            "videoSrc": "/campaigns/habeeb_zeds/habeeb_zeds_06.mp4?v=oct2_music",
            "description": "Biggie's cadence landing right on top of the 808 kick. Brooklyn meets Toronto bass culture! 🏙️🔥\n\n#biggie #eastcoasthiphop #bassheavymusic #ravevibes #edm",
            "hashtags": [
                  "#biggie",
                  "#eastcoasthiphop",
                  "#bassheavymusic",
                  "#ravevibes",
                  "#edm"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "16s classic hip-hop rhyming sequence into heavy sub drop."
      },
      {
            "id": "habeeb_zeds_07",
            "addedTime": "Oct 02, 2026 • 02:30 PM",
            "batchTag": "Today's 20 Music Drops (Oct 2)",
            "title": "High-Octane Stadium Laser Frenzy Into Deep Bass 💥 @zedsdead #shorts",
            "duration": "0:16",
            "quality": "1080x1920 (9:16 Vertical HD)",
            "videoSrc": "/campaigns/habeeb_zeds/habeeb_zeds_07.mp4?v=oct2_music",
            "description": "The moment the green and amber beams swept the entire outdoor terrace. Unreal atmosphere! ⚡🗽\n\n#laserbeam #lightshow #stadiumvibes #miaminights #viral",
            "hashtags": [
                  "#laserbeam",
                  "#lightshow",
                  "#stadiumvibes",
                  "#miaminights",
                  "#viral"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "16s laser sweep across outdoor terrace into deep bass drop."
      },
      {
            "id": "habeeb_zeds_08",
            "addedTime": "Oct 02, 2026 • 02:30 PM",
            "batchTag": "Today's 20 Music Drops (Oct 2)",
            "title": "Classic Mobb Deep Hook With Earth-Shaking Bass 🎤 @zedsdead #shorts",
            "duration": "0:14",
            "quality": "1080x1920 (9:16 Vertical HD)",
            "videoSrc": "/campaigns/habeeb_zeds/habeeb_zeds_08.mp4?v=oct2_music",
            "description": "Havoc and Prodigy's legendary anthem revitalized for modern festival sound systems! 🔊💀\n\n#shookones #mobbdeep #queensbridge #bassdrop #remix",
            "hashtags": [
                  "#shookones",
                  "#mobbdeep",
                  "#queensbridge",
                  "#bassdrop",
                  "#remix"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "14s iconic hip-hop hook with heavy bass accompaniment."
      },
      {
            "id": "habeeb_zeds_09",
            "addedTime": "Oct 02, 2026 • 02:30 PM",
            "batchTag": "Today's 20 Music Drops (Oct 2)",
            "title": "Rapid Horn Breakdown Into Glitching Strobe Assault 🎺 @zedsdead #shorts",
            "duration": "0:16",
            "quality": "1080x1920 (9:16 Vertical HD)",
            "videoSrc": "/campaigns/habeeb_zeds/habeeb_zeds_09.mp4?v=oct2_music",
            "description": "Fast tempo switch! The visual rhythm sync here is unmatched anywhere in EDM right now. ⚡\n\n#tempo #switchup #glitch #visualarts #raveculture",
            "hashtags": [
                  "#tempo",
                  "#switchup",
                  "#glitch",
                  "#visualarts",
                  "#raveculture"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "16s fast-tempo horn breakdown into rapid strobe sequence."
      },
      {
            "id": "habeeb_zeds_10",
            "addedTime": "Oct 02, 2026 • 02:30 PM",
            "batchTag": "Today's 20 Music Drops (Oct 2)",
            "title": "M.O.P. Ante Up Vocal Blast Into Aggressive Dubstep 🥊 @zedsdead #shorts",
            "duration": "0:15",
            "quality": "1080x1920 (9:16 Vertical HD)",
            "videoSrc": "/campaigns/habeeb_zeds/habeeb_zeds_10.mp4?v=oct2_music",
            "description": "ANTEE UPP! The ultimate energy weapon in any Zeds Dead set. Pure chaos on the floor! 🚨💥\n\n#anteup #mop #heavydubstep #moshpit #rage",
            "hashtags": [
                  "#anteup",
                  "#mop",
                  "#heavydubstep",
                  "#moshpit",
                  "#rage"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "15s iconic vocal punch into heavy dubstep bounce."
      },
      {
            "id": "habeeb_zeds_11",
            "addedTime": "Oct 02, 2026 • 02:30 PM",
            "batchTag": "Today's 20 Music Drops (Oct 2)",
            "title": "Acrobatic Drone Barrel Roll Across Empty Amphitheatre 🌀 @zedsdead #shorts",
            "duration": "0:16",
            "quality": "1080x1920 (9:16 Vertical HD)",
            "videoSrc": "/campaigns/habeeb_zeds/habeeb_zeds_11.mp4?v=oct2_music",
            "description": "Full inverted barrel roll 100 feet in the air above the empty seating bowl! Red Rocks rehearsals go hard. 🪨🛸\n\n#barrelroll #droneacrobatics #fpvflow #cinematicdrone #redrocks",
            "hashtags": [
                  "#barrelroll",
                  "#droneacrobatics",
                  "#fpvflow",
                  "#cinematicdrone",
                  "#redrocks"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "16s mid-air barrel roll over the venue amphitheatre."
      },
      {
            "id": "habeeb_zeds_12",
            "addedTime": "Oct 02, 2026 • 02:30 PM",
            "batchTag": "Today's 20 Music Drops (Oct 2)",
            "title": "60 MPH Flyby Right In Front Of The Stage Front Rail ⚡ @zedsdead #shorts",
            "duration": "0:14",
            "quality": "1080x1920 (9:16 Vertical HD)",
            "videoSrc": "/campaigns/habeeb_zeds/habeeb_zeds_12.mp4?v=oct2_music",
            "description": "Skimming the front row barricade where thousands of fans will be headbanging tomorrow night! 🛡️🔊\n\n#frontrow #barricade #headbangers #stagefront #soundcheck",
            "hashtags": [
                  "#frontrow",
                  "#barricade",
                  "#headbangers",
                  "#stagefront",
                  "#soundcheck"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "14s high-speed sweep along the front barricade rail."
      },
      {
            "id": "habeeb_zeds_13",
            "addedTime": "Oct 02, 2026 • 02:30 PM",
            "batchTag": "Today's 20 Music Drops (Oct 2)",
            "title": "Plunging Down Vertically Right In Front Of LED Wall 🔻 @zedsdead #shorts",
            "duration": "0:15",
            "quality": "1080x1920 (9:16 Vertical HD)",
            "videoSrc": "/campaigns/habeeb_zeds/habeeb_zeds_13.mp4?v=oct2_music",
            "description": "Vertical nose dive along the 60-foot video screen. The sense of scale will give you vertigo! 🪂✨\n\n#vertigo #nosedive #ledscreen #concerttech #stagesetup",
            "hashtags": [
                  "#vertigo",
                  "#nosedive",
                  "#ledscreen",
                  "#concerttech",
                  "#stagesetup"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "15s vertical dive parallel to the giant central LED display."
      },
      {
            "id": "habeeb_zeds_14",
            "addedTime": "Oct 02, 2026 • 02:30 PM",
            "batchTag": "Today's 20 Music Drops (Oct 2)",
            "title": "Flying Under The Synchronized Emerald Laser Canopy 🟢 @zedsdead #shorts",
            "duration": "0:16",
            "quality": "1080x1920 (9:16 Vertical HD)",
            "videoSrc": "/campaigns/habeeb_zeds/habeeb_zeds_14.mp4?v=oct2_music",
            "description": "A geometric laser ceiling moving in real time to the sub-bass pulse. Production level 100/10! 🌌👽\n\n#lasertech #lasercanopy #visualdesign #lightshow #ravemusic",
            "hashtags": [
                  "#lasertech",
                  "#lasercanopy",
                  "#visualdesign",
                  "#lightshow",
                  "#ravemusic"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "16s continuous flight under pulsing emerald laser grid."
      },
      {
            "id": "habeeb_zeds_15",
            "addedTime": "Oct 02, 2026 • 02:30 PM",
            "batchTag": "Today's 20 Music Drops (Oct 2)",
            "title": "Cyberpunk Laser Matrix Test Inside Outdoor Venue 🕸️ @zedsdead #shorts",
            "duration": "0:16",
            "quality": "1080x1920 (9:16 Vertical HD)",
            "videoSrc": "/campaigns/habeeb_zeds/habeeb_zeds_15.mp4?v=oct2_music",
            "description": "Slicing through a matrix of crimson and sapphire laser beams in the dark amphitheatre. Looks like a sci-fi set! 🤖✨\n\n#cyberpunk #lasermatrix #geometry #lightart #futuristic",
            "hashtags": [
                  "#cyberpunk",
                  "#lasermatrix",
                  "#geometry",
                  "#lightart",
                  "#futuristic"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "16s flight through complex geometric laser matrix."
      },
      {
            "id": "habeeb_zeds_16",
            "addedTime": "Oct 02, 2026 • 02:30 PM",
            "batchTag": "Today's 20 Music Drops (Oct 2)",
            "title": "Subwoofer Array Proximity Run With Pulsing Neon Strobes ⚡ @zedsdead #shorts",
            "duration": "0:16",
            "quality": "1080x1920 (9:16 Vertical HD)",
            "videoSrc": "/campaigns/habeeb_zeds/habeeb_zeds_16.mp4?v=oct2_music",
            "description": "Hovering right in front of the center bass bins while the strobe program tests at 100% brightness! 🔊💥\n\n#bassbins #subwoofers #soundpressure #heavybass #tourlife",
            "hashtags": [
                  "#bassbins",
                  "#subwoofers",
                  "#soundpressure",
                  "#heavybass",
                  "#tourlife"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "16s sub-cabinet flyby under pulsing white strobes."
      },
      {
            "id": "habeeb_zeds_17",
            "addedTime": "Oct 02, 2026 • 02:30 PM",
            "batchTag": "Today's 20 Music Drops (Oct 2)",
            "title": "Colosseum Amphitheatre Flight Over Empty Tiers 🏟️ @zedsdead #shorts",
            "duration": "0:16",
            "quality": "1080x1920 (9:16 Vertical HD)",
            "videoSrc": "/campaigns/habeeb_zeds/habeeb_zeds_17.mp4?v=oct2_music",
            "description": "Sweeping wide across the stone amphitheatre tiers. The acoustics and visual lines in this venue are legendary! 🏔️✨\n\n#amphitheatre #colosseum #redrocks #concerts #naturemeetsmusic",
            "hashtags": [
                  "#amphitheatre",
                  "#colosseum",
                  "#redrocks",
                  "#concerts",
                  "#naturemeetsmusic"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "16s panoramic flight across venue amphitheatre tiers."
      },
      {
            "id": "habeeb_zeds_18",
            "addedTime": "Oct 02, 2026 • 02:30 PM",
            "batchTag": "Today's 20 Music Drops (Oct 2)",
            "title": "Dramatic Low-Altitude Cruise Over VIP Terrace 🍹 @zedsdead #shorts",
            "duration": "0:16",
            "quality": "1080x1920 (9:16 Vertical HD)",
            "videoSrc": "/campaigns/habeeb_zeds/habeeb_zeds_18.mp4?v=oct2_music",
            "description": "Cruising 6 feet above the VIP terrace tables out toward the main stage glow. Pure movie aesthetic! 🎬🌟\n\n#vipexperience #terrace #nightlife #cinema #cinematography",
            "hashtags": [
                  "#vipexperience",
                  "#terrace",
                  "#nightlife",
                  "#cinema",
                  "#cinematography"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "16s low-altitude cruise over venue terraces."
      },
      {
            "id": "habeeb_zeds_19",
            "addedTime": "Oct 02, 2026 • 02:30 PM",
            "batchTag": "Today's 20 Music Drops (Oct 2)",
            "title": "Massive Monolith LED Tower Illumination Sequence 🖥️ @zedsdead #shorts",
            "duration": "0:16",
            "quality": "1080x1920 (9:16 Vertical HD)",
            "videoSrc": "/campaigns/habeeb_zeds/habeeb_zeds_19.mp4?v=oct2_music",
            "description": "Testing the central monolith screens. High-contrast visuals firing at 60 FPS in complete synchronicity! 🔥⚡\n\n#monolith #ledscreens #visualartist #stagecraft #tourtesting",
            "hashtags": [
                  "#monolith",
                  "#ledscreens",
                  "#visualartist",
                  "#stagecraft",
                  "#tourtesting"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "16s tower illumination sequence with high-contrast graphics."
      },
      {
            "id": "habeeb_zeds_20",
            "addedTime": "Oct 02, 2026 • 02:30 PM",
            "batchTag": "Today's 20 Music Drops (Oct 2)",
            "title": "Peak Laser Convergence Flight At Rehearsal Test 🎯 @zedsdead #shorts",
            "duration": "0:16",
            "quality": "1080x1920 (9:16 Vertical HD)",
            "videoSrc": "/campaigns/habeeb_zeds/habeeb_zeds_20.mp4?v=oct2_music",
            "description": "The moment all 40 lasers converge onto a single focal point above the crowd. Goosebumps every single time! 🌟🛸\n\n#convergence #lasershow #basshead #electronicmusic #zedsdead",
            "hashtags": [
                  "#convergence",
                  "#lasershow",
                  "#basshead",
                  "#electronicmusic",
                  "#zedsdead"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "16s peak laser convergence sequence at final flight test."
      }
]
  }
];

const LILSHEY_CAMPAIGNS: CampaignSlot[] = [
  {
    "campaignId": "lilshey_zeds_music",
    "campaignName": "Zeds Dead Music Clipping (Official Tour Drop)",
    "category": "Electronic & Bass Music (Deadbeats Records)",
    "status": "Live & Active (Strict Lilshey Exclusive)",
    "payout": "$1,000 / 1M Views ($500 Max)",
    "batches": [
      "All Drops",
      "Today's 15 Music Drops (Oct 2)"
    ],
    "clips": [
      {
            "id": "lilshey_zeds_01",
            "addedTime": "Oct 02, 2026 • 02:30 PM",
            "batchTag": "Today's 15 Music Drops (Oct 2)",
            "title": "The Hypnotic Vocal Buildup At 3 AM In Miami 🔮 @zedsdead #shorts",
            "duration": "0:15",
            "quality": "1080x1920 (9:16 Vertical HD)",
            "videoSrc": "/campaigns/lilshey_zeds/lilshey_zeds_01.mp4?v=oct2_music",
            "description": "Factory Town was completely in a trance when this vocal buildup started floating over the 140 BPM sub pressure. 🌙🔊\n\n#zedsdead #bassmusic #miamimusicweek #dubstep #electronicmusic",
            "hashtags": [
                  "#zedsdead",
                  "#bassmusic",
                  "#miamimusicweek",
                  "#dubstep",
                  "#electronicmusic"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "15s hypnotic vocal intro building tension before the chromatic laser explosion."
      },
      {
            "id": "lilshey_zeds_02",
            "addedTime": "Oct 02, 2026 • 02:30 PM",
            "batchTag": "Today's 15 Music Drops (Oct 2)",
            "title": "When The Chromatic Lasers Explode In 4K 🌈 @zedsdead #shorts",
            "duration": "0:16",
            "quality": "1080x1920 (9:16 Vertical HD)",
            "videoSrc": "/campaigns/lilshey_zeds/lilshey_zeds_02.mp4?v=oct2_music",
            "description": "Every single laser in the venue fired at the exact same millisecond. Pure sensory overload in Factory Town! ⚡💥\n\n#rave #lasers #visuals #festivalseason #basshead",
            "hashtags": [
                  "#rave",
                  "#lasers",
                  "#visuals",
                  "#festivalseason",
                  "#basshead"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "16s peak visual energy with full chromatic laser spread across the crowd."
      },
      {
            "id": "lilshey_zeds_03",
            "addedTime": "Oct 02, 2026 • 02:30 PM",
            "batchTag": "Today's 15 Music Drops (Oct 2)",
            "title": "Second Drop Stole Everyone's Breath Away 🌪️ @zedsdead #shorts",
            "duration": "0:16",
            "quality": "1080x1920 (9:16 Vertical HD)",
            "videoSrc": "/campaigns/lilshey_zeds/lilshey_zeds_03.mp4?v=oct2_music",
            "description": "Just when the crowd thought they caught their breath, Zeds Dead doubled down with this filthy second drop! 🐱🔊\n\n#edmtok #bassdrop #drops #headbanger #ravegirls",
            "hashtags": [
                  "#edmtok",
                  "#bassdrop",
                  "#drops",
                  "#headbanger",
                  "#ravegirls"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "16s secondary bass drop highlighting massive crowd reaction."
      },
      {
            "id": "lilshey_zeds_04",
            "addedTime": "Oct 02, 2026 • 02:30 PM",
            "batchTag": "Today's 15 Music Drops (Oct 2)",
            "title": "Frank Sinatra Horns Cut Into Heavy Dubstep 🎺 @zedsdead #shorts",
            "duration": "0:15",
            "quality": "1080x1920 (9:16 Vertical HD)",
            "videoSrc": "/campaigns/lilshey_zeds/lilshey_zeds_04.mp4?v=oct2_music",
            "description": "Taking classic 1950s swing brass and slamming it straight into a sub-bass rumble! Nobody merges genres like Zeds Dead. 🎷🔥\n\n#retromusic #oldschool #bassboosted #remix #electronic",
            "hashtags": [
                  "#retromusic",
                  "#oldschool",
                  "#bassboosted",
                  "#remix",
                  "#electronic"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "15s vintage swing intro leading straight into the first brass hit."
      },
      {
            "id": "lilshey_zeds_05",
            "addedTime": "Oct 02, 2026 • 02:30 PM",
            "batchTag": "Today's 15 Music Drops (Oct 2)",
            "title": "The Swing Groove That Controlled The Entire Venue 🎩 @zedsdead #shorts",
            "duration": "0:16",
            "quality": "1080x1920 (9:16 Vertical HD)",
            "videoSrc": "/campaigns/lilshey_zeds/lilshey_zeds_05.mp4?v=oct2_music",
            "description": "Look at the entire outdoor terrace bouncing in sync to this swing rhythm. Pure infectious festival energy! 💃🕺\n\n#festivalvibes #danceparty #openair #miaminights #ravevibes",
            "hashtags": [
                  "#festivalvibes",
                  "#danceparty",
                  "#openair",
                  "#miaminights",
                  "#ravevibes"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "16s continuous swing bounce with synchronized outdoor crowd movement."
      },
      {
            "id": "lilshey_zeds_06",
            "addedTime": "Oct 02, 2026 • 02:30 PM",
            "batchTag": "Today's 15 Music Drops (Oct 2)",
            "title": "Biggie Smalls Vocals Chopped Over 140 BPM Sub 👑 @zedsdead #shorts",
            "duration": "0:16",
            "quality": "1080x1920 (9:16 Vertical HD)",
            "videoSrc": "/campaigns/lilshey_zeds/lilshey_zeds_06.mp4?v=oct2_music",
            "description": "The King of New York acapella floating over rolling sub frequencies. The bass pressure in the chest was real! 🗽🔊\n\n#notoriousbig #hiphopedm #bassculture #sounddesign #dnb",
            "hashtags": [
                  "#notoriousbig",
                  "#hiphopedm",
                  "#bassculture",
                  "#sounddesign",
                  "#dnb"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "16s hip-hop vocal chop over heavy sub-bass rhythm."
      },
      {
            "id": "lilshey_zeds_07",
            "addedTime": "Oct 02, 2026 • 02:30 PM",
            "batchTag": "Today's 15 Music Drops (Oct 2)",
            "title": "NYC Rap Acapella Into Aggressive Sub Rattle 🚨 @zedsdead #shorts",
            "duration": "0:16",
            "quality": "1080x1920 (9:16 Vertical HD)",
            "videoSrc": "/campaigns/lilshey_zeds/lilshey_zeds_07.mp4?v=oct2_music",
            "description": "When Jay Z's iconic flow gets backed by stadium subwoofers, the whole zip code feels the bass shake! 🏙️💥\n\n#jayz #subwoofer #caraudio #stadiumbass #hype",
            "hashtags": [
                  "#jayz",
                  "#subwoofer",
                  "#caraudio",
                  "#stadiumbass",
                  "#hype"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "16s Jay-Z vocal flow colliding with heavy 808 sub."
      },
      {
            "id": "lilshey_zeds_08",
            "addedTime": "Oct 02, 2026 • 02:30 PM",
            "batchTag": "Today's 15 Music Drops (Oct 2)",
            "title": "Shook Ones Pt II Sample Resampled Into Filthy Bass 🎹 @zedsdead #shorts",
            "duration": "0:15",
            "quality": "1080x1920 (9:16 Vertical HD)",
            "videoSrc": "/campaigns/lilshey_zeds/lilshey_zeds_08.mp4?v=oct2_music",
            "description": "That legendary 1995 Queensbridge piano hook right before the low-end frequency drops. Legendary tribute! 🎹💀\n\n#mobbdeep #90shiphop #bassheads #rave #undergroundbass",
            "hashtags": [
                  "#mobbdeep",
                  "#90shiphop",
                  "#bassheads",
                  "#rave",
                  "#undergroundbass"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "15s iconic piano progression into deep sub bass hit."
      },
      {
            "id": "lilshey_zeds_09",
            "addedTime": "Oct 02, 2026 • 02:30 PM",
            "batchTag": "Today's 15 Music Drops (Oct 2)",
            "title": "16 Bars Of Brass & Strobe Synchronicity 🎺 @zedsdead #shorts",
            "duration": "0:16",
            "quality": "1080x1920 (9:16 Vertical HD)",
            "videoSrc": "/campaigns/lilshey_zeds/lilshey_zeds_09.mp4?v=oct2_music",
            "description": "Blinding white strobes matching every high-frequency brass hit in Miami! Audio-visual production at its highest peak. ⚡🎺\n\n#strobelights #lightingcrew #stageproduction #musicfestival",
            "hashtags": [
                  "#strobelights",
                  "#lightingcrew",
                  "#stageproduction",
                  "#musicfestival"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "16s rapid brass chops accompanied by intense strobe lighting."
      },
      {
            "id": "lilshey_zeds_10",
            "addedTime": "Oct 02, 2026 • 02:30 PM",
            "batchTag": "Today's 15 Music Drops (Oct 2)",
            "title": "FPV Drone Inside Empty Amphitheatre Rehearsal 🛸 @zedsdead #shorts",
            "duration": "0:15",
            "quality": "1080x1920 (9:16 Vertical HD)",
            "videoSrc": "/campaigns/lilshey_zeds/lilshey_zeds_10.mp4?v=oct2_music",
            "description": "Watch this high-speed drone dive straight toward the main stage subwoofers during sound check. Insane pilot skill! 🚀🎧\n\n#fpvdrone #behindthescenes #production #tourlife #redrocks",
            "hashtags": [
                  "#fpvdrone",
                  "#behindthescenes",
                  "#production",
                  "#tourlife",
                  "#redrocks"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "15s acrobatic FPV drone flight passing right past main stage speaker stacks."
      },
      {
            "id": "lilshey_zeds_11",
            "addedTime": "Oct 02, 2026 • 02:30 PM",
            "batchTag": "Today's 15 Music Drops (Oct 2)",
            "title": "FPV Drone Climbing The 80-Foot Lighting Truss 🏗️ @zedsdead #shorts",
            "duration": "0:16",
            "quality": "1080x1920 (9:16 Vertical HD)",
            "videoSrc": "/campaigns/lilshey_zeds/lilshey_zeds_11.mp4?v=oct2_music",
            "description": "Climbing through the industrial steel rigging high above the stage floor. The scale of this tour rig is massive! 🌌⚡\n\n#rigging #stagelife #fpvpilot #lightingdesign #concertvenue",
            "hashtags": [
                  "#rigging",
                  "#stagelife",
                  "#fpvpilot",
                  "#lightingdesign",
                  "#concertvenue"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "16s vertical ascent through high-altitude lighting truss structures."
      },
      {
            "id": "lilshey_zeds_12",
            "addedTime": "Oct 02, 2026 • 02:30 PM",
            "batchTag": "Today's 15 Music Drops (Oct 2)",
            "title": "Supersonic FPV Dive Right Over The CDJ Booth 🎛️ @zedsdead #shorts",
            "duration": "0:15",
            "quality": "1080x1920 (9:16 Vertical HD)",
            "videoSrc": "/campaigns/lilshey_zeds/lilshey_zeds_12.mp4?v=oct2_music",
            "description": "Coming in hot at 50 MPH and leveling out inches from the DJ mixer! Precision flying at the outdoor amphitheatre. 🎯✨\n\n#djbooth #pioneerdj #fpvracing #redrocksamphitheater #stagegear",
            "hashtags": [
                  "#djbooth",
                  "#pioneerdj",
                  "#fpvracing",
                  "#redrocksamphitheater",
                  "#stagegear"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "15s high-velocity dive over the DJ performance platform."
      },
      {
            "id": "lilshey_zeds_13",
            "addedTime": "Oct 02, 2026 • 02:30 PM",
            "batchTag": "Today's 15 Music Drops (Oct 2)",
            "title": "360 Drone Spin In Front Of Massive LED Wall 🌀 @zedsdead #shorts",
            "duration": "0:15",
            "quality": "1080x1920 (9:16 Vertical HD)",
            "videoSrc": "/campaigns/lilshey_zeds/lilshey_zeds_13.mp4?v=oct2_music",
            "description": "Inverted roll right in front of the giant deadbeats logo on the LED screen. Cinematic drone cinematography! 🎥👾\n\n#dronecinematography #aerobatics #visualeffects #stageart",
            "hashtags": [
                  "#dronecinematography",
                  "#aerobatics",
                  "#visualeffects",
                  "#stageart"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "15s rotational acrobatic move framed against the central LED screen."
      },
      {
            "id": "lilshey_zeds_14",
            "addedTime": "Oct 02, 2026 • 02:30 PM",
            "batchTag": "Today's 15 Music Drops (Oct 2)",
            "title": "Flying Under A Ceiling Of Pure Neon Green Lasers 🟢 @zedsdead #shorts",
            "duration": "0:16",
            "quality": "1080x1920 (9:16 Vertical HD)",
            "videoSrc": "/campaigns/lilshey_zeds/lilshey_zeds_14.mp4?v=oct2_music",
            "description": "Cutting through the atmospheric fog under a roof of slicing emerald lasers. Looks straight out of the Matrix! 🟩🛸\n\n#lasertunnel #thematrix #laserlights #indoorrave #electronicmusic",
            "hashtags": [
                  "#lasertunnel",
                  "#thematrix",
                  "#laserlights",
                  "#indoorrave",
                  "#electronicmusic"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "16s glide through dense neon green laser ceiling."
      },
      {
            "id": "lilshey_zeds_15",
            "addedTime": "Oct 02, 2026 • 02:30 PM",
            "batchTag": "Today's 15 Music Drops (Oct 2)",
            "title": "FPV Drone Threading The Gap Between LED Towers 🏙️ @zedsdead #shorts",
            "duration": "0:16",
            "quality": "1080x1920 (9:16 Vertical HD)",
            "videoSrc": "/campaigns/lilshey_zeds/lilshey_zeds_15.mp4?v=oct2_music",
            "description": "Only 4 feet of clearance between multi-million dollar video walls! High stakes flying before showtime. 🕹️🔥\n\n#highstakes #dronefails #skillcheck #liveproduction #deadbeats",
            "hashtags": [
                  "#highstakes",
                  "#dronefails",
                  "#skillcheck",
                  "#liveproduction",
                  "#deadbeats"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "16s precision gap-threading between main stage LED pillars."
      }
]
  },
  {
    "campaignId": "lilshey_camp_2",
    "campaignName": "Campaign Drop Beta (Lilshey Slot 2)",
    "category": "Cinema & Viral Trends",
    "status": "Standby For Drop",
    "payout": "$850 - $1,200 / 1M Views",
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
  const [habeebCampaignChoice, setHabeebCampaignChoice] = useState<string>(() => {
    return localStorage.getItem("habeeb_campaign_choice") || "";
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

  // Dedicated Background Audio Engine (Tml Vibez - A Street Kid's Diary Disk 2)
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const playlistRef = useRef<AlbumTrack[]>([]);
  const trackIndexRef = useRef(0);
  const lastSaveTimeRef = useRef(0);
  const [currentTrack, setCurrentTrack] = useState<AlbumTrack>(TML_VIBEZ_ALBUM[0]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);

  // Helper to persist audio position per profile
  const saveAudioProgress = (user: string, playlist: AlbumTrack[], trackId: string, time: number) => {
    if (!user) return;
    try {
      localStorage.setItem(`vault_audio_profile_${user}`, JSON.stringify({
        playlistIds: playlist.map(t => t.id),
        trackId,
        currentTime: Math.floor(time)
      }));
    } catch(e) {}
  };

  // Play next track from beginning to end
  const playNextTrack = (user: string) => {
    const audio = audioRef.current;
    if (!audio || playlistRef.current.length === 0) return;
    const nextIdx = (trackIndexRef.current + 1) % playlistRef.current.length;
    trackIndexRef.current = nextIdx;
    const nextTrack = playlistRef.current[nextIdx];
    setCurrentTrack(nextTrack);
    audio.src = nextTrack.src;
    audio.currentTime = 0;
    audio.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    saveAudioProgress(user, playlistRef.current, nextTrack.id, 0);
  };

  useEffect(() => {
    if (!currentUser) return;
    const audio = audioRef.current;
    if (!audio) return;

    const storageKey = `vault_audio_profile_${currentUser}`;
    let saved: { playlistIds?: string[]; trackId?: string; currentTime?: number } | null = null;
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) saved = JSON.parse(raw);
    } catch(e) {}

    let playlist: AlbumTrack[] = [];
    let startIdx = 0;
    let resumeTime = 0;

    if (saved && Array.isArray(saved.playlistIds) && saved.trackId) {
      // Restore previous profile session playlist order
      const map = new Map(TML_VIBEZ_ALBUM.map(t => [t.id, t]));
      playlist = saved.playlistIds.map(id => map.get(id)).filter((t): t is AlbumTrack => !!t);
      if (playlist.length < TML_VIBEZ_ALBUM.length) {
        const existing = new Set(playlist.map(t => t.id));
        const missing = TML_VIBEZ_ALBUM.filter(t => !existing.has(t.id));
        playlist = [...playlist, ...shuffleTracks(missing)];
      }
      const found = playlist.findIndex(t => t.id === saved.trackId);
      startIdx = found !== -1 ? found : 0;
      resumeTime = typeof saved.currentTime === "number" && saved.currentTime > 0 ? saved.currentTime : 0;
    } else {
      // Fresh load: always randomize on load!
      playlist = shuffleTracks(TML_VIBEZ_ALBUM);
      startIdx = 0;
      resumeTime = 0;
    }

    playlistRef.current = playlist;
    trackIndexRef.current = startIdx;
    const activeTrack = playlist[startIdx];
    setCurrentTrack(activeTrack);

    audio.src = activeTrack.src;
    audio.volume = TARGET_VOLUME;

    // Resume from where it stopped
    if (resumeTime > 0) {
      audio.currentTime = resumeTime;
    }

    const startPlayback = () => {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch(() => {
        setIsPlaying(false);
        const onFirstGesture = () => {
          audio.play().then(() => setIsPlaying(true)).catch(() => {});
          window.removeEventListener("click", onFirstGesture);
          window.removeEventListener("touchstart", onFirstGesture);
        };
        window.addEventListener("click", onFirstGesture);
        window.addEventListener("touchstart", onFirstGesture);
      });
    };

    startPlayback();

    // Event handlers
    const handleEnded = () => {
      playNextTrack(currentUser);
    };

    const handleTimeUpdate = () => {
      const now = Date.now();
      if (now - lastSaveTimeRef.current > 1500) {
        lastSaveTimeRef.current = now;
        saveAudioProgress(currentUser, playlistRef.current, playlistRef.current[trackIndexRef.current]?.id || activeTrack.id, audio.currentTime);
      }
    };

    const handlePlay = () => setIsPlaying(true);
    const handlePause = () => setIsPlaying(false);

    audio.addEventListener("ended", handleEnded);
    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("play", handlePlay);
    audio.addEventListener("pause", handlePause);

    const handleBeforeUnload = () => {
      saveAudioProgress(currentUser, playlistRef.current, playlistRef.current[trackIndexRef.current]?.id || activeTrack.id, audio.currentTime);
    };
    window.addEventListener("beforeunload", handleBeforeUnload);

    return () => {
      audio.removeEventListener("ended", handleEnded);
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("play", handlePlay);
      audio.removeEventListener("pause", handlePause);
      window.removeEventListener("beforeunload", handleBeforeUnload);
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

    const selectHabeebCampaign = (choice: "bubsy" | "zedsdead") => {
    setHabeebCampaignChoice(choice);
    localStorage.setItem("habeeb_campaign_choice", choice);
  };

  const handleLogout = () => {
    if (audioRef.current && currentUser) {
      saveAudioProgress(currentUser, playlistRef.current, playlistRef.current[trackIndexRef.current]?.id || currentTrack.id, audioRef.current.currentTime);
      audioRef.current.pause();
    }
    localStorage.removeItem("clipping_user");
    setCurrentUser("");
  };

  if (currentUser === "habeeb" && !habeebCampaignChoice) {
    return (
      <div className="min-h-screen bg-[#0a0d14] flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="w-full max-w-xl bg-[#10141e] border border-[#1b2234] rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden"
        >
          <div className="text-center mb-8">
            <span className="text-xs font-mono text-blue-400 uppercase tracking-widest font-bold block mb-2">
              HABEEB OPERATIONS VAULT
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Select Your Clipping Focus
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-2">
              Choose your active workspace to keep your feed uncluttered. Your choice is saved automatically and can be switched anytime.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button
              onClick={() => selectHabeebCampaign("bubsy")}
              className="group p-6 bg-[#0a0d14] hover:bg-[#141926] border border-[#1b2234] hover:border-amber-500/50 rounded-2xl text-left transition-all duration-300 relative overflow-hidden active:scale-[0.98] shadow-lg cursor-pointer"
            >
              <div className="text-3xl mb-3">🐱</div>
              <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors flex items-center justify-between">
                Bubsy 4D
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono">15 Shorts</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                Mascot platformer revival, comedic lore, and momentum speedrunning clips.
              </p>
              <div className="mt-4 pt-3 border-t border-[#1b2234] text-[11px] text-amber-400 font-semibold flex items-center gap-1">
                Enter Bubsy Workspace →
              </div>
            </button>

            <button
              onClick={() => selectHabeebCampaign("zedsdead")}
              className="group p-6 bg-[#0a0d14] hover:bg-[#141926] border border-[#1b2234] hover:border-purple-500/50 rounded-2xl text-left transition-all duration-300 relative overflow-hidden active:scale-[0.98] shadow-lg cursor-pointer"
            >
              <div className="text-3xl mb-3">🔊</div>
              <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors flex items-center justify-between">
                Zeds Dead Music
                <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-mono">20 Drops</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                Miami Factory Town live drops, heavy sub frequencies, and tour laser FPV runs.
              </p>
              <div className="mt-4 pt-3 border-t border-[#1b2234] text-[11px] text-purple-400 font-semibold flex items-center gap-1">
                Enter Music Workspace →
              </div>
            </button>
          </div>
        </motion.div>
      </div>
    );
  }

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
  const campaigns = currentUser === "habeeb" 
    ? (habeebCampaignChoice === "zedsdead" ? [HABEEB_CAMPAIGNS[1]] : [HABEEB_CAMPAIGNS[0]])
    : currentUser === "lilshey" 
    ? LILSHEY_CAMPAIGNS 
    : currentUser === "usman" 
    ? USMAN_CAMPAIGNS 
    : CEO_CAMPAIGNS;

  return (
    <div className="min-h-screen bg-[#0a0d14] text-white selection:bg-blue-600/30 pb-20">
      {/* Tml Vibez Background Album Engine */}
      <audio ref={audioRef} preload="auto" />

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

          <div className="flex items-center gap-3">
            {/* Sleek Minimalist Tml Vibez Album Player Pill */}
            <div className="hidden sm:flex items-center gap-2.5 px-3 py-1.5 rounded-full bg-[#131926]/90 border border-blue-500/20 backdrop-blur-md shadow-lg shadow-black/20">
              <div className="flex items-center gap-2">
                <Disc3 className={`w-4 h-4 text-blue-400 ${isPlaying ? "animate-spin" : ""}`} style={{ animationDuration: "3s" }} />
                <div className="text-[11px] leading-tight max-w-[190px] truncate">
                  <span className="font-semibold text-white truncate block">{currentTrack.title}</span>
                  <span className="text-[9.5px] text-neutral-400 truncate block">Tml Vibez • Disk 2</span>
                </div>
              </div>

              <div className="flex items-center gap-1 pl-1.5 border-l border-neutral-800">
                <button 
                  onClick={() => {
                    if (!audioRef.current) return;
                    if (isPlaying) {
                      audioRef.current.pause();
                    } else {
                      audioRef.current.play().catch(() => {});
                    }
                  }}
                  className="p-1 rounded-full text-neutral-300 hover:text-white hover:bg-neutral-800/60 transition"
                  title={isPlaying ? "Pause Track" : "Play Track"}
                >
                  {isPlaying ? <Pause className="w-3 h-3" /> : <Play className="w-3 h-3 fill-current" />}
                </button>

                <button 
                  onClick={() => playNextTrack(currentUser)}
                  className="p-1 rounded-full text-neutral-300 hover:text-white hover:bg-neutral-800/60 transition"
                  title="Next Song (Randomized Album)"
                >
                  <SkipForward className="w-3 h-3" />
                </button>

                <button 
                  onClick={() => {
                    if (!audioRef.current) return;
                    audioRef.current.muted = !isMuted;
                    setIsMuted(!isMuted);
                  }}
                  className="p-1 rounded-full text-neutral-300 hover:text-white hover:bg-neutral-800/60 transition"
                  title={isMuted ? "Unmute" : "Mute"}
                >
                  {isMuted ? <VolumeX className="w-3 h-3 text-red-400" /> : <Volume2 className="w-3 h-3 text-blue-400" />}
                </button>
              </div>
            </div>

          {currentUser === "habeeb" && (
            <div className="hidden sm:flex items-center gap-1 bg-[#10141e] border border-[#1b2234] p-1 rounded-xl">
              <button
                onClick={() => selectHabeebCampaign("bubsy")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  habeebCampaignChoice !== "zedsdead"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <span>🐱</span> Bubsy 4D (15)
              </button>
              <button
                onClick={() => selectHabeebCampaign("zedsdead")}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  habeebCampaignChoice === "zedsdead"
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <span>🔊</span> Zeds Dead (20)
              </button>
            </div>
          )}

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
