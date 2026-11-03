import React, { useState, useEffect } from 'react';
import { GameCanvas } from './game/GameCanvas';
import { ShopModal } from './game/ShopModal';
import { HowToPlayModal } from './game/HowToPlayModal';
import { RecordsModal } from './game/RecordsModal';
import { Difficulty, CharacterSkin, PlayerStats, SKINS } from './game/types';
import { sound } from './game/sound';
import {
  Trophy,
  ShoppingBag,
  HelpCircle,
  Music,
  Flame,
  Zap,
  Shield,
  Coins,
  ChevronRight,
} from 'lucide-react';

const STORAGE_KEY = 'neon_runner_save_v1';

const defaultStats: PlayerStats = {
  totalCoins: 20, // initial gift coins
  highScores: {
    easy: 0,
    normal: 0,
    hard: 0,
  },
  unlockedSkins: ['striker'],
  activeSkin: 'striker',
  upgrades: {
    magnetDuration: 1,
    shieldDuration: 1,
    coinValue: 1,
  },
};

export default function App() {
  const [stats, setStats] = useState<PlayerStats>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return {
          ...defaultStats,
          ...parsed,
          highScores: { ...defaultStats.highScores, ...(parsed.highScores || {}) },
          upgrades: { ...defaultStats.upgrades, ...(parsed.upgrades || {}) },
        };
      }
    } catch {
      // fallback
    }
    return defaultStats;
  });

  const [totalDistance, setTotalDistance] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('neon_runner_total_dist') || 0);
    } catch {
      return 0;
    }
  });

  const [totalRuns, setTotalRuns] = useState<number>(() => {
    try {
      return Number(localStorage.getItem('neon_runner_total_runs') || 0);
    } catch {
      return 0;
    }
  });

  const [difficulty, setDifficulty] = useState<Difficulty>('normal');
  const [isShopOpen, setIsShopOpen] = useState(false);
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  const [isRecordsOpen, setIsRecordsOpen] = useState(false);
  const [isMusicActive, setIsMusicActive] = useState(false);

  // Save stats to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(stats));
    } catch {
      // ignore
    }
  }, [stats]);

  // Handle run completion
  const handleSaveRun = (score: number, earnedCoins: number, distance: number) => {
    setStats((prev) => {
      const currentHigh = prev.highScores[difficulty] || 0;
      const newHigh = Math.max(currentHigh, score);

      return {
        ...prev,
        totalCoins: prev.totalCoins + earnedCoins,
        highScores: {
          ...prev.highScores,
          [difficulty]: newHigh,
        },
      };
    });

    setTotalDistance((prev) => {
      const next = prev + distance;
      try {
        localStorage.setItem('neon_runner_total_dist', String(next));
      } catch {
        // ignore
      }
      return next;
    });

    setTotalRuns((prev) => {
      const next = prev + 1;
      try {
        localStorage.setItem('neon_runner_total_runs', String(next));
      } catch {
        // ignore
      }
      return next;
    });
  };

  // Skin equip
  const handleSelectSkin = (skinId: CharacterSkin['id']) => {
    setStats((prev) => ({
      ...prev,
      activeSkin: skinId,
    }));
  };

  // Skin purchase
  const handleBuySkin = (skin: CharacterSkin) => {
    if (stats.totalCoins < skin.cost) return;

    setStats((prev) => ({
      ...prev,
      totalCoins: prev.totalCoins - skin.cost,
      unlockedSkins: [...prev.unlockedSkins, skin.id],
      activeSkin: skin.id,
    }));
  };

  // Permanent Upgrade
  const handleUpgrade = (
    type: 'magnetDuration' | 'shieldDuration' | 'coinValue',
    cost: number
  ) => {
    if (stats.totalCoins < cost) return;

    setStats((prev) => ({
      ...prev,
      totalCoins: prev.totalCoins - cost,
      upgrades: {
        ...prev.upgrades,
        [type]: Math.min(5, prev.upgrades[type] + 1),
      },
    }));
    sound.playPowerup();
  };

  // Background Synth Beat Toggle
  const toggleMusic = () => {
    if (isMusicActive) {
      sound.stopMusic();
      setIsMusicActive(false);
    } else {
      sound.startMusic();
      setIsMusicActive(true);
    }
  };

  const currentSkinData =
    SKINS.find((s) => s.id === stats.activeSkin) || SKINS[0];

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 flex flex-col selection:bg-cyan-500/30 selection:text-cyan-200">
      {/* 
        TOP BAR CONTRACT:
        Zone 1: Brand title, one line
        Zone 2: 4-5 concise single-line nav links
        Zone 3: 1 primary action button
      */}
      <header className="w-full border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Title */}
          <a
            href="/"
            className="text-lg font-extrabold tracking-tight text-white whitespace-nowrap shrink-0 flex items-center gap-2 hover:opacity-90 transition-opacity"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-cyan-600 to-cyan-400 flex items-center justify-center text-slate-950 font-black text-sm shadow-md shadow-cyan-500/20">
              ⚡
            </div>
            <span>네온 러너</span>
          </a>

          {/* Zone 2: 4 Clean Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-400">
            <button
              onClick={() => {
                sound.playClick();
                setIsHowToPlayOpen(true);
              }}
              className="hover:text-cyan-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <HelpCircle className="w-4 h-4" />
              <span>플레이 방법</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setIsShopOpen(true);
              }}
              className="hover:text-amber-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>러너 상점</span>
            </button>

            <button
              onClick={() => {
                sound.playClick();
                setIsRecordsOpen(true);
              }}
              className="hover:text-purple-400 transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer"
            >
              <Trophy className="w-4 h-4" />
              <span>명예의 전당</span>
            </button>

            <button
              onClick={toggleMusic}
              className={`hover:text-white transition-colors whitespace-nowrap shrink-0 flex items-center gap-1.5 cursor-pointer ${
                isMusicActive ? 'text-cyan-400' : 'text-slate-500'
              }`}
            >
              <Music className="w-4 h-4" />
              <span>{isMusicActive ? 'BGM 켜짐' : 'BGM 끄기'}</span>
            </button>
          </nav>

          {/* Zone 3: 1 Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-amber-400 text-xs font-mono font-bold">
              <span>🪙</span>
              <span>{stats.totalCoins}</span>
            </div>

            <button
              onClick={() => {
                sound.playClick();
                setIsShopOpen(true);
              }}
              className="px-4 py-2 text-xs font-bold text-slate-950 bg-cyan-400 hover:bg-cyan-300 rounded-lg shadow-sm shadow-cyan-500/30 transition-all cursor-pointer whitespace-nowrap shrink-0"
            >
              상점 & 강화
            </button>
          </div>
        </div>
      </header>

      {/* MAIN GAME CONTAINER */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 flex flex-col items-center">
        {/* Sub-toolbar: Difficulty & Active Character info */}
        <div className="w-full max-w-5xl mb-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          {/* Difficulty Segmented Control */}
          <div className="flex items-center gap-1 p-1 bg-slate-900/90 border border-slate-800 rounded-xl">
            {(
              [
                { id: 'easy', label: '쉬움 (Easy)', icon: Zap },
                { id: 'normal', label: '보통 (Normal)', icon: Zap },
                { id: 'hard', label: '매운맛 (Hard)', icon: Flame },
              ] as const
            ).map((item) => {
              const active = difficulty === item.id;
              const Icon = item.icon;
              return (
                <button
                  key={item.id}
                  onClick={() => {
                    sound.playClick();
                    setDifficulty(item.id);
                  }}
                  className={`px-3 py-1.5 font-semibold rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer whitespace-nowrap ${
                    active
                      ? item.id === 'hard'
                        ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 shadow-sm'
                        : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </div>

          {/* Active Skin Badge & Best Score */}
          <div className="flex items-center gap-4 text-slate-400">
            <div className="flex items-center gap-2">
              <span>장착 러너:</span>
              <button
                onClick={() => setIsShopOpen(true)}
                className="font-bold text-white hover:text-cyan-400 flex items-center gap-1.5 px-2.5 py-1 bg-slate-900 border border-slate-800 rounded-lg cursor-pointer transition-colors"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: currentSkinData.color }}
                />
                <span>{currentSkinData.name}</span>
                <ChevronRight className="w-3.5 h-3.5 text-slate-500" />
              </button>
            </div>

            <div className="flex items-center gap-1.5">
              <span>최고 기록:</span>
              <span className="font-mono font-bold text-cyan-400 tabular-nums">
                {(stats.highScores[difficulty] || 0).toLocaleString()}점
              </span>
            </div>
          </div>
        </div>

        {/* The Game Canvas & Interactive Canvas Area */}
        <GameCanvas
          difficulty={difficulty}
          activeSkin={currentSkinData}
          stats={stats}
          onSaveRun={handleSaveRun}
          onOpenShop={() => setIsShopOpen(true)}
        />

        {/* Quick Features & Gameplay Hint Strip */}
        <section className="w-full max-w-5xl mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl">
            <div className="flex items-center gap-2.5 mb-1.5 text-cyan-400 font-bold text-sm">
              <Zap className="w-4 h-4" />
              <span>점프 vs 슬라이딩 판정</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              지상 가시 장애물은 점프로 피하고, 공중에 뜬 분홍색 레이저 게이트는
              슬라이딩(S 키)으로 통과하세요. 점프하면 머리가 닿아 충돌합니다!
            </p>
          </div>

          <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl">
            <div className="flex items-center gap-2.5 mb-1.5 text-amber-400 font-bold text-sm">
              <Coins className="w-4 h-4" />
              <span>코인 획득 & 영구 강화</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              주행 중 모은 코인은 상점에서 자석 흡입 시간, 보호막 무적 시간,
              코인 가치 증폭 등 영구적인 능력치 강화에 사용할 수 있습니다.
            </p>
          </div>

          <div className="p-4 bg-slate-900/60 border border-slate-800/80 rounded-xl">
            <div className="flex items-center gap-2.5 mb-1.5 text-purple-400 font-bold text-sm">
              <Shield className="w-4 h-4" />
              <span>다양한 특수 캐릭터</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              기본 러너 외에도 공중 3단 점프가 가능한 퀀텀 캣, 매 판 보호막을
              지급받는 골든 메카, 코인 보너스 닌자 등 개성 넘치는 캐릭터를 즐겨보세요.
            </p>
          </div>
        </section>
      </main>

      {/* FOOTER */}
      <footer className="w-full border-t border-slate-800/80 py-4 mt-8 text-center text-xs text-slate-500">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div>
            <span>네온 러너 (Neon Runner)</span>
            <span className="mx-2">·</span>
            <span>방향키 또는 터치로 질주하는 2D 러닝 게임</span>
          </div>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setIsHowToPlayOpen(true)}
              className="hover:text-slate-300 transition-colors"
            >
              조작법
            </button>
            <button
              onClick={() => setIsRecordsOpen(true)}
              className="hover:text-slate-300 transition-colors"
            >
              기록실
            </button>
            <button
              onClick={() => setIsShopOpen(true)}
              className="hover:text-slate-300 transition-colors"
            >
              상점
            </button>
          </div>
        </div>
      </footer>

      {/* Modals */}
      <ShopModal
        isOpen={isShopOpen}
        onClose={() => setIsShopOpen(false)}
        stats={stats}
        onSelectSkin={handleSelectSkin}
        onBuySkin={handleBuySkin}
        onUpgrade={handleUpgrade}
      />

      <HowToPlayModal
        isOpen={isHowToPlayOpen}
        onClose={() => setIsHowToPlayOpen(false)}
      />

      <RecordsModal
        isOpen={isRecordsOpen}
        onClose={() => setIsRecordsOpen(false)}
        stats={stats}
        totalDistance={totalDistance}
        totalRuns={totalRuns}
      />
    </div>
  );
}
