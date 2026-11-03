import React from 'react';
import { CharacterSkin, PlayerStats, SKINS } from './types';
import { sound } from './sound';
import { X, Check, Lock, Sparkles, Magnet, Shield, Coins } from 'lucide-react';

interface ShopModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: PlayerStats;
  onSelectSkin: (skinId: CharacterSkin['id']) => void;
  onBuySkin: (skin: CharacterSkin) => void;
  onUpgrade: (type: 'magnetDuration' | 'shieldDuration' | 'coinValue', cost: number) => void;
}

export const ShopModal: React.FC<ShopModalProps> = ({
  isOpen,
  onClose,
  stats,
  onSelectSkin,
  onBuySkin,
  onUpgrade,
}) => {
  if (!isOpen) return null;

  const upgradeCosts = {
    magnetDuration: [30, 60, 100, 160],
    shieldDuration: [40, 80, 130, 200],
    coinValue: [50, 90, 150, 240],
  };

  const getUpgradeCost = (type: 'magnetDuration' | 'shieldDuration' | 'coinValue') => {
    const currentLevel = stats.upgrades[type];
    if (currentLevel >= 5) return null; // MAX
    return upgradeCosts[type][currentLevel - 1];
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-slate-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <span>🛒</span>
              <span>상점 및 러너 강화</span>
            </h2>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-amber-400 font-mono font-bold text-xs">
              <span>🪙</span>
              <span>{stats.totalCoins} 코인</span>
            </div>
          </div>
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Section 1: Character Skins */}
        <div className="mt-6">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            러너 캐릭터 선택 및 해금
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SKINS.map((skin) => {
              const isUnlocked = stats.unlockedSkins.includes(skin.id);
              const isEquipped = stats.activeSkin === skin.id;
              const canAfford = stats.totalCoins >= skin.cost;

              return (
                <div
                  key={skin.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    isEquipped
                      ? 'bg-slate-800/80 border-cyan-500/60 shadow-md shadow-cyan-950/30'
                      : 'bg-slate-850/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="w-8 h-8 rounded-lg flex items-center justify-center font-bold text-slate-950 text-xs shadow-inner"
                        style={{ backgroundColor: skin.color }}
                      >
                        ⚡
                      </div>
                      <div>
                        <div className="font-bold text-sm text-white">{skin.name}</div>
                        <div className="text-[11px] text-cyan-400 font-medium">{skin.perk}</div>
                      </div>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 mb-3">{skin.desc}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                    {isEquipped ? (
                      <span className="text-xs font-bold text-cyan-400 flex items-center gap-1">
                        <Check className="w-4 h-4" /> 장착 중
                      </span>
                    ) : isUnlocked ? (
                      <button
                        onClick={() => {
                          sound.playClick();
                          onSelectSkin(skin.id);
                        }}
                        className="px-3 py-1.5 bg-slate-800 hover:bg-cyan-500 hover:text-slate-950 text-xs font-semibold text-white rounded-lg transition-colors cursor-pointer"
                      >
                        선택하기
                      </button>
                    ) : (
                      <button
                        onClick={() => {
                          if (canAfford) {
                            sound.playPowerup();
                            onBuySkin(skin);
                          }
                        }}
                        disabled={!canAfford}
                        className={`px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                          canAfford
                            ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <Lock className="w-3.5 h-3.5" />
                        <span>🪙 {skin.cost} 코인</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Permanent Upgrades */}
        <div className="mt-6 mb-2">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            영구 파워업 강화
          </h3>
          <div className="space-y-3">
            {/* Magnet Upgrade */}
            {(() => {
              const cost = getUpgradeCost('magnetDuration');
              const level = stats.upgrades.magnetDuration;
              const canAfford = cost !== null && stats.totalCoins >= cost;

              return (
                <div className="flex items-center justify-between p-3.5 bg-slate-850/50 border border-slate-800 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-950/40 border border-purple-800/40 flex items-center justify-center text-purple-400">
                      <Magnet className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-white flex items-center gap-2">
                        <span>자석 지속 시간</span>
                        <span className="text-xs font-mono text-purple-400">Lv.{level}/5</span>
                      </div>
                      <div className="text-xs text-slate-400">
                        자석 아이템의 흡입 지속 시간을 +2초씩 연장합니다.
                      </div>
                    </div>
                  </div>

                  <div>
                    {cost === null ? (
                      <span className="text-xs font-bold text-emerald-400">최대 레벨</span>
                    ) : (
                      <button
                        onClick={() => onUpgrade('magnetDuration', cost)}
                        disabled={!canAfford}
                        className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                          canAfford
                            ? 'bg-purple-600 hover:bg-purple-500 text-white cursor-pointer font-bold'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>강화 (🪙 {cost})</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Shield Tech Upgrade */}
            {(() => {
              const cost = getUpgradeCost('shieldDuration');
              const level = stats.upgrades.shieldDuration;
              const canAfford = cost !== null && stats.totalCoins >= cost;

              return (
                <div className="flex items-center justify-between p-3.5 bg-slate-850/50 border border-slate-800 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-sky-950/40 border border-sky-800/40 flex items-center justify-center text-sky-400">
                      <Shield className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-white flex items-center gap-2">
                        <span>보호막 무적 시간</span>
                        <span className="text-xs font-mono text-sky-400">Lv.{level}/5</span>
                      </div>
                      <div className="text-xs text-slate-400">
                        보호막 파괴 후 주어지는 무적 회피 시간을 증가시킵니다.
                      </div>
                    </div>
                  </div>

                  <div>
                    {cost === null ? (
                      <span className="text-xs font-bold text-emerald-400">최대 레벨</span>
                    ) : (
                      <button
                        onClick={() => onUpgrade('shieldDuration', cost)}
                        disabled={!canAfford}
                        className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                          canAfford
                            ? 'bg-sky-600 hover:bg-sky-500 text-white cursor-pointer font-bold'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>강화 (🪙 {cost})</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Coin Value Booster */}
            {(() => {
              const cost = getUpgradeCost('coinValue');
              const level = stats.upgrades.coinValue;
              const canAfford = cost !== null && stats.totalCoins >= cost;

              return (
                <div className="flex items-center justify-between p-3.5 bg-slate-850/50 border border-slate-800 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-950/40 border border-amber-800/40 flex items-center justify-center text-amber-400">
                      <Coins className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="font-bold text-sm text-white flex items-center gap-2">
                        <span>코인 가치 증폭</span>
                        <span className="text-xs font-mono text-amber-400">Lv.{level}/5</span>
                      </div>
                      <div className="text-xs text-slate-400">
                        획득하는 코인 가치를 영구적으로 +15% 증가시킵니다.
                      </div>
                    </div>
                  </div>

                  <div>
                    {cost === null ? (
                      <span className="text-xs font-bold text-emerald-400">최대 레벨</span>
                    ) : (
                      <button
                        onClick={() => onUpgrade('coinValue', cost)}
                        disabled={!canAfford}
                        className={`px-3.5 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
                          canAfford
                            ? 'bg-amber-600 hover:bg-amber-500 text-white cursor-pointer font-bold'
                            : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        <span>강화 (🪙 {cost})</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        </div>

        {/* Footer Close */}
        <div className="pt-4 mt-6 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 text-white text-sm font-semibold rounded-xl transition-colors cursor-pointer"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
};
