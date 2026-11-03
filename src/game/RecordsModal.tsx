import React from 'react';
import { PlayerStats, Difficulty } from './types';
import { sound } from './sound';
import { X, Trophy, Award, Flame, Zap } from 'lucide-react';

interface RecordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  stats: PlayerStats;
  totalDistance: number;
  totalRuns: number;
}

export const RecordsModal: React.FC<RecordsModalProps> = ({
  isOpen,
  onClose,
  stats,
  totalDistance,
  totalRuns,
}) => {
  if (!isOpen) return null;

  const difficultyNames: Record<Difficulty, string> = {
    easy: '쉬움 (Easy)',
    normal: '보통 (Normal)',
    hard: '매운맛 (Hard)',
  };

  const achievements = [
    {
      title: '첫 출발',
      desc: '달리기 1회 완주하기',
      done: totalRuns >= 1,
    },
    {
      title: '스피드 러너',
      desc: '단일 런에서 500m 이상 돌파하기',
      done: Math.max(...Object.values(stats.highScores)) >= 5000,
    },
    {
      title: '코인 부자',
      desc: '누적 코인 100개 이상 수집하기',
      done: stats.totalCoins >= 100,
    },
    {
      title: '캐릭터 수집가',
      desc: '러너 스킨 2종 이상 보유하기',
      done: stats.unlockedSkins.length >= 2,
    },
    {
      title: '매운맛 정복자',
      desc: '매운맛 난이도에서 10,000점 이상 달성',
      done: stats.highScores.hard >= 10000,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-slate-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span>최고 기록 및 업적</span>
          </h2>
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

        {/* High Scores per difficulty */}
        <div className="mt-5">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            난이도별 최고 점수
          </h3>
          <div className="grid grid-cols-3 gap-2.5">
            {(['easy', 'normal', 'hard'] as Difficulty[]).map((diff) => (
              <div
                key={diff}
                className="p-3 bg-slate-850/60 border border-slate-800 rounded-xl flex flex-col items-center text-center"
              >
                <div className="flex items-center gap-1 text-[11px] font-semibold text-slate-400 mb-1">
                  {diff === 'hard' && <Flame className="w-3.5 h-3.5 text-rose-500" />}
                  {diff === 'normal' && <Zap className="w-3.5 h-3.5 text-cyan-400" />}
                  <span>{difficultyNames[diff]}</span>
                </div>
                <div className="text-lg font-bold font-mono tabular-nums text-white">
                  {(stats.highScores[diff] || 0).toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Career Stats */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="p-3 bg-slate-850/50 border border-slate-800 rounded-xl">
            <div className="text-xs text-slate-400">총 누적 달린 거리</div>
            <div className="text-xl font-bold font-mono text-cyan-400 tabular-nums mt-0.5">
              {totalDistance.toLocaleString()}m
            </div>
          </div>
          <div className="p-3 bg-slate-850/50 border border-slate-800 rounded-xl">
            <div className="text-xs text-slate-400">총 누적 코인</div>
            <div className="text-xl font-bold font-mono text-amber-400 tabular-nums mt-0.5 flex items-center gap-1">
              <span>🪙</span>
              <span>{stats.totalCoins.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Achievements */}
        <div className="mt-5">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            도전 과제 (업적)
          </h3>
          <div className="space-y-2">
            {achievements.map((ach, idx) => (
              <div
                key={idx}
                className={`p-3 rounded-xl border flex items-center justify-between transition-colors ${
                  ach.done
                    ? 'bg-amber-950/20 border-amber-500/30 text-amber-200'
                    : 'bg-slate-850/40 border-slate-800/80 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-7 h-7 rounded-lg flex items-center justify-center ${
                      ach.done ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 text-slate-600'
                    }`}
                  >
                    <Award className="w-4 h-4" />
                  </div>
                  <div>
                    <div className={`text-xs font-bold ${ach.done ? 'text-white' : 'text-slate-300'}`}>
                      {ach.title}
                    </div>
                    <div className="text-[11px] text-slate-400">{ach.desc}</div>
                  </div>
                </div>
                <div>
                  {ach.done ? (
                    <span className="text-[11px] font-bold text-amber-400 px-2 py-0.5 bg-amber-500/10 rounded">
                      달성 완료
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-500">진행 중</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
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
