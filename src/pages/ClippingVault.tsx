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
    campaignId: "ceo_zeds_dead_3days",
    campaignName: "Channel 1: Zeds Dead (3-Day Drop Pack - 75 Unique Videos)",
    category: "Mainstage Production, Lasers & Drone Acrobatics (Deadbeats / Clipr)",
    status: "Live & Active (Strict CEO Exclusive)",
    payout: "$3.50 / 1k Views ($175 Max)",
    batches: [
      "All Drops (75)",
      "Day 1 - Today's Drop (25 Videos)",
      "Day 2 - Reserve Pack (25 Videos)",
      "Day 3 - Reserve Pack (25 Videos)"
    ],
    clips: [
      {
            "id": "ceo_zeds_d1_01",
            "addedTime": "Oct 04, 2026 • 09:00 AM",
            "batchTag": "Day 1 - Today's Drop (25 Videos)",
            "title": "Ante Up Vocal Buildup Before The Drop 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d1_01.mp4?v=d1_drop",
            "description": "Official Zeds Dead music clipping cut: ANTE UP VOCAL BUILDUP BEFORE THE DROP. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from Ante Up Final.mp4 (0s - 10.0s). Top hook: \"ANTE UP VOCAL BUILDUP BEFORE THE DROP\"."
      },
      {
            "id": "ceo_zeds_d1_02",
            "addedTime": "Oct 04, 2026 • 09:00 AM",
            "batchTag": "Day 1 - Today's Drop (25 Videos)",
            "title": "Biggie Smalls Vinyl Scratch Flip 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d1_02.mp4?v=d1_drop",
            "description": "Official Zeds Dead music clipping cut: BIGGIE SMALLS VINYL SCRATCH FLIP. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from Ante Up Final.mp4 (10s - 20.0s). Top hook: \"BIGGIE SMALLS VINYL SCRATCH FLIP\"."
      },
      {
            "id": "ceo_zeds_d1_03",
            "addedTime": "Oct 04, 2026 • 09:00 AM",
            "batchTag": "Day 1 - Today's Drop (25 Videos)",
            "title": "Stadium Crowd Roar At Red Rocks 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d1_03.mp4?v=d1_drop",
            "description": "Official Zeds Dead music clipping cut: STADIUM CROWD ROAR AT RED ROCKS. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from Ante Up Final.mp4 (20s - 30.0s). Top hook: \"STADIUM CROWD ROAR AT RED ROCKS\"."
      },
      {
            "id": "ceo_zeds_d1_04",
            "addedTime": "Oct 04, 2026 • 09:00 AM",
            "batchTag": "Day 1 - Today's Drop (25 Videos)",
            "title": "Hypnotic 3am Synth In Miami 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d1_04.mp4?v=d1_drop",
            "description": "Official Zeds Dead music clipping cut: HYPNOTIC 3AM SYNTH IN MIAMI. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from Biggie edit final.mp4 (0s - 10.0s). Top hook: \"HYPNOTIC 3AM SYNTH IN MIAMI\"."
      },
      {
            "id": "ceo_zeds_d1_05",
            "addedTime": "Oct 04, 2026 • 09:00 AM",
            "batchTag": "Day 1 - Today's Drop (25 Videos)",
            "title": "Blinding Strobe Acceleration Drop 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d1_05.mp4?v=d1_drop",
            "description": "Official Zeds Dead music clipping cut: BLINDING STROBE ACCELERATION DROP. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from Biggie edit final.mp4 (10s - 20.0s). Top hook: \"BLINDING STROBE ACCELERATION DROP\"."
      },
      {
            "id": "ceo_zeds_d1_06",
            "addedTime": "Oct 04, 2026 • 09:00 AM",
            "batchTag": "Day 1 - Today's Drop (25 Videos)",
            "title": "Factory Town Sunrise Finale 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d1_06.mp4?v=d1_drop",
            "description": "Official Zeds Dead music clipping cut: FACTORY TOWN SUNRISE FINALE. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from Biggie edit final.mp4 (20s - 30.0s). Top hook: \"FACTORY TOWN SUNRISE FINALE\"."
      },
      {
            "id": "ceo_zeds_d1_07",
            "addedTime": "Oct 04, 2026 • 09:00 AM",
            "batchTag": "Day 1 - Today's Drop (25 Videos)",
            "title": "Glitched Big Band Swing Bass 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d1_07.mp4?v=d1_drop",
            "description": "Official Zeds Dead music clipping cut: GLITCHED BIG BAND SWING BASS. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from Biggie edit final.mp4 (30s - 40.0s). Top hook: \"GLITCHED BIG BAND SWING BASS\"."
      },
      {
            "id": "ceo_zeds_d1_08",
            "addedTime": "Oct 04, 2026 • 09:00 AM",
            "batchTag": "Day 1 - Today's Drop (25 Videos)",
            "title": "1950s Vintage Trumpet Dubstep Flip 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d1_08.mp4?v=d1_drop",
            "description": "Official Zeds Dead music clipping cut: 1950s VINTAGE TRUMPET DUBSTEP FLIP. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from Biggie edit final.mp4 (40s - 50.0s). Top hook: \"1950s VINTAGE TRUMPET DUBSTEP FLIP\"."
      },
      {
            "id": "ceo_zeds_d1_09",
            "addedTime": "Oct 04, 2026 • 09:00 AM",
            "batchTag": "Day 1 - Today's Drop (25 Videos)",
            "title": "Gliding Under An Emerald Laser Canopy 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d1_09.mp4?v=d1_drop",
            "description": "Official Zeds Dead music clipping cut: GLIDING UNDER AN EMERALD LASER CANOPY. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from Jay Z Final.mp4 (0s - 10.0s). Top hook: \"GLIDING UNDER AN EMERALD LASER CANOPY\"."
      },
      {
            "id": "ceo_zeds_d1_10",
            "addedTime": "Oct 04, 2026 • 09:00 AM",
            "batchTag": "Day 1 - Today's Drop (25 Videos)",
            "title": "Inverted Barrel Roll Inside Laser Cage 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d1_10.mp4?v=d1_drop",
            "description": "Official Zeds Dead music clipping cut: INVERTED BARREL ROLL INSIDE LASER CAGE. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from Jay Z Final.mp4 (10s - 20.0s). Top hook: \"INVERTED BARREL ROLL INSIDE LASER CAGE\"."
      },
      {
            "id": "ceo_zeds_d1_11",
            "addedTime": "Oct 04, 2026 • 09:00 AM",
            "batchTag": "Day 1 - Today's Drop (25 Videos)",
            "title": "Diving Through Stage Cryo Fog At 50 Mph 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d1_11.mp4?v=d1_drop",
            "description": "Official Zeds Dead music clipping cut: DIVING THROUGH STAGE CRYO FOG AT 50 MPH. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from Jay Z Final.mp4 (20s - 30.0s). Top hook: \"DIVING THROUGH STAGE CRYO FOG AT 50 MPH\"."
      },
      {
            "id": "ceo_zeds_d1_12",
            "addedTime": "Oct 04, 2026 • 09:00 AM",
            "batchTag": "Day 1 - Today's Drop (25 Videos)",
            "title": "Full Red Rocks Crowd Jumping Together 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d1_12.mp4?v=d1_drop",
            "description": "Official Zeds Dead music clipping cut: FULL RED ROCKS CROWD JUMPING TOGETHER. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from Jay Z Final.mp4 (30s - 40.0s). Top hook: \"FULL RED ROCKS CROWD JUMPING TOGETHER\"."
      },
      {
            "id": "ceo_zeds_d1_13",
            "addedTime": "Oct 04, 2026 • 09:00 AM",
            "batchTag": "Day 1 - Today's Drop (25 Videos)",
            "title": "Surfing Laser Beams Over 10000 Heads 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d1_13.mp4?v=d1_drop",
            "description": "Official Zeds Dead music clipping cut: SURFING LASER BEAMS OVER 10000 HEADS. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from Phuket To Colors .mp4 (0s - 10.0s). Top hook: \"SURFING LASER BEAMS OVER 10000 HEADS\"."
      },
      {
            "id": "ceo_zeds_d1_14",
            "addedTime": "Oct 04, 2026 • 09:00 AM",
            "batchTag": "Day 1 - Today's Drop (25 Videos)",
            "title": "Fpv Dive Bomb Directly Into Dj Booth 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d1_14.mp4?v=d1_drop",
            "description": "Official Zeds Dead music clipping cut: FPV DIVE BOMB DIRECTLY INTO DJ BOOTH. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from Phuket To Colors .mp4 (10s - 20.0s). Top hook: \"FPV DIVE BOMB DIRECTLY INTO DJ BOOTH\"."
      },
      {
            "id": "ceo_zeds_d1_15",
            "addedTime": "Oct 04, 2026 • 09:00 AM",
            "batchTag": "Day 1 - Today's Drop (25 Videos)",
            "title": "Panoramic Sunset Over The Monolith 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d1_15.mp4?v=d1_drop",
            "description": "Official Zeds Dead music clipping cut: PANORAMIC SUNSET OVER THE MONOLITH. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from Phuket To Colors .mp4 (20s - 30.0s). Top hook: \"PANORAMIC SUNSET OVER THE MONOLITH\"."
      },
      {
            "id": "ceo_zeds_d1_16",
            "addedTime": "Oct 04, 2026 • 09:00 AM",
            "batchTag": "Day 1 - Today's Drop (25 Videos)",
            "title": "When The Sub-bass Shakes Your Phone 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d1_16.mp4?v=d1_drop",
            "description": "Official Zeds Dead music clipping cut: WHEN THE SUB-BASS SHAKES YOUR PHONE. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from Phuket To Colors .mp4 (30s - 40.0s). Top hook: \"WHEN THE SUB-BASS SHAKES YOUR PHONE\"."
      },
      {
            "id": "ceo_zeds_d1_17",
            "addedTime": "Oct 04, 2026 • 09:00 AM",
            "batchTag": "Day 1 - Today's Drop (25 Videos)",
            "title": "Shook Ones Chords In The Open Air 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d1_17.mp4?v=d1_drop",
            "description": "Official Zeds Dead music clipping cut: SHOOK ONES CHORDS IN THE OPEN AIR. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from Phuket To Colors .mp4 (40s - 50.0s). Top hook: \"SHOOK ONES CHORDS IN THE OPEN AIR\"."
      },
      {
            "id": "ceo_zeds_d1_18",
            "addedTime": "Oct 04, 2026 • 09:00 AM",
            "batchTag": "Day 1 - Today's Drop (25 Videos)",
            "title": "Sinatra Swing Wobble Meltdown 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d1_18.mp4?v=d1_drop",
            "description": "Official Zeds Dead music clipping cut: SINATRA SWING WOBBLE MELTDOWN. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from Phuket To Colors .mp4 (50s - 60.0s). Top hook: \"SINATRA SWING WOBBLE MELTDOWN\"."
      },
      {
            "id": "ceo_zeds_d1_19",
            "addedTime": "Oct 04, 2026 • 09:00 AM",
            "batchTag": "Day 1 - Today's Drop (25 Videos)",
            "title": "Retro Gramophone Meets 140 Bpm 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d1_19.mp4?v=d1_drop",
            "description": "Official Zeds Dead music clipping cut: RETRO GRAMOPHONE MEETS 140 BPM. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from Phuket To Colors .mp4 (60s - 70.0s). Top hook: \"RETRO GRAMOPHONE MEETS 140 BPM\"."
      },
      {
            "id": "ceo_zeds_d1_20",
            "addedTime": "Oct 04, 2026 • 09:00 AM",
            "batchTag": "Day 1 - Today's Drop (25 Videos)",
            "title": "Laser Tunnel Flight At 45 Degrees 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d1_20.mp4?v=d1_drop",
            "description": "Official Zeds Dead music clipping cut: LASER TUNNEL FLIGHT AT 45 DEGREES. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from Phuket To Colors .mp4 (70s - 80.0s). Top hook: \"LASER TUNNEL FLIGHT AT 45 DEGREES\"."
      },
      {
            "id": "ceo_zeds_d1_21",
            "addedTime": "Oct 04, 2026 • 09:00 AM",
            "batchTag": "Day 1 - Today's Drop (25 Videos)",
            "title": "Amphitheatre Acoustics Hit Different 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d1_21.mp4?v=d1_drop",
            "description": "Official Zeds Dead music clipping cut: AMPHITHEATRE ACOUSTICS HIT DIFFERENT. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from Phuket To Colors .mp4 (80s - 90.0s). Top hook: \"AMPHITHEATRE ACOUSTICS HIT DIFFERENT\"."
      },
      {
            "id": "ceo_zeds_d1_22",
            "addedTime": "Oct 04, 2026 • 09:00 AM",
            "batchTag": "Day 1 - Today's Drop (25 Videos)",
            "title": "Factory Town 4am Hypnosis 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d1_22.mp4?v=d1_drop",
            "description": "Official Zeds Dead music clipping cut: FACTORY TOWN 4AM HYPNOSIS. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from Phuket To Colors .mp4 (90s - 100.0s). Top hook: \"FACTORY TOWN 4AM HYPNOSIS\"."
      },
      {
            "id": "ceo_zeds_d1_23",
            "addedTime": "Oct 04, 2026 • 09:00 AM",
            "batchTag": "Day 1 - Today's Drop (25 Videos)",
            "title": "Unreleased Bassline Test In Miami 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d1_23.mp4?v=d1_drop",
            "description": "Official Zeds Dead music clipping cut: UNRELEASED BASSLINE TEST IN MIAMI. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from Phuket To Colors .mp4 (100s - 110.0s). Top hook: \"UNRELEASED BASSLINE TEST IN MIAMI\"."
      },
      {
            "id": "ceo_zeds_d1_24",
            "addedTime": "Oct 04, 2026 • 09:00 AM",
            "batchTag": "Day 1 - Today's Drop (25 Videos)",
            "title": "High Altitude Dive Through Light Beams 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d1_24.mp4?v=d1_drop",
            "description": "Official Zeds Dead music clipping cut: HIGH ALTITUDE DIVE THROUGH LIGHT BEAMS. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from Phuket To Colors .mp4 (110s - 120.0s). Top hook: \"HIGH ALTITUDE DIVE THROUGH LIGHT BEAMS\"."
      },
      {
            "id": "ceo_zeds_d1_25",
            "addedTime": "Oct 04, 2026 • 09:00 AM",
            "batchTag": "Day 1 - Today's Drop (25 Videos)",
            "title": "Deadbeats Anthem Live Finale 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d1_25.mp4?v=d1_drop",
            "description": "Official Zeds Dead music clipping cut: DEADBEATS ANTHEM LIVE FINALE. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from Phuket To Colors .mp4 (120s - 130.0s). Top hook: \"DEADBEATS ANTHEM LIVE FINALE\"."
      },
      {
            "id": "ceo_zeds_d2_01",
            "addedTime": "Oct 05, 2026 • 09:00 AM",
            "batchTag": "Day 2 - Reserve Pack (25 Videos)",
            "title": "Bass Resonance At Maximum Pressure 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d2_01.mp4?v=d2_drop",
            "description": "Official Zeds Dead music clipping cut: BASS RESONANCE AT MAXIMUM PRESSURE. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from Phuket To Colors .mp4 (130s - 140.0s). Top hook: \"BASS RESONANCE AT MAXIMUM PRESSURE\"."
      },
      {
            "id": "ceo_zeds_d2_02",
            "addedTime": "Oct 05, 2026 • 09:00 AM",
            "batchTag": "Day 2 - Reserve Pack (25 Videos)",
            "title": "Unreal Fpv Drone Chase Over Red Rocks 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d2_02.mp4?v=d2_drop",
            "description": "Official Zeds Dead music clipping cut: UNREAL FPV DRONE CHASE OVER RED ROCKS. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from Phuket To Colors .mp4 (140s - 150.0s). Top hook: \"UNREAL FPV DRONE CHASE OVER RED ROCKS\"."
      },
      {
            "id": "ceo_zeds_d2_03",
            "addedTime": "Oct 05, 2026 • 09:00 AM",
            "batchTag": "Day 2 - Reserve Pack (25 Videos)",
            "title": "That Instant Drop Reaction 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d2_03.mp4?v=d2_drop",
            "description": "Official Zeds Dead music clipping cut: THAT INSTANT DROP REACTION. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from Phuket To Colors .mp4 (150s - 160.0s). Top hook: \"THAT INSTANT DROP REACTION\"."
      },
      {
            "id": "ceo_zeds_d2_04",
            "addedTime": "Oct 05, 2026 • 09:00 AM",
            "batchTag": "Day 2 - Reserve Pack (25 Videos)",
            "title": "Can Your Earphones Survive This Sub 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d2_04.mp4?v=d2_drop",
            "description": "Official Zeds Dead music clipping cut: CAN YOUR EARPHONES SURVIVE THIS SUB. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from Phuket To Colors .mp4 (160s - 170.0s). Top hook: \"CAN YOUR EARPHONES SURVIVE THIS SUB\"."
      },
      {
            "id": "ceo_zeds_d2_05",
            "addedTime": "Oct 05, 2026 • 09:00 AM",
            "batchTag": "Day 2 - Reserve Pack (25 Videos)",
            "title": "Vintage Hip Hop Chopped Over Wobble 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d2_05.mp4?v=d2_drop",
            "description": "Official Zeds Dead music clipping cut: VINTAGE HIP HOP CHOPPED OVER WOBBLE. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from Shook Ones FINAL.mp4 (0s - 10.0s). Top hook: \"VINTAGE HIP HOP CHOPPED OVER WOBBLE\"."
      },
      {
            "id": "ceo_zeds_d2_06",
            "addedTime": "Oct 05, 2026 • 09:00 AM",
            "batchTag": "Day 2 - Reserve Pack (25 Videos)",
            "title": "The Purest Synth Leads In Edm 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d2_06.mp4?v=d2_drop",
            "description": "Official Zeds Dead music clipping cut: THE PUREST SYNTH LEADS IN EDM. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from Shook Ones FINAL.mp4 (10s - 20.0s). Top hook: \"THE PUREST SYNTH LEADS IN EDM\"."
      },
      {
            "id": "ceo_zeds_d2_07",
            "addedTime": "Oct 05, 2026 • 09:00 AM",
            "batchTag": "Day 2 - Reserve Pack (25 Videos)",
            "title": "Crowd In Absolute Disbelief 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d2_07.mp4?v=d2_drop",
            "description": "Official Zeds Dead music clipping cut: CROWD IN ABSOLUTE DISBELIEF. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from Shook Ones FINAL.mp4 (20s - 30.0s). Top hook: \"CROWD IN ABSOLUTE DISBELIEF\"."
      },
      {
            "id": "ceo_zeds_d2_08",
            "addedTime": "Oct 05, 2026 • 09:00 AM",
            "batchTag": "Day 2 - Reserve Pack (25 Videos)",
            "title": "Lasers Cutting Through Colorado Sky 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d2_08.mp4?v=d2_drop",
            "description": "Official Zeds Dead music clipping cut: LASERS CUTTING THROUGH COLORADO SKY. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from Shook Ones FINAL.mp4 (30s - 40.0s). Top hook: \"LASERS CUTTING THROUGH COLORADO SKY\"."
      },
      {
            "id": "ceo_zeds_d2_09",
            "addedTime": "Oct 05, 2026 • 09:00 AM",
            "batchTag": "Day 2 - Reserve Pack (25 Videos)",
            "title": "High Speed Glide Over 10000 Fans 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d2_09.mp4?v=d2_drop",
            "description": "Official Zeds Dead music clipping cut: HIGH SPEED GLIDE OVER 10000 FANS. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from Sinatra Full FINAL.mp4 (0s - 10.0s). Top hook: \"HIGH SPEED GLIDE OVER 10000 FANS\"."
      },
      {
            "id": "ceo_zeds_d2_10",
            "addedTime": "Oct 05, 2026 • 09:00 AM",
            "batchTag": "Day 2 - Reserve Pack (25 Videos)",
            "title": "Factory Town Soundsystem Vibrations 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d2_10.mp4?v=d2_drop",
            "description": "Official Zeds Dead music clipping cut: FACTORY TOWN SOUNDSYSTEM VIBRATIONS. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from Sinatra Full FINAL.mp4 (10s - 20.0s). Top hook: \"FACTORY TOWN SOUNDSYSTEM VIBRATIONS\"."
      },
      {
            "id": "ceo_zeds_d2_11",
            "addedTime": "Oct 05, 2026 • 09:00 AM",
            "batchTag": "Day 2 - Reserve Pack (25 Videos)",
            "title": "Unreleased Zeds Dead Dubplate 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d2_11.mp4?v=d2_drop",
            "description": "Official Zeds Dead music clipping cut: UNRELEASED ZEDS DEAD DUBPLATE. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from Sinatra Full FINAL.mp4 (20s - 30.0s). Top hook: \"UNRELEASED ZEDS DEAD DUBPLATE\"."
      },
      {
            "id": "ceo_zeds_d2_12",
            "addedTime": "Oct 05, 2026 • 09:00 AM",
            "batchTag": "Day 2 - Reserve Pack (25 Videos)",
            "title": "Cryo Cannons Erupting On The Drop 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d2_12.mp4?v=d2_drop",
            "description": "Official Zeds Dead music clipping cut: CRYO CANNONS ERUPTING ON THE DROP. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from Sinatra Full FINAL.mp4 (30s - 40.0s). Top hook: \"CRYO CANNONS ERUPTING ON THE DROP\"."
      },
      {
            "id": "ceo_zeds_d2_13",
            "addedTime": "Oct 05, 2026 • 09:00 AM",
            "batchTag": "Day 2 - Reserve Pack (25 Videos)",
            "title": "When The Bass Shakes The Mountains 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d2_13.mp4?v=d2_drop",
            "description": "Official Zeds Dead music clipping cut: WHEN THE BASS SHAKES THE MOUNTAINS. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from Sinatra Full FINAL.mp4 (40s - 50.0s). Top hook: \"WHEN THE BASS SHAKES THE MOUNTAINS\"."
      },
      {
            "id": "ceo_zeds_d2_14",
            "addedTime": "Oct 05, 2026 • 09:00 AM",
            "batchTag": "Day 2 - Reserve Pack (25 Videos)",
            "title": "Retro Classic Turned Into Festival Destroyer 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d2_14.mp4?v=d2_drop",
            "description": "Official Zeds Dead music clipping cut: RETRO CLASSIC TURNED INTO FESTIVAL DESTROYER. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from Sinatra Full FINAL.mp4 (50s - 60.0s). Top hook: \"RETRO CLASSIC TURNED INTO FESTIVAL DESTROYER\"."
      },
      {
            "id": "ceo_zeds_d2_15",
            "addedTime": "Oct 05, 2026 • 09:00 AM",
            "batchTag": "Day 2 - Reserve Pack (25 Videos)",
            "title": "Amber Sunrise Over Factory Town 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d2_15.mp4?v=d2_drop",
            "description": "Official Zeds Dead music clipping cut: AMBER SUNRISE OVER FACTORY TOWN. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from Sinatra Full FINAL.mp4 (60s - 70.0s). Top hook: \"AMBER SUNRISE OVER FACTORY TOWN\"."
      },
      {
            "id": "ceo_zeds_d2_16",
            "addedTime": "Oct 05, 2026 • 09:00 AM",
            "batchTag": "Day 2 - Reserve Pack (25 Videos)",
            "title": "Hypnotic Chord Progression Intro 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d2_16.mp4?v=d2_drop",
            "description": "Official Zeds Dead music clipping cut: HYPNOTIC CHORD PROGRESSION INTRO. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from Sinatra Full FINAL.mp4 (70s - 80.0s). Top hook: \"HYPNOTIC CHORD PROGRESSION INTRO\"."
      },
      {
            "id": "ceo_zeds_d2_17",
            "addedTime": "Oct 05, 2026 • 09:00 AM",
            "batchTag": "Day 2 - Reserve Pack (25 Videos)",
            "title": "The Sub Pressure You Feel In Your Chest 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d2_17.mp4?v=d2_drop",
            "description": "Official Zeds Dead music clipping cut: THE SUB PRESSURE YOU FEEL IN YOUR CHEST. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from Sinatra Full FINAL.mp4 (80s - 90.0s). Top hook: \"THE SUB PRESSURE YOU FEEL IN YOUR CHEST\"."
      },
      {
            "id": "ceo_zeds_d2_18",
            "addedTime": "Oct 05, 2026 • 09:00 AM",
            "batchTag": "Day 2 - Reserve Pack (25 Videos)",
            "title": "Fpv Piloting Reaches Another Dimension 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d2_18.mp4?v=d2_drop",
            "description": "Official Zeds Dead music clipping cut: FPV PILOTING REACHES ANOTHER DIMENSION. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from Sinatra Full FINAL.mp4 (90s - 100.0s). Top hook: \"FPV PILOTING REACHES ANOTHER DIMENSION\"."
      },
      {
            "id": "ceo_zeds_d2_19",
            "addedTime": "Oct 05, 2026 • 09:00 AM",
            "batchTag": "Day 2 - Reserve Pack (25 Videos)",
            "title": "Colorado Night Sky Illuminated 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d2_19.mp4?v=d2_drop",
            "description": "Official Zeds Dead music clipping cut: COLORADO NIGHT SKY ILLUMINATED. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from SINATRA SHORT FINAL.mp4 (0s - 10.0s). Top hook: \"COLORADO NIGHT SKY ILLUMINATED\"."
      },
      {
            "id": "ceo_zeds_d2_20",
            "addedTime": "Oct 05, 2026 • 09:00 AM",
            "batchTag": "Day 2 - Reserve Pack (25 Videos)",
            "title": "Mop Sample Echoing Through Stadium 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d2_20.mp4?v=d2_drop",
            "description": "Official Zeds Dead music clipping cut: MOP SAMPLE ECHOING THROUGH STADIUM. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from SINATRA SHORT FINAL.mp4 (10s - 20.0s). Top hook: \"MOP SAMPLE ECHOING THROUGH STADIUM\"."
      },
      {
            "id": "ceo_zeds_d2_21",
            "addedTime": "Oct 05, 2026 • 09:00 AM",
            "batchTag": "Day 2 - Reserve Pack (25 Videos)",
            "title": "Perfectly Synced Lighting Grid 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d2_21.mp4?v=d2_drop",
            "description": "Official Zeds Dead music clipping cut: PERFECTLY SYNCED LIGHTING GRID. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from SINATRA SHORT FINAL.mp4 (20s - 30.0s). Top hook: \"PERFECTLY SYNCED LIGHTING GRID\"."
      },
      {
            "id": "ceo_zeds_d2_22",
            "addedTime": "Oct 05, 2026 • 09:00 AM",
            "batchTag": "Day 2 - Reserve Pack (25 Videos)",
            "title": "Swing Step Bounce Is Unmatched 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d2_22.mp4?v=d2_drop",
            "description": "Official Zeds Dead music clipping cut: SWING STEP BOUNCE IS UNMATCHED. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from SINATRA SHORT FINAL.mp4 (30s - 40.0s). Top hook: \"SWING STEP BOUNCE IS UNMATCHED\"."
      },
      {
            "id": "ceo_zeds_d2_23",
            "addedTime": "Oct 05, 2026 • 09:00 AM",
            "batchTag": "Day 2 - Reserve Pack (25 Videos)",
            "title": "Heavyweight Bassline Takeover 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d2_23.mp4?v=d2_drop",
            "description": "Official Zeds Dead music clipping cut: HEAVYWEIGHT BASSLINE TAKEOVER. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from SINATRA SHORT FINAL.mp4 (40s - 50.0s). Top hook: \"HEAVYWEIGHT BASSLINE TAKEOVER\"."
      },
      {
            "id": "ceo_zeds_d2_24",
            "addedTime": "Oct 05, 2026 • 09:00 AM",
            "batchTag": "Day 2 - Reserve Pack (25 Videos)",
            "title": "Speed Acceleration Into Drop Two 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d2_24.mp4?v=d2_drop",
            "description": "Official Zeds Dead music clipping cut: SPEED ACCELERATION INTO DROP TWO. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from SINATRA SHORT FINAL.mp4 (50s - 60.0s). Top hook: \"SPEED ACCELERATION INTO DROP TWO\"."
      },
      {
            "id": "ceo_zeds_d2_25",
            "addedTime": "Oct 05, 2026 • 09:00 AM",
            "batchTag": "Day 2 - Reserve Pack (25 Videos)",
            "title": "Midnight In Miami Hits Different 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d2_25.mp4?v=d2_drop",
            "description": "Official Zeds Dead music clipping cut: MIDNIGHT IN MIAMI HITS DIFFERENT. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from SINATRA SHORT FINAL.mp4 (60s - 70.0s). Top hook: \"MIDNIGHT IN MIAMI HITS DIFFERENT\"."
      },
      {
            "id": "ceo_zeds_d3_01",
            "addedTime": "Oct 06, 2026 • 09:00 AM",
            "batchTag": "Day 3 - Reserve Pack (25 Videos)",
            "title": "The Buildup That Gives Chills Every Time 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d3_01.mp4?v=d3_drop",
            "description": "Official Zeds Dead music clipping cut: THE BUILDUP THAT GIVES CHILLS EVERY TIME. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 14.mov (0s - 10.0s). Top hook: \"THE BUILDUP THAT GIVES CHILLS EVERY TIME\"."
      },
      {
            "id": "ceo_zeds_d3_02",
            "addedTime": "Oct 06, 2026 • 09:00 AM",
            "batchTag": "Day 3 - Reserve Pack (25 Videos)",
            "title": "Inverted Sky Dive Over Red Rocks 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d3_02.mp4?v=d3_drop",
            "description": "Official Zeds Dead music clipping cut: INVERTED SKY DIVE OVER RED ROCKS. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 14.mov (10s - 20.0s). Top hook: \"INVERTED SKY DIVE OVER RED ROCKS\"."
      },
      {
            "id": "ceo_zeds_d3_03",
            "addedTime": "Oct 06, 2026 • 09:00 AM",
            "batchTag": "Day 3 - Reserve Pack (25 Videos)",
            "title": "Retro Acoustics Sliced By Wobbles 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d3_03.mp4?v=d3_drop",
            "description": "Official Zeds Dead music clipping cut: RETRO ACOUSTICS SLICED BY WOBBLES. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 14.mov (20s - 30.0s). Top hook: \"RETRO ACOUSTICS SLICED BY WOBBLES\"."
      },
      {
            "id": "ceo_zeds_d3_04",
            "addedTime": "Oct 06, 2026 • 09:00 AM",
            "batchTag": "Day 3 - Reserve Pack (25 Videos)",
            "title": "This Is What Peak Festival Energy Feels Like 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d3_04.mp4?v=d3_drop",
            "description": "Official Zeds Dead music clipping cut: THIS IS WHAT PEAK FESTIVAL ENERGY FEELS LIKE. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 14.mov (30s - 40.0s). Top hook: \"THIS IS WHAT PEAK FESTIVAL ENERGY FEELS LIKE\"."
      },
      {
            "id": "ceo_zeds_d3_05",
            "addedTime": "Oct 06, 2026 • 09:00 AM",
            "batchTag": "Day 3 - Reserve Pack (25 Videos)",
            "title": "Stadium Light Show Timed To The Millisecond 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d3_05.mp4?v=d3_drop",
            "description": "Official Zeds Dead music clipping cut: STADIUM LIGHT SHOW TIMED TO THE MILLISECOND. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 15.mov (0s - 10.0s). Top hook: \"STADIUM LIGHT SHOW TIMED TO THE MILLISECOND\"."
      },
      {
            "id": "ceo_zeds_d3_06",
            "addedTime": "Oct 06, 2026 • 09:00 AM",
            "batchTag": "Day 3 - Reserve Pack (25 Videos)",
            "title": "Factory Town Ambience At Dawn 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d3_06.mp4?v=d3_drop",
            "description": "Official Zeds Dead music clipping cut: FACTORY TOWN AMBIENCE AT DAWN. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 15.mov (10s - 20.0s). Top hook: \"FACTORY TOWN AMBIENCE AT DAWN\"."
      },
      {
            "id": "ceo_zeds_d3_07",
            "addedTime": "Oct 06, 2026 • 09:00 AM",
            "batchTag": "Day 3 - Reserve Pack (25 Videos)",
            "title": "Classic Rap Vocal Floating Over Sub 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d3_07.mp4?v=d3_drop",
            "description": "Official Zeds Dead music clipping cut: CLASSIC RAP VOCAL FLOATING OVER SUB. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 15.mov (20s - 30.0s). Top hook: \"CLASSIC RAP VOCAL FLOATING OVER SUB\"."
      },
      {
            "id": "ceo_zeds_d3_08",
            "addedTime": "Oct 06, 2026 • 09:00 AM",
            "batchTag": "Day 3 - Reserve Pack (25 Videos)",
            "title": "Drone Pilot Risks It All Over The Crowd 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d3_08.mp4?v=d3_drop",
            "description": "Official Zeds Dead music clipping cut: DRONE PILOT RISKS IT ALL OVER THE CROWD. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 15.mov (30s - 40.0s). Top hook: \"DRONE PILOT RISKS IT ALL OVER THE CROWD\"."
      },
      {
            "id": "ceo_zeds_d3_09",
            "addedTime": "Oct 06, 2026 • 09:00 AM",
            "batchTag": "Day 3 - Reserve Pack (25 Videos)",
            "title": "Unfiltered Bass Pressure Test 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d3_09.mp4?v=d3_drop",
            "description": "Official Zeds Dead music clipping cut: UNFILTERED BASS PRESSURE TEST. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 15.mov (40s - 50.0s). Top hook: \"UNFILTERED BASS PRESSURE TEST\"."
      },
      {
            "id": "ceo_zeds_d3_10",
            "addedTime": "Oct 06, 2026 • 09:00 AM",
            "batchTag": "Day 3 - Reserve Pack (25 Videos)",
            "title": "The 140 Bpm Heavyweight Anthem 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d3_10.mp4?v=d3_drop",
            "description": "Official Zeds Dead music clipping cut: THE 140 BPM HEAVYWEIGHT ANTHEM. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 16.mov (0s - 10.0s). Top hook: \"THE 140 BPM HEAVYWEIGHT ANTHEM\"."
      },
      {
            "id": "ceo_zeds_d3_11",
            "addedTime": "Oct 06, 2026 • 09:00 AM",
            "batchTag": "Day 3 - Reserve Pack (25 Videos)",
            "title": "Immersive Laser Canopy Glide 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d3_11.mp4?v=d3_drop",
            "description": "Official Zeds Dead music clipping cut: IMMERSIVE LASER CANOPY GLIDE. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 16.mov (10s - 20.0s). Top hook: \"IMMERSIVE LASER CANOPY GLIDE\"."
      },
      {
            "id": "ceo_zeds_d3_12",
            "addedTime": "Oct 06, 2026 • 09:00 AM",
            "batchTag": "Day 3 - Reserve Pack (25 Videos)",
            "title": "When 10000 People Scream The Vocal 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d3_12.mp4?v=d3_drop",
            "description": "Official Zeds Dead music clipping cut: WHEN 10000 PEOPLE SCREAM THE VOCAL. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 16.mov (20s - 30.0s). Top hook: \"WHEN 10000 PEOPLE SCREAM THE VOCAL\"."
      },
      {
            "id": "ceo_zeds_d3_13",
            "addedTime": "Oct 06, 2026 • 09:00 AM",
            "batchTag": "Day 3 - Reserve Pack (25 Videos)",
            "title": "The Smoothest Drone Dive Of 2026 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d3_13.mp4?v=d3_drop",
            "description": "Official Zeds Dead music clipping cut: THE SMOOTHEST DRONE DIVE OF 2026. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 16.mov (30s - 40.0s). Top hook: \"THE SMOOTHEST DRONE DIVE OF 2026\"."
      },
      {
            "id": "ceo_zeds_d3_14",
            "addedTime": "Oct 06, 2026 • 09:00 AM",
            "batchTag": "Day 3 - Reserve Pack (25 Videos)",
            "title": "Timeless Hip Hop Flip Stomped Live 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d3_14.mp4?v=d3_drop",
            "description": "Official Zeds Dead music clipping cut: TIMELESS HIP HOP FLIP STOMPED LIVE. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 17.mov (0s - 10.0s). Top hook: \"TIMELESS HIP HOP FLIP STOMPED LIVE\"."
      },
      {
            "id": "ceo_zeds_d3_15",
            "addedTime": "Oct 06, 2026 • 09:00 AM",
            "batchTag": "Day 3 - Reserve Pack (25 Videos)",
            "title": "Cryo Cloud Envelops The Stage 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d3_15.mp4?v=d3_drop",
            "description": "Official Zeds Dead music clipping cut: CRYO CLOUD ENVELOPS THE STAGE. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 17.mov (10s - 20.0s). Top hook: \"CRYO CLOUD ENVELOPS THE STAGE\"."
      },
      {
            "id": "ceo_zeds_d3_16",
            "addedTime": "Oct 06, 2026 • 09:00 AM",
            "batchTag": "Day 3 - Reserve Pack (25 Videos)",
            "title": "Factory Town Bass Purists Assemble 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d3_16.mp4?v=d3_drop",
            "description": "Official Zeds Dead music clipping cut: FACTORY TOWN BASS PURISTS ASSEMBLE. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 17.mov (20s - 30.0s). Top hook: \"FACTORY TOWN BASS PURISTS ASSEMBLE\"."
      },
      {
            "id": "ceo_zeds_d3_17",
            "addedTime": "Oct 06, 2026 • 09:00 AM",
            "batchTag": "Day 3 - Reserve Pack (25 Videos)",
            "title": "The Moment The Sub Woofers Unload 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d3_17.mp4?v=d3_drop",
            "description": "Official Zeds Dead music clipping cut: THE MOMENT THE SUB WOOFERS UNLOAD. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 17.mov (30s - 40.0s). Top hook: \"THE MOMENT THE SUB WOOFERS UNLOAD\"."
      },
      {
            "id": "ceo_zeds_d3_18",
            "addedTime": "Oct 06, 2026 • 09:00 AM",
            "batchTag": "Day 3 - Reserve Pack (25 Videos)",
            "title": "Cinematic Fpv Over Monolith Rocks 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d3_18.mp4?v=d3_drop",
            "description": "Official Zeds Dead music clipping cut: CINEMATIC FPV OVER MONOLITH ROCKS. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 17.mov (40s - 50.0s). Top hook: \"CINEMATIC FPV OVER MONOLITH ROCKS\"."
      },
      {
            "id": "ceo_zeds_d3_19",
            "addedTime": "Oct 06, 2026 • 09:00 AM",
            "batchTag": "Day 3 - Reserve Pack (25 Videos)",
            "title": "Unreal Audience Roar On The Switch 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d3_19.mp4?v=d3_drop",
            "description": "Official Zeds Dead music clipping cut: UNREAL AUDIENCE ROAR ON THE SWITCH. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 17.mov (50s - 60.0s). Top hook: \"UNREAL AUDIENCE ROAR ON THE SWITCH\"."
      },
      {
            "id": "ceo_zeds_d3_20",
            "addedTime": "Oct 06, 2026 • 09:00 AM",
            "batchTag": "Day 3 - Reserve Pack (25 Videos)",
            "title": "Swing Step Synths Take Control 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d3_20.mp4?v=d3_drop",
            "description": "Official Zeds Dead music clipping cut: SWING STEP SYNTHS TAKE CONTROL. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 17.mov (60s - 70.0s). Top hook: \"SWING STEP SYNTHS TAKE CONTROL\"."
      },
      {
            "id": "ceo_zeds_d3_21",
            "addedTime": "Oct 06, 2026 • 09:00 AM",
            "batchTag": "Day 3 - Reserve Pack (25 Videos)",
            "title": "Nightfall Lightning Show At Red Rocks 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d3_21.mp4?v=d3_drop",
            "description": "Official Zeds Dead music clipping cut: NIGHTFALL LIGHTNING SHOW AT RED ROCKS. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 18.mov (0s - 10.0s). Top hook: \"NIGHTFALL LIGHTNING SHOW AT RED ROCKS\"."
      },
      {
            "id": "ceo_zeds_d3_22",
            "addedTime": "Oct 06, 2026 • 09:00 AM",
            "batchTag": "Day 3 - Reserve Pack (25 Videos)",
            "title": "Peak Time Festival Anthem 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d3_22.mp4?v=d3_drop",
            "description": "Official Zeds Dead music clipping cut: PEAK TIME FESTIVAL ANTHEM. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 18.mov (10s - 20.0s). Top hook: \"PEAK TIME FESTIVAL ANTHEM\"."
      },
      {
            "id": "ceo_zeds_d3_23",
            "addedTime": "Oct 06, 2026 • 09:00 AM",
            "batchTag": "Day 3 - Reserve Pack (25 Videos)",
            "title": "Unmatched Miami Music Week Energy 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d3_23.mp4?v=d3_drop",
            "description": "Official Zeds Dead music clipping cut: UNMATCHED MIAMI MUSIC WEEK ENERGY. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 18.mov (20s - 30.0s). Top hook: \"UNMATCHED MIAMI MUSIC WEEK ENERGY\"."
      },
      {
            "id": "ceo_zeds_d3_24",
            "addedTime": "Oct 06, 2026 • 09:00 AM",
            "batchTag": "Day 3 - Reserve Pack (25 Videos)",
            "title": "The Accelerating Snare Roll Finale 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d3_24.mp4?v=d3_drop",
            "description": "Official Zeds Dead music clipping cut: THE ACCELERATING SNARE ROLL FINALE. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 1.mov (0s - 10.0s). Top hook: \"THE ACCELERATING SNARE ROLL FINALE\"."
      },
      {
            "id": "ceo_zeds_d3_25",
            "addedTime": "Oct 06, 2026 • 09:00 AM",
            "batchTag": "Day 3 - Reserve Pack (25 Videos)",
            "title": "Legendary Outro Under The Morning Sun 🔥 @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/ceo_zeds_3days/ceo_zeds_d3_25.mp4?v=d3_drop",
            "description": "Official Zeds Dead music clipping cut: LEGENDARY OUTRO UNDER THE MORNING SUN. Experience peak festival sound and visuals! 🔊🔥\n\n@zedsdead\n\n#ZedsDead #BassMusic #EDMDrop #FestivalEnergy #Dubstep #Shorts",
            "hashtags": [
                  "#ZedsDead",
                  "#BassMusic",
                  "#EDMDrop",
                  "#FestivalEnergy",
                  "#Dubstep"
            ],
            "payoutRate": "$3.50 / 1k Views ($175 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 1.mov (10s - 20.0s). Top hook: \"LEGENDARY OUTRO UNDER THE MORNING SUN\"."
      }
]
  },
  {
    campaignId: "ceo_camp_2",
    campaignName: "Channel 2: Viral Gaming & Web3 (Duel & XGL)",
    category: "Gaming Clips & High Stakes Drops",
    status: "Standby For Drop",
    payout: "$10.00 CPM (Duel) / $2.50 CPM (XGL)",
    batches: [
      "All Drops (20)"
    ],
    clips: []
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
  },
  {
    "campaignId": "habeeb_moonpay_xgl",
    "campaignName": "MoonPay X Games League (XGL) Winter Draft 2026",
    "category": "Action Sports & Winter Athletes (X Games)",
    "status": "Live & Active (Strict Exclusive)",
    "payout": "$2.50 / 1k Views ($500 Max)",
    "batches": [
        "All Drops",
        "Today's MoonPay XGL Drops (Oct 4)"
    ],
    "clips": [
        {
            "id": "habeeb_moonpay_01",
            "addedTime": "Oct 04, 2026 • 11:15 AM",
            "batchTag": "Today's MoonPay XGL Drops (Oct 4)",
            "title": "He Pulled Off The First EVER 2340 Spin In Human History 🤯 @moonpayhq #shorts",
            "duration": "0:12",
            "quality": "1080x1920 (9:16 Vertical Master)",
            "videoSrc": "/campaigns/moonpay_xgl/moonpay_01.mp4?v=oct4_moonpay",
            "description": "Hiroto Ogiwara did the impossible by landing a 2340 spin in competition! Golden State locked him in immediately during the X Games League Winter Draft 🏂⚡\n\nAthlete IG: Instagram @hiroto_ogiwara @moonpayhq @moonpay\n\n#snowboarding #XGLDraft #xgames #2340 #insanetricks #shorts",
            "hashtags": [
                "#snowboarding",
                "#XGLDraft",
                "#xgames",
                "#moonpay",
                "#shorts"
            ],
            "payoutRate": "$2.50 / 1K Views ($500 Max)",
            "loopNote": "2-Part MoonPay Formula: Draft Pick from livestream (54m) + Hiroto Ogiwara highlights. Mandatory Tags: @moonpayhq @moonpay Instagram @hiroto_ogiwara. Audience must be 40%+ US/UK/CA/AU."
        },
        {
            "id": "habeeb_moonpay_02",
            "addedTime": "Oct 04, 2026 • 11:15 AM",
            "batchTag": "Today's MoonPay XGL Drops (Oct 4)",
            "title": "Scotty James TIED Shaun White's Historic X Games Record 🏆 @moonpayhq #shorts",
            "duration": "0:12",
            "quality": "1080x1920 (9:16 Vertical Master)",
            "videoSrc": "/campaigns/moonpay_xgl/moonpay_02.mp4?v=oct4_moonpay",
            "description": "Australian icon Scotty James matches Shaun White with his 5th consecutive SuperPipe Gold Medal! The SuperPipe GOAT debate is officially open.\n\nAthlete IG: Instagram @scottyjames31 @moonpayhq\n\n#ScottyJames #ShaunWhite #XGames #Snowboarding #SuperPipe #shorts",
            "hashtags": [
                "#snowboarding",
                "#XGLDraft",
                "#xgames",
                "#moonpay",
                "#shorts"
            ],
            "payoutRate": "$2.50 / 1K Views ($500 Max)",
            "loopNote": "2-Part MoonPay Formula: Draft Pick from livestream (1h 07m) + Scotty James highlights. Mandatory Tags: @moonpayhq @moonpay Instagram @scottyjames31. Audience must be 40%+ US/UK/CA/AU."
        },
        {
            "id": "habeeb_moonpay_03",
            "addedTime": "Oct 04, 2026 • 11:15 AM",
            "batchTag": "Today's MoonPay XGL Drops (Oct 4)",
            "title": "Eileen Gu Dominates The Slopes Like Nobody Else On Earth 🎿 @moonpayhq #shorts",
            "duration": "0:12",
            "quality": "1080x1920 (9:16 Vertical Master)",
            "videoSrc": "/campaigns/moonpay_xgl/moonpay_03.mp4?v=oct4_moonpay",
            "description": "The most decorated Olympic freeskier gets picked first overall. Flawless rail transfers and triple corks in the Aspen powder!\n\nAthlete IG: Instagram @eileengu @moonpayhq\n\n#eileengu #freeski #xgames #olympics #winterdraft #shorts",
            "hashtags": [
                "#snowboarding",
                "#XGLDraft",
                "#xgames",
                "#moonpay",
                "#shorts"
            ],
            "payoutRate": "$2.50 / 1K Views ($500 Max)",
            "loopNote": "2-Part MoonPay Formula: Draft Pick from livestream (21m) + Eileen Gu highlights. Mandatory Tags: @moonpayhq @moonpay Instagram @eileengu. Audience must be 40%+ US/UK/CA/AU."
        },
        {
            "id": "habeeb_moonpay_04",
            "addedTime": "Oct 04, 2026 • 11:15 AM",
            "batchTag": "Today's MoonPay XGL Drops (Oct 4)",
            "title": "Su Yiming's Gravity-Defying Gold Medal Run Was Pure Art 🏂 @moonpayhq #shorts",
            "duration": "0:12",
            "quality": "1080x1920 (9:16 Vertical Master)",
            "videoSrc": "/campaigns/moonpay_xgl/moonpay_04.mp4?v=oct4_moonpay",
            "description": "2x Olympic gold medalist Su Yiming stomping 1980 rotations with effortless style. Park City made the right choice!\n\nAthlete IG: Instagram @mingsuyi @moonpayhq\n\n#suyiming #snowboard #xgames #olympics #winterdraft #shorts",
            "hashtags": [
                "#snowboarding",
                "#XGLDraft",
                "#xgames",
                "#moonpay",
                "#shorts"
            ],
            "payoutRate": "$2.50 / 1K Views ($500 Max)",
            "loopNote": "2-Part MoonPay Formula: Draft Pick from livestream (1h 09m) + Su Yiming highlights. Mandatory Tags: @moonpayhq @moonpay Instagram @mingsuyi. Audience must be 40%+ US/UK/CA/AU."
        },
        {
            "id": "habeeb_moonpay_05",
            "addedTime": "Oct 04, 2026 • 11:15 AM",
            "batchTag": "Today's MoonPay XGL Drops (Oct 4)",
            "title": "Mark McMorris Makes History With His 25th X Games Medal 🏅 @moonpayhq #shorts",
            "duration": "0:12",
            "quality": "1080x1920 (9:16 Vertical Master)",
            "videoSrc": "/campaigns/moonpay_xgl/moonpay_05.mp4?v=oct4_moonpay",
            "description": "25 medals deep and still competing at the absolute highest level. Mark McMorris is an action sports living legend!\n\nAthlete IG: Instagram @markmcmorris @moonpayhq\n\n#markmcmorris #snowboarding #xgames #legend #winterdraft #shorts",
            "hashtags": [
                "#snowboarding",
                "#XGLDraft",
                "#xgames",
                "#moonpay",
                "#shorts"
            ],
            "payoutRate": "$2.50 / 1K Views ($500 Max)",
            "loopNote": "2-Part MoonPay Formula: Draft Pick from livestream (1h 22m) + Mark McMorris highlights. Mandatory Tags: @moonpayhq @moonpay Instagram @markmcmorris. Audience must be 40%+ US/UK/CA/AU."
        },
        {
            "id": "habeeb_moonpay_06",
            "addedTime": "Oct 04, 2026 • 11:15 AM",
            "batchTag": "Today's MoonPay XGL Drops (Oct 4)",
            "title": "17-Year-Old Mia Brookes Shatters World Snowboard Record 🌍 @moonpayhq #shorts",
            "duration": "0:12",
            "quality": "1080x1920 (9:16 Vertical Master)",
            "videoSrc": "/campaigns/moonpay_xgl/moonpay_06.mp4?v=oct4_moonpay",
            "description": "Youngest snowboard slopestyle world champion in history stomping flat spins and cab 1440s like it's nothing!\n\nAthlete IG: Instagram @mia_brookes @moonpayhq\n\n#miabrookes #snowboarding #worldchampion #xgames #shorts",
            "hashtags": [
                "#snowboarding",
                "#XGLDraft",
                "#xgames",
                "#moonpay",
                "#shorts"
            ],
            "payoutRate": "$2.50 / 1K Views ($500 Max)",
            "loopNote": "2-Part MoonPay Formula: Draft Pick from livestream (1h 28m) + Mia Brookes highlights. Mandatory Tags: @moonpayhq @moonpay Instagram @mia_brookes. Audience must be 40%+ US/UK/CA/AU."
        },
        {
            "id": "habeeb_moonpay_07",
            "addedTime": "Oct 04, 2026 • 11:15 AM",
            "batchTag": "Today's MoonPay XGL Drops (Oct 4)",
            "title": "Birk Ruud Lands Insane Triple Cork 1980 In Aspen 🇳🇴 @moonpayhq #shorts",
            "duration": "0:12",
            "quality": "1080x1920 (9:16 Vertical Master)",
            "videoSrc": "/campaigns/moonpay_xgl/moonpay_07.mp4?v=oct4_moonpay",
            "description": "Olympic Big Air Gold medalist Birk Ruud stomping triple cork 1980 with surgical precision!\n\nAthlete IG: Instagram @birk_ruud @moonpayhq\n\n#birkruud #freeski #bigair #triplecork #shorts",
            "hashtags": [
                "#snowboarding",
                "#XGLDraft",
                "#xgames",
                "#moonpay",
                "#shorts"
            ],
            "payoutRate": "$2.50 / 1K Views ($500 Max)",
            "loopNote": "2-Part MoonPay Formula: Draft Pick from livestream (1h 39m) + Birk Ruud highlights. Mandatory Tags: @moonpayhq @moonpay Instagram @birk_ruud. Audience must be 40%+ US/UK/CA/AU."
        },
        {
            "id": "habeeb_moonpay_08",
            "addedTime": "Oct 04, 2026 • 11:15 AM",
            "batchTag": "Today's MoonPay XGL Drops (Oct 4)",
            "title": "Mathilde Gremaud Doubles Down With Historic Gold Sweep 🇨🇭 @moonpayhq #shorts",
            "duration": "0:12",
            "quality": "1080x1920 (9:16 Vertical Master)",
            "videoSrc": "/campaigns/moonpay_xgl/moonpay_08.mp4?v=oct4_moonpay",
            "description": "Olympic Big Air & Slopestyle gold sweep! Mathilde Gremaud is in a league of her own.\n\nAthlete IG: Instagram @mathilde_gremaud @moonpayhq\n\n#mathildegremaud #freeski #slopestyle #olympics #shorts",
            "hashtags": [
                "#snowboarding",
                "#XGLDraft",
                "#xgames",
                "#moonpay",
                "#shorts"
            ],
            "payoutRate": "$2.50 / 1K Views ($500 Max)",
            "loopNote": "2-Part MoonPay Formula: Draft Pick from livestream (23m) + Mathilde Gremaud highlights. Mandatory Tags: @moonpayhq @moonpay Instagram @mathilde_gremaud. Audience must be 40%+ US/UK/CA/AU."
        },
        {
            "id": "habeeb_moonpay_09",
            "addedTime": "Oct 04, 2026 • 11:15 AM",
            "batchTag": "Today's MoonPay XGL Drops (Oct 4)",
            "title": "Yuto Totsuka Hits 23 Feet Out Of The SuperPipe 🚀 @moonpayhq #shorts",
            "duration": "0:12",
            "quality": "1080x1920 (9:16 Vertical Master)",
            "videoSrc": "/campaigns/moonpay_xgl/moonpay_09.mp4?v=oct4_moonpay",
            "description": "Massive 23-foot amplitude back-to-back 1440 combos in the freezing Aspen halfpipe!\n\nAthlete IG: Instagram @yuto_totsuka @moonpayhq\n\n#yutototsuka #superpipe #snowboarding #halfpipe #shorts",
            "hashtags": [
                "#snowboarding",
                "#XGLDraft",
                "#xgames",
                "#moonpay",
                "#shorts"
            ],
            "payoutRate": "$2.50 / 1K Views ($500 Max)",
            "loopNote": "2-Part MoonPay Formula: Draft Pick from livestream (1h 48m) + Yuto Totsuka highlights. Mandatory Tags: @moonpayhq @moonpay Instagram @yuto_totsuka. Audience must be 40%+ US/UK/CA/AU."
        },
        {
            "id": "habeeb_moonpay_10",
            "addedTime": "Oct 04, 2026 • 11:15 AM",
            "batchTag": "Today's MoonPay XGL Drops (Oct 4)",
            "title": "Alex Hall Invents A New Ski Trick Nobody Has Ever Seen 🧠 @moonpayhq #shorts",
            "duration": "0:12",
            "quality": "1080x1920 (9:16 Vertical Master)",
            "videoSrc": "/campaigns/moonpay_xgl/moonpay_10.mp4?v=oct4_moonpay",
            "description": "Creative wizard Alex Hall landing 2160 rotation with butter pretzel rail dismount!\n\nAthlete IG: Instagram @alexhallskiing @moonpayhq\n\n#alexhall #freeski #creative #knucklehuck #shorts",
            "hashtags": [
                "#snowboarding",
                "#XGLDraft",
                "#xgames",
                "#moonpay",
                "#shorts"
            ],
            "payoutRate": "$2.50 / 1K Views ($500 Max)",
            "loopNote": "2-Part MoonPay Formula: Draft Pick from livestream (26m) + Alex Hall highlights. Mandatory Tags: @moonpayhq @moonpay Instagram @alexhallskiing. Audience must be 40%+ US/UK/CA/AU."
        },
        {
            "id": "habeeb_moonpay_11",
            "addedTime": "Oct 04, 2026 • 11:15 AM",
            "batchTag": "Today's MoonPay XGL Drops (Oct 4)",
            "title": "Red Gerard Rail Precision Is On Another Level 🇺🇸 @moonpayhq #shorts",
            "duration": "0:12",
            "quality": "1080x1920 (9:16 Vertical Master)",
            "videoSrc": "/campaigns/moonpay_xgl/moonpay_11.mp4?v=oct4_moonpay",
            "description": "Olympic slopestyle prodigy Red Gerard slicing through rails and disaster 450 out!\n\nAthlete IG: Instagram @redgerard @moonpayhq\n\n#redgerard #slopestyle #snowboard #rails #shorts",
            "hashtags": [
                "#snowboarding",
                "#XGLDraft",
                "#xgames",
                "#moonpay",
                "#shorts"
            ],
            "payoutRate": "$2.50 / 1K Views ($500 Max)",
            "loopNote": "2-Part MoonPay Formula: Draft Pick from livestream (46m) + Red Gerard highlights. Mandatory Tags: @moonpayhq @moonpay Instagram @redgerard. Audience must be 40%+ US/UK/CA/AU."
        },
        {
            "id": "habeeb_moonpay_12",
            "addedTime": "Oct 04, 2026 • 11:15 AM",
            "batchTag": "Today's MoonPay XGL Drops (Oct 4)",
            "title": "15-Year-Old Gaon Choi Breaks Chloe Kim's Historic Record 🇰🇷 @moonpayhq #shorts",
            "duration": "0:12",
            "quality": "1080x1920 (9:16 Vertical Master)",
            "videoSrc": "/campaigns/moonpay_xgl/moonpay_12.mp4?v=oct4_moonpay",
            "description": "Korean super-teen Gaon Choi becomes the youngest SuperPipe gold medalist in X Games history!\n\nAthlete IG: Instagram @gaon_choi_ @moonpayhq\n\n#gaonchoi #halfpipe #xgames #recordbreaker #shorts",
            "hashtags": [
                "#snowboarding",
                "#XGLDraft",
                "#xgames",
                "#moonpay",
                "#shorts"
            ],
            "payoutRate": "$2.50 / 1K Views ($500 Max)",
            "loopNote": "2-Part MoonPay Formula: Draft Pick from livestream (50m) + Gaon Choi highlights. Mandatory Tags: @moonpayhq @moonpay Instagram @gaon_choi_. Audience must be 40%+ US/UK/CA/AU."
        },
        {
            "id": "habeeb_moonpay_13",
            "addedTime": "Oct 04, 2026 • 11:15 AM",
            "batchTag": "Today's MoonPay XGL Drops (Oct 4)",
            "title": "Taiga Hasegawa Stomps 4 Different 1980 Spins In One Session 🌪️ @moonpayhq #shorts",
            "duration": "0:12",
            "quality": "1080x1920 (9:16 Vertical Master)",
            "videoSrc": "/campaigns/moonpay_xgl/moonpay_13.mp4?v=oct4_moonpay",
            "description": "The only human on earth who can spin 1980 degrees in all four directions on a snowboard!\n\nAthlete IG: Instagram @taigahasegawa @moonpayhq\n\n#taigahasegawa #bigair #snowboard #quadspin #shorts",
            "hashtags": [
                "#snowboarding",
                "#XGLDraft",
                "#xgames",
                "#moonpay",
                "#shorts"
            ],
            "payoutRate": "$2.50 / 1K Views ($500 Max)",
            "loopNote": "2-Part MoonPay Formula: Draft Pick from livestream (1h 03m) + Taiga Hasegawa highlights. Mandatory Tags: @moonpayhq @moonpay Instagram @taigahasegawa. Audience must be 40%+ US/UK/CA/AU."
        },
        {
            "id": "habeeb_moonpay_14",
            "addedTime": "Oct 04, 2026 • 11:15 AM",
            "batchTag": "Today's MoonPay XGL Drops (Oct 4)",
            "title": "Naomi Urness Dominates The Big Air Jumps With Pure Steeze ⛷️ @moonpayhq #shorts",
            "duration": "0:12",
            "quality": "1080x1920 (9:16 Vertical Master)",
            "videoSrc": "/campaigns/moonpay_xgl/moonpay_14.mp4?v=oct4_moonpay",
            "description": "Smooth cork 1080 blunt grab with effortless landing in the fresh winter powder!\n\nAthlete IG: Instagram @naomi.urness @moonpayhq\n\n#naomiurness #freeski #bigair #xgames #shorts",
            "hashtags": [
                "#snowboarding",
                "#XGLDraft",
                "#xgames",
                "#moonpay",
                "#shorts"
            ],
            "payoutRate": "$2.50 / 1K Views ($500 Max)",
            "loopNote": "2-Part MoonPay Formula: Draft Pick from livestream (1h 13m) + Naomi Urness highlights. Mandatory Tags: @moonpayhq @moonpay Instagram @naomi.urness. Audience must be 40%+ US/UK/CA/AU."
        },
        {
            "id": "habeeb_moonpay_15",
            "addedTime": "Oct 04, 2026 • 11:15 AM",
            "batchTag": "Today's MoonPay XGL Drops (Oct 4)",
            "title": "Marcus Kleveland Rewrites Snowboard Physics On The Knuckle 🛸 @moonpayhq #shorts",
            "duration": "0:12",
            "quality": "1080x1920 (9:16 Vertical Master)",
            "videoSrc": "/campaigns/moonpay_xgl/moonpay_15.mp4?v=oct4_moonpay",
            "description": "The inventor of the knuckle huck revolution landing butter spins into switch backflips!\n\nAthlete IG: Instagram @marcuskleveland @moonpayhq\n\n#marcuskleveland #knucklehuck #snowboard #physics #shorts",
            "hashtags": [
                "#snowboarding",
                "#XGLDraft",
                "#xgames",
                "#moonpay",
                "#shorts"
            ],
            "payoutRate": "$2.50 / 1K Views ($500 Max)",
            "loopNote": "2-Part MoonPay Formula: Draft Pick from livestream (1h 18m) + Marcus Kleveland highlights. Mandatory Tags: @moonpayhq @moonpay Instagram @marcuskleveland. Audience must be 40%+ US/UK/CA/AU."
        },
        {
            "id": "habeeb_moonpay_16",
            "addedTime": "Oct 04, 2026 • 11:15 AM",
            "batchTag": "Today's MoonPay XGL Drops (Oct 4)",
            "title": "Tess Ledeux Becomes First Woman To Land Double Cork 1620 🇫🇷 @moonpayhq #shorts",
            "duration": "0:12",
            "quality": "1080x1920 (9:16 Vertical Master)",
            "videoSrc": "/campaigns/moonpay_xgl/moonpay_16.mp4?v=oct4_moonpay",
            "description": "Historic double cork 1620 stomp in X Games Big Air competition!\n\nAthlete IG: Instagram @tessledeux @moonpayhq\n\n#tessledeux #freeski #bigair #xgames #shorts",
            "hashtags": [
                "#snowboarding",
                "#XGLDraft",
                "#xgames",
                "#moonpay",
                "#shorts"
            ],
            "payoutRate": "$2.50 / 1K Views ($500 Max)",
            "loopNote": "2-Part MoonPay Formula: Draft Pick from livestream (30m) + Tess Ledeux highlights. Mandatory Tags: @moonpayhq @moonpay Instagram @tessledeux. Audience must be 40%+ US/UK/CA/AU."
        },
        {
            "id": "habeeb_moonpay_17",
            "addedTime": "Oct 04, 2026 • 11:15 AM",
            "batchTag": "Today's MoonPay XGL Drops (Oct 4)",
            "title": "Chloe Kim Still Undefeated On The Halfpipe At Full Speed 👸 @moonpayhq #shorts",
            "duration": "0:12",
            "quality": "1080x1920 (9:16 Vertical Master)",
            "videoSrc": "/campaigns/moonpay_xgl/moonpay_17.mp4?v=oct4_moonpay",
            "description": "Undefeated 2x Olympic halfpipe champion sending back-to-back 1080s with insane height!\n\nAthlete IG: Instagram @chloekim @moonpayhq\n\n#chloekim #halfpipe #snowboard #queen #shorts",
            "hashtags": [
                "#snowboarding",
                "#XGLDraft",
                "#xgames",
                "#moonpay",
                "#shorts"
            ],
            "payoutRate": "$2.50 / 1K Views ($500 Max)",
            "loopNote": "2-Part MoonPay Formula: Draft Pick from livestream (44m) + Chloe Kim highlights. Mandatory Tags: @moonpayhq @moonpay Instagram @chloekim. Audience must be 40%+ US/UK/CA/AU."
        },
        {
            "id": "habeeb_moonpay_18",
            "addedTime": "Oct 04, 2026 • 11:15 AM",
            "batchTag": "Today's MoonPay XGL Drops (Oct 4)",
            "title": "Ayumu Hirano Lands The Lethal Triple Cork 1440 👑 @moonpayhq #shorts",
            "duration": "0:12",
            "quality": "1080x1920 (9:16 Vertical Master)",
            "videoSrc": "/campaigns/moonpay_xgl/moonpay_18.mp4?v=oct4_moonpay",
            "description": "Frontside triple cork 1440 in the Olympic SuperPipe! Nobody flies higher than Ayumu.\n\nAthlete IG: Instagram @ayumuhirano1129 @moonpayhq\n\n#ayumuhirano #triplecork #snowboarding #goldmedal #shorts",
            "hashtags": [
                "#snowboarding",
                "#XGLDraft",
                "#xgames",
                "#moonpay",
                "#shorts"
            ],
            "payoutRate": "$2.50 / 1K Views ($500 Max)",
            "loopNote": "2-Part MoonPay Formula: Draft Pick from livestream (52m) + Ayumu Hirano highlights. Mandatory Tags: @moonpayhq @moonpay Instagram @ayumuhirano1129. Audience must be 40%+ US/UK/CA/AU."
        },
        {
            "id": "habeeb_moonpay_19",
            "addedTime": "Oct 04, 2026 • 11:15 AM",
            "batchTag": "Today's MoonPay XGL Drops (Oct 4)",
            "title": "Anna Gasser Stunned The Crowd With This Triple Underflip 🇦🇹 @moonpayhq #shorts",
            "duration": "0:12",
            "quality": "1080x1920 (9:16 Vertical Master)",
            "videoSrc": "/campaigns/moonpay_xgl/moonpay_19.mp4?v=oct4_moonpay",
            "description": "First woman to stomp a cab triple underflip in major winter sports competition!\n\nAthlete IG: Instagram @annagassersnow @moonpayhq\n\n#annagasser #bigair #snowboard #pioneer #shorts",
            "hashtags": [
                "#snowboarding",
                "#XGLDraft",
                "#xgames",
                "#moonpay",
                "#shorts"
            ],
            "payoutRate": "$2.50 / 1K Views ($500 Max)",
            "loopNote": "2-Part MoonPay Formula: Draft Pick from livestream (1h 02m) + Anna Gasser highlights. Mandatory Tags: @moonpayhq @moonpay Instagram @annagassersnow. Audience must be 40%+ US/UK/CA/AU."
        },
        {
            "id": "habeeb_moonpay_20",
            "addedTime": "Oct 04, 2026 • 11:15 AM",
            "batchTag": "Today's MoonPay XGL Drops (Oct 4)",
            "title": "Zeb Powell Knuckle Huck Run Had The Entire Crowd In Tears 😂 @moonpayhq #shorts",
            "duration": "0:12",
            "quality": "1080x1920 (9:16 Vertical Master)",
            "videoSrc": "/campaigns/moonpay_xgl/moonpay_20.mp4?v=oct4_moonpay",
            "description": "Coffin slide into no-grab backflip on a 203cm board! Pure action sports entertainment.\n\nAthlete IG: Instagram @zebpowelll @moonpayhq\n\n#zebpowell #knucklehuck #creative #snowboard #shorts",
            "hashtags": [
                "#snowboarding",
                "#XGLDraft",
                "#xgames",
                "#moonpay",
                "#shorts"
            ],
            "payoutRate": "$2.50 / 1K Views ($500 Max)",
            "loopNote": "2-Part MoonPay Formula: Draft Pick from livestream (1h 15m) + Zeb Powell highlights. Mandatory Tags: @moonpayhq @moonpay Instagram @zebpowelll. Audience must be 40%+ US/UK/CA/AU."
        }
    ]
},
  {
    "campaignId": "habeeb_duel_shorts",
    "campaignName": "Duel [CLIPPING - YT SHORTS] (Official Campaign)",
    "category": "1v1 PvP Gaming, Bets, IRL & Arena Reactions",
    "status": "Live & Active (Strict Exclusive)",
    "payout": "$10.00 / 1k Views (Min 1,750 Views)",
    "batches": [
        "All Drops",
        "Duel [YT Shorts] Exclusive Drops"
    ],
    "clips": [
        {
                "id": "duel_01",
                "addedTime": "Oct 04, 2026 • 05:00 PM",
                "batchTag": "Today's 20 Viral Drops (Oct 4)",
                "title": "Clavicular Calls Out Sneako For Disrespecting Duel 🤬 #shorts",
                "duration": "0:11",
                "quality": "1080x1920 (9:16 Shorts HD)",
                "videoSrc": "/campaigns/duel_shorts/duel_01.mp4?v=sneako_vital",
                "description": "Clavicular did NOT hold back on Sneako after his comments about Duel! The tension between them was insane 💀\n\n#duel #sneako #clavicular #streamerdrama #reaction #shorts",
                "hashtags": [
                        "#duel",
                        "#sneako",
                        "#shorts",
                        "#streamer",
                        "#gaming"
                ],
                "payoutRate": "$10.00 CPM ($2,000 Max)",
                "loopNote": "Duel YT Shorts Formula: On-screen top hook ('CLAVICULAR CALLS OUT SNEAKO FOR DISRESPECTING DUEL'). YouTube Shorts ONLY. Min 7s length. Min 1% engagement. 40%+ Tier-1 (US/UK/CA/AU)."
        },
        {
                "id": "duel_02",
                "addedTime": "Oct 04, 2026 • 05:00 PM",
                "batchTag": "Today's 20 Viral Drops (Oct 4)",
                "title": "Sneako And Vitaly React To Insane Duel Win 🤯 #shorts",
                "duration": "0:11",
                "quality": "1080x1920 (9:16 Shorts HD)",
                "videoSrc": "/campaigns/duel_shorts/duel_02.mp4?v=sneako_vital",
                "description": "Vitaly and Sneako could not believe the final second multiplier on Duel! Both of them lost their minds live on stream 🔥\n\n#duel #sneako #vitaly #kickstream #viralmoments #shorts",
                "hashtags": [
                        "#duel",
                        "#sneako",
                        "#shorts",
                        "#streamer",
                        "#gaming"
                ],
                "payoutRate": "$10.00 CPM ($2,000 Max)",
                "loopNote": "Duel YT Shorts Formula: On-screen top hook ('SNEAKO AND VITALY GET SHOCKED BY DUEL WIN'). YouTube Shorts ONLY. Min 7s length. Min 1% engagement. 40%+ Tier-1 (US/UK/CA/AU)."
        },
        {
                "id": "duel_03",
                "addedTime": "Oct 04, 2026 • 05:00 PM",
                "batchTag": "Today's 20 Viral Drops (Oct 4)",
                "title": "Sneako Snaps At Chat Over TTS Duel Donation 🤬 #shorts",
                "duration": "0:11",
                "quality": "1080x1920 (9:16 Shorts HD)",
                "videoSrc": "/campaigns/duel_shorts/duel_03.mp4?v=sneako_vital",
                "description": "When chat won't stop sending Duel donation TTS messages and Sneako completely loses his temper! 😂\n\n#duel #sneako #rage #funnymoments #streamerfails #shorts",
                "hashtags": [
                        "#duel",
                        "#sneako",
                        "#shorts",
                        "#streamer",
                        "#gaming"
                ],
                "payoutRate": "$10.00 CPM ($2,000 Max)",
                "loopNote": "Duel YT Shorts Formula: On-screen top hook ('SNEAKO SNAPS AT CHAT OVER DUEL DONATION'). YouTube Shorts ONLY. Min 7s length. Min 1% engagement. 40%+ Tier-1 (US/UK/CA/AU)."
        },
        {
                "id": "duel_04",
                "addedTime": "Oct 04, 2026 • 05:00 PM",
                "batchTag": "Today's 20 Viral Drops (Oct 4)",
                "title": "Sneako Perma-Bans Duel Spammer Live On Kick 🚫 #shorts",
                "duration": "0:11",
                "quality": "1080x1920 (9:16 Shorts HD)",
                "videoSrc": "/campaigns/duel_shorts/duel_04.mp4?v=sneako_vital",
                "description": "He really paid money just to troll Sneako with Duel TTS until he got banned live in front of 30,000 viewers! 💀\n\n#duel #sneako #banned #kick #troll #shorts",
                "hashtags": [
                        "#duel",
                        "#sneako",
                        "#shorts",
                        "#streamer",
                        "#gaming"
                ],
                "payoutRate": "$10.00 CPM ($2,000 Max)",
                "loopNote": "Duel YT Shorts Formula: On-screen top hook ('SNEAKO BANS DUEL TTS SPAMMER ON STREAM'). YouTube Shorts ONLY. Min 7s length. Min 1% engagement. 40%+ Tier-1 (US/UK/CA/AU)."
        },
        {
                "id": "duel_05",
                "addedTime": "Oct 04, 2026 • 05:00 PM",
                "batchTag": "Today's 20 Viral Drops (Oct 4)",
                "title": "Sneako Debates If Duel Is Halal Or Haram ☪️ #shorts",
                "duration": "0:11",
                "quality": "1080x1920 (9:16 Shorts HD)",
                "videoSrc": "/campaigns/duel_shorts/duel_05.mp4?v=sneako_vital",
                "description": "Sneako breaking down the mechanics of Duel PvP and arguing with chat whether peer-to-peer wagering is halal 🤔\n\n#duel #sneako #halal #debate #streamer #shorts",
                "hashtags": [
                        "#duel",
                        "#sneako",
                        "#shorts",
                        "#streamer",
                        "#gaming"
                ],
                "payoutRate": "$10.00 CPM ($2,000 Max)",
                "loopNote": "Duel YT Shorts Formula: On-screen top hook ('SNEAKO DEBATES IF DUEL IS ACTUALLY HALAL'). YouTube Shorts ONLY. Min 7s length. Min 1% engagement. 40%+ Tier-1 (US/UK/CA/AU)."
        },
        {
                "id": "duel_06",
                "addedTime": "Oct 04, 2026 • 05:00 PM",
                "batchTag": "Today's 20 Viral Drops (Oct 4)",
                "title": "Clavicular Tries To Convince Sneako Duel Is Halal 😂 #shorts",
                "duration": "0:11",
                "quality": "1080x1920 (9:16 Shorts HD)",
                "videoSrc": "/campaigns/duel_shorts/duel_06.mp4?v=sneako_vital",
                "description": "Clavicular giving Sneako a whole theological lecture on why Duel has no house edge and is pure skill! 🧠\n\n#duel #clavicular #sneako #funny #debate #shorts",
                "hashtags": [
                        "#duel",
                        "#sneako",
                        "#shorts",
                        "#streamer",
                        "#gaming"
                ],
                "payoutRate": "$10.00 CPM ($2,000 Max)",
                "loopNote": "Duel YT Shorts Formula: On-screen top hook ('CLAVICULAR CONVINCES SNEAKO DUEL IS HALAL'). YouTube Shorts ONLY. Min 7s length. Min 1% engagement. 40%+ Tier-1 (US/UK/CA/AU)."
        },
        {
                "id": "duel_07",
                "addedTime": "Oct 04, 2026 • 05:00 PM",
                "batchTag": "Today's 20 Viral Drops (Oct 4)",
                "title": "Sneako Realizes Duel Has A 0% House Edge 🤯 #shorts",
                "duration": "0:11",
                "quality": "1080x1920 (9:16 Shorts HD)",
                "videoSrc": "/campaigns/duel_shorts/duel_07.mp4?v=sneako_vital",
                "description": "Sneako discovers how Duel actually works without any casino house edge. Pure player vs player competition!\n\n#duel #sneako #pvp #houseedge #gaming #shorts",
                "hashtags": [
                        "#duel",
                        "#sneako",
                        "#shorts",
                        "#streamer",
                        "#gaming"
                ],
                "payoutRate": "$10.00 CPM ($2,000 Max)",
                "loopNote": "Duel YT Shorts Formula: On-screen top hook ('SNEAKO EXPOSES DUEL ZERO HOUSE EDGE'). YouTube Shorts ONLY. Min 7s length. Min 1% engagement. 40%+ Tier-1 (US/UK/CA/AU)."
        },
        {
                "id": "duel_08",
                "addedTime": "Oct 04, 2026 • 05:00 PM",
                "batchTag": "Today's 20 Viral Drops (Oct 4)",
                "title": "'You Are Disrespecting Duel Right Now!' 😡 #shorts",
                "duration": "0:11",
                "quality": "1080x1920 (9:16 Shorts HD)",
                "videoSrc": "/campaigns/duel_shorts/duel_08.mp4?v=sneako_vital",
                "description": "He stood up for Duel against everyone in the room! The argument got way too heated 🔥\n\n#duel #sneako #argument #drama #streamers #shorts",
                "hashtags": [
                        "#duel",
                        "#sneako",
                        "#shorts",
                        "#streamer",
                        "#gaming"
                ],
                "payoutRate": "$10.00 CPM ($2,000 Max)",
                "loopNote": "Duel YT Shorts Formula: On-screen top hook ('STOP DISRESPECTING DUEL RIGHT NOW'). YouTube Shorts ONLY. Min 7s length. Min 1% engagement. 40%+ Tier-1 (US/UK/CA/AU)."
        },
        {
                "id": "duel_09",
                "addedTime": "Oct 04, 2026 • 05:00 PM",
                "batchTag": "Today's 20 Viral Drops (Oct 4)",
                "title": "Sneako Calls Clavicular To Squash The Beef 📞 #shorts",
                "duration": "0:11",
                "quality": "1080x1920 (9:16 Shorts HD)",
                "videoSrc": "/campaigns/duel_shorts/duel_09.mp4?v=sneako_vital",
                "description": "Sneako pulls out his phone on stream and dials Clavicular to address the Duel feud in real time!\n\n#duel #sneako #phonecall #clavicular #beef #shorts",
                "hashtags": [
                        "#duel",
                        "#sneako",
                        "#shorts",
                        "#streamer",
                        "#gaming"
                ],
                "payoutRate": "$10.00 CPM ($2,000 Max)",
                "loopNote": "Duel YT Shorts Formula: On-screen top hook ('SNEAKO CALLS CLAVICULAR LIVE ON STREAM'). YouTube Shorts ONLY. Min 7s length. Min 1% engagement. 40%+ Tier-1 (US/UK/CA/AU)."
        },
        {
                "id": "duel_10",
                "addedTime": "Oct 04, 2026 • 05:00 PM",
                "batchTag": "Today's 20 Viral Drops (Oct 4)",
                "title": "Sneako Addresses The Viral Video With Clavicular 🎬 #shorts",
                "duration": "0:11",
                "quality": "1080x1920 (9:16 Shorts HD)",
                "videoSrc": "/campaigns/duel_shorts/duel_10.mp4?v=sneako_vital",
                "description": "Sneako reacts to the trending clip that had everyone talking on Twitter and Kick all week long!\n\n#duel #sneako #response #trending #viral #shorts",
                "hashtags": [
                        "#duel",
                        "#sneako",
                        "#shorts",
                        "#streamer",
                        "#gaming"
                ],
                "payoutRate": "$10.00 CPM ($2,000 Max)",
                "loopNote": "Duel YT Shorts Formula: On-screen top hook ('SNEAKO ADDRESSES CLAVICULAR DRAMA'). YouTube Shorts ONLY. Min 7s length. Min 1% engagement. 40%+ Tier-1 (US/UK/CA/AU)."
        },
        {
                "id": "duel_11",
                "addedTime": "Oct 04, 2026 • 05:00 PM",
                "batchTag": "Today's 20 Viral Drops (Oct 4)",
                "title": "Chat Will Not Stop Trolling Sneako With Duel Donos 💀 #shorts",
                "duration": "0:11",
                "quality": "1080x1920 (9:16 Shorts HD)",
                "videoSrc": "/campaigns/duel_shorts/duel_11.mp4?v=sneako_vital",
                "description": "His face when another $100 donation pops up on screen mentioning Duel! Pure agony 😂\n\n#duel #sneako #tts #funnyreaction #streamer #shorts",
                "hashtags": [
                        "#duel",
                        "#sneako",
                        "#shorts",
                        "#streamer",
                        "#gaming"
                ],
                "payoutRate": "$10.00 CPM ($2,000 Max)",
                "loopNote": "Duel YT Shorts Formula: On-screen top hook ('ANOTHER INSANE DUEL DONATION TO SNEAKO'). YouTube Shorts ONLY. Min 7s length. Min 1% engagement. 40%+ Tier-1 (US/UK/CA/AU)."
        },
        {
                "id": "duel_12",
                "addedTime": "Oct 04, 2026 • 05:00 PM",
                "batchTag": "Today's 20 Viral Drops (Oct 4)",
                "title": "Sneako Threatens Legal Action Over Duel Drama ⚖️ #shorts",
                "duration": "0:11",
                "quality": "1080x1920 (9:16 Shorts HD)",
                "videoSrc": "/campaigns/duel_shorts/duel_12.mp4?v=sneako_vital",
                "description": "Sneako says his lawyers are already drafting up papers after what happened on stream! 😳\n\n#duel #sneako #lawsuit #drama #lawyer #shorts",
                "hashtags": [
                        "#duel",
                        "#sneako",
                        "#shorts",
                        "#streamer",
                        "#gaming"
                ],
                "payoutRate": "$10.00 CPM ($2,000 Max)",
                "loopNote": "Duel YT Shorts Formula: On-screen top hook ('SNEAKO THREATENS TO SUE OVER DUEL CONTROVERSY'). YouTube Shorts ONLY. Min 7s length. Min 1% engagement. 40%+ Tier-1 (US/UK/CA/AU)."
        },
        {
                "id": "duel_13",
                "addedTime": "Oct 04, 2026 • 05:00 PM",
                "batchTag": "Today's 20 Viral Drops (Oct 4)",
                "title": "Sneako Finally Logs Into Duel Live On Stream 🎮 #shorts",
                "duration": "0:11",
                "quality": "1080x1920 (9:16 Shorts HD)",
                "videoSrc": "/campaigns/duel_shorts/duel_13.mp4?v=sneako_vital",
                "description": "After months of chat asking him, Sneako finally tests out Duel for himself! His first impression says it all.\n\n#duel #sneako #firsttime #pvp #gaming #shorts",
                "hashtags": [
                        "#duel",
                        "#sneako",
                        "#shorts",
                        "#streamer",
                        "#gaming"
                ],
                "payoutRate": "$10.00 CPM ($2,000 Max)",
                "loopNote": "Duel YT Shorts Formula: On-screen top hook ('SNEAKO FINALLY TRIES DUEL ON LIVE STREAM'). YouTube Shorts ONLY. Min 7s length. Min 1% engagement. 40%+ Tier-1 (US/UK/CA/AU)."
        },
        {
                "id": "duel_14",
                "addedTime": "Oct 04, 2026 • 05:00 PM",
                "batchTag": "Today's 20 Viral Drops (Oct 4)",
                "title": "Monarch Drops A Huge Duel Donation On Sneako 💰 #shorts",
                "duration": "0:11",
                "quality": "1080x1920 (9:16 Shorts HD)",
                "videoSrc": "/campaigns/duel_shorts/duel_14.mp4?v=sneako_vital",
                "description": "Monarch caught Sneako off guard with a massive donation on stream! The message had him stunned.\n\n#duel #monarch #sneako #streamerdonation #bigwin #shorts",
                "hashtags": [
                        "#duel",
                        "#sneako",
                        "#shorts",
                        "#streamer",
                        "#gaming"
                ],
                "payoutRate": "$10.00 CPM ($2,000 Max)",
                "loopNote": "Duel YT Shorts Formula: On-screen top hook ('MONARCH DROPS A CRAZY DONO ON SNEAKO'). YouTube Shorts ONLY. Min 7s length. Min 1% engagement. 40%+ Tier-1 (US/UK/CA/AU)."
        },
        {
                "id": "duel_15",
                "addedTime": "Oct 04, 2026 • 05:00 PM",
                "batchTag": "Today's 20 Viral Drops (Oct 4)",
                "title": "Nelli Confronts Sneako About Playing Duel Off-Stream 👀 #shorts",
                "duration": "0:11",
                "quality": "1080x1920 (9:16 Shorts HD)",
                "videoSrc": "/campaigns/duel_shorts/duel_15.mp4?v=sneako_vital",
                "description": "Nelli puts Sneako on blast for staying up until 4 AM playing 1v1 matches on Duel! 😂\n\n#duel #sneako #nelli #exposed #funnyclips #shorts",
                "hashtags": [
                        "#duel",
                        "#sneako",
                        "#shorts",
                        "#streamer",
                        "#gaming"
                ],
                "payoutRate": "$10.00 CPM ($2,000 Max)",
                "loopNote": "Duel YT Shorts Formula: On-screen top hook ('NELLI ASKS SNEAKO ABOUT HIS DUEL ADDICTION'). YouTube Shorts ONLY. Min 7s length. Min 1% engagement. 40%+ Tier-1 (US/UK/CA/AU)."
        },
        {
                "id": "duel_16",
                "addedTime": "Oct 04, 2026 • 05:00 PM",
                "batchTag": "Today's 20 Viral Drops (Oct 4)",
                "title": "Sneako Prepares Official Apology Statement To Duel 📄 #shorts",
                "duration": "0:11",
                "quality": "1080x1920 (9:16 Shorts HD)",
                "videoSrc": "/campaigns/duel_shorts/duel_16.mp4?v=sneako_vital",
                "description": "Sneako on his notes app drafting a formal apology after disrespecting Duel during his broadcast!\n\n#duel #sneako #apology #statement #streamerlife #shorts",
                "hashtags": [
                        "#duel",
                        "#sneako",
                        "#shorts",
                        "#streamer",
                        "#gaming"
                ],
                "payoutRate": "$10.00 CPM ($2,000 Max)",
                "loopNote": "Duel YT Shorts Formula: On-screen top hook ('SNEAKO PREPARES APOLOGY TO DUEL PLATFORM'). YouTube Shorts ONLY. Min 7s length. Min 1% engagement. 40%+ Tier-1 (US/UK/CA/AU)."
        },
        {
                "id": "duel_17",
                "addedTime": "Oct 04, 2026 • 05:00 PM",
                "batchTag": "Today's 20 Viral Drops (Oct 4)",
                "title": "Sneako Reads His Duel Apology Out Loud To Chat 💀 #shorts",
                "duration": "0:11",
                "quality": "1080x1920 (9:16 Shorts HD)",
                "videoSrc": "/campaigns/duel_shorts/duel_17.mp4?v=sneako_vital",
                "description": "Chat made him read every single word out loud without laughing! The most awkward 60 seconds ever 😂\n\n#duel #sneako #apologyletter #kickstream #funnymoments #shorts",
                "hashtags": [
                        "#duel",
                        "#sneako",
                        "#shorts",
                        "#streamer",
                        "#gaming"
                ],
                "payoutRate": "$10.00 CPM ($2,000 Max)",
                "loopNote": "Duel YT Shorts Formula: On-screen top hook ('SNEAKO READS DUEL OFFICIAL APOLOGY LETTER'). YouTube Shorts ONLY. Min 7s length. Min 1% engagement. 40%+ Tier-1 (US/UK/CA/AU)."
        },
        {
                "id": "duel_18",
                "addedTime": "Oct 04, 2026 • 05:00 PM",
                "batchTag": "Today's 20 Viral Drops (Oct 4)",
                "title": "The Donation That Made Sneako Want To Walk Off Stream 🚪 #shorts",
                "duration": "0:11",
                "quality": "1080x1920 (9:16 Shorts HD)",
                "videoSrc": "/campaigns/duel_shorts/duel_18.mp4?v=sneako_vital",
                "description": "He literally pushed his chair back and stared into the ceiling when this donation came in 😭\n\n#duel #sneako #ragequit #streamerfails #funny #shorts",
                "hashtags": [
                        "#duel",
                        "#sneako",
                        "#shorts",
                        "#streamer",
                        "#gaming"
                ],
                "payoutRate": "$10.00 CPM ($2,000 Max)",
                "loopNote": "Duel YT Shorts Formula: On-screen top hook ('CHAT SENDS ANOTHER DUEL DONO TO SNEAKO'). YouTube Shorts ONLY. Min 7s length. Min 1% engagement. 40%+ Tier-1 (US/UK/CA/AU)."
        },
        {
                "id": "duel_19",
                "addedTime": "Oct 04, 2026 • 05:00 PM",
                "batchTag": "Today's 20 Viral Drops (Oct 4)",
                "title": "Sneako Begs Viewers To Stop Sending Duel Donos 🙏 #shorts",
                "duration": "0:11",
                "quality": "1080x1920 (9:16 Shorts HD)",
                "videoSrc": "/campaigns/duel_shorts/duel_19.mp4?v=sneako_vital",
                "description": "'Please bro, I am begging you, stop mentioning Duel in the TTS!' Chat took that as a challenge 😂\n\n#duel #sneako #begging #troll #kick #shorts",
                "hashtags": [
                        "#duel",
                        "#sneako",
                        "#shorts",
                        "#streamer",
                        "#gaming"
                ],
                "payoutRate": "$10.00 CPM ($2,000 Max)",
                "loopNote": "Duel YT Shorts Formula: On-screen top hook ('SNEAKO GETS SICK OF DUEL DONATIONS'). YouTube Shorts ONLY. Min 7s length. Min 1% engagement. 40%+ Tier-1 (US/UK/CA/AU)."
        },
        {
                "id": "duel_20",
                "addedTime": "Oct 04, 2026 • 05:00 PM",
                "batchTag": "Today's 20 Viral Drops (Oct 4)",
                "title": "Clavicular vs Sneako Live Duel Showdown 🥊 #shorts",
                "duration": "0:11",
                "quality": "1080x1920 (9:16 Shorts HD)",
                "videoSrc": "/campaigns/duel_shorts/duel_20.mp4?v=sneako_vital",
                "description": "The ultimate faceoff! Clavicular and Sneako go head-to-head on Duel to settle their dispute once and for all 🔥\n\n#duel #sneako #clavicular #showdown #pvp #shorts",
                "hashtags": [
                        "#duel",
                        "#sneako",
                        "#shorts",
                        "#streamer",
                        "#gaming"
                ],
                "payoutRate": "$10.00 CPM ($2,000 Max)",
                "loopNote": "Duel YT Shorts Formula: On-screen top hook ('CLAVICULAR AND SNEAKO DUEL SHOWDOWN'). YouTube Shorts ONLY. Min 7s length. Min 1% engagement. 40%+ Tier-1 (US/UK/CA/AU)."
        }
      ]
  }
];

const LILSHEY_CAMPAIGNS: CampaignSlot[] = [
  {
    campaignId: "lilshey_zeds_music",
    campaignName: "Zeds Dead Music Clipping (3-Day Drop Pack - 45 Unique Videos)",
    category: "Electronic & Bass Music (Deadbeats Records)",
    status: "Live & Active (Strict Lilshey Exclusive)",
    payout: "$1,000 / 1M Views ($500 Max)",
    batches: [
      "All Drops (45)",
      "Day 1 Drop (15 Videos)",
      "Day 2 Drop (15 Videos)",
      "Day 3 Drop (15 Videos)"
    ],
    clips: [
      {
            "id": "lilshey_zeds_d1_01",
            "addedTime": "Oct 04, 2026 • 09:00 AM",
            "batchTag": "Day 1 Drop (15 Videos)",
            "title": "Hypnotic 3am Vocal Buildup In Miami ✨ @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/lilshey_zeds_3days/lilshey_zeds_d1_01.mp4?v=d1_drop",
            "description": "Zeds Dead live tour edit: HYPNOTIC 3AM VOCAL BUILDUP IN MIAMI. Silky atmosphere building into earth-shaking sub frequencies! ⚡✨\n\n@zedsdead\n\n#zedsdead #bassmusic #festivalseason #dubstep #electronicmusic",
            "hashtags": [
                  "#zedsdead",
                  "#bassmusic",
                  "#festivalseason",
                  "#dubstep",
                  "#electronicmusic"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 1.mov (20s - 30.0s). Top hook: \"HYPNOTIC 3AM VOCAL BUILDUP IN MIAMI\"."
      },
      {
            "id": "lilshey_zeds_d1_02",
            "addedTime": "Oct 04, 2026 • 09:00 AM",
            "batchTag": "Day 1 Drop (15 Videos)",
            "title": "Cryo Fog Eruption Over Factory Town ✨ @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/lilshey_zeds_3days/lilshey_zeds_d1_02.mp4?v=d1_drop",
            "description": "Zeds Dead live tour edit: CRYO FOG ERUPTION OVER FACTORY TOWN. Silky atmosphere building into earth-shaking sub frequencies! ⚡✨\n\n@zedsdead\n\n#zedsdead #bassmusic #festivalseason #dubstep #electronicmusic",
            "hashtags": [
                  "#zedsdead",
                  "#bassmusic",
                  "#festivalseason",
                  "#dubstep",
                  "#electronicmusic"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 1.mov (30s - 40.0s). Top hook: \"CRYO FOG ERUPTION OVER FACTORY TOWN\"."
      },
      {
            "id": "lilshey_zeds_d1_03",
            "addedTime": "Oct 04, 2026 • 09:00 AM",
            "batchTag": "Day 1 Drop (15 Videos)",
            "title": "Gliding Through Emerald Laser Beams ✨ @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/lilshey_zeds_3days/lilshey_zeds_d1_03.mp4?v=d1_drop",
            "description": "Zeds Dead live tour edit: GLIDING THROUGH EMERALD LASER BEAMS. Silky atmosphere building into earth-shaking sub frequencies! ⚡✨\n\n@zedsdead\n\n#zedsdead #bassmusic #festivalseason #dubstep #electronicmusic",
            "hashtags": [
                  "#zedsdead",
                  "#bassmusic",
                  "#festivalseason",
                  "#dubstep",
                  "#electronicmusic"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 3.mov (0s - 10.0s). Top hook: \"GLIDING THROUGH EMERALD LASER BEAMS\"."
      },
      {
            "id": "lilshey_zeds_d1_04",
            "addedTime": "Oct 04, 2026 • 09:00 AM",
            "batchTag": "Day 1 Drop (15 Videos)",
            "title": "That Sub Bass Drop At 140 Bpm ✨ @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/lilshey_zeds_3days/lilshey_zeds_d1_04.mp4?v=d1_drop",
            "description": "Zeds Dead live tour edit: THAT SUB BASS DROP AT 140 BPM. Silky atmosphere building into earth-shaking sub frequencies! ⚡✨\n\n@zedsdead\n\n#zedsdead #bassmusic #festivalseason #dubstep #electronicmusic",
            "hashtags": [
                  "#zedsdead",
                  "#bassmusic",
                  "#festivalseason",
                  "#dubstep",
                  "#electronicmusic"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 3.mov (10s - 20.0s). Top hook: \"THAT SUB BASS DROP AT 140 BPM\"."
      },
      {
            "id": "lilshey_zeds_d1_05",
            "addedTime": "Oct 04, 2026 • 09:00 AM",
            "batchTag": "Day 1 Drop (15 Videos)",
            "title": "The Sunrise Chords Hit Different ✨ @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/lilshey_zeds_3days/lilshey_zeds_d1_05.mp4?v=d1_drop",
            "description": "Zeds Dead live tour edit: THE SUNRISE CHORDS HIT DIFFERENT. Silky atmosphere building into earth-shaking sub frequencies! ⚡✨\n\n@zedsdead\n\n#zedsdead #bassmusic #festivalseason #dubstep #electronicmusic",
            "hashtags": [
                  "#zedsdead",
                  "#bassmusic",
                  "#festivalseason",
                  "#dubstep",
                  "#electronicmusic"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 3.mov (20s - 30.0s). Top hook: \"THE SUNRISE CHORDS HIT DIFFERENT\"."
      },
      {
            "id": "lilshey_zeds_d1_06",
            "addedTime": "Oct 04, 2026 • 09:00 AM",
            "batchTag": "Day 1 Drop (15 Videos)",
            "title": "Weightless Drone Flight Over The Main Stage ✨ @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/lilshey_zeds_3days/lilshey_zeds_d1_06.mp4?v=d1_drop",
            "description": "Zeds Dead live tour edit: WEIGHTLESS DRONE FLIGHT OVER THE MAIN STAGE. Silky atmosphere building into earth-shaking sub frequencies! ⚡✨\n\n@zedsdead\n\n#zedsdead #bassmusic #festivalseason #dubstep #electronicmusic",
            "hashtags": [
                  "#zedsdead",
                  "#bassmusic",
                  "#festivalseason",
                  "#dubstep",
                  "#electronicmusic"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 4.mov (0s - 10.0s). Top hook: \"WEIGHTLESS DRONE FLIGHT OVER THE MAIN STAGE\"."
      },
      {
            "id": "lilshey_zeds_d1_07",
            "addedTime": "Oct 04, 2026 • 09:00 AM",
            "batchTag": "Day 1 Drop (15 Videos)",
            "title": "Analog Jazz Meets Modern Sub Woofers ✨ @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/lilshey_zeds_3days/lilshey_zeds_d1_07.mp4?v=d1_drop",
            "description": "Zeds Dead live tour edit: ANALOG JAZZ MEETS MODERN SUB WOOFERS. Silky atmosphere building into earth-shaking sub frequencies! ⚡✨\n\n@zedsdead\n\n#zedsdead #bassmusic #festivalseason #dubstep #electronicmusic",
            "hashtags": [
                  "#zedsdead",
                  "#bassmusic",
                  "#festivalseason",
                  "#dubstep",
                  "#electronicmusic"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 4.mov (10s - 20.0s). Top hook: \"ANALOG JAZZ MEETS MODERN SUB WOOFERS\"."
      },
      {
            "id": "lilshey_zeds_d1_08",
            "addedTime": "Oct 04, 2026 • 09:00 AM",
            "batchTag": "Day 1 Drop (15 Videos)",
            "title": "The Moment The Whole Arena Froze ✨ @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/lilshey_zeds_3days/lilshey_zeds_d1_08.mp4?v=d1_drop",
            "description": "Zeds Dead live tour edit: THE MOMENT THE WHOLE ARENA FROZE. Silky atmosphere building into earth-shaking sub frequencies! ⚡✨\n\n@zedsdead\n\n#zedsdead #bassmusic #festivalseason #dubstep #electronicmusic",
            "hashtags": [
                  "#zedsdead",
                  "#bassmusic",
                  "#festivalseason",
                  "#dubstep",
                  "#electronicmusic"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 4.mov (20s - 30.0s). Top hook: \"THE MOMENT THE WHOLE ARENA FROZE\"."
      },
      {
            "id": "lilshey_zeds_d1_09",
            "addedTime": "Oct 04, 2026 • 09:00 AM",
            "batchTag": "Day 1 Drop (15 Videos)",
            "title": "Sub-bass Frequencies Tested At High Altitude ✨ @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/lilshey_zeds_3days/lilshey_zeds_d1_09.mp4?v=d1_drop",
            "description": "Zeds Dead live tour edit: SUB-BASS FREQUENCIES TESTED AT HIGH ALTITUDE. Silky atmosphere building into earth-shaking sub frequencies! ⚡✨\n\n@zedsdead\n\n#zedsdead #bassmusic #festivalseason #dubstep #electronicmusic",
            "hashtags": [
                  "#zedsdead",
                  "#bassmusic",
                  "#festivalseason",
                  "#dubstep",
                  "#electronicmusic"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 5.mov (0s - 10.0s). Top hook: \"SUB-BASS FREQUENCIES TESTED AT HIGH ALTITUDE\"."
      },
      {
            "id": "lilshey_zeds_d1_10",
            "addedTime": "Oct 04, 2026 • 09:00 AM",
            "batchTag": "Day 1 Drop (15 Videos)",
            "title": "Electric Vibes Rolling Through Miami ✨ @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/lilshey_zeds_3days/lilshey_zeds_d1_10.mp4?v=d1_drop",
            "description": "Zeds Dead live tour edit: ELECTRIC VIBES ROLLING THROUGH MIAMI. Silky atmosphere building into earth-shaking sub frequencies! ⚡✨\n\n@zedsdead\n\n#zedsdead #bassmusic #festivalseason #dubstep #electronicmusic",
            "hashtags": [
                  "#zedsdead",
                  "#bassmusic",
                  "#festivalseason",
                  "#dubstep",
                  "#electronicmusic"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 5.mov (10s - 20.0s). Top hook: \"ELECTRIC VIBES ROLLING THROUGH MIAMI\"."
      },
      {
            "id": "lilshey_zeds_d1_11",
            "addedTime": "Oct 04, 2026 • 09:00 AM",
            "batchTag": "Day 1 Drop (15 Videos)",
            "title": "The Pure Audience Adrenaline Rush ✨ @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/lilshey_zeds_3days/lilshey_zeds_d1_11.mp4?v=d1_drop",
            "description": "Zeds Dead live tour edit: THE PURE AUDIENCE ADRENALINE RUSH. Silky atmosphere building into earth-shaking sub frequencies! ⚡✨\n\n@zedsdead\n\n#zedsdead #bassmusic #festivalseason #dubstep #electronicmusic",
            "hashtags": [
                  "#zedsdead",
                  "#bassmusic",
                  "#festivalseason",
                  "#dubstep",
                  "#electronicmusic"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 5.mov (20s - 30.0s). Top hook: \"THE PURE AUDIENCE ADRENALINE RUSH\"."
      },
      {
            "id": "lilshey_zeds_d1_12",
            "addedTime": "Oct 04, 2026 • 09:00 AM",
            "batchTag": "Day 1 Drop (15 Videos)",
            "title": "Unreleased Summer Tour Edit Dropped Live ✨ @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/lilshey_zeds_3days/lilshey_zeds_d1_12.mp4?v=d1_drop",
            "description": "Zeds Dead live tour edit: UNRELEASED SUMMER TOUR EDIT DROPPED LIVE. Silky atmosphere building into earth-shaking sub frequencies! ⚡✨\n\n@zedsdead\n\n#zedsdead #bassmusic #festivalseason #dubstep #electronicmusic",
            "hashtags": [
                  "#zedsdead",
                  "#bassmusic",
                  "#festivalseason",
                  "#dubstep",
                  "#electronicmusic"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 5.mov (30s - 40.0s). Top hook: \"UNRELEASED SUMMER TOUR EDIT DROPPED LIVE\"."
      },
      {
            "id": "lilshey_zeds_d1_13",
            "addedTime": "Oct 04, 2026 • 09:00 AM",
            "batchTag": "Day 1 Drop (15 Videos)",
            "title": "Lasers Reflecting Off Red Rocks Monoliths ✨ @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/lilshey_zeds_3days/lilshey_zeds_d1_13.mp4?v=d1_drop",
            "description": "Zeds Dead live tour edit: LASERS REFLECTING OFF RED ROCKS MONOLITHS. Silky atmosphere building into earth-shaking sub frequencies! ⚡✨\n\n@zedsdead\n\n#zedsdead #bassmusic #festivalseason #dubstep #electronicmusic",
            "hashtags": [
                  "#zedsdead",
                  "#bassmusic",
                  "#festivalseason",
                  "#dubstep",
                  "#electronicmusic"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 5.mov (40s - 50.0s). Top hook: \"LASERS REFLECTING OFF RED ROCKS MONOLITHS\"."
      },
      {
            "id": "lilshey_zeds_d1_14",
            "addedTime": "Oct 04, 2026 • 09:00 AM",
            "batchTag": "Day 1 Drop (15 Videos)",
            "title": "Timeless Hip Hop Vocal Chops In The Air ✨ @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/lilshey_zeds_3days/lilshey_zeds_d1_14.mp4?v=d1_drop",
            "description": "Zeds Dead live tour edit: TIMELESS HIP HOP VOCAL CHOPS IN THE AIR. Silky atmosphere building into earth-shaking sub frequencies! ⚡✨\n\n@zedsdead\n\n#zedsdead #bassmusic #festivalseason #dubstep #electronicmusic",
            "hashtags": [
                  "#zedsdead",
                  "#bassmusic",
                  "#festivalseason",
                  "#dubstep",
                  "#electronicmusic"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 5.mov (50s - 60.0s). Top hook: \"TIMELESS HIP HOP VOCAL CHOPS IN THE AIR\"."
      },
      {
            "id": "lilshey_zeds_d1_15",
            "addedTime": "Oct 04, 2026 • 09:00 AM",
            "batchTag": "Day 1 Drop (15 Videos)",
            "title": "Earthquake Bass Vibrations Detected ✨ @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/lilshey_zeds_3days/lilshey_zeds_d1_15.mp4?v=d1_drop",
            "description": "Zeds Dead live tour edit: EARTHQUAKE BASS VIBRATIONS DETECTED. Silky atmosphere building into earth-shaking sub frequencies! ⚡✨\n\n@zedsdead\n\n#zedsdead #bassmusic #festivalseason #dubstep #electronicmusic",
            "hashtags": [
                  "#zedsdead",
                  "#bassmusic",
                  "#festivalseason",
                  "#dubstep",
                  "#electronicmusic"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 5.mov (60s - 70.0s). Top hook: \"EARTHQUAKE BASS VIBRATIONS DETECTED\"."
      },
      {
            "id": "lilshey_zeds_d2_01",
            "addedTime": "Oct 05, 2026 • 09:00 AM",
            "batchTag": "Day 2 Drop (15 Videos)",
            "title": "Retro Vocal Chopped Over Heavy Sub ✨ @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/lilshey_zeds_3days/lilshey_zeds_d2_01.mp4?v=d2_drop",
            "description": "Zeds Dead live tour edit: RETRO VOCAL CHOPPED OVER HEAVY SUB. Silky atmosphere building into earth-shaking sub frequencies! ⚡✨\n\n@zedsdead\n\n#zedsdead #bassmusic #festivalseason #dubstep #electronicmusic",
            "hashtags": [
                  "#zedsdead",
                  "#bassmusic",
                  "#festivalseason",
                  "#dubstep",
                  "#electronicmusic"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 10.mov (0s - 10.0s). Top hook: \"RETRO VOCAL CHOPPED OVER HEAVY SUB\"."
      },
      {
            "id": "lilshey_zeds_d2_02",
            "addedTime": "Oct 05, 2026 • 09:00 AM",
            "batchTag": "Day 2 Drop (15 Videos)",
            "title": "Red Rocks Night Sky Filled With Lasers ✨ @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/lilshey_zeds_3days/lilshey_zeds_d2_02.mp4?v=d2_drop",
            "description": "Zeds Dead live tour edit: RED ROCKS NIGHT SKY FILLED WITH LASERS. Silky atmosphere building into earth-shaking sub frequencies! ⚡✨\n\n@zedsdead\n\n#zedsdead #bassmusic #festivalseason #dubstep #electronicmusic",
            "hashtags": [
                  "#zedsdead",
                  "#bassmusic",
                  "#festivalseason",
                  "#dubstep",
                  "#electronicmusic"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 10.mov (10s - 20.0s). Top hook: \"RED ROCKS NIGHT SKY FILLED WITH LASERS\"."
      },
      {
            "id": "lilshey_zeds_d2_03",
            "addedTime": "Oct 05, 2026 • 09:00 AM",
            "batchTag": "Day 2 Drop (15 Videos)",
            "title": "The Buildup That Gives Instant Goosebumps ✨ @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/lilshey_zeds_3days/lilshey_zeds_d2_03.mp4?v=d2_drop",
            "description": "Zeds Dead live tour edit: THE BUILDUP THAT GIVES INSTANT GOOSEBUMPS. Silky atmosphere building into earth-shaking sub frequencies! ⚡✨\n\n@zedsdead\n\n#zedsdead #bassmusic #festivalseason #dubstep #electronicmusic",
            "hashtags": [
                  "#zedsdead",
                  "#bassmusic",
                  "#festivalseason",
                  "#dubstep",
                  "#electronicmusic"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 10.mov (20s - 30.0s). Top hook: \"THE BUILDUP THAT GIVES INSTANT GOOSEBUMPS\"."
      },
      {
            "id": "lilshey_zeds_d2_04",
            "addedTime": "Oct 05, 2026 • 09:00 AM",
            "batchTag": "Day 2 Drop (15 Videos)",
            "title": "When The Bassline Takes Over The Floor ✨ @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/lilshey_zeds_3days/lilshey_zeds_d2_04.mp4?v=d2_drop",
            "description": "Zeds Dead live tour edit: WHEN THE BASSLINE TAKES OVER THE FLOOR. Silky atmosphere building into earth-shaking sub frequencies! ⚡✨\n\n@zedsdead\n\n#zedsdead #bassmusic #festivalseason #dubstep #electronicmusic",
            "hashtags": [
                  "#zedsdead",
                  "#bassmusic",
                  "#festivalseason",
                  "#dubstep",
                  "#electronicmusic"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 10.mov (30s - 40.0s). Top hook: \"WHEN THE BASSLINE TAKES OVER THE FLOOR\"."
      },
      {
            "id": "lilshey_zeds_d2_05",
            "addedTime": "Oct 05, 2026 • 09:00 AM",
            "batchTag": "Day 2 Drop (15 Videos)",
            "title": "Unreleased Summer Tour Id Tested ✨ @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/lilshey_zeds_3days/lilshey_zeds_d2_05.mp4?v=d2_drop",
            "description": "Zeds Dead live tour edit: UNRELEASED SUMMER TOUR ID TESTED. Silky atmosphere building into earth-shaking sub frequencies! ⚡✨\n\n@zedsdead\n\n#zedsdead #bassmusic #festivalseason #dubstep #electronicmusic",
            "hashtags": [
                  "#zedsdead",
                  "#bassmusic",
                  "#festivalseason",
                  "#dubstep",
                  "#electronicmusic"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 10.mov (40s - 50.0s). Top hook: \"UNRELEASED SUMMER TOUR ID TESTED\"."
      },
      {
            "id": "lilshey_zeds_d2_06",
            "addedTime": "Oct 05, 2026 • 09:00 AM",
            "batchTag": "Day 2 Drop (15 Videos)",
            "title": "The Coolest Fpv Angle Of The Entire Tour ✨ @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/lilshey_zeds_3days/lilshey_zeds_d2_06.mp4?v=d2_drop",
            "description": "Zeds Dead live tour edit: THE COOLEST FPV ANGLE OF THE ENTIRE TOUR. Silky atmosphere building into earth-shaking sub frequencies! ⚡✨\n\n@zedsdead\n\n#zedsdead #bassmusic #festivalseason #dubstep #electronicmusic",
            "hashtags": [
                  "#zedsdead",
                  "#bassmusic",
                  "#festivalseason",
                  "#dubstep",
                  "#electronicmusic"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 10.mov (50s - 60.0s). Top hook: \"THE COOLEST FPV ANGLE OF THE ENTIRE TOUR\"."
      },
      {
            "id": "lilshey_zeds_d2_07",
            "addedTime": "Oct 05, 2026 • 09:00 AM",
            "batchTag": "Day 2 Drop (15 Videos)",
            "title": "Vintage Swing Sample Flipped Into Chaos ✨ @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/lilshey_zeds_3days/lilshey_zeds_d2_07.mp4?v=d2_drop",
            "description": "Zeds Dead live tour edit: VINTAGE SWING SAMPLE FLIPPED INTO CHAOS. Silky atmosphere building into earth-shaking sub frequencies! ⚡✨\n\n@zedsdead\n\n#zedsdead #bassmusic #festivalseason #dubstep #electronicmusic",
            "hashtags": [
                  "#zedsdead",
                  "#bassmusic",
                  "#festivalseason",
                  "#dubstep",
                  "#electronicmusic"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 10.mov (60s - 70.0s). Top hook: \"VINTAGE SWING SAMPLE FLIPPED INTO CHAOS\"."
      },
      {
            "id": "lilshey_zeds_d2_08",
            "addedTime": "Oct 05, 2026 • 09:00 AM",
            "batchTag": "Day 2 Drop (15 Videos)",
            "title": "The Chord Progression That Broke Tiktok ✨ @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/lilshey_zeds_3days/lilshey_zeds_d2_08.mp4?v=d2_drop",
            "description": "Zeds Dead live tour edit: THE CHORD PROGRESSION THAT BROKE TIKTOK. Silky atmosphere building into earth-shaking sub frequencies! ⚡✨\n\n@zedsdead\n\n#zedsdead #bassmusic #festivalseason #dubstep #electronicmusic",
            "hashtags": [
                  "#zedsdead",
                  "#bassmusic",
                  "#festivalseason",
                  "#dubstep",
                  "#electronicmusic"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 11.mov (0s - 10.0s). Top hook: \"THE CHORD PROGRESSION THAT BROKE TIKTOK\"."
      },
      {
            "id": "lilshey_zeds_d2_09",
            "addedTime": "Oct 05, 2026 • 09:00 AM",
            "batchTag": "Day 2 Drop (15 Videos)",
            "title": "Miami Music Week Sunrise Anthem ✨ @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/lilshey_zeds_3days/lilshey_zeds_d2_09.mp4?v=d2_drop",
            "description": "Zeds Dead live tour edit: MIAMI MUSIC WEEK SUNRISE ANTHEM. Silky atmosphere building into earth-shaking sub frequencies! ⚡✨\n\n@zedsdead\n\n#zedsdead #bassmusic #festivalseason #dubstep #electronicmusic",
            "hashtags": [
                  "#zedsdead",
                  "#bassmusic",
                  "#festivalseason",
                  "#dubstep",
                  "#electronicmusic"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 11.mov (10s - 20.0s). Top hook: \"MIAMI MUSIC WEEK SUNRISE ANTHEM\"."
      },
      {
            "id": "lilshey_zeds_d2_10",
            "addedTime": "Oct 05, 2026 • 09:00 AM",
            "batchTag": "Day 2 Drop (15 Videos)",
            "title": "The Exact Reaction When Bass Kicks In ✨ @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/lilshey_zeds_3days/lilshey_zeds_d2_10.mp4?v=d2_drop",
            "description": "Zeds Dead live tour edit: THE EXACT REACTION WHEN BASS KICKS IN. Silky atmosphere building into earth-shaking sub frequencies! ⚡✨\n\n@zedsdead\n\n#zedsdead #bassmusic #festivalseason #dubstep #electronicmusic",
            "hashtags": [
                  "#zedsdead",
                  "#bassmusic",
                  "#festivalseason",
                  "#dubstep",
                  "#electronicmusic"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 12.mov (0s - 10.0s). Top hook: \"THE EXACT REACTION WHEN BASS KICKS IN\"."
      },
      {
            "id": "lilshey_zeds_d2_11",
            "addedTime": "Oct 05, 2026 • 09:00 AM",
            "batchTag": "Day 2 Drop (15 Videos)",
            "title": "Chasing Laser Beams Through Open Sky ✨ @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/lilshey_zeds_3days/lilshey_zeds_d2_11.mp4?v=d2_drop",
            "description": "Zeds Dead live tour edit: CHASING LASER BEAMS THROUGH OPEN SKY. Silky atmosphere building into earth-shaking sub frequencies! ⚡✨\n\n@zedsdead\n\n#zedsdead #bassmusic #festivalseason #dubstep #electronicmusic",
            "hashtags": [
                  "#zedsdead",
                  "#bassmusic",
                  "#festivalseason",
                  "#dubstep",
                  "#electronicmusic"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 12.mov (10s - 20.0s). Top hook: \"CHASING LASER BEAMS THROUGH OPEN SKY\"."
      },
      {
            "id": "lilshey_zeds_d2_12",
            "addedTime": "Oct 05, 2026 • 09:00 AM",
            "batchTag": "Day 2 Drop (15 Videos)",
            "title": "Stage Pyro Erupting On The Second Drop ✨ @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/lilshey_zeds_3days/lilshey_zeds_d2_12.mp4?v=d2_drop",
            "description": "Zeds Dead live tour edit: STAGE PYRO ERUPTING ON THE SECOND DROP. Silky atmosphere building into earth-shaking sub frequencies! ⚡✨\n\n@zedsdead\n\n#zedsdead #bassmusic #festivalseason #dubstep #electronicmusic",
            "hashtags": [
                  "#zedsdead",
                  "#bassmusic",
                  "#festivalseason",
                  "#dubstep",
                  "#electronicmusic"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 12.mov (20s - 30.0s). Top hook: \"STAGE PYRO ERUPTING ON THE SECOND DROP\"."
      },
      {
            "id": "lilshey_zeds_d2_13",
            "addedTime": "Oct 05, 2026 • 09:00 AM",
            "batchTag": "Day 2 Drop (15 Videos)",
            "title": "Deep Dubplate Groove Spreading Through Crowd ✨ @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/lilshey_zeds_3days/lilshey_zeds_d2_13.mp4?v=d2_drop",
            "description": "Zeds Dead live tour edit: DEEP DUBPLATE GROOVE SPREADING THROUGH CROWD. Silky atmosphere building into earth-shaking sub frequencies! ⚡✨\n\n@zedsdead\n\n#zedsdead #bassmusic #festivalseason #dubstep #electronicmusic",
            "hashtags": [
                  "#zedsdead",
                  "#bassmusic",
                  "#festivalseason",
                  "#dubstep",
                  "#electronicmusic"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 13.mov (0s - 10.0s). Top hook: \"DEEP DUBPLATE GROOVE SPREADING THROUGH CROWD\"."
      },
      {
            "id": "lilshey_zeds_d2_14",
            "addedTime": "Oct 05, 2026 • 09:00 AM",
            "batchTag": "Day 2 Drop (15 Videos)",
            "title": "When 10000 Voices Sing In Harmony ✨ @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/lilshey_zeds_3days/lilshey_zeds_d2_14.mp4?v=d2_drop",
            "description": "Zeds Dead live tour edit: WHEN 10000 VOICES SING IN HARMONY. Silky atmosphere building into earth-shaking sub frequencies! ⚡✨\n\n@zedsdead\n\n#zedsdead #bassmusic #festivalseason #dubstep #electronicmusic",
            "hashtags": [
                  "#zedsdead",
                  "#bassmusic",
                  "#festivalseason",
                  "#dubstep",
                  "#electronicmusic"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 13.mov (10s - 20.0s). Top hook: \"WHEN 10000 VOICES SING IN HARMONY\"."
      },
      {
            "id": "lilshey_zeds_d2_15",
            "addedTime": "Oct 05, 2026 • 09:00 AM",
            "batchTag": "Day 2 Drop (15 Videos)",
            "title": "Surreal Aerial Drift Over Dj Platform ✨ @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/lilshey_zeds_3days/lilshey_zeds_d2_15.mp4?v=d2_drop",
            "description": "Zeds Dead live tour edit: SURREAL AERIAL DRIFT OVER DJ PLATFORM. Silky atmosphere building into earth-shaking sub frequencies! ⚡✨\n\n@zedsdead\n\n#zedsdead #bassmusic #festivalseason #dubstep #electronicmusic",
            "hashtags": [
                  "#zedsdead",
                  "#bassmusic",
                  "#festivalseason",
                  "#dubstep",
                  "#electronicmusic"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 13.mov (20s - 30.0s). Top hook: \"SURREAL AERIAL DRIFT OVER DJ PLATFORM\"."
      },
      {
            "id": "lilshey_zeds_d3_01",
            "addedTime": "Oct 06, 2026 • 09:00 AM",
            "batchTag": "Day 3 Drop (15 Videos)",
            "title": "Inverted Barrel Roll Over 10000 Heads ✨ @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/lilshey_zeds_3days/lilshey_zeds_d3_01.mp4?v=d3_drop",
            "description": "Zeds Dead live tour edit: INVERTED BARREL ROLL OVER 10000 HEADS. Silky atmosphere building into earth-shaking sub frequencies! ⚡✨\n\n@zedsdead\n\n#zedsdead #bassmusic #festivalseason #dubstep #electronicmusic",
            "hashtags": [
                  "#zedsdead",
                  "#bassmusic",
                  "#festivalseason",
                  "#dubstep",
                  "#electronicmusic"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 13.mov (30s - 40.0s). Top hook: \"INVERTED BARREL ROLL OVER 10000 HEADS\"."
      },
      {
            "id": "lilshey_zeds_d3_02",
            "addedTime": "Oct 06, 2026 • 09:00 AM",
            "batchTag": "Day 3 Drop (15 Videos)",
            "title": "Can Your Speakers Survive This Sub Drop ✨ @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/lilshey_zeds_3days/lilshey_zeds_d3_02.mp4?v=d3_drop",
            "description": "Zeds Dead live tour edit: CAN YOUR SPEAKERS SURVIVE THIS SUB DROP. Silky atmosphere building into earth-shaking sub frequencies! ⚡✨\n\n@zedsdead\n\n#zedsdead #bassmusic #festivalseason #dubstep #electronicmusic",
            "hashtags": [
                  "#zedsdead",
                  "#bassmusic",
                  "#festivalseason",
                  "#dubstep",
                  "#electronicmusic"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 13.mov (40s - 50.0s). Top hook: \"CAN YOUR SPEAKERS SURVIVE THIS SUB DROP\"."
      },
      {
            "id": "lilshey_zeds_d3_03",
            "addedTime": "Oct 06, 2026 • 09:00 AM",
            "batchTag": "Day 3 Drop (15 Videos)",
            "title": "Factory Town At 4-30 In The Morning ✨ @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/lilshey_zeds_3days/lilshey_zeds_d3_03.mp4?v=d3_drop",
            "description": "Zeds Dead live tour edit: FACTORY TOWN AT 4-30 IN THE MORNING. Silky atmosphere building into earth-shaking sub frequencies! ⚡✨\n\n@zedsdead\n\n#zedsdead #bassmusic #festivalseason #dubstep #electronicmusic",
            "hashtags": [
                  "#zedsdead",
                  "#bassmusic",
                  "#festivalseason",
                  "#dubstep",
                  "#electronicmusic"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 6.mov (0s - 10.0s). Top hook: \"FACTORY TOWN AT 4-30 IN THE MORNING\"."
      },
      {
            "id": "lilshey_zeds_d3_04",
            "addedTime": "Oct 06, 2026 • 09:00 AM",
            "batchTag": "Day 3 Drop (15 Videos)",
            "title": "Stage Production Timed To Perfection ✨ @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/lilshey_zeds_3days/lilshey_zeds_d3_04.mp4?v=d3_drop",
            "description": "Zeds Dead live tour edit: STAGE PRODUCTION TIMED TO PERFECTION. Silky atmosphere building into earth-shaking sub frequencies! ⚡✨\n\n@zedsdead\n\n#zedsdead #bassmusic #festivalseason #dubstep #electronicmusic",
            "hashtags": [
                  "#zedsdead",
                  "#bassmusic",
                  "#festivalseason",
                  "#dubstep",
                  "#electronicmusic"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 6.mov (10s - 20.0s). Top hook: \"STAGE PRODUCTION TIMED TO PERFECTION\"."
      },
      {
            "id": "lilshey_zeds_d3_05",
            "addedTime": "Oct 06, 2026 • 09:00 AM",
            "batchTag": "Day 3 Drop (15 Videos)",
            "title": "The Moment The Whole Crowd Jumped ✨ @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/lilshey_zeds_3days/lilshey_zeds_d3_05.mp4?v=d3_drop",
            "description": "Zeds Dead live tour edit: THE MOMENT THE WHOLE CROWD JUMPED. Silky atmosphere building into earth-shaking sub frequencies! ⚡✨\n\n@zedsdead\n\n#zedsdead #bassmusic #festivalseason #dubstep #electronicmusic",
            "hashtags": [
                  "#zedsdead",
                  "#bassmusic",
                  "#festivalseason",
                  "#dubstep",
                  "#electronicmusic"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 6.mov (20s - 30.0s). Top hook: \"THE MOMENT THE WHOLE CROWD JUMPED\"."
      },
      {
            "id": "lilshey_zeds_d3_06",
            "addedTime": "Oct 06, 2026 • 09:00 AM",
            "batchTag": "Day 3 Drop (15 Videos)",
            "title": "Crisp Analog Drums Cutting Through Night ✨ @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/lilshey_zeds_3days/lilshey_zeds_d3_06.mp4?v=d3_drop",
            "description": "Zeds Dead live tour edit: CRISP ANALOG DRUMS CUTTING THROUGH NIGHT. Silky atmosphere building into earth-shaking sub frequencies! ⚡✨\n\n@zedsdead\n\n#zedsdead #bassmusic #festivalseason #dubstep #electronicmusic",
            "hashtags": [
                  "#zedsdead",
                  "#bassmusic",
                  "#festivalseason",
                  "#dubstep",
                  "#electronicmusic"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 6.mov (30s - 40.0s). Top hook: \"CRISP ANALOG DRUMS CUTTING THROUGH NIGHT\"."
      },
      {
            "id": "lilshey_zeds_d3_07",
            "addedTime": "Oct 06, 2026 • 09:00 AM",
            "batchTag": "Day 3 Drop (15 Videos)",
            "title": "The Heaviest Sub Drop Of The Weekend ✨ @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/lilshey_zeds_3days/lilshey_zeds_d3_07.mp4?v=d3_drop",
            "description": "Zeds Dead live tour edit: THE HEAVIEST SUB DROP OF THE WEEKEND. Silky atmosphere building into earth-shaking sub frequencies! ⚡✨\n\n@zedsdead\n\n#zedsdead #bassmusic #festivalseason #dubstep #electronicmusic",
            "hashtags": [
                  "#zedsdead",
                  "#bassmusic",
                  "#festivalseason",
                  "#dubstep",
                  "#electronicmusic"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 6.mov (40s - 50.0s). Top hook: \"THE HEAVIEST SUB DROP OF THE WEEKEND\"."
      },
      {
            "id": "lilshey_zeds_d3_08",
            "addedTime": "Oct 06, 2026 • 09:00 AM",
            "batchTag": "Day 3 Drop (15 Videos)",
            "title": "Panoramic Mountain View Dipped In Lasers ✨ @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/lilshey_zeds_3days/lilshey_zeds_d3_08.mp4?v=d3_drop",
            "description": "Zeds Dead live tour edit: PANORAMIC MOUNTAIN VIEW DIPPED IN LASERS. Silky atmosphere building into earth-shaking sub frequencies! ⚡✨\n\n@zedsdead\n\n#zedsdead #bassmusic #festivalseason #dubstep #electronicmusic",
            "hashtags": [
                  "#zedsdead",
                  "#bassmusic",
                  "#festivalseason",
                  "#dubstep",
                  "#electronicmusic"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 6.mov (50s - 60.0s). Top hook: \"PANORAMIC MOUNTAIN VIEW DIPPED IN LASERS\"."
      },
      {
            "id": "lilshey_zeds_d3_09",
            "addedTime": "Oct 06, 2026 • 09:00 AM",
            "batchTag": "Day 3 Drop (15 Videos)",
            "title": "That Chill Down Your Spine When Vocals Hit ✨ @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/lilshey_zeds_3days/lilshey_zeds_d3_09.mp4?v=d3_drop",
            "description": "Zeds Dead live tour edit: THAT CHILL DOWN YOUR SPINE WHEN VOCALS HIT. Silky atmosphere building into earth-shaking sub frequencies! ⚡✨\n\n@zedsdead\n\n#zedsdead #bassmusic #festivalseason #dubstep #electronicmusic",
            "hashtags": [
                  "#zedsdead",
                  "#bassmusic",
                  "#festivalseason",
                  "#dubstep",
                  "#electronicmusic"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 6.mov (60s - 70.0s). Top hook: \"THAT CHILL DOWN YOUR SPINE WHEN VOCALS HIT\"."
      },
      {
            "id": "lilshey_zeds_d3_10",
            "addedTime": "Oct 06, 2026 • 09:00 AM",
            "batchTag": "Day 3 Drop (15 Videos)",
            "title": "Fpv Pilot Pushing Limits Over The Booth ✨ @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/lilshey_zeds_3days/lilshey_zeds_d3_10.mp4?v=d3_drop",
            "description": "Zeds Dead live tour edit: FPV PILOT PUSHING LIMITS OVER THE BOOTH. Silky atmosphere building into earth-shaking sub frequencies! ⚡✨\n\n@zedsdead\n\n#zedsdead #bassmusic #festivalseason #dubstep #electronicmusic",
            "hashtags": [
                  "#zedsdead",
                  "#bassmusic",
                  "#festivalseason",
                  "#dubstep",
                  "#electronicmusic"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 6.mov (70s - 80.0s). Top hook: \"FPV PILOT PUSHING LIMITS OVER THE BOOTH\"."
      },
      {
            "id": "lilshey_zeds_d3_11",
            "addedTime": "Oct 06, 2026 • 09:00 AM",
            "batchTag": "Day 3 Drop (15 Videos)",
            "title": "Classic Zeds Dead Energy Takes Over ✨ @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/lilshey_zeds_3days/lilshey_zeds_d3_11.mp4?v=d3_drop",
            "description": "Zeds Dead live tour edit: CLASSIC ZEDS DEAD ENERGY TAKES OVER. Silky atmosphere building into earth-shaking sub frequencies! ⚡✨\n\n@zedsdead\n\n#zedsdead #bassmusic #festivalseason #dubstep #electronicmusic",
            "hashtags": [
                  "#zedsdead",
                  "#bassmusic",
                  "#festivalseason",
                  "#dubstep",
                  "#electronicmusic"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 6.mov (80s - 90.0s). Top hook: \"CLASSIC ZEDS DEAD ENERGY TAKES OVER\"."
      },
      {
            "id": "lilshey_zeds_d3_12",
            "addedTime": "Oct 06, 2026 • 09:00 AM",
            "batchTag": "Day 3 Drop (15 Videos)",
            "title": "Midnight Crowd Reaction At Maximum Hype ✨ @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/lilshey_zeds_3days/lilshey_zeds_d3_12.mp4?v=d3_drop",
            "description": "Zeds Dead live tour edit: MIDNIGHT CROWD REACTION AT MAXIMUM HYPE. Silky atmosphere building into earth-shaking sub frequencies! ⚡✨\n\n@zedsdead\n\n#zedsdead #bassmusic #festivalseason #dubstep #electronicmusic",
            "hashtags": [
                  "#zedsdead",
                  "#bassmusic",
                  "#festivalseason",
                  "#dubstep",
                  "#electronicmusic"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 6.mov (90s - 100.0s). Top hook: \"MIDNIGHT CROWD REACTION AT MAXIMUM HYPE\"."
      },
      {
            "id": "lilshey_zeds_d3_13",
            "addedTime": "Oct 06, 2026 • 09:00 AM",
            "batchTag": "Day 3 Drop (15 Videos)",
            "title": "The Cleanest Bassline Transition Of 2026 ✨ @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/lilshey_zeds_3days/lilshey_zeds_d3_13.mp4?v=d3_drop",
            "description": "Zeds Dead live tour edit: THE CLEANEST BASSLINE TRANSITION OF 2026. Silky atmosphere building into earth-shaking sub frequencies! ⚡✨\n\n@zedsdead\n\n#zedsdead #bassmusic #festivalseason #dubstep #electronicmusic",
            "hashtags": [
                  "#zedsdead",
                  "#bassmusic",
                  "#festivalseason",
                  "#dubstep",
                  "#electronicmusic"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 6.mov (100s - 110.0s). Top hook: \"THE CLEANEST BASSLINE TRANSITION OF 2026\"."
      },
      {
            "id": "lilshey_zeds_d3_14",
            "addedTime": "Oct 06, 2026 • 09:00 AM",
            "batchTag": "Day 3 Drop (15 Videos)",
            "title": "High Voltage Strobes Melting The Stage ✨ @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/lilshey_zeds_3days/lilshey_zeds_d3_14.mp4?v=d3_drop",
            "description": "Zeds Dead live tour edit: HIGH VOLTAGE STROBES MELTING THE STAGE. Silky atmosphere building into earth-shaking sub frequencies! ⚡✨\n\n@zedsdead\n\n#zedsdead #bassmusic #festivalseason #dubstep #electronicmusic",
            "hashtags": [
                  "#zedsdead",
                  "#bassmusic",
                  "#festivalseason",
                  "#dubstep",
                  "#electronicmusic"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 6.mov (110s - 120.0s). Top hook: \"HIGH VOLTAGE STROBES MELTING THE STAGE\"."
      },
      {
            "id": "lilshey_zeds_d3_15",
            "addedTime": "Oct 06, 2026 • 09:00 AM",
            "batchTag": "Day 3 Drop (15 Videos)",
            "title": "Unforgettable Finale Under Colorado Stars ✨ @zedsdead #shorts",
            "duration": "0:10",
            "quality": "1080x1920 (9:16 Master HD)",
            "videoSrc": "/campaigns/lilshey_zeds_3days/lilshey_zeds_d3_15.mp4?v=d3_drop",
            "description": "Zeds Dead live tour edit: UNFORGETTABLE FINALE UNDER COLORADO STARS. Silky atmosphere building into earth-shaking sub frequencies! ⚡✨\n\n@zedsdead\n\n#zedsdead #bassmusic #festivalseason #dubstep #electronicmusic",
            "hashtags": [
                  "#zedsdead",
                  "#bassmusic",
                  "#festivalseason",
                  "#dubstep",
                  "#electronicmusic"
            ],
            "payoutRate": "$1,000 / 1M Views ($500 Max)",
            "loopNote": "10s high-retention cut from FPV RAW 6.mov (120s - 130.0s). Top hook: \"UNFORGETTABLE FINALE UNDER COLORADO STARS\"."
      }
]
  },
  {
    campaignId: "lilshey_camp_2",
    campaignName: "Campaign Drop Beta (Lilshey Slot 2)",
    category: "Cinema & Viral Trends",
    status: "Standby For Drop",
    payout: "$850 - $1,200 / 1M Views",
    batches: [
      "All Drops"
    ],
    clips: []
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
    return localStorage.getItem("habeeb_campaign_choice") || "all";
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

    const selectHabeebCampaign = (choice: "bubsy" | "zedsdead" | "moonpay" | "duel" | "all") => {
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
          className="w-full max-w-3xl bg-[#10141e] border border-[#1b2234] rounded-3xl p-8 sm:p-10 shadow-2xl relative overflow-hidden"
        >
          <div className="text-center mb-8">
            <span className="text-xs font-mono text-blue-400 uppercase tracking-widest font-bold block mb-2">
              HABEEB OPERATIONS VAULT
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Select Your Clipping Focus
            </h1>
            <p className="text-xs sm:text-sm text-neutral-400 mt-2 max-w-lg mx-auto">
              Choose your active workspace to keep your dashboard clean. Switch between campaigns anytime from the top navigation bar.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => selectHabeebCampaign("moonpay")}
              className="group p-5 bg-[#0a0d14] hover:bg-[#141926] border border-[#1b2234] hover:border-emerald-500/50 rounded-2xl text-left transition-all duration-300 relative overflow-hidden active:scale-[0.98] shadow-lg cursor-pointer"
            >
              <div className="text-3xl mb-3">🏂</div>
              <h3 className="text-base font-bold text-white group-hover:text-emerald-300 transition-colors flex items-center justify-between">
                MoonPay XGL
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-full font-mono">$2.50 CPM</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                X Games League Winter Draft 2026. 20 drops ready with official draft pick reveal + athlete stunts.
              </p>
              <div className="mt-4 pt-3 border-t border-[#1b2234] text-[11px] text-emerald-400 font-semibold flex items-center gap-1">
                Enter MoonPay →
              </div>
            </button>

            <button
              onClick={() => selectHabeebCampaign("duel")}
              className="group p-5 bg-[#0a0d14] hover:bg-[#141926] border border-[#1b2234] hover:border-rose-500/50 rounded-2xl text-left transition-all duration-300 relative overflow-hidden active:scale-[0.98] shadow-lg cursor-pointer"
            >
              <div className="text-3xl mb-3">⚔️</div>
              <h3 className="text-base font-bold text-white group-hover:text-rose-300 transition-colors flex items-center justify-between">
                Duel [Shorts]
                <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full font-mono">$10.00 CPM</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                Duel PvP 1v1 bets, viral streamer reactions & arena clips. YouTube Shorts ONLY with top hooks.
              </p>
              <div className="mt-4 pt-3 border-t border-[#1b2234] text-[11px] text-rose-400 font-semibold flex items-center gap-1">
                Enter Duel →
              </div>
            </button>

            <button
              onClick={() => selectHabeebCampaign("zedsdead")}
              className="group p-5 bg-[#0a0d14] hover:bg-[#141926] border border-[#1b2234] hover:border-purple-500/50 rounded-2xl text-left transition-all duration-300 relative overflow-hidden active:scale-[0.98] shadow-lg cursor-pointer"
            >
              <div className="text-3xl mb-3">🔊</div>
              <h3 className="text-base font-bold text-white group-hover:text-purple-300 transition-colors flex items-center justify-between">
                Zeds Dead
                <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded-full font-mono">20 Drops</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                Miami Factory Town live audio drops, heavy sub frequencies, and tour FPV runs.
              </p>
              <div className="mt-4 pt-3 border-t border-[#1b2234] text-[11px] text-purple-400 font-semibold flex items-center gap-1">
                Enter Music →
              </div>
            </button>

            <button
              onClick={() => selectHabeebCampaign("bubsy")}
              className="group p-5 bg-[#0a0d14] hover:bg-[#141926] border border-[#1b2234] hover:border-amber-500/50 rounded-2xl text-left transition-all duration-300 relative overflow-hidden active:scale-[0.98] shadow-lg cursor-pointer"
            >
              <div className="text-3xl mb-3">🐱</div>
              <h3 className="text-base font-bold text-white group-hover:text-amber-300 transition-colors flex items-center justify-between">
                Bubsy 4D
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full font-mono">15 Shorts</span>
              </h3>
              <p className="text-xs text-neutral-400 mt-2 leading-relaxed">
                Mascot platformer revival, comedic speedrunning, and lore clips.
              </p>
              <div className="mt-4 pt-3 border-t border-[#1b2234] text-[11px] text-amber-400 font-semibold flex items-center gap-1">
                Enter Bubsy →
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
    ? (habeebCampaignChoice === "zedsdead" 
        ? [HABEEB_CAMPAIGNS[1]] 
        : habeebCampaignChoice === "moonpay" 
        ? [HABEEB_CAMPAIGNS[2]]
        : habeebCampaignChoice === "duel"
        ? [HABEEB_CAMPAIGNS[3]]
        : habeebCampaignChoice === "bubsy"
        ? [HABEEB_CAMPAIGNS[0]]
        : HABEEB_CAMPAIGNS)
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
            <div className="hidden md:flex items-center gap-1 bg-[#10141e]/90 backdrop-blur-md border border-[#1b2234] p-1 rounded-xl shadow-lg">
              <button
                onClick={() => selectHabeebCampaign("all")}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                  habeebCampaignChoice === "all" || !habeebCampaignChoice
                    ? "bg-blue-500/20 text-blue-300 border border-blue-500/40 shadow-sm"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <span>✨</span> All Channels (75)
              </button>
              <button
                onClick={() => selectHabeebCampaign("moonpay")}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                  habeebCampaignChoice === "moonpay"
                    ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 shadow-sm"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <span>🏂</span> MoonPay ($2.50)
              </button>
              <button
                onClick={() => selectHabeebCampaign("duel")}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                  habeebCampaignChoice === "duel"
                    ? "bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <span>⚔️</span> Duel ($10)
              </button>
              <button
                onClick={() => selectHabeebCampaign("zedsdead")}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                  habeebCampaignChoice === "zedsdead"
                    ? "bg-purple-500/20 text-purple-300 border border-purple-500/40 shadow-sm"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <span>🔊</span> Zeds Dead (20)
              </button>
              <button
                onClick={() => selectHabeebCampaign("bubsy")}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 cursor-pointer ${
                  habeebCampaignChoice === "bubsy"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-sm"
                    : "text-neutral-400 hover:text-white"
                }`}
              >
                <span>🐱</span> Bubsy (15)
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

        {/* Interactive Campaign Switcher Deck for Habeeb */}
        {currentUser === "habeeb" && (
          <section className="bg-[#10141e]/90 backdrop-blur-xl border border-[#1b2234] rounded-2xl p-5 sm:p-6 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse"></span>
                  <span className="text-[10px] font-mono uppercase tracking-wider text-blue-400 font-bold">
                    CAMPAIGN WORKSPACE CHANNELS (HABEEB EXCLUSIVE)
                  </span>
                </div>
                <h2 className="text-lg sm:text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
                  Select Videos Channel To Clip
                  <span className="text-xs font-normal text-neutral-400 hidden sm:inline">
                    (Pick & switch freely anytime • 75 total drops ready)
                  </span>
                </h2>
              </div>

              <div className="flex items-center gap-1.5 bg-[#0a0d14] border border-[#1b2234] p-1 rounded-xl">
                <button
                  onClick={() => selectHabeebCampaign("all")}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    habeebCampaignChoice === "all" || !habeebCampaignChoice
                      ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  ✨ View All (75)
                </button>
              </div>
            </div>

            {/* BentoGrid Cards for Campaign Switcher */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5">
              {/* 1. MoonPay XGL */}
              <button
                onClick={() => selectHabeebCampaign("moonpay")}
                className={`group p-4 rounded-xl text-left transition-all duration-300 relative overflow-hidden cursor-pointer border ${
                  habeebCampaignChoice === "moonpay"
                    ? "bg-gradient-to-b from-emerald-950/40 via-[#0e171b] to-[#0a0d14] border-emerald-500 shadow-lg shadow-emerald-500/10 ring-1 ring-emerald-500/50"
                    : "bg-[#0d111a] hover:bg-[#121824] border-[#1e2638] hover:border-emerald-500/40"
                }`}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-2xl">🏂</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    $2.50 CPM • $500 Max
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-emerald-300 transition-colors flex items-center justify-between">
                  MoonPay XGL 2026
                  {habeebCampaignChoice === "moonpay" && (
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  )}
                </h3>
                <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                  Winter Draft 2-Part Formula: Broadcast pick + stunt highlights. 40%+ US/UK/CA/AU.
                </p>
                <div className="mt-3 pt-2.5 border-t border-[#1b2234] flex items-center justify-between text-[11px]">
                  <span className="text-neutral-400">20 Master Drops</span>
                  <span className="font-semibold text-emerald-400">
                    {habeebCampaignChoice === "moonpay" ? "Active View ✓" : "Switch Here →"}
                  </span>
                </div>
              </button>

              {/* 2. Duel [YT Shorts] */}
              <button
                onClick={() => selectHabeebCampaign("duel")}
                className={`group p-4 rounded-xl text-left transition-all duration-300 relative overflow-hidden cursor-pointer border ${
                  habeebCampaignChoice === "duel"
                    ? "bg-gradient-to-b from-rose-950/40 via-[#180e12] to-[#0a0d14] border-rose-500 shadow-lg shadow-rose-500/10 ring-1 ring-rose-500/50"
                    : "bg-[#0d111a] hover:bg-[#121824] border-[#1e2638] hover:border-rose-500/40"
                }`}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-2xl">⚔️</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    $10.00 CPM
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-rose-300 transition-colors flex items-center justify-between">
                  Duel [YT Shorts]
                  {habeebCampaignChoice === "duel" && (
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-ping"></span>
                  )}
                </h3>
                <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                  YouTube Shorts ONLY. Top on-screen hooks, 1% min engagement, min 1,750 views.
                </p>
                <div className="mt-3 pt-2.5 border-t border-[#1b2234] flex items-center justify-between text-[11px]">
                  <span className="text-neutral-400">20 Viral Drops</span>
                  <span className="font-semibold text-rose-400">
                    {habeebCampaignChoice === "duel" ? "Active View ✓" : "Switch Here →"}
                  </span>
                </div>
              </button>

              {/* 3. Zeds Dead Music */}
              <button
                onClick={() => selectHabeebCampaign("zedsdead")}
                className={`group p-4 rounded-xl text-left transition-all duration-300 relative overflow-hidden cursor-pointer border ${
                  habeebCampaignChoice === "zedsdead"
                    ? "bg-gradient-to-b from-purple-950/40 via-[#140e1b] to-[#0a0d14] border-purple-500 shadow-lg shadow-purple-500/10 ring-1 ring-purple-500/50"
                    : "bg-[#0d111a] hover:bg-[#121824] border-[#1e2638] hover:border-purple-500/40"
                }`}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-2xl">🔊</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    $3.50 CPM (Clipr)
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors flex items-center justify-between">
                  Zeds Dead Music
                  {habeebCampaignChoice === "zedsdead" && (
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-400 animate-ping"></span>
                  )}
                </h3>
                <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                  Miami Factory Town live audio drops, 140 BPM wobbles, laser-synced FPV runs.
                </p>
                <div className="mt-3 pt-2.5 border-t border-[#1b2234] flex items-center justify-between text-[11px]">
                  <span className="text-neutral-400">20 Unique Drops</span>
                  <span className="font-semibold text-purple-400">
                    {habeebCampaignChoice === "zedsdead" ? "Active View ✓" : "Switch Here →"}
                  </span>
                </div>
              </button>

              {/* 4. Bubsy 4D */}
              <button
                onClick={() => selectHabeebCampaign("bubsy")}
                className={`group p-4 rounded-xl text-left transition-all duration-300 relative overflow-hidden cursor-pointer border ${
                  habeebCampaignChoice === "bubsy"
                    ? "bg-gradient-to-b from-amber-950/40 via-[#1a140d] to-[#0a0d14] border-amber-500 shadow-lg shadow-amber-500/10 ring-1 ring-amber-500/50"
                    : "bg-[#0d111a] hover:bg-[#121824] border-[#1e2638] hover:border-amber-500/40"
                }`}
              >
                <div className="flex items-center justify-between mb-2.5">
                  <span className="text-2xl">🐱</span>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    $3.00 CPM
                  </span>
                </div>
                <h3 className="text-sm font-bold text-white group-hover:text-amber-300 transition-colors flex items-center justify-between">
                  Bubsy 4D
                  {habeebCampaignChoice === "bubsy" && (
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping"></span>
                  )}
                </h3>
                <p className="text-[11px] text-neutral-400 mt-1 leading-relaxed">
                  Retro mascot platformer revival, comedic speedrunning, and lore gameplay clips.
                </p>
                <div className="mt-3 pt-2.5 border-t border-[#1b2234] flex items-center justify-between text-[11px]">
                  <span className="text-neutral-400">15 Classic Drops</span>
                  <span className="font-semibold text-amber-400">
                    {habeebCampaignChoice === "bubsy" ? "Active View ✓" : "Switch Here →"}
                  </span>
                </div>
              </button>
            </div>
          </section>
        )}

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
