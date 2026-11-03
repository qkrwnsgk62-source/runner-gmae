// ==========================================
// 쿠키 러너 (Cookie Runner) - Vanilla JS Engine
// Mobile-first Fullscreen Cookie Running Game
// ==========================================

// --- Web Audio API Procedural Sound Engine ---
class SoundController {
  constructor() {
    this.ctx = null;
    this.isMuted = false;
    this.musicInterval = null;
    this.isMusicPlaying = false;
    this.coinNotes = [523.25, 659.25, 783.99, 1046.50, 1318.51];
    this.coinNoteIndex = 0;
    this.lastCoinTime = 0;

    try {
      const saved = localStorage.getItem('cookie_runner_mute');
      if (saved !== null) {
        this.isMuted = saved === 'true';
      }
    } catch (e) {}
  }

  initCtx() {
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
  }

  setMuted(muted) {
    this.isMuted = muted;
    try {
      localStorage.setItem('cookie_runner_mute', String(muted));
    } catch (e) {}
    if (muted && this.isMusicPlaying) {
      this.stopMusic();
    }
  }

  toggleMute() {
    this.setMuted(!this.isMuted);
    return this.isMuted;
  }

  playJump() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      const now = this.ctx.currentTime;
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(220, now);
      osc.frequency.exponentialRampToValueAtTime(620, now + 0.13);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.14);
    } catch (e) {}
  }

  playDoubleJump() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(980, now + 0.15);
      gain.gain.setValueAtTime(0.22, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.16);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.16);
    } catch (e) {}
  }

  playSlide() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const bufferSize = Math.floor(this.ctx.sampleRate * 0.14);
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const output = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }
      const whiteNoise = this.ctx.createBufferSource();
      whiteNoise.buffer = buffer;
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(800, now);
      filter.frequency.exponentialRampToValueAtTime(180, now + 0.14);
      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.18, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
      whiteNoise.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);
      whiteNoise.start(now);
    } catch (e) {}
  }

  playCoin() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      if (now - this.lastCoinTime > 1.0) {
        this.coinNoteIndex = 0;
      }
      this.lastCoinTime = now;
      const freq = this.coinNotes[this.coinNoteIndex % this.coinNotes.length];
      this.coinNoteIndex++;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);
      osc.frequency.setValueAtTime(freq * 1.5, now + 0.04);
      gain.gain.setValueAtTime(0.2, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.12);
    } catch (e) {}
  }

  playPowerup() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const notes = [440, 554.37, 659.25, 880];
      notes.forEach((freq, idx) => {
        if (!this.ctx) return;
        const now = this.ctx.currentTime + idx * 0.05;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.14, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.14);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.14);
      });
    } catch (e) {}
  }

  playHit() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(40, now + 0.22);
      gain.gain.setValueAtTime(0.32, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.22);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.22);
    } catch (e) {}
  }

  playGameOver() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const chord = [349.23, 311.13, 261.63, 196];
      chord.forEach((freq, idx) => {
        if (!this.ctx) return;
        const now = this.ctx.currentTime + idx * 0.12;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.22, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.35);
      });
    } catch (e) {}
  }

  playClick() {
    if (this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    try {
      const now = this.ctx.currentTime;
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(650, now);
      osc.frequency.exponentialRampToValueAtTime(320, now + 0.04);
      gain.gain.setValueAtTime(0.12, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.04);
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start(now);
      osc.stop(now + 0.04);
    } catch (e) {}
  }

  startMusic() {
    if (this.isMusicPlaying || this.isMuted) return;
    this.initCtx();
    if (!this.ctx) return;
    this.isMusicPlaying = true;
    let step = 0;
    const notes = [261.63, 329.63, 392.0, 523.25, 440.0, 392.0, 329.63, 293.66];
    this.musicInterval = window.setInterval(() => {
      if (!this.ctx || this.isMuted || !this.isMusicPlaying) return;
      try {
        const now = this.ctx.currentTime;
        const freq = notes[step % notes.length];
        step++;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, now);
        gain.gain.setValueAtTime(0.06, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
        osc.connect(gain);
        gain.connect(this.ctx.destination);
        osc.start(now);
        osc.stop(now + 0.18);
      } catch (e) {}
    }, 220);
  }

  stopMusic() {
    if (this.musicInterval !== null) {
      clearInterval(this.musicInterval);
      this.musicInterval = null;
    }
    this.isMusicPlaying = false;
  }
}

const sound = new SoundController();

// --- Cookie Characters Data (All purchasable with in-game coins) ---
const SKINS = [
  {
    id: 'ginger',
    name: '진저브레드 쿠키',
    desc: '달콤한 설탕 프로스팅과 미소를 지닌 국민 대표 쿠키!',
    cost: 0,
    doughColor: '#d97706', // warm golden brown gingerbread
    icingColor: '#ffffff',
    btnColor1: '#ef4444',
    btnColor2: '#10b981',
    perk: '기본 2단 점프 탑재',
    extraJumps: 1,
    initialShield: false,
    coinMultiplier: 1.0,
  },
  {
    id: 'choco',
    name: '초코칩 쿠키',
    desc: '진한 초코 반죽에 초코칩이 콕콕 박혀 코인을 더 많이 끌어모으는 쿠키!',
    cost: 60,
    doughColor: '#78350f', // rich dark chocolate dough
    icingColor: '#f472b6', // pink icing
    btnColor1: '#3b82f6',
    btnColor2: '#f59e0b',
    perk: '코인 획득량 +20% 증가',
    extraJumps: 1,
    initialShield: false,
    coinMultiplier: 1.2,
  },
  {
    id: 'strawberry',
    name: '딸기 생크림 쿠키',
    desc: '부드러운 딸기 크림과 딸기 사탕 모자로 첫 충돌을 보호받는 쿠키!',
    cost: 150,
    doughColor: '#f43f5e', // strawberry dough
    icingColor: '#ffffff',
    btnColor1: '#ffffff',
    btnColor2: '#fbbf24',
    perk: '시작 시 딸기 설탕 보호막 1회 무료 지급',
    extraJumps: 1,
    initialShield: true,
    coinMultiplier: 1.0,
  },
  {
    id: 'butter_gold',
    name: '황금 버터 쿠키',
    desc: '눈부신 허니 버터로 구워져 공중에서 3번 연속 도약하는 아크로바틱 쿠키!',
    cost: 250,
    doughColor: '#eab308', // golden honey butter
    icingColor: '#fef08a',
    btnColor1: '#ec4899',
    btnColor2: '#06b6d4',
    perk: '공중 3단 점프 (트리플 점프) 가능!',
    extraJumps: 2,
    initialShield: false,
    coinMultiplier: 1.0,
  },
];

const UPGRADE_COSTS = {
  magnetDuration: [30, 60, 100, 160],
  shieldDuration: [40, 80, 130, 200],
  coinValue: [50, 90, 150, 240],
};

const STORAGE_KEY = 'cookie_runner_save_v2';

// Player persisted data
let playerData = {
  totalCoins: 30, // starter coins
  highScores: { easy: 0, normal: 0, hard: 0 },
  unlockedSkins: ['ginger'],
  activeSkin: 'ginger',
  upgrades: {
    magnetDuration: 1,
    shieldDuration: 1,
    coinValue: 1,
  },
};

let totalDistance = 0;
let totalRuns = 0;

try {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    const parsed = JSON.parse(saved);
    playerData = {
      ...playerData,
      ...parsed,
      highScores: { ...playerData.highScores, ...(parsed.highScores || {}) },
      upgrades: { ...playerData.upgrades, ...(parsed.upgrades || {}) },
    };
  }
  totalDistance = Number(localStorage.getItem('cookie_runner_total_dist') || 0);
  totalRuns = Number(localStorage.getItem('cookie_runner_total_runs') || 0);
} catch (e) {}

function savePlayerData() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(playerData));
    localStorage.setItem('cookie_runner_total_dist', String(totalDistance));
    localStorage.setItem('cookie_runner_total_runs', String(totalRuns));
  } catch (e) {}
}

// Active Game State
let currentDifficulty = 'normal';
let gameState = 'MENU'; // 'MENU' | 'PLAYING' | 'PAUSED' | 'GAME_OVER'

const V_WIDTH = 960;
const V_HEIGHT = 540;
const GROUND_Y = 440;

const game = {
  score: 0,
  distance: 0,
  coins: 0,
  speed: 7,
  baseSpeed: 7,
  maxSpeed: 16,
  acceleration: 0.0015,
  distanceToNextObstacle: 180,
  distanceToNextCoin: 100,
  distanceToNextPowerUp: 500,
  obstacles: [],
  coinsList: [],
  powerUps: [],
  activePowerUps: [],
  particles: [],
  floatingTexts: [],
  speedLines: [],
  clouds: [],
  hills: [],
  groundGridOffset: 0,
  shake: 0,
  invincibleTimer: 0,
  player: {
    x: 130,
    y: GROUND_Y - 60,
    vy: 0,
    width: 44,
    height: 62,
    isGrounded: true,
    isSliding: false,
    slideTimer: 0,
    jumpsRemaining: 1,
    coyoteTimer: 0,
    jumpBufferTimer: 0,
    legAngle: 0,
    trailHistory: [],
  },
};

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Initialize candy scenery (candy land / cookie world)
function initScenery() {
  game.clouds = [];
  for (let i = 0; i < 6; i++) {
    game.clouds.push({
      x: Math.random() * V_WIDTH,
      y: Math.random() * 120 + 20,
      width: Math.random() * 80 + 90,
      height: 35,
      speed: Math.random() * 0.3 + 0.15,
      alpha: Math.random() * 0.4 + 0.4,
    });
  }

  game.hills = [];
  let curX = 0;
  while (curX < V_WIDTH * 2) {
    const hWidth = Math.floor(Math.random() * 120 + 100);
    const hHeight = Math.floor(Math.random() * 90 + 70);
    game.hills.push({
      x: curX,
      width: hWidth,
      height: hHeight,
      color: Math.random() > 0.5 ? '#3b1c54' : '#28133f', // candy violet sugar hills
    });
    curX += hWidth * 0.75;
  }
}
initScenery();

function getActiveSkin() {
  return SKINS.find((s) => s.id === playerData.activeSkin) || SKINS[0];
}

// Particle Generators (Cookie crumbs & sugar sparkles)
function createCrumbDust(x, y, color = '#d97706') {
  for (let i = 0; i < 7; i++) {
    game.particles.push({
      x: x + (Math.random() - 0.5) * 20,
      y: y - 2,
      vx: (Math.random() - 0.5) * 4 - 2,
      vy: -Math.random() * 2.5 - 0.5,
      size: Math.random() * 3 + 2,
      color,
      alpha: 0.85,
      life: 0,
      maxLife: 0.35,
      shape: 'crumb',
    });
  }
}

function createSlideSugarSparks(x, y) {
  for (let i = 0; i < 8; i++) {
    game.particles.push({
      x: x + Math.random() * 25,
      y: y - 2,
      vx: -Math.random() * 6 - 2,
      vy: -Math.random() * 3,
      size: Math.random() * 3 + 1,
      color: '#fef08a', // sugar sprinkles
      alpha: 0.95,
      life: 0,
      maxLife: 0.35,
      shape: 'spark',
    });
  }
}

function createRingWave(x, y, color) {
  game.particles.push({
    x,
    y,
    vx: -game.speed * 0.3,
    vy: 0,
    size: 10,
    color,
    alpha: 1.0,
    life: 0,
    maxLife: 0.35,
    shape: 'ring',
  });
}

function createExplosion(x, y, color, count = 22) {
  for (let i = 0; i < count; i++) {
    const angle = Math.random() * Math.PI * 2;
    const spd = Math.random() * 8 + 2;
    game.particles.push({
      x,
      y,
      vx: Math.cos(angle) * spd,
      vy: Math.sin(angle) * spd,
      size: Math.random() * 5 + 2,
      color,
      alpha: 1,
      life: 0,
      maxLife: Math.random() * 0.4 + 0.35,
      shape: Math.random() > 0.4 ? 'spark' : 'circle',
    });
  }
}

function addFloatingText(x, y, text, color) {
  game.floatingTexts.push({
    x,
    y,
    text,
    color,
    alpha: 1,
    vy: -1.8,
  });
}

// Player Actions (Jump & Slide)
function handleJump() {
  if (gameState !== 'PLAYING') return;
  const p = game.player;
  const skin = getActiveSkin();

  if (p.isSliding) {
    p.isSliding = false;
    p.height = 62;
    p.y = GROUND_Y - 62;
  }

  if (p.isGrounded || p.coyoteTimer > 0) {
    p.vy = -14.2;
    p.isGrounded = false;
    p.coyoteTimer = 0;
    p.jumpsRemaining = skin.extraJumps;
    sound.playJump();
    createCrumbDust(p.x + 20, GROUND_Y, skin.doughColor);
  } else if (p.jumpsRemaining > 0) {
    p.vy = -12.5;
    p.jumpsRemaining -= 1;
    sound.playDoubleJump();
    createRingWave(p.x + 20, p.y + p.height, '#fde047');
  } else {
    p.jumpBufferTimer = 0.18;
  }
}

function handleSlide() {
  if (gameState !== 'PLAYING') return;
  const p = game.player;
  if (!p.isSliding) {
    p.isSliding = true;
    p.slideTimer = 0.6;
    p.height = 30; // lower cookie profile
    if (p.isGrounded) {
      p.y = GROUND_Y - 30;
    }
    sound.playSlide();
    createSlideSugarSparks(p.x + 10, GROUND_Y);
  }
}

// Start Game
function startGame() {
  let initialSpeed = 7.0;
  if (currentDifficulty === 'easy') initialSpeed = 6.0;
  if (currentDifficulty === 'hard') initialSpeed = 8.8;

  const skin = getActiveSkin();

  game.score = 0;
  game.distance = 0;
  game.coins = 0;
  game.speed = initialSpeed;
  game.baseSpeed = initialSpeed;
  game.obstacles = [];
  game.coinsList = [];
  game.powerUps = [];
  game.activePowerUps = [];
  game.particles = [];
  game.floatingTexts = [];
  game.speedLines = [];
  game.distanceToNextObstacle = 180;
  game.distanceToNextCoin = 100;
  game.distanceToNextPowerUp = 450;
  game.invincibleTimer = 0;
  game.shake = 0;

  const p = game.player;
  p.x = 130;
  p.y = GROUND_Y - 62;
  p.vy = 0;
  p.width = 44;
  p.height = 62;
  p.isGrounded = true;
  p.isSliding = false;
  p.slideTimer = 0;
  p.jumpsRemaining = 1 + skin.extraJumps;
  p.trailHistory = [];

  if (skin.initialShield) {
    game.activePowerUps.push({
      type: 'shield',
      timeLeft: 999,
      maxTime: 999,
    });
    addFloatingText(p.x + 20, p.y - 20, '딸기 설탕 보호막!', '#f43f5e');
  }

  setGameState('PLAYING');
  sound.playClick();
  updateHUD();
}

function togglePause() {
  if (gameState === 'PLAYING') {
    setGameState('PAUSED');
    sound.playClick();
  } else if (gameState === 'PAUSED') {
    setGameState('PLAYING');
    sound.playClick();
  }
}

function setGameState(newState) {
  gameState = newState;

  document.getElementById('titleMenu').classList.toggle('hidden', newState !== 'MENU');
  document.getElementById('pauseOverlay').classList.toggle('hidden', newState !== 'PAUSED');
  document.getElementById('gameOverOverlay').classList.toggle('hidden', newState !== 'GAME_OVER');
  document.getElementById('hudTop').classList.toggle('hidden', newState === 'MENU');

  const pauseBtn = document.getElementById('btnPause');
  if (pauseBtn) {
    pauseBtn.innerHTML = newState === 'PAUSED' ? '▶' : '⏸';
  }
}

function handleGameOver() {
  setGameState('GAME_OVER');
  sound.playHit();
  sound.playGameOver();
  game.shake = 18;
  const skin = getActiveSkin();
  createExplosion(game.player.x + 20, game.player.y + 30, skin.doughColor, 36);

  const finalScore = Math.floor(game.score);
  const finalDistance = Math.floor(game.distance / 10);
  const finalCoins = game.coins;

  totalDistance += finalDistance;
  totalRuns += 1;
  playerData.totalCoins += finalCoins;

  const currentHigh = playerData.highScores[currentDifficulty] || 0;
  const isNewHigh = finalScore > currentHigh;
  if (isNewHigh) {
    playerData.highScores[currentDifficulty] = finalScore;
  }
  savePlayerData();

  document.getElementById('goScore').innerText = finalScore.toLocaleString();
  document.getElementById('goDistance').innerText = `${finalDistance}m`;
  document.getElementById('goCoins').innerText = `+${finalCoins}`;
  document.getElementById('highScoreBadge').classList.toggle('hidden', !isNewHigh);

  updateUIElements();
}

// Update Top HUD
function updateHUD() {
  document.getElementById('hudScore').innerText = Math.floor(game.score).toLocaleString();
  document.getElementById('hudDistance').innerText = `${Math.floor(game.distance / 10)}m`;
  document.getElementById('hudCoins').innerText = game.coins;

  const container = document.getElementById('activePowerupsList');
  container.innerHTML = '';
  game.activePowerUps.forEach((pu) => {
    const badge = document.createElement('div');
    badge.className = 'flex items-center gap-1.5 px-2.5 py-1 bg-black/60 backdrop-blur-md rounded-lg border border-white/20 text-xs text-white';
    const icon = pu.type === 'shield' ? '🛡️' : pu.type === 'magnet' ? '🧲' : pu.type === 'boost' ? '⚡' : '2X';
    const label = pu.type === 'shield' ? 'ON' : `${Math.ceil(pu.timeLeft)}s`;
    badge.innerHTML = `<span>${icon}</span><span class="font-mono tabular-nums font-semibold">${label}</span>`;
    container.appendChild(badge);
  });
}

function updateUIElements() {
  document.getElementById('hudTopCoins').innerText = playerData.totalCoins;
  document.getElementById('shopCoins').innerText = `${playerData.totalCoins} 코인`;

  const skin = getActiveSkin();
  const nameEl = document.getElementById('activeSkinName');
  if (nameEl) nameEl.innerText = skin.name;
}

// --- DRAWING: CUTE COOKIE CHARACTER RUNNER ---
function drawCookieCharacter(ctx, p, skin, currentTime, isGrounded, isSliding, legAngle) {
  ctx.save();

  const centerX = p.x + p.width / 2;
  const doughColor = skin.doughColor;
  const icingColor = skin.icingColor;

  if (isSliding) {
    // SLIDING COOKIE POSE: Leaning forward horizontally, streamlined crouch
    ctx.translate(centerX, p.y + p.height / 2);
    ctx.rotate(-0.18); // slight forward tilt

    // Cookie body oval
    ctx.fillStyle = doughColor;
    ctx.beginPath();
    ctx.ellipse(0, 0, 30, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    // Cookie head (front right)
    ctx.beginPath();
    ctx.arc(18, -4, 13, 0, Math.PI * 2);
    ctx.fill();

    // Eye (happy squint)
    ctx.strokeStyle = '#271406';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(22, -6, 3, Math.PI, Math.PI * 2);
    ctx.stroke();

    // Sweet blushing cheek
    ctx.fillStyle = 'rgba(244, 63, 94, 0.6)';
    ctx.beginPath();
    ctx.arc(22, -1, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // Sugar frosting zigzag on back
    ctx.strokeStyle = icingColor;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-16, -2);
    ctx.lineTo(-8, 3);
    ctx.lineTo(0, -2);
    ctx.lineTo(8, 3);
    ctx.stroke();

    // Candy button
    ctx.fillStyle = skin.btnColor1;
    ctx.beginPath();
    ctx.arc(4, 1, 3, 0, Math.PI * 2);
    ctx.fill();

  } else {
    // STANDING / RUNNING / JUMPING COOKIE
    const legSwing = Math.sin(legAngle) * 14;

    // 1. Legs (Cookie Dough Stumps)
    ctx.fillStyle = doughColor;
    if (isGrounded) {
      // Left leg
      ctx.beginPath();
      ctx.ellipse(p.x + 15 + legSwing * 0.7, p.y + 52, 6, 10, legSwing * 0.05, 0, Math.PI * 2);
      ctx.fill();
      // Right leg
      ctx.beginPath();
      ctx.ellipse(p.x + 29 - legSwing * 0.7, p.y + 52, 6, 10, -legSwing * 0.05, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Jump legs (tucked in joy)
      ctx.beginPath();
      ctx.ellipse(p.x + 14, p.y + 48, 6, 8, -0.4, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(p.x + 30, p.y + 48, 6, 8, 0.4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Sugar frosting on ankles
    ctx.strokeStyle = icingColor;
    ctx.lineWidth = 2.5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(p.x + 10, p.y + 54);
    ctx.lineTo(p.x + 18, p.y + 54);
    ctx.moveTo(p.x + 24, p.y + 54);
    ctx.lineTo(p.x + 32, p.y + 54);
    ctx.stroke();

    // 2. Cookie Torso
    ctx.fillStyle = doughColor;
    ctx.beginPath();
    ctx.ellipse(centerX, p.y + 36, 15, 17, 0, 0, Math.PI * 2);
    ctx.fill();

    // Candy Gumdrop Buttons on Chest
    ctx.fillStyle = skin.btnColor1;
    ctx.beginPath();
    ctx.arc(centerX, p.y + 30, 3.5, 0, Math.PI * 2);
    ctx.fill();
    // button shine
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(centerX - 1, p.y + 29, 1, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = skin.btnColor2;
    ctx.beginPath();
    ctx.arc(centerX, p.y + 40, 3.5, 0, Math.PI * 2);
    ctx.fill();

    // 3. Arms (Cookie arms swinging)
    ctx.fillStyle = doughColor;
    if (isGrounded) {
      // Left arm swinging
      ctx.beginPath();
      ctx.ellipse(p.x + 8, p.y + 34 - legSwing * 0.5, 5, 8, -legSwing * 0.04, 0, Math.PI * 2);
      ctx.fill();
      // Right arm
      ctx.beginPath();
      ctx.ellipse(p.x + 36, p.y + 34 + legSwing * 0.5, 5, 8, legSwing * 0.04, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Jump cheer arms!
      ctx.beginPath();
      ctx.ellipse(p.x + 7, p.y + 24, 5, 9, -0.6, 0, Math.PI * 2);
      ctx.fill();
      ctx.beginPath();
      ctx.ellipse(p.x + 37, p.y + 24, 5, 9, 0.6, 0, Math.PI * 2);
      ctx.fill();
    }

    // 4. Cookie Head
    ctx.fillStyle = doughColor;
    ctx.beginPath();
    ctx.arc(centerX, p.y + 15, 15, 0, Math.PI * 2);
    ctx.fill();

    // Sugar Icing Frosting on Forehead/Hair
    ctx.strokeStyle = icingColor;
    ctx.lineWidth = 3;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(centerX - 10, p.y + 5);
    ctx.quadraticCurveTo(centerX - 5, p.y + 9, centerX, p.y + 5);
    ctx.quadraticCurveTo(centerX + 5, p.y + 9, centerX + 10, p.y + 5);
    ctx.stroke();

    // Cookie Eyes (Chocolate bead eyes)
    ctx.fillStyle = '#271406';
    ctx.beginPath();
    ctx.arc(centerX - 5, p.y + 13, 2.5, 0, Math.PI * 2);
    ctx.arc(centerX + 5, p.y + 13, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // White eye twinkle shine
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(centerX - 6, p.y + 12, 0.9, 0, Math.PI * 2);
    ctx.arc(centerX + 4, p.y + 12, 0.9, 0, Math.PI * 2);
    ctx.fill();

    // Rosy Cookie Cheeks
    ctx.fillStyle = 'rgba(244, 63, 94, 0.55)';
    ctx.beginPath();
    ctx.arc(centerX - 9, p.y + 17, 3, 0, Math.PI * 2);
    ctx.arc(centerX + 9, p.y + 17, 3, 0, Math.PI * 2);
    ctx.fill();

    // Cute Smile
    ctx.strokeStyle = '#271406';
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.arc(centerX, p.y + 16, 4, 0.2, Math.PI - 0.2);
    ctx.stroke();
  }

  ctx.restore();
}

// -------------------------------------------------------------
// MAIN 60FPS GAME LOOP
// -------------------------------------------------------------
let lastTime = performance.now();

function gameLoop(currentTime) {
  const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
  lastTime = currentTime;

  // 1. UPDATE
  if (gameState === 'PLAYING') {
    game.speed = Math.min(game.maxSpeed, game.speed + game.acceleration * dt * 60);
    game.distance += game.speed * dt * 5;

    const multiplierActive = game.activePowerUps.some((p) => p.type === 'multiplier');
    const scoreMultiplier = (multiplierActive ? 2.0 : 1.0) * (currentDifficulty === 'hard' ? 1.5 : 1.0);
    game.score += Math.round(game.speed * dt * 10 * scoreMultiplier);

    if (Math.random() < 0.25) {
      updateHUD();
    }

    // Powerup countdowns
    for (let i = game.activePowerUps.length - 1; i >= 0; i--) {
      const p = game.activePowerUps[i];
      p.timeLeft -= dt;
      if (p.timeLeft <= 0) {
        game.activePowerUps.splice(i, 1);
      }
    }

    if (game.invincibleTimer > 0) game.invincibleTimer -= dt;
    if (game.shake > 0) game.shake = Math.max(0, game.shake - dt * 25);

    // Player Physics
    const p = game.player;
    const skin = getActiveSkin();

    if (p.isSliding) {
      p.slideTimer -= dt;
      if (p.slideTimer <= 0) {
        const blockedByHighLaser = game.obstacles.some(
          (obs) =>
            obs.type === 'high_laser' &&
            obs.x < p.x + p.width &&
            obs.x + obs.width > p.x &&
            p.y < obs.y + obs.height
        );
        if (!blockedByHighLaser) {
          p.isSliding = false;
          p.height = 62;
          p.y = GROUND_Y - 62;
        } else {
          p.slideTimer = 0.1;
        }
      }
    }

    if (!p.isGrounded) {
      p.vy += 38.0 * dt;
      p.y += p.vy;
      if (p.y >= GROUND_Y - p.height) {
        p.y = GROUND_Y - p.height;
        p.vy = 0;
        p.isGrounded = true;
        p.jumpsRemaining = 1 + skin.extraJumps;
        createCrumbDust(p.x + 15, GROUND_Y, skin.doughColor);

        if (p.jumpBufferTimer > 0) {
          p.jumpBufferTimer = 0;
          p.vy = -14.2;
          p.isGrounded = false;
          sound.playJump();
        }
      }
    }

    if (p.isGrounded) p.coyoteTimer = 0.1;
    else if (p.coyoteTimer > 0) p.coyoteTimer -= dt;
    if (p.jumpBufferTimer > 0) p.jumpBufferTimer -= dt;

    p.legAngle += game.speed * dt * 3.5;

    // Speed Lines
    if (game.speed > 8.5 && Math.random() < 0.4) {
      game.speedLines.push({
        x: V_WIDTH + 20,
        y: Math.random() * (GROUND_Y - 40),
        length: Math.random() * 80 + 40,
        speed: game.speed * (Math.random() * 1.5 + 1.2),
        alpha: Math.random() * 0.4 + 0.2,
      });
    }

    // Motion Blur Trails
    const hasBoost = game.activePowerUps.some((ap) => ap.type === 'boost');
    if (hasBoost || game.speed > 11) {
      p.trailHistory.unshift({ x: p.x, y: p.y, isSliding: p.isSliding, alpha: 0.6 });
      if (p.trailHistory.length > 5) p.trailHistory.pop();
    } else if (p.trailHistory.length > 0) {
      p.trailHistory.shift();
    }

    // Spawn Obstacles (Candy cane barriers, flying drone forks, giant sugar monoliths)
    game.distanceToNextObstacle -= game.speed * dt * 60;
    if (game.distanceToNextObstacle <= 0) {
      const types = ['low_barrier', 'high_laser', 'tall_pillar'];
      if (game.score > 800) types.push('double_hurdle');
      const chosenType = types[Math.floor(Math.random() * types.length)];
      let width = 36;
      let height = 48;
      let y = GROUND_Y - height;

      if (chosenType === 'low_barrier') {
        width = 38;
        height = 42;
        y = GROUND_Y - 42;
      } else if (chosenType === 'high_laser') {
        width = 75;
        height = 36;
        y = GROUND_Y - 82;
      } else if (chosenType === 'tall_pillar') {
        width = 34;
        height = 88;
        y = GROUND_Y - 88;
      } else if (chosenType === 'double_hurdle') {
        width = 82;
        height = 42;
        y = GROUND_Y - 42;
      }

      game.obstacles.push({
        id: Date.now() + Math.random(),
        x: V_WIDTH + 40,
        y,
        width,
        height,
        type: chosenType,
        passed: false,
        pulsePhase: Math.random() * Math.PI,
      });

      const baseGap = currentDifficulty === 'easy' ? 420 : currentDifficulty === 'hard' ? 270 : 340;
      game.distanceToNextObstacle = baseGap + Math.random() * 260;
    }

    // Spawn Coins (Golden Cookie Coins)
    game.distanceToNextCoin -= game.speed * dt * 60;
    if (game.distanceToNextCoin <= 0) {
      const patternType = Math.random() > 0.4 ? 'arc' : 'line';
      const coinCount = Math.floor(Math.random() * 3 + 3);
      for (let i = 0; i < coinCount; i++) {
        let coinY = GROUND_Y - 25;
        if (patternType === 'arc') {
          coinY = GROUND_Y - 25 - Math.sin((i / (coinCount - 1)) * Math.PI) * 90;
        } else if (Math.random() > 0.6) {
          coinY = GROUND_Y - 75;
        }
        game.coinsList.push({
          id: Date.now() + i + Math.random(),
          x: V_WIDTH + 60 + i * 42,
          y: coinY,
          radius: 12,
          collected: false,
          animOffset: i * 0.3,
        });
      }
      game.distanceToNextCoin = 280 + Math.random() * 200;
    }

    // Spawn Powerups (Jelly items)
    game.distanceToNextPowerUp -= game.speed * dt * 60;
    if (game.distanceToNextPowerUp <= 0) {
      const pTypes = ['shield', 'magnet', 'boost', 'multiplier'];
      const chosenPower = pTypes[Math.floor(Math.random() * pTypes.length)];
      game.powerUps.push({
        id: Date.now() + Math.random(),
        x: V_WIDTH + 50,
        y: GROUND_Y - 70 - Math.random() * 50,
        type: chosenPower,
        radius: 16,
        collected: false,
        animOffset: Math.random() * 5,
      });
      game.distanceToNextPowerUp = 700 + Math.random() * 500;
    }

    // Magnet Effect
    const magnetActive = game.activePowerUps.some((ap) => ap.type === 'magnet');
    if (magnetActive) {
      const magnetRadius = 340;
      for (const coin of game.coinsList) {
        if (coin.collected) continue;
        const dx = p.x + 20 - coin.x;
        const dy = p.y + p.height / 2 - coin.y;
        const dist = Math.hypot(dx, dy);
        if (dist < magnetRadius) {
          coin.x += (dx / dist) * (game.speed * 1.8 + 8);
          coin.y += (dy / dist) * (game.speed * 1.8 + 8);
        }
      }
    }

    // Coin Collisions
    for (const coin of game.coinsList) {
      if (coin.collected) continue;
      coin.x -= game.speed;

      const playerLeft = p.x + 4;
      const playerRight = p.x + p.width - 4;
      const playerTop = p.y + 4;
      const playerBottom = p.y + p.height;

      if (
        coin.x + coin.radius > playerLeft &&
        coin.x - coin.radius < playerRight &&
        coin.y + coin.radius > playerTop &&
        coin.y - coin.radius < playerBottom
      ) {
        coin.collected = true;
        const bonus = skin.coinMultiplier * (1 + (playerData.upgrades.coinValue - 1) * 0.15);
        const coinGain = Math.round(1 * bonus);
        game.coins += coinGain;
        game.score += 25 * (multiplierActive ? 2 : 1);
        sound.playCoin();
        createExplosion(coin.x, coin.y, '#facc15', 7);
        addFloatingText(coin.x, coin.y - 10, `+${coinGain}`, '#facc15');
      }
    }

    // Powerup Collisions
    for (const item of game.powerUps) {
      if (item.collected) continue;
      item.x -= game.speed;

      if (
        item.x + item.radius > p.x &&
        item.x - item.radius < p.x + p.width &&
        item.y + item.radius > p.y &&
        item.y - item.radius < p.y + p.height
      ) {
        item.collected = true;
        sound.playPowerup();

        let duration = 8.0;
        if (item.type === 'shield') duration = 999;
        else if (item.type === 'magnet') duration = 7.0 + (playerData.upgrades.magnetDuration - 1) * 2.0;
        else if (item.type === 'boost') duration = 4.5;
        else if (item.type === 'multiplier') duration = 10.0;

        game.activePowerUps = game.activePowerUps.filter((ap) => ap.type !== item.type);
        game.activePowerUps.push({
          type: item.type,
          timeLeft: duration,
          maxTime: duration,
        });

        const labels = {
          shield: '설탕 보호막 획득!',
          magnet: '자석 젤리 활성화!',
          boost: '초고속 쿠키 대시!',
          multiplier: '2X 점수 부스트!',
        };
        const colors = {
          shield: '#38bdf8',
          magnet: '#c084fc',
          boost: '#f97316',
          multiplier: '#4ade80',
        };

        createExplosion(item.x, item.y, colors[item.type], 16);
        addFloatingText(p.x + 20, p.y - 25, labels[item.type], colors[item.type]);
      }
    }

    // Obstacle Collisions
    const isBoosted = game.activePowerUps.some((ap) => ap.type === 'boost');

    for (const obs of game.obstacles) {
      obs.x -= game.speed;
      if (obs.pulsePhase !== undefined) obs.pulsePhase += dt * 5;

      const hitPaddingX = 6;
      const hitPaddingY = 5;

      const playerLeft = p.x + hitPaddingX;
      const playerRight = p.x + p.width - hitPaddingX;
      const playerTop = p.y + hitPaddingY;
      const playerBottom = p.y + p.height - 2;

      const obsLeft = obs.x + hitPaddingX;
      const obsRight = obs.x + obs.width - hitPaddingX;
      const obsTop = obs.y + hitPaddingY;
      const obsBottom = obs.y + obs.height;

      const isColliding =
        playerRight > obsLeft &&
        playerLeft < obsRight &&
        playerBottom > obsTop &&
        playerTop < obsBottom;

      if (isColliding && game.invincibleTimer <= 0) {
        if (isBoosted) {
          createExplosion(obs.x + obs.width / 2, obs.y + obs.height / 2, '#fbbf24', 20);
          obs.x = -200;
          game.score += 150;
          game.shake = 5;
          sound.playHit();
          addFloatingText(p.x + 30, p.y - 20, '파괴! +150', '#fbbf24');
        } else {
          const shieldIdx = game.activePowerUps.findIndex((ap) => ap.type === 'shield');
          if (shieldIdx !== -1) {
            game.activePowerUps.splice(shieldIdx, 1);
            game.invincibleTimer = 1.0 + (playerData.upgrades.shieldDuration - 1) * 0.3;
            game.shake = 10;
            sound.playHit();
            createExplosion(p.x + 20, p.y + 30, '#38bdf8', 25);
            addFloatingText(p.x + 20, p.y - 25, '보호막 파괴!', '#38bdf8');
          } else {
            handleGameOver();
            break;
          }
        }
      }

      if (!obs.passed && obs.x + obs.width < p.x) {
        obs.passed = true;
        game.score += 50 * (multiplierActive ? 2 : 1);
      }
    }

    game.obstacles = game.obstacles.filter((o) => o.x > -150);
    game.coinsList = game.coinsList.filter((c) => c.x > -50 && !c.collected);
    game.powerUps = game.powerUps.filter((pu) => pu.x > -50 && !pu.collected);
    game.groundGridOffset = (game.groundGridOffset + game.speed) % 40;
  }

  // Particle updates
  for (let i = game.particles.length - 1; i >= 0; i--) {
    const pt = game.particles[i];
    pt.life += dt;
    pt.x += pt.vx;
    pt.y += pt.vy;
    pt.alpha = Math.max(0, 1 - pt.life / pt.maxLife);
    if (pt.shape === 'ring') pt.size += dt * 70;
    if (pt.life >= pt.maxLife) game.particles.splice(i, 1);
  }

  for (let i = game.floatingTexts.length - 1; i >= 0; i--) {
    const ft = game.floatingTexts[i];
    ft.y += ft.vy;
    ft.alpha -= dt * 1.2;
    if (ft.alpha <= 0) game.floatingTexts.splice(i, 1);
  }

  for (let i = game.speedLines.length - 1; i >= 0; i--) {
    const sl = game.speedLines[i];
    sl.x -= sl.speed;
    if (sl.x < -sl.length) game.speedLines.splice(i, 1);
  }

  for (const c of game.clouds) {
    c.x -= c.speed * (gameState === 'PLAYING' ? game.speed * 0.15 : 0.4);
    if (c.x < -c.width) c.x = V_WIDTH + 20;
  }

  const hSpeed = (gameState === 'PLAYING' ? game.speed : 1.5) * 0.25;
  for (const h of game.hills) {
    h.x -= hSpeed;
  }
  for (const h of game.hills) {
    if (h.x + h.width < 0) {
      const maxHx = Math.max(...game.hills.map((it) => it.x + it.width));
      h.x = maxHx;
    }
  }

  // -------------------------------------------------------------
  // 2. RENDER
  // -------------------------------------------------------------
  ctx.save();
  if (game.shake > 0) {
    ctx.translate((Math.random() - 0.5) * game.shake, (Math.random() - 0.5) * game.shake);
  }

  // Sky: Candy sunset twilight
  const skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  skyGrad.addColorStop(0, '#110c26');
  skyGrad.addColorStop(0.5, '#2e1065');
  skyGrad.addColorStop(1, '#6b21a8');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);

  // Candy Moon / Sugar Sun
  const moonGrad = ctx.createRadialGradient(760, 130, 10, 760, 130, 80);
  moonGrad.addColorStop(0, '#fde047');
  moonGrad.addColorStop(0.6, 'rgba(250, 204, 21, 0.4)');
  moonGrad.addColorStop(1, 'rgba(250, 204, 21, 0)');
  ctx.fillStyle = moonGrad;
  ctx.beginPath();
  ctx.arc(760, 130, 80, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fef08a';
  ctx.beginPath();
  ctx.arc(760, 130, 42, 0, Math.PI * 2);
  ctx.fill();

  // Floating Fluffy Sugar Clouds
  for (const c of game.clouds) {
    ctx.fillStyle = `rgba(255, 255, 255, ${c.alpha})`;
    ctx.beginPath();
    ctx.arc(c.x, c.y, 20, 0, Math.PI * 2);
    ctx.arc(c.x + 25, c.y - 8, 26, 0, Math.PI * 2);
    ctx.arc(c.x + 55, c.y, 22, 0, Math.PI * 2);
    ctx.fill();
  }

  // Candy Hills
  for (const h of game.hills) {
    ctx.fillStyle = h.color;
    ctx.beginPath();
    ctx.ellipse(h.x + h.width / 2, GROUND_Y, h.width / 2, h.height, 0, Math.PI, 0);
    ctx.fill();
  }

  // Speed Lines
  for (const sl of game.speedLines) {
    ctx.strokeStyle = `rgba(254, 240, 138, ${sl.alpha})`;
    ctx.lineWidth = 1.8;
    ctx.beginPath();
    ctx.moveTo(sl.x, sl.y);
    ctx.lineTo(sl.x + sl.length, sl.y);
    ctx.stroke();
  }

  // Cookie Land Floor (Chocolate Wafer & Candy Road)
  const groundGrad = ctx.createLinearGradient(0, GROUND_Y, 0, V_HEIGHT);
  groundGrad.addColorStop(0, '#451a03'); // rich baked chocolate wafer crust
  groundGrad.addColorStop(1, '#1c0901');
  ctx.fillStyle = groundGrad;
  ctx.fillRect(0, GROUND_Y, V_WIDTH, V_HEIGHT - GROUND_Y);

  // Candy Icing Horizon Line (White sugar piping)
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.shadowColor = '#f472b6';
  ctx.shadowBlur = 10;
  ctx.beginPath();
  ctx.moveTo(0, GROUND_Y);
  ctx.lineTo(V_WIDTH, GROUND_Y);
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Wafer grid lines on road
  ctx.strokeStyle = 'rgba(253, 224, 71, 0.2)';
  ctx.lineWidth = 2;
  for (let gx = -40 + game.groundGridOffset; gx < V_WIDTH + 60; gx += 40) {
    ctx.beginPath();
    ctx.moveTo(gx, GROUND_Y);
    ctx.lineTo(gx - 35, V_HEIGHT);
    ctx.stroke();
  }

  // Road Candy Sprinkles
  ctx.fillStyle = '#f43f5e';
  ctx.fillRect(100, GROUND_Y + 25, 6, 3);
  ctx.fillRect(320, GROUND_Y + 40, 6, 3);
  ctx.fillRect(680, GROUND_Y + 20, 6, 3);

  // 7. Golden Cookie Coins
  for (const coin of game.coinsList) {
    if (coin.collected) continue;
    const bobY = coin.y + Math.sin(currentTime * 0.006 + coin.animOffset) * 4;
    ctx.save();
    ctx.translate(coin.x, bobY);
    ctx.scale(Math.cos(currentTime * 0.008 + coin.animOffset), 1);
    ctx.shadowColor = '#fbbf24';
    ctx.shadowBlur = 10;
    ctx.fillStyle = '#f59e0b';
    ctx.beginPath();
    ctx.arc(0, 0, coin.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fde047';
    ctx.beginPath();
    ctx.arc(0, 0, coin.radius * 0.72, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#b45309';
    ctx.beginPath();
    ctx.moveTo(0, -coin.radius * 0.45);
    ctx.lineTo(coin.radius * 0.4, 0);
    ctx.lineTo(0, coin.radius * 0.45);
    ctx.lineTo(-coin.radius * 0.4, 0);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  // 8. Power-Up Jelly Orbs
  const puColors = {
    shield: { outer: '#0284c7', inner: '#38bdf8', glow: '#38bdf8' },
    magnet: { outer: '#7e22ce', inner: '#c084fc', glow: '#c084fc' },
    boost: { outer: '#ea580c', inner: '#fb923c', glow: '#f97316' },
    multiplier: { outer: '#16a34a', inner: '#4ade80', glow: '#22c55e' },
  };

  for (const pu of game.powerUps) {
    if (pu.collected) continue;
    const bobY = pu.y + Math.sin(currentTime * 0.005 + pu.animOffset) * 6;
    ctx.save();
    ctx.translate(pu.x, bobY);
    const col = puColors[pu.type];
    ctx.shadowColor = col.glow;
    ctx.shadowBlur = 16;
    ctx.fillStyle = col.outer;
    ctx.beginPath();
    ctx.arc(0, 0, pu.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = col.inner;
    ctx.beginPath();
    ctx.arc(0, 0, pu.radius * 0.65, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const sym = pu.type === 'shield' ? '🛡️' : pu.type === 'magnet' ? '🧲' : pu.type === 'boost' ? '⚡' : '2X';
    ctx.fillText(sym, 0, 1);
    ctx.restore();
  }

  // 9. Obstacles (Candy Cane Spikes, Overhead Flying Laser Forks, Chocolate Pillars)
  for (const obs of game.obstacles) {
    ctx.save();
    if (obs.type === 'low_barrier') {
      // Candy cane spike hurdle
      ctx.shadowColor = '#ef4444';
      ctx.shadowBlur = 10;
      ctx.fillStyle = '#dc2626';
      ctx.beginPath();
      ctx.moveTo(obs.x, obs.y + obs.height);
      ctx.lineTo(obs.x + obs.width / 2, obs.y);
      ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
      ctx.closePath();
      ctx.fill();

      // Candy white swirl stripes
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.moveTo(obs.x + 8, obs.y + obs.height);
      ctx.lineTo(obs.x + obs.width / 2, obs.y + 10);
      ctx.lineTo(obs.x + obs.width - 8, obs.y + obs.height);
      ctx.closePath();
      ctx.fill();
    } else if (obs.type === 'high_laser') {
      // Flying overhead laser gate (SLIDE UNDER!)
      const pulse = (Math.sin(obs.pulsePhase || 0) + 1) * 0.5;
      ctx.shadowColor = '#f43f5e';
      ctx.shadowBlur = 14 + pulse * 6;
      ctx.fillStyle = '#4c0519';
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
      ctx.fillStyle = '#f43f5e';
      ctx.fillRect(obs.x + 4, obs.y + 6, obs.width - 8, obs.height - 12);

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 11px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('▼ SLIDE ▼', obs.x + obs.width / 2, obs.y + obs.height / 2);

      ctx.fillStyle = '#fde047';
      ctx.fillRect(obs.x + 6, obs.y - 3, 8, 3);
      ctx.fillRect(obs.x + obs.width - 14, obs.y - 3, 8, 3);
    } else if (obs.type === 'tall_pillar') {
      // Tall wafer energy pillar (double jump)
      ctx.shadowColor = '#a855f7';
      ctx.shadowBlur = 12;
      ctx.fillStyle = '#3b0764';
      ctx.fillRect(obs.x, obs.y, obs.width, obs.height);
      ctx.fillStyle = '#c084fc';
      ctx.fillRect(obs.x + 6, obs.y + 4, obs.width - 12, obs.height - 8);
      ctx.fillStyle = '#f3e8ff';
      ctx.fillRect(obs.x + 10, obs.y + 8, obs.width - 20, obs.height - 16);
    } else if (obs.type === 'double_hurdle') {
      // Double candy spike
      ctx.fillStyle = '#ea580c';
      ctx.beginPath();
      ctx.moveTo(obs.x, obs.y + obs.height);
      ctx.lineTo(obs.x + 18, obs.y);
      ctx.lineTo(obs.x + 36, obs.y + obs.height);
      ctx.closePath();
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(obs.x + 46, obs.y + obs.height);
      ctx.lineTo(obs.x + 64, obs.y);
      ctx.lineTo(obs.x + 82, obs.y + obs.height);
      ctx.closePath();
      ctx.fill();
    }
    ctx.restore();
  }

  // 10. Motion Trails
  const skin = getActiveSkin();
  const p = game.player;

  for (let t = 0; t < p.trailHistory.length; t++) {
    const tr = p.trailHistory[t];
    ctx.save();
    ctx.globalAlpha = tr.alpha * (1 - t / p.trailHistory.length) * 0.4;
    ctx.fillStyle = skin.doughColor;
    if (tr.isSliding) {
      ctx.fillRect(tr.x, tr.y, 56, 28);
    } else {
      ctx.fillRect(tr.x, tr.y, p.width, p.height);
    }
    ctx.restore();
  }

  // 11. DRAW COOKIE RUNNER
  const isInvulnerable = game.invincibleTimer > 0;
  const flickerVisible = !isInvulnerable || Math.floor(currentTime * 0.02) % 2 === 0;

  if (gameState !== 'GAME_OVER' && flickerVisible) {
    const hasShield = game.activePowerUps.some((ap) => ap.type === 'shield');
    const hasBoost = game.activePowerUps.some((ap) => ap.type === 'boost');

    // Shield Bubble
    if (hasShield) {
      ctx.strokeStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 15;
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(p.x + p.width / 2, p.y + p.height / 2, p.isSliding ? 34 : 45, 0, Math.PI * 2);
      ctx.stroke();
      ctx.fillStyle = 'rgba(56, 189, 248, 0.15)';
      ctx.fill();
    }

    // Boost Super Aura
    if (hasBoost) {
      ctx.strokeStyle = '#fbbf24';
      ctx.shadowColor = '#f59e0b';
      ctx.shadowBlur = 20;
      ctx.lineWidth = 3.5;
      ctx.beginPath();
      ctx.arc(p.x + p.width / 2, p.y + p.height / 2, 48, 0, Math.PI * 2);
      ctx.stroke();
    }

    drawCookieCharacter(ctx, p, skin, currentTime, p.isGrounded, p.isSliding, p.legAngle);
  }

  // 12. Particles
  for (const pt of game.particles) {
    ctx.save();
    ctx.globalAlpha = pt.alpha;
    ctx.fillStyle = pt.color;
    ctx.strokeStyle = pt.color;
    ctx.shadowColor = pt.color;
    ctx.shadowBlur = 6;
    if (pt.shape === 'ring') {
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      ctx.stroke();
    } else if (pt.shape === 'crumb') {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      ctx.fill();
    } else if (pt.shape === 'spark') {
      ctx.fillRect(pt.x, pt.y, pt.size * 2, pt.size);
    } else {
      ctx.beginPath();
      ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  // 13. Floating Score / Status Popups
  for (const ft of game.floatingTexts) {
    ctx.save();
    ctx.globalAlpha = Math.max(0, ft.alpha);
    ctx.fillStyle = ft.color;
    ctx.shadowColor = ft.color;
    ctx.shadowBlur = 8;
    ctx.font = 'bold 16px "Plus Jakarta Sans", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(ft.text, ft.x, ft.y);
    ctx.restore();
  }

  ctx.restore();
  requestAnimationFrame(gameLoop);
}
requestAnimationFrame(gameLoop);

// --- User Interaction & Controls Wiring ---
window.addEventListener('keydown', (e) => {
  if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) {
    e.preventDefault();
    if (gameState === 'MENU' || gameState === 'GAME_OVER') {
      startGame();
    } else {
      handleJump();
    }
  } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
    e.preventDefault();
    handleSlide();
  } else if (['KeyP', 'Escape'].includes(e.code)) {
    e.preventDefault();
    if (gameState === 'PLAYING' || gameState === 'PAUSED') {
      togglePause();
    }
  }
});

// Canvas Click & Touch
canvas.addEventListener('click', () => {
  if (gameState === 'MENU' || gameState === 'GAME_OVER') {
    startGame();
  } else if (gameState === 'PLAYING') {
    handleJump();
  }
});

let touchStartY = null;
let touchStartX = null;
let touchStartTime = null;

canvas.addEventListener('touchstart', (e) => {
  const t = e.touches[0];
  touchStartY = t.clientY;
  touchStartX = t.clientX;
  touchStartTime = Date.now();
}, { passive: true });

canvas.addEventListener('touchend', (e) => {
  if (touchStartY === null) return;
  const t = e.changedTouches[0];
  const dy = t.clientY - touchStartY;
  const dx = t.clientX - touchStartX;
  const dt = Date.now() - touchStartTime;

  touchStartY = null;

  if (gameState === 'MENU' || gameState === 'GAME_OVER') {
    startGame();
    return;
  }

  if (dt < 400 && Math.abs(dy) > 28 && Math.abs(dy) > Math.abs(dx)) {
    if (dy < 0) {
      handleJump();
    } else {
      handleSlide();
    }
    return;
  }

  const rect = canvas.getBoundingClientRect();
  const relY = t.clientY - rect.top;
  if (relY > rect.height * 0.68) {
    handleSlide();
  } else {
    handleJump();
  }
}, { passive: true });

// Mobile Action Buttons (Slide on Left, Jump on Right)
const btnTouchJump = document.getElementById('btnTouchJump');
const btnTouchSlide = document.getElementById('btnTouchSlide');

btnTouchJump?.addEventListener('touchstart', (e) => {
  e.preventDefault();
  handleJump();
});
btnTouchJump?.addEventListener('click', handleJump);

btnTouchSlide?.addEventListener('touchstart', (e) => {
  e.preventDefault();
  handleSlide();
});
btnTouchSlide?.addEventListener('click', handleSlide);

document.getElementById('btnPause')?.addEventListener('click', togglePause);
document.getElementById('btnResume')?.addEventListener('click', togglePause);
document.getElementById('btnPauseRestart')?.addEventListener('click', startGame);

document.getElementById('btnMute')?.addEventListener('click', () => {
  const isMuted = sound.toggleMute();
  document.getElementById('btnMute').innerHTML = isMuted ? '🔇' : '🔊';
});

document.getElementById('btnStartGame')?.addEventListener('click', startGame);
document.getElementById('btnRestartGame')?.addEventListener('click', startGame);

// Open Modals
document.querySelectorAll('.btn-open-shop').forEach((el) => {
  el.addEventListener('click', () => {
    sound.playClick();
    renderShopModal();
    document.getElementById('shopModal').classList.remove('hidden');
  });
});

document.querySelectorAll('.btn-open-howto').forEach((el) => {
  el.addEventListener('click', () => {
    sound.playClick();
    document.getElementById('howToPlayModal').classList.remove('hidden');
  });
});

document.querySelectorAll('.btn-close-modal').forEach((el) => {
  el.addEventListener('click', () => {
    sound.playClick();
    document.getElementById('shopModal').classList.add('hidden');
    document.getElementById('howToPlayModal').classList.add('hidden');
  });
});

// Render Cookie Shop Content (All purchasable with in-game coins)
function renderShopModal() {
  document.getElementById('shopCoins').innerText = `${playerData.totalCoins} 코인`;

  const skinContainer = document.getElementById('shopSkinsContainer');
  skinContainer.innerHTML = '';

  SKINS.forEach((skin) => {
    const isUnlocked = playerData.unlockedSkins.includes(skin.id);
    const isEquipped = playerData.activeSkin === skin.id;
    const canAfford = playerData.totalCoins >= skin.cost;

    const card = document.createElement('div');
    card.className = `p-3.5 rounded-xl border transition-all ${
      isEquipped
        ? 'bg-amber-950/40 border-amber-500 shadow-md shadow-amber-950/30'
        : 'bg-slate-850/60 border-slate-800 hover:border-slate-700'
    }`;

    let actionBtnHtml = '';
    if (isEquipped) {
      actionBtnHtml = `<span class="text-xs font-bold text-amber-400 flex items-center gap-1">✓ 선택됨</span>`;
    } else if (isUnlocked) {
      actionBtnHtml = `<button data-id="${skin.id}" class="btn-select-skin px-3 py-1.5 bg-slate-800 hover:bg-amber-500 hover:text-slate-950 text-xs font-semibold text-white rounded-lg transition-colors cursor-pointer">선택하기</button>`;
    } else {
      actionBtnHtml = `<button data-id="${skin.id}" ${canAfford ? '' : 'disabled'} class="btn-buy-skin px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
        canAfford
          ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer'
          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
      }">🔒 🪙 ${skin.cost} 코인으로 구매</button>`;
    }

    card.innerHTML = `
      <div class="flex items-start justify-between mb-2">
        <div class="flex items-center gap-2.5">
          <div class="w-9 h-9 rounded-full flex items-center justify-center font-bold text-white text-base shadow-md border-2 border-white/20" style="background-color: ${skin.doughColor}">
            🍪
          </div>
          <div>
            <div class="font-bold text-sm text-white">${skin.name}</div>
            <div class="text-[11px] text-amber-400 font-medium">${skin.perk}</div>
          </div>
        </div>
      </div>
      <p class="text-xs text-slate-400 mb-3">${skin.desc}</p>
      <div class="flex items-center justify-between pt-2 border-t border-slate-800/60">
        <span class="text-xs font-mono text-slate-400">${skin.cost > 0 ? `가격: 🪙 ${skin.cost}` : '기본 지급'}</span>
        ${actionBtnHtml}
      </div>
    `;
    skinContainer.appendChild(card);
  });

  // Attach skin action events
  skinContainer.querySelectorAll('.btn-select-skin').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      sound.playClick();
      playerData.activeSkin = e.currentTarget.dataset.id;
      savePlayerData();
      renderShopModal();
      updateUIElements();
    });
  });

  skinContainer.querySelectorAll('.btn-buy-skin').forEach((btn) => {
    btn.addEventListener('click', (e) => {
      const skinId = e.currentTarget.dataset.id;
      const target = SKINS.find((s) => s.id === skinId);
      if (target && playerData.totalCoins >= target.cost) {
        sound.playPowerup();
        playerData.totalCoins -= target.cost;
        playerData.unlockedSkins.push(target.id);
        playerData.activeSkin = target.id;
        savePlayerData();
        renderShopModal();
        updateUIElements();
      }
    });
  });

  // Render Upgrades
  renderUpgradeItem('magnetDuration', '자석 젤리 지속 시간', '자석 아이템의 코인 흡입 시간을 +2초씩 연장합니다.', '🧲');
  renderUpgradeItem('shieldDuration', '설탕 보호막 무적 시간', '보호막 파괴 후 주어지는 무적 회피 시간을 증가시킵니다.', '🛡️');
  renderUpgradeItem('coinValue', '황금 코인 가치 증폭', '획득하는 코인 가치를 영구적으로 +15% 증가시킵니다.', '🪙');
}

function renderUpgradeItem(type, title, desc, icon) {
  const container = document.getElementById(`upgrade_${type}`);
  if (!container) return;
  const currentLvl = playerData.upgrades[type];
  const costs = UPGRADE_COSTS[type];
  const cost = currentLvl >= 5 ? null : costs[currentLvl - 1];
  const canAfford = cost !== null && playerData.totalCoins >= cost;

  let btnHtml = '';
  if (cost === null) {
    btnHtml = `<span class="text-xs font-bold text-emerald-400">최대 레벨</span>`;
  } else {
    btnHtml = `<button class="btn-do-upgrade px-3 py-1.5 text-xs font-semibold rounded-lg flex items-center gap-1.5 transition-colors ${
      canAfford
        ? 'bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold cursor-pointer'
        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
    }" ${canAfford ? '' : 'disabled'}>강화 (🪙 ${cost})</button>`;
  }

  container.innerHTML = `
    <div class="flex items-center gap-2.5">
      <div class="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-sm">${icon}</div>
      <div>
        <div class="font-bold text-xs text-white flex items-center gap-1.5">
          <span>${title}</span>
          <span class="text-[11px] font-mono text-amber-400">Lv.${currentLvl}/5</span>
        </div>
        <div class="text-[11px] text-slate-400">${desc}</div>
      </div>
    </div>
    <div>${btnHtml}</div>
  `;

  const btn = container.querySelector('.btn-do-upgrade');
  if (btn && canAfford) {
    btn.addEventListener('click', () => {
      sound.playPowerup();
      playerData.totalCoins -= cost;
      playerData.upgrades[type] = Math.min(5, currentLvl + 1);
      savePlayerData();
      renderShopModal();
      updateUIElements();
    });
  }
}

// Initial UI sync
updateUIElements();
