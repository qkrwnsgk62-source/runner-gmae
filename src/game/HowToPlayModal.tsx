import React from 'react';
import { X, ArrowUp, ArrowDown, Shield, Magnet, Zap, Sparkles } from 'lucide-react';
import { sound } from './sound';

interface HowToPlayModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const HowToPlayModal: React.FC<HowToPlayModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 text-slate-100 flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
            <span>🎮</span>
            <span>게임 조작 및 방법</span>
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

        {/* Controls Section */}
        <div className="mt-5 space-y-4">
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            기본 조작법 (키보드 / 터치)
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 bg-slate-850 border border-slate-800 rounded-xl flex items-start gap-3">
              <div className="p-2 bg-cyan-950 border border-cyan-800 rounded-lg text-cyan-400">
                <ArrowUp className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-white text-sm">점프 / 2단 점프</div>
                <div className="text-xs text-slate-400 mt-1">
                  <span className="font-mono text-cyan-300">Space</span>,{' '}
                  <span className="font-mono text-cyan-300">W</span>,{' '}
                  <span className="font-mono text-cyan-300">↑</span> 키 또는 화면 탭.<br />
                  공중에서 다시 누르면 2단 점프가 발동합니다.
                </div>
              </div>
            </div>

            <div className="p-3.5 bg-slate-850 border border-slate-800 rounded-xl flex items-start gap-3">
              <div className="p-2 bg-amber-950 border border-amber-800 rounded-lg text-amber-400">
                <ArrowDown className="w-5 h-5" />
              </div>
              <div>
                <div className="font-bold text-white text-sm">슬라이딩 (숙이기)</div>
                <div className="text-xs text-slate-400 mt-1">
                  <span className="font-mono text-amber-300">S</span>,{' '}
                  <span className="font-mono text-amber-300">↓</span> 키 또는 슬라이딩 버튼.<br />
                  공중에 떠 있는 레이저 게이트를 안전하게 피합니다.
                </div>
              </div>
            </div>
          </div>

          {/* Obstacles guide */}
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider pt-2">
            장애물 대처 요령
          </h3>
          <div className="space-y-2 text-xs">
            <div className="flex items-center gap-3 p-2.5 bg-slate-850/60 rounded-lg border border-slate-800">
              <span className="w-6 h-6 rounded bg-red-950 text-red-400 font-bold flex items-center justify-center shrink-0">
                ▲
              </span>
              <div>
                <span className="font-bold text-white">지상 가시 / 장애물</span>: 타이밍에 맞춰 점프로 뛰어넘으세요.
              </div>
            </div>
            <div className="flex items-center gap-3 p-2.5 bg-slate-850/60 rounded-lg border border-slate-800">
              <span className="w-6 h-6 rounded bg-rose-950 text-rose-400 font-bold flex items-center justify-center shrink-0">
                ▼
              </span>
              <div>
                <span className="font-bold text-white">공중 레이저 게이트</span>: 점프하면 충돌합니다! 반드시 <span className="text-amber-400 font-semibold">슬라이딩</span>으로 낮게 미끄러지세요.
              </div>
            </div>
            <div className="flex items-center gap-3 p-2.5 bg-slate-850/60 rounded-lg border border-slate-800">
              <span className="w-6 h-6 rounded bg-purple-950 text-purple-400 font-bold flex items-center justify-center shrink-0">
                ▮
              </span>
              <div>
                <span className="font-bold text-white">거대 에너지 기둥</span>: 높이가 높으므로 <span className="text-cyan-400 font-semibold">2단 점프</span>로 넘어야 합니다.
              </div>
            </div>
          </div>

          {/* Items guide */}
          <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider pt-2">
            파워업 아이템
          </h3>
          <div className="grid grid-cols-2 gap-2 text-xs">
            <div className="p-2.5 bg-slate-850/60 rounded-lg border border-slate-800 flex items-center gap-2">
              <Shield className="w-4 h-4 text-sky-400 shrink-0" />
              <div>
                <span className="font-bold text-sky-300">보호막 (Shield)</span>
                <div className="text-slate-400 text-[11px]">충돌 1회를 무효화</div>
              </div>
            </div>
            <div className="p-2.5 bg-slate-850/60 rounded-lg border border-slate-800 flex items-center gap-2">
              <Magnet className="w-4 h-4 text-purple-400 shrink-0" />
              <div>
                <span className="font-bold text-purple-300">자석 (Magnet)</span>
                <div className="text-slate-400 text-[11px]">주변 코인을 자동 흡수</div>
              </div>
            </div>
            <div className="p-2.5 bg-slate-850/60 rounded-lg border border-slate-800 flex items-center gap-2">
              <Zap className="w-4 h-4 text-orange-400 shrink-0" />
              <div>
                <span className="font-bold text-orange-300">부스트 (Boost)</span>
                <div className="text-slate-400 text-[11px]">무적 돌진 & 장애물 파괴</div>
              </div>
            </div>
            <div className="p-2.5 bg-slate-850/60 rounded-lg border border-slate-800 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-emerald-400 shrink-0" />
              <div>
                <span className="font-bold text-emerald-300">2X 배수 (Double)</span>
                <div className="text-slate-400 text-[11px]">점수 획득량 2배 증가</div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="pt-4 mt-6 border-t border-slate-800 flex justify-end">
          <button
            onClick={() => {
              sound.playClick();
              onClose();
            }}
            className="px-5 py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-sm rounded-xl transition-colors cursor-pointer"
          >
            확인 및 게임하기
          </button>
        </div>
      </div>
    </div>
  );
};
