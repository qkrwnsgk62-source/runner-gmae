export type GameState = 'MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER';

export type Difficulty = 'easy' | 'normal' | 'hard';

export type PowerUpType = 'shield' | 'magnet' | 'boost' | 'multiplier';

export type ObstacleType = 'low_barrier' | 'high_laser' | 'tall_pillar' | 'double_hurdle';

export interface CharacterSkin {
  id: 'striker' | 'ninja' | 'mecha' | 'cat';
  name: string;
  desc: string;
  cost: number;
  color: string;
  accentColor: string;
  perk: string;
  extraJumps: number;
  initialShield: boolean;
  coinMultiplier: number;
}

export interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  color: string;
  alpha: number;
  life: number;
  maxLife: number;
  shape?: 'circle' | 'spark' | 'ring';
}

export interface Obstacle {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  type: ObstacleType;
  passed: boolean;
  pulsePhase?: number;
}

export interface CoinItem {
  id: number;
  x: number;
  y: number;
  radius: number;
  collected: boolean;
  animOffset: number;
}

export interface PowerUpItem {
  id: number;
  x: number;
  y: number;
  type: PowerUpType;
  radius: number;
  collected: boolean;
  animOffset: number;
}

export interface ActivePowerUp {
  type: PowerUpType;
  timeLeft: number;
  maxTime: number;
}

export interface PlayerStats {
  totalCoins: number;
  highScores: Record<Difficulty, number>;
  unlockedSkins: string[];
  activeSkin: 'striker' | 'ninja' | 'mecha' | 'cat';
  upgrades: {
    magnetDuration: number; // Level 1 - 5
    shieldDuration: number; // Level 1 - 5
    coinValue: number;      // Level 1 - 5
  };
}

export const SKINS: CharacterSkin[] = [
  {
    id: 'striker',
    name: '네온 스트라이커',
    desc: '균형 잡힌 민첩성과 안정적인 점프력을 가진 기본 러너',
    cost: 0,
    color: '#06b6d4', // Cyan
    accentColor: '#38bdf8',
    perk: '표준 2단 점프 기본 제공',
    extraJumps: 1, // 1 extra = double jump (total 2 jumps)
    initialShield: false,
    coinMultiplier: 1.0,
  },
  {
    id: 'ninja',
    name: '사이버 닌자',
    desc: '고속 기동 시 추가 코인을 획득하는 그림자 질주자',
    cost: 60,
    color: '#a855f7', // Purple
    accentColor: '#c084fc',
    perk: '코인 획득량 +20% 증가',
    extraJumps: 1,
    initialShield: false,
    coinMultiplier: 1.2,
  },
  {
    id: 'mecha',
    name: '골든 메카',
    desc: '강력한 장갑으로 첫 충돌을 무료로 방어하는 헤비 러너',
    cost: 150,
    color: '#eab308', // Gold/Yellow
    accentColor: '#fde047',
    perk: '매 게임 시작 시 보호막(실드) 1회 무료 지급',
    extraJumps: 1,
    initialShield: true,
    coinMultiplier: 1.0,
  },
  {
    id: 'cat',
    name: '퀀텀 캣',
    desc: '공중에서 3번 연속 도약할 수 있는 궁극의 아크로바틱 러너',
    cost: 250,
    color: '#ec4899', // Pink
    accentColor: '#f472b6',
    perk: '공중 3단 점프 (트리플 점프) 가능!',
    extraJumps: 2, // 2 extra = triple jump
    initialShield: false,
    coinMultiplier: 1.0,
  },
];
