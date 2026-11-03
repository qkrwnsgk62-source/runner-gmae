import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Difficulty,
  GameState,
  CharacterSkin,
  Obstacle,
  CoinItem,
  PowerUpItem,
  ActivePowerUp,
  Particle,
  SKINS,
  PowerUpType,
} from './types';
import { sound } from './sound';
import {
  Volume2,
  VolumeX,
  Play,
  RotateCcw,
  Shield,
  Zap,
  Magnet,
  Sparkles,
  ArrowUp,
  ArrowDown,
  Pause,
} from 'lucide-react';

interface GameCanvasProps {
  difficulty: Difficulty;
  activeSkin: CharacterSkin;
  stats: {
    totalCoins: number;
    highScores: Record<Difficulty, number>;
    upgrades: {
      magnetDuration: number;
      shieldDuration: number;
      coinValue: number;
    };
  };
  onSaveRun: (score: number, coins: number, distance: number) => void;
  onOpenShop: () => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  difficulty,
  activeSkin,
  stats,
  onSaveRun,
  onOpenShop,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // React states for UI overlay
  const [gameState, setGameState] = useState<GameState>('MENU');
  const [currentScore, setCurrentScore] = useState<number>(0);
  const [currentDistance, setCurrentDistance] = useState<number>(0);
  const [runCoins, setRunCoins] = useState<number>(0);
  const [isMuted, setIsMuted] = useState<boolean>(sound.getMuted());
  const [activePowerUpsUI, setActivePowerUpsUI] = useState<ActivePowerUp[]>([]);
  const [hasNewHighScore, setHasNewHighScore] = useState<boolean>(false);
  const [screenShake, setScreenShake] = useState<number>(0);

  // Constants for 16:9 canvas
  const V_WIDTH = 960;
  const V_HEIGHT = 540;
  const GROUND_Y = 440;

  // Mutable Game Loop References
  const stateRef = useRef<{
    gameState: GameState;
    difficulty: Difficulty;
    skin: CharacterSkin;
    upgrades: typeof stats.upgrades;
    score: number;
    distance: number;
    coins: number;
    speed: number;
    baseSpeed: number;
    maxSpeed: number;
    acceleration: number;
    distanceToNextObstacle: number;
    distanceToNextCoin: number;
    distanceToNextPowerUp: number;
    obstacles: Obstacle[];
    coinsList: CoinItem[];
    powerUps: PowerUpItem[];
    activePowerUps: ActivePowerUp[];
    particles: Particle[];
    floatingTexts: { x: number; y: number; text: string; color: string; alpha: number; vy: number }[];
    speedLines: { x: number; y: number; length: number; speed: number; alpha: number }[];
    stars: { x: number; y: number; size: number; speed: number; alpha: number }[];
    buildings: { x: number; width: number; height: number; color: string; windows: boolean[] }[];
    groundGridOffset: number;
    shake: number;
    invincibleTimer: number;

    // Player Physics
    player: {
      x: number;
      y: number;
      vy: number;
      width: number;
      height: number;
      isGrounded: boolean;
      isSliding: boolean;
      slideTimer: number;
      jumpsRemaining: number;
      coyoteTimer: number;
      jumpBufferTimer: number;
      legAngle: number;
      trailHistory: { x: number; y: number; isSliding: boolean; alpha: number }[];
    };
  }>({
    gameState: 'MENU',
    difficulty,
    skin: activeSkin,
    upgrades: stats.upgrades,
    score: 0,
    distance: 0,
    coins: 0,
    speed: 7,
    baseSpeed: 7,
    maxSpeed: 16,
    acceleration: 0.0015,
    distanceToNextObstacle: 180,
    distanceToNextCoin: 80,
    distanceToNextPowerUp: 600,
    obstacles: [],
    coinsList: [],
    powerUps: [],
    activePowerUps: [],
    particles: [],
    floatingTexts: [],
    speedLines: [],
    stars: [],
    buildings: [],
    groundGridOffset: 0,
    shake: 0,
    invincibleTimer: 0,
    player: {
      x: 130,
      y: GROUND_Y - 60,
      vy: 0,
      width: 38,
      height: 60,
      isGrounded: true,
      isSliding: false,
      slideTimer: 0,
      jumpsRemaining: 1 + activeSkin.extraJumps,
      coyoteTimer: 0,
      jumpBufferTimer: 0,
      legAngle: 0,
      trailHistory: [],
    },
  });

  // Keep stateRef in sync with props
  useEffect(() => {
    stateRef.current.difficulty = difficulty;
    stateRef.current.skin = activeSkin;
    stateRef.current.upgrades = stats.upgrades;
  }, [difficulty, activeSkin, stats.upgrades]);

  // Generate background scenery once
  useEffect(() => {
    const s = stateRef.current;
    // Stars
    s.stars = [];
    for (let i = 0; i < 70; i++) {
      s.stars.push({
        x: Math.random() * V_WIDTH,
        y: Math.random() * (GROUND_Y - 140),
        size: Math.random() * 2 + 1,
        speed: Math.random() * 0.4 + 0.1,
        alpha: Math.random() * 0.7 + 0.3,
      });
    }

    // Skyline Buildings
    s.buildings = [];
    let curX = 0;
    while (curX < V_WIDTH * 2) {
      const bWidth = Math.floor(Math.random() * 60 + 50);
      const bHeight = Math.floor(Math.random() * 150 + 100);
      const numWindows = Math.floor(bHeight / 20) * Math.floor(bWidth / 15);
      const windows = Array.from({ length: numWindows }, () => Math.random() > 0.45);
      const shade = Math.floor(Math.random() * 15 + 15); // dark blue/gray
      s.buildings.push({
        x: curX,
        width: bWidth,
        height: bHeight,
        color: `rgb(${shade - 5}, ${shade}, ${shade + 18})`,
        windows,
      });
      curX += bWidth + Math.floor(Math.random() * 20 + 8);
    }
  }, []);

  // Audio mute handler
  const handleToggleMute = useCallback(() => {
    const newMuted = sound.toggleMute();
    setIsMuted(newMuted);
  }, []);

  // Trigger Jump
  const handleJump = useCallback(() => {
    const s = stateRef.current;
    if (s.gameState !== 'PLAYING') return;

    // Cancel sliding if jumping
    if (s.player.isSliding) {
      s.player.isSliding = false;
      s.player.height = 60;
      s.player.y = GROUND_Y - 60;
    }

    if (s.player.isGrounded || s.player.coyoteTimer > 0) {
      // First Jump
      s.player.vy = -14.2;
      s.player.isGrounded = false;
      s.player.coyoteTimer = 0;
      s.player.jumpsRemaining = s.skin.extraJumps;
      sound.playJump();

      // Jump dust particles
      createJumpDust(s.player.x + 20, GROUND_Y, s.skin.color);
    } else if (s.player.jumpsRemaining > 0) {
      // Double / Triple Jump
      s.player.vy = -12.5;
      s.player.jumpsRemaining -= 1;
      sound.playDoubleJump();

      // Double jump neon ring burst
      createRingWave(s.player.x + 20, s.player.y + s.player.height, s.skin.accentColor);
    } else {
      // Buffer jump for smooth landing response
      s.player.jumpBufferTimer = 0.18; // 180ms buffer
    }
  }, []);

  // Trigger Slide
  const handleSlide = useCallback(() => {
    const s = stateRef.current;
    if (s.gameState !== 'PLAYING') return;

    if (!s.player.isSliding) {
      s.player.isSliding = true;
      s.player.slideTimer = 0.6; // 600ms slide duration
      s.player.height = 28; // Lower hitbox!
      if (s.player.isGrounded) {
        s.player.y = GROUND_Y - 28;
      }
      sound.playSlide();

      // Ground sparks
      createSlideSparks(s.player.x + 10, GROUND_Y);
    }
  }, []);

  // Particle Generators
  const createJumpDust = (x: number, y: number, color: string) => {
    const s = stateRef.current;
    for (let i = 0; i < 8; i++) {
      s.particles.push({
        x: x + (Math.random() - 0.5) * 20,
        y: y - 2,
        vx: (Math.random() - 0.5) * 4 - 2,
        vy: -Math.random() * 2 - 0.5,
        size: Math.random() * 3 + 2,
        color,
        alpha: 0.8,
        life: 0,
        maxLife: 0.35,
        shape: 'circle',
      });
    }
  };

  const createSlideSparks = (x: number, y: number) => {
    const s = stateRef.current;
    for (let i = 0; i < 10; i++) {
      s.particles.push({
        x: x + Math.random() * 20,
        y: y - 2,
        vx: -Math.random() * 6 - 2,
        vy: -Math.random() * 3,
        size: Math.random() * 3 + 1,
        color: '#f59e0b',
        alpha: 0.9,
        life: 0,
        maxLife: 0.4,
        shape: 'spark',
      });
    }
  };

  const createRingWave = (x: number, y: number, color: string) => {
    const s = stateRef.current;
    s.particles.push({
      x,
      y,
      vx: -s.speed * 0.3,
      vy: 0,
      size: 10,
      color,
      alpha: 1.0,
      life: 0,
      maxLife: 0.35,
      shape: 'ring',
    });
  };

  const createExplosion = (x: number, y: number, color: string, count: number = 24) => {
    const s = stateRef.current;
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = Math.random() * 9 + 2;
      s.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        size: Math.random() * 5 + 2,
        color,
        alpha: 1,
        life: 0,
        maxLife: Math.random() * 0.4 + 0.4,
        shape: Math.random() > 0.5 ? 'spark' : 'circle',
      });
    }
  };

  const addFloatingText = (x: number, y: number, text: string, color: string) => {
    const s = stateRef.current;
    s.floatingTexts.push({
      x,
      y,
      text,
      color,
      alpha: 1,
      vy: -1.8,
    });
  };

  // Start / Restart Game
  const startGame = useCallback(() => {
    const s = stateRef.current;
    let initialSpeed = 7.0;
    if (s.difficulty === 'easy') initialSpeed = 6.0;
    if (s.difficulty === 'hard') initialSpeed = 8.8;

    s.score = 0;
    s.distance = 0;
    s.coins = 0;
    s.speed = initialSpeed;
    s.baseSpeed = initialSpeed;
    s.obstacles = [];
    s.coinsList = [];
    s.powerUps = [];
    s.activePowerUps = [];
    s.particles = [];
    s.floatingTexts = [];
    s.speedLines = [];
    s.distanceToNextObstacle = 180;
    s.distanceToNextCoin = 100;
    s.distanceToNextPowerUp = 450;
    s.invincibleTimer = 0;
    s.shake = 0;

    // Reset player
    s.player.x = 130;
    s.player.y = GROUND_Y - 60;
    s.player.vy = 0;
    s.player.width = 38;
    s.player.height = 60;
    s.player.isGrounded = true;
    s.player.isSliding = false;
    s.player.slideTimer = 0;
    s.player.jumpsRemaining = 1 + s.skin.extraJumps;
    s.player.trailHistory = [];

    // Skin perk: mecha starts with shield
    if (s.skin.initialShield) {
      s.activePowerUps.push({
        type: 'shield',
        timeLeft: 999, // permanent until hit
        maxTime: 999,
      });
      addFloatingText(s.player.x + 20, s.player.y - 20, '보호막 장착!', '#38bdf8');
    }

    s.gameState = 'PLAYING';
    setGameState('PLAYING');
    setCurrentScore(0);
    setCurrentDistance(0);
    setRunCoins(0);
    setActivePowerUpsUI(s.activePowerUps);
    setHasNewHighScore(false);

    sound.playClick();
  }, []);

  // Pause / Resume
  const togglePause = useCallback(() => {
    const s = stateRef.current;
    if (s.gameState === 'PLAYING') {
      s.gameState = 'PAUSED';
      setGameState('PAUSED');
      sound.playClick();
    } else if (s.gameState === 'PAUSED') {
      s.gameState = 'PLAYING';
      setGameState('PLAYING');
      sound.playClick();
    }
  }, []);

  // Keyboard controls
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['Space', 'ArrowUp', 'KeyW'].includes(e.code)) {
        e.preventDefault();
        if (stateRef.current.gameState === 'MENU' || stateRef.current.gameState === 'GAME_OVER') {
          startGame();
        } else {
          handleJump();
        }
      } else if (['ArrowDown', 'KeyS'].includes(e.code)) {
        e.preventDefault();
        handleSlide();
      } else if (['KeyP', 'Escape'].includes(e.code)) {
        e.preventDefault();
        if (stateRef.current.gameState === 'PLAYING' || stateRef.current.gameState === 'PAUSED') {
          togglePause();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [handleJump, handleSlide, startGame, togglePause]);

  // Touch & Swipe handlers on the canvas wrapper
  const touchStartRef = useRef<{ x: number; y: number; time: number } | null>(null);

  const handleTouchStart = (e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStartRef.current = { x: t.clientX, y: t.clientY, time: Date.now() };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStartRef.current.x;
    const dy = t.clientY - touchStartRef.current.y;
    const dt = Date.now() - touchStartRef.current.time;

    touchStartRef.current = null;

    if (stateRef.current.gameState === 'MENU' || stateRef.current.gameState === 'GAME_OVER') {
      startGame();
      return;
    }

    // Check for swipe gesture (if moved > 30px within 350ms)
    if (dt < 400 && Math.abs(dy) > 28 && Math.abs(dy) > Math.abs(dx)) {
      if (dy < 0) {
        // Swipe Up -> Jump
        handleJump();
        return;
      } else {
        // Swipe Down -> Slide
        handleSlide();
        return;
      }
    }

    // Default tap: If in lower third of canvas, slide; otherwise jump
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      const relativeY = t.clientY - rect.top;
      if (relativeY > rect.height * 0.68) {
        handleSlide();
      } else {
        handleJump();
      }
    } else {
      handleJump();
    }
  };

  // Main 60fps Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let lastTime = performance.now();

    const loop = (currentTime: number) => {
      const dt = Math.min((currentTime - lastTime) / 1000, 0.1); // clamp to max 100ms
      lastTime = currentTime;

      const s = stateRef.current;

      // UPDATE PHASE
      if (s.gameState === 'PLAYING') {
        // 1. Difficulty & Speed Scaling
        s.speed = Math.min(s.maxSpeed, s.speed + s.acceleration * dt * 60);
        s.distance += (s.speed * dt * 5);
        
        // Multiplier perk check
        const multiplierActive = s.activePowerUps.some((p) => p.type === 'multiplier');
        const scoreMultiplier = (multiplierActive ? 2.0 : 1.0) * (s.difficulty === 'hard' ? 1.5 : 1.0);
        s.score += Math.round(s.speed * dt * 10 * scoreMultiplier);

        // Update React HUD occasionally (every ~6 frames for smooth DOM)
        if (Math.random() < 0.2) {
          setCurrentScore(Math.floor(s.score));
          setCurrentDistance(Math.floor(s.distance / 10));
          setRunCoins(s.coins);
          setActivePowerUpsUI([...s.activePowerUps]);
        }

        // 2. Active Power-ups Countdown
        for (let i = s.activePowerUps.length - 1; i >= 0; i--) {
          const p = s.activePowerUps[i];
          p.timeLeft -= dt;
          if (p.timeLeft <= 0) {
            s.activePowerUps.splice(i, 1);
          }
        }

        // 3. Invincibility Timer
        if (s.invincibleTimer > 0) {
          s.invincibleTimer -= dt;
        }

        // 4. Screen Shake decay
        if (s.shake > 0) {
          s.shake = Math.max(0, s.shake - dt * 25);
          setScreenShake(s.shake);
        }

        // 5. Player Physics & State
        const p = s.player;

        // Slide Timer
        if (p.isSliding) {
          p.slideTimer -= dt;
          if (p.slideTimer <= 0) {
            // Check if standing up would collide with a high laser right now!
            const blockedByHighLaser = s.obstacles.some(
              (obs) =>
                obs.type === 'high_laser' &&
                obs.x < p.x + p.width &&
                obs.x + obs.width > p.x &&
                p.y < obs.y + obs.height
            );

            if (!blockedByHighLaser) {
              p.isSliding = false;
              p.height = 60;
              p.y = GROUND_Y - 60;
            } else {
              // extend slide safely until clearance
              p.slideTimer = 0.1;
            }
          }
        }

        // Gravity & Jump Arc
        if (!p.isGrounded) {
          p.vy += 38.0 * dt; // gravity
          p.y += p.vy;

          if (p.y >= GROUND_Y - p.height) {
            p.y = GROUND_Y - p.height;
            p.vy = 0;
            p.isGrounded = true;
            p.jumpsRemaining = 1 + s.skin.extraJumps;

            // Landing dust
            createJumpDust(p.x + 15, GROUND_Y, '#94a3b8');

            // Jump buffer execution
            if (p.jumpBufferTimer > 0) {
              p.jumpBufferTimer = 0;
              p.vy = -14.2;
              p.isGrounded = false;
              sound.playJump();
            }
          }
        }

        // Coyote Timer Decay
        if (p.isGrounded) {
          p.coyoteTimer = 0.1; // 100ms
        } else if (p.coyoteTimer > 0) {
          p.coyoteTimer -= dt;
        }

        // Jump Buffer Decay
        if (p.jumpBufferTimer > 0) {
          p.jumpBufferTimer -= dt;
        }

        // Running Leg Animation
        p.legAngle += s.speed * dt * 3.5;

        // Speed Lines Generation
        if (s.speed > 8.5 && Math.random() < 0.4) {
          s.speedLines.push({
            x: V_WIDTH + 20,
            y: Math.random() * (GROUND_Y - 40),
            length: Math.random() * 80 + 40,
            speed: s.speed * (Math.random() * 1.5 + 1.2),
            alpha: Math.random() * 0.4 + 0.2,
          });
        }

        // Trail Record for motion blur / speed effect
        const hasBoost = s.activePowerUps.some((ap) => ap.type === 'boost');
        if (hasBoost || s.speed > 11) {
          p.trailHistory.unshift({
            x: p.x,
            y: p.y,
            isSliding: p.isSliding,
            alpha: 0.6,
          });
          if (p.trailHistory.length > 5) p.trailHistory.pop();
        } else if (p.trailHistory.length > 0) {
          p.trailHistory.shift();
        }

        // 6. SPAWN LOGIC: Obstacles
        s.distanceToNextObstacle -= s.speed * dt * 60;
        if (s.distanceToNextObstacle <= 0) {
          const types: Obstacle['type'][] = ['low_barrier', 'high_laser', 'tall_pillar'];
          if (s.score > 800) types.push('double_hurdle');

          // Pick random type
          const chosenType = types[Math.floor(Math.random() * types.length)];
          let width = 36;
          let height = 48;
          let y = GROUND_Y - height;

          if (chosenType === 'low_barrier') {
            width = 38;
            height = 42;
            y = GROUND_Y - 42;
          } else if (chosenType === 'high_laser') {
            // Floating high beam: MUST SLIDE UNDER!
            width = 75;
            height = 36;
            y = GROUND_Y - 82; // y spans from ~358 to 394 (clearance to ground is 46px!)
          } else if (chosenType === 'tall_pillar') {
            // Tall energy monolith: Double jump required
            width = 32;
            height = 88;
            y = GROUND_Y - 88;
          } else if (chosenType === 'double_hurdle') {
            width = 82;
            height = 42;
            y = GROUND_Y - 42;
          }

          s.obstacles.push({
            id: Date.now() + Math.random(),
            x: V_WIDTH + 40,
            y,
            width,
            height,
            type: chosenType,
            passed: false,
            pulsePhase: Math.random() * Math.PI,
          });

          // Set next obstacle spacing (scales inversely with speed)
          const baseGap = s.difficulty === 'easy' ? 420 : s.difficulty === 'hard' ? 270 : 340;
          s.distanceToNextObstacle = baseGap + Math.random() * 260;
        }

        // 7. SPAWN LOGIC: Coins & Patterns
        s.distanceToNextCoin -= s.speed * dt * 60;
        if (s.distanceToNextCoin <= 0) {
          // Spawn coin groups (arc or straight line)
          const patternType = Math.random() > 0.4 ? 'arc' : 'line';
          const coinCount = Math.floor(Math.random() * 3 + 3);

          for (let i = 0; i < coinCount; i++) {
            let coinY = GROUND_Y - 25;
            if (patternType === 'arc') {
              // Jumping arc pattern
              coinY = GROUND_Y - 25 - Math.sin((i / (coinCount - 1)) * Math.PI) * 90;
            } else if (Math.random() > 0.6) {
              // Floating mid-air coins
              coinY = GROUND_Y - 75;
            }

            s.coinsList.push({
              id: Date.now() + i + Math.random(),
              x: V_WIDTH + 60 + i * 42,
              y: coinY,
              radius: 11,
              collected: false,
              animOffset: i * 0.3,
            });
          }

          s.distanceToNextCoin = 280 + Math.random() * 200;
        }

        // 8. SPAWN LOGIC: Power-Up Items
        s.distanceToNextPowerUp -= s.speed * dt * 60;
        if (s.distanceToNextPowerUp <= 0) {
          const powerTypes: PowerUpType[] = ['shield', 'magnet', 'boost', 'multiplier'];
          const chosenPower = powerTypes[Math.floor(Math.random() * powerTypes.length)];
          s.powerUps.push({
            id: Date.now() + Math.random(),
            x: V_WIDTH + 50,
            y: GROUND_Y - 70 - Math.random() * 50,
            type: chosenPower,
            radius: 16,
            collected: false,
            animOffset: Math.random() * 5,
          });

          s.distanceToNextPowerUp = 700 + Math.random() * 500;
        }

        // 9. MAGNET EFFECT: Pull coins
        const magnetActive = s.activePowerUps.some((ap) => ap.type === 'magnet');
        if (magnetActive) {
          const magnetRadius = 340;
          for (const coin of s.coinsList) {
            if (coin.collected) continue;
            const dx = p.x + 20 - coin.x;
            const dy = p.y + p.height / 2 - coin.y;
            const dist = Math.hypot(dx, dy);
            if (dist < magnetRadius) {
              coin.x += (dx / dist) * (s.speed * 1.8 + 8);
              coin.y += (dy / dist) * (s.speed * 1.8 + 8);
            }
          }
        }

        // 10. COLLISIONS: Coins
        for (const coin of s.coinsList) {
          if (coin.collected) continue;
          coin.x -= s.speed;

          // Check intersection with player hitbox
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
            // Coin bonus multiplier from skin & upgrades
            const bonus = s.skin.coinMultiplier * (1 + (s.upgrades.coinValue - 1) * 0.15);
            const coinGain = Math.round(1 * bonus);
            s.coins += coinGain;
            s.score += 25 * (multiplierActive ? 2 : 1);
            sound.playCoin();

            // Coin sparkle burst
            createExplosion(coin.x, coin.y, '#facc15', 7);
            addFloatingText(coin.x, coin.y - 10, `+${coinGain}`, '#facc15');
          }
        }

        // 11. COLLISIONS: Power-up Items
        for (const item of s.powerUps) {
          if (item.collected) continue;
          item.x -= s.speed;

          const playerLeft = p.x;
          const playerRight = p.x + p.width;
          const playerTop = p.y;
          const playerBottom = p.y + p.height;

          if (
            item.x + item.radius > playerLeft &&
            item.x - item.radius < playerRight &&
            item.y + item.radius > playerTop &&
            item.y - item.radius < playerBottom
          ) {
            item.collected = true;
            sound.playPowerup();

            // Calculate duration based on upgrades
            let duration = 8.0;
            if (item.type === 'shield') {
              duration = 999; // lasts until hit
            } else if (item.type === 'magnet') {
              duration = 7.0 + (s.upgrades.magnetDuration - 1) * 2.0;
            } else if (item.type === 'boost') {
              duration = 4.5;
            } else if (item.type === 'multiplier') {
              duration = 10.0;
            }

            // Remove existing duplicate active powerup
            s.activePowerUps = s.activePowerUps.filter((ap) => ap.type !== item.type);
            s.activePowerUps.push({
              type: item.type,
              timeLeft: duration,
              maxTime: duration,
            });

            const labels: Record<PowerUpType, string> = {
              shield: '보호막 획득!',
              magnet: '자석 활성화!',
              boost: '초고속 대시!',
              multiplier: '2X 점수 부스트!',
            };
            const colors: Record<PowerUpType, string> = {
              shield: '#38bdf8',
              magnet: '#c084fc',
              boost: '#f97316',
              multiplier: '#4ade80',
            };

            createExplosion(item.x, item.y, colors[item.type], 16);
            addFloatingText(p.x + 20, p.y - 25, labels[item.type], colors[item.type]);
          }
        }

        // 12. COLLISIONS: Obstacles
        const isBoosted = s.activePowerUps.some((ap) => ap.type === 'boost');

        for (const obs of s.obstacles) {
          obs.x -= s.speed;
          if (obs.pulsePhase !== undefined) obs.pulsePhase += dt * 5;

          // Forgiving Hitbox bounds
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

          // Check overlap
          const isColliding =
            playerRight > obsLeft &&
            playerLeft < obsRight &&
            playerBottom > obsTop &&
            playerTop < obsBottom;

          if (isColliding && s.invincibleTimer <= 0) {
            if (isBoosted) {
              // Super Dash smashes through obstacle!
              createExplosion(obs.x + obs.width / 2, obs.y + obs.height / 2, '#fbbf24', 20);
              obs.x = -200; // eliminate
              s.score += 150;
              s.shake = 5;
              sound.playHit();
              addFloatingText(p.x + 30, p.y - 20, '파괴! +150', '#fbbf24');
            } else {
              // Check if player has Shield
              const shieldIdx = s.activePowerUps.findIndex((ap) => ap.type === 'shield');
              if (shieldIdx !== -1) {
                // Break shield, save player!
                s.activePowerUps.splice(shieldIdx, 1);
                s.invincibleTimer = 1.2; // 1.2 seconds of invulnerability
                s.shake = 10;
                sound.playHit();
                createExplosion(p.x + 20, p.y + 30, '#38bdf8', 25);
                addFloatingText(p.x + 20, p.y - 25, '보호막 파괴!', '#38bdf8');
              } else {
                // GAME OVER CRASH!
                s.gameState = 'GAME_OVER';
                setGameState('GAME_OVER');
                sound.playHit();
                sound.playGameOver();
                s.shake = 18;
                createExplosion(p.x + 20, p.y + 30, s.skin.color, 36);

                const finalScore = Math.floor(s.score);
                const finalCoins = s.coins;
                const finalDistance = Math.floor(s.distance / 10);

                setCurrentScore(finalScore);
                setCurrentDistance(finalDistance);
                setRunCoins(finalCoins);

                // High score check
                const prevHigh = stats.highScores[s.difficulty] || 0;
                if (finalScore > prevHigh) {
                  setHasNewHighScore(true);
                }

                // Save run
                onSaveRun(finalScore, finalCoins, finalDistance);
                break;
              }
            }
          }

          // Score bonus for successfully dodging an obstacle
          if (!obs.passed && obs.x + obs.width < p.x) {
            obs.passed = true;
            s.score += 50 * (multiplierActive ? 2 : 1);
          }
        }

        // Cleanup off-screen items
        s.obstacles = s.obstacles.filter((o) => o.x > -150);
        s.coinsList = s.coinsList.filter((c) => c.x > -50 && !c.collected);
        s.powerUps = s.powerUps.filter((pu) => pu.x > -50 && !pu.collected);

        // Ground scrolling
        s.groundGridOffset = (s.groundGridOffset + s.speed) % 40;
      }

      // UPDATE PARTICLES & TEXTS (Always run even during Game Over for nice explosion decay)
      for (let i = s.particles.length - 1; i >= 0; i--) {
        const pt = s.particles[i];
        pt.life += dt;
        pt.x += pt.vx;
        pt.y += pt.vy;
        pt.alpha = Math.max(0, 1 - pt.life / pt.maxLife);
        if (pt.shape === 'ring') pt.size += dt * 70;
        if (pt.life >= pt.maxLife) {
          s.particles.splice(i, 1);
        }
      }

      for (let i = s.floatingTexts.length - 1; i >= 0; i--) {
        const ft = s.floatingTexts[i];
        ft.y += ft.vy;
        ft.alpha -= dt * 1.2;
        if (ft.alpha <= 0) {
          s.floatingTexts.splice(i, 1);
        }
      }

      for (let i = s.speedLines.length - 1; i >= 0; i--) {
        const sl = s.speedLines[i];
        sl.x -= sl.speed;
        if (sl.x < -sl.length) {
          s.speedLines.splice(i, 1);
        }
      }

      // Stars parallax
      for (const star of s.stars) {
        star.x -= star.speed * (s.gameState === 'PLAYING' ? s.speed * 0.1 : 0.4);
        if (star.x < 0) star.x = V_WIDTH;
      }

      // Buildings parallax
      const bSpeed = (s.gameState === 'PLAYING' ? s.speed : 1.5) * 0.25;
      for (const b of s.buildings) {
        b.x -= bSpeed;
      }
      // Wrap buildings
      for (const b of s.buildings) {
        if (b.x + b.width < 0) {
          const maxBx = Math.max(...s.buildings.map((it) => it.x + it.width));
          b.x = maxBx + Math.floor(Math.random() * 20 + 8);
        }
      }

      // -------------------------------------------------------------
      // RENDER PHASE
      // -------------------------------------------------------------
      ctx.save();

      // Apply Screen Shake
      if (s.shake > 0) {
        const shakeX = (Math.random() - 0.5) * s.shake;
        const shakeY = (Math.random() - 0.5) * s.shake;
        ctx.translate(shakeX, shakeY);
      }

      // 1. Sky Gradient Background
      const skyGrad = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
      skyGrad.addColorStop(0, '#030712'); // deep midnight slate
      skyGrad.addColorStop(0.65, '#0b132b');
      skyGrad.addColorStop(1, '#1c1938'); // faint twilight purple near horizon
      ctx.fillStyle = skyGrad;
      ctx.fillRect(0, 0, V_WIDTH, V_HEIGHT);

      // 2. Neon Moon / Synthwave Sun
      const moonGrad = ctx.createRadialGradient(760, 140, 10, 760, 140, 95);
      moonGrad.addColorStop(0, 'rgba(236, 72, 153, 0.9)'); // Neon pink
      moonGrad.addColorStop(0.5, 'rgba(168, 85, 247, 0.4)'); // Purple glow
      moonGrad.addColorStop(1, 'rgba(168, 85, 247, 0)');
      ctx.fillStyle = moonGrad;
      ctx.beginPath();
      ctx.arc(760, 140, 95, 0, Math.PI * 2);
      ctx.fill();

      // Moon core
      ctx.fillStyle = '#f43f5e';
      ctx.beginPath();
      ctx.arc(760, 140, 52, 0, Math.PI * 2);
      ctx.fill();

      // Moon scanline cuts
      ctx.fillStyle = '#030712';
      for (let slY = 120; slY < 185; slY += 8) {
        ctx.fillRect(700, slY, 120, (slY - 110) * 0.08 + 1.5);
      }

      // 3. Stars
      for (const st of s.stars) {
        ctx.fillStyle = `rgba(255, 255, 255, ${st.alpha})`;
        ctx.fillRect(st.x, st.y, st.size, st.size);
      }

      // 4. Distant Skyline Buildings
      for (const b of s.buildings) {
        ctx.fillStyle = b.color;
        const by = GROUND_Y - b.height;
        ctx.fillRect(b.x, by, b.width, b.height);

        // Building rooftop neon beacon
        ctx.fillStyle = '#06b6d4';
        ctx.fillRect(b.x + b.width / 2 - 1, by - 6, 2, 6);

        // Glowing Windows
        let winIdx = 0;
        const rows = Math.floor(b.height / 20);
        const cols = Math.floor(b.width / 15);
        for (let r = 0; r < rows; r++) {
          for (let c = 0; c < cols; c++) {
            if (b.windows[winIdx % b.windows.length]) {
              ctx.fillStyle = 'rgba(250, 204, 21, 0.45)'; // Amber window light
              ctx.fillRect(b.x + 4 + c * 14, by + 12 + r * 18, 6, 8);
            }
            winIdx++;
          }
        }
      }

      // 5. Speed Lines
      for (const sl of s.speedLines) {
        ctx.strokeStyle = `rgba(56, 189, 248, ${sl.alpha})`;
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.moveTo(sl.x, sl.y);
        ctx.lineTo(sl.x + sl.length, sl.y);
        ctx.stroke();
      }

      // 6. Ground & Perspective Track
      const groundGrad = ctx.createLinearGradient(0, GROUND_Y, 0, V_HEIGHT);
      groundGrad.addColorStop(0, '#0f172a'); // slate-900
      groundGrad.addColorStop(1, '#020617'); // slate-950
      ctx.fillStyle = groundGrad;
      ctx.fillRect(0, GROUND_Y, V_WIDTH, V_HEIGHT - GROUND_Y);

      // Glowing Neon Horizon Line
      ctx.strokeStyle = '#06b6d4';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y);
      ctx.lineTo(V_WIDTH, GROUND_Y);
      ctx.stroke();
      ctx.shadowBlur = 0; // reset

      // Moving Grid Perspective Lines on Road
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.22)';
      ctx.lineWidth = 1.5;
      for (let gx = -40 + s.groundGridOffset; gx < V_WIDTH + 60; gx += 40) {
        ctx.beginPath();
        ctx.moveTo(gx, GROUND_Y);
        ctx.lineTo(gx - 35, V_HEIGHT);
        ctx.stroke();
      }

      // Road horizontal track stripes
      ctx.strokeStyle = 'rgba(147, 51, 234, 0.18)';
      ctx.beginPath();
      ctx.moveTo(0, GROUND_Y + 30);
      ctx.lineTo(V_WIDTH, GROUND_Y + 30);
      ctx.moveTo(0, GROUND_Y + 65);
      ctx.lineTo(V_WIDTH, GROUND_Y + 65);
      ctx.stroke();

      // 7. Collectible Coins
      for (const coin of s.coinsList) {
        if (coin.collected) continue;
        const bobY = coin.y + Math.sin(currentTime * 0.006 + coin.animOffset) * 4;

        ctx.save();
        ctx.translate(coin.x, bobY);
        // Spin effect
        const scaleX = Math.cos(currentTime * 0.008 + coin.animOffset);
        ctx.scale(scaleX, 1);

        // Glow
        ctx.shadowColor = '#fbbf24';
        ctx.shadowBlur = 10;

        // Outer coin
        ctx.fillStyle = '#f59e0b';
        ctx.beginPath();
        ctx.arc(0, 0, coin.radius, 0, Math.PI * 2);
        ctx.fill();

        // Inner rim
        ctx.fillStyle = '#fde047';
        ctx.beginPath();
        ctx.arc(0, 0, coin.radius * 0.72, 0, Math.PI * 2);
        ctx.fill();

        // Star / diamond center
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

      // 8. Power-Up Orbs
      for (const pu of s.powerUps) {
        if (pu.collected) continue;
        const bobY = pu.y + Math.sin(currentTime * 0.005 + pu.animOffset) * 6;

        ctx.save();
        ctx.translate(pu.x, bobY);

        const puColors: Record<PowerUpType, { outer: string; inner: string; glow: string }> = {
          shield: { outer: '#0284c7', inner: '#38bdf8', glow: '#38bdf8' },
          magnet: { outer: '#7e22ce', inner: '#c084fc', glow: '#c084fc' },
          boost: { outer: '#ea580c', inner: '#fb923c', glow: '#f97316' },
          multiplier: { outer: '#16a34a', inner: '#4ade80', glow: '#22c55e' },
        };

        const col = puColors[pu.type];

        // Pulsing aura
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

        // Icon text inside
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.font = 'bold 11px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        const symbol = pu.type === 'shield' ? '🛡️' : pu.type === 'magnet' ? '🧲' : pu.type === 'boost' ? '⚡' : '2X';
        ctx.fillText(symbol, 0, 1);

        ctx.restore();
      }

      // 9. Obstacles
      for (const obs of s.obstacles) {
        ctx.save();

        if (obs.type === 'low_barrier') {
          // Low neon spiked barrier (jump over)
          ctx.shadowColor = '#ef4444';
          ctx.shadowBlur = 12;

          ctx.fillStyle = '#dc2626';
          ctx.beginPath();
          ctx.moveTo(obs.x, obs.y + obs.height);
          ctx.lineTo(obs.x + obs.width / 2, obs.y);
          ctx.lineTo(obs.x + obs.width, obs.y + obs.height);
          ctx.closePath();
          ctx.fill();

          // Inner hazard stripe
          ctx.fillStyle = '#fee2e2';
          ctx.beginPath();
          ctx.moveTo(obs.x + 8, obs.y + obs.height);
          ctx.lineTo(obs.x + obs.width / 2, obs.y + 10);
          ctx.lineTo(obs.x + obs.width - 8, obs.y + obs.height);
          ctx.closePath();
          ctx.fill();

          // Base warning emitter
          ctx.fillStyle = '#991b1b';
          ctx.fillRect(obs.x - 4, obs.y + obs.height - 6, obs.width + 8, 6);
        } else if (obs.type === 'high_laser') {
          // Flying High Laser Gate (slide under!)
          // Warning laser beam
          const pulse = (Math.sin(obs.pulsePhase || 0) + 1) * 0.5;

          ctx.shadowColor = '#f43f5e';
          ctx.shadowBlur = 14 + pulse * 6;

          // Overhead drone/emitter body
          ctx.fillStyle = '#334155';
          ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

          // Emitter core
          ctx.fillStyle = '#f43f5e';
          ctx.fillRect(obs.x + 4, obs.y + 6, obs.width - 8, obs.height - 12);

          // Downward laser warning arrows
          ctx.fillStyle = '#fb7185';
          ctx.font = 'bold 11px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('▼ SLIDE ▼', obs.x + obs.width / 2, obs.y + obs.height / 2);

          // Thruster glow
          ctx.fillStyle = '#38bdf8';
          ctx.fillRect(obs.x + 8, obs.y - 4, 10, 4);
          ctx.fillRect(obs.x + obs.width - 18, obs.y - 4, 10, 4);
        } else if (obs.type === 'tall_pillar') {
          // Tall Energy Pillar (jump/double jump)
          ctx.shadowColor = '#a855f7';
          ctx.shadowBlur = 12;

          ctx.fillStyle = '#1e1b4b';
          ctx.fillRect(obs.x, obs.y, obs.width, obs.height);

          // Glowing energy conduit
          ctx.fillStyle = '#c084fc';
          ctx.fillRect(obs.x + 8, obs.y + 4, obs.width - 16, obs.height - 8);

          ctx.fillStyle = '#e9d5ff';
          ctx.fillRect(obs.x + 12, obs.y + 10, obs.width - 24, obs.height - 20);

          // Top crown emitter
          ctx.fillStyle = '#9333ea';
          ctx.fillRect(obs.x - 3, obs.y, obs.width + 6, 6);
        } else if (obs.type === 'double_hurdle') {
          // Double Low Barrier
          ctx.shadowColor = '#f97316';
          ctx.shadowBlur = 10;

          // First hurdle
          ctx.fillStyle = '#ea580c';
          ctx.beginPath();
          ctx.moveTo(obs.x, obs.y + obs.height);
          ctx.lineTo(obs.x + 18, obs.y);
          ctx.lineTo(obs.x + 36, obs.y + obs.height);
          ctx.closePath();
          ctx.fill();

          // Second hurdle
          ctx.beginPath();
          ctx.moveTo(obs.x + 46, obs.y + obs.height);
          ctx.lineTo(obs.x + 64, obs.y);
          ctx.lineTo(obs.x + 82, obs.y + obs.height);
          ctx.closePath();
          ctx.fill();
        }

        ctx.restore();
      }

      // 10. Motion Blur Trails
      const isSliding = s.player.isSliding;
      for (let t = 0; t < s.player.trailHistory.length; t++) {
        const tr = s.player.trailHistory[t];
        ctx.save();
        ctx.globalAlpha = tr.alpha * (1 - t / s.player.trailHistory.length) * 0.4;
        ctx.fillStyle = s.skin.accentColor;
        if (tr.isSliding) {
          ctx.fillRect(tr.x, tr.y, 56, 28);
        } else {
          ctx.fillRect(tr.x, tr.y, s.player.width, s.player.height);
        }
        ctx.restore();
      }

      // 11. Player Character (Procedural Neon Cyber Runner)
      const p = s.player;
      const isInvulnerable = s.invincibleTimer > 0;
      const flickerVisible = !isInvulnerable || Math.floor(currentTime * 0.02) % 2 === 0;

      if (s.gameState !== 'GAME_OVER' && flickerVisible) {
        ctx.save();

        const hasShield = s.activePowerUps.some((ap) => ap.type === 'shield');
        const hasBoost = s.activePowerUps.some((ap) => ap.type === 'boost');

        // Shield Bubble Aura
        if (hasShield) {
          ctx.strokeStyle = '#38bdf8';
          ctx.shadowColor = '#38bdf8';
          ctx.shadowBlur = 15;
          ctx.lineWidth = 2.5;
          ctx.beginPath();
          const shieldRadius = isSliding ? 34 : 45;
          ctx.arc(p.x + p.width / 2, p.y + p.height / 2, shieldRadius, 0, Math.PI * 2);
          ctx.stroke();
          ctx.fillStyle = 'rgba(56, 189, 248, 0.14)';
          ctx.fill();
        }

        // Boost Aura
        if (hasBoost) {
          ctx.strokeStyle = '#f59e0b';
          ctx.shadowColor = '#fbbf24';
          ctx.shadowBlur = 20;
          ctx.lineWidth = 3;
          ctx.beginPath();
          ctx.arc(p.x + p.width / 2, p.y + p.height / 2, 48, 0, Math.PI * 2);
          ctx.stroke();
        }

        ctx.shadowColor = s.skin.color;
        ctx.shadowBlur = 12;

        if (isSliding) {
          // SLIDING POSE: Low aerodynamic crouch / slide
          // Sparks under slide
          if (p.isGrounded && Math.random() < 0.4) {
            createSlideSparks(p.x, GROUND_Y);
          }

          // Main body streamlined block
          ctx.fillStyle = s.skin.color;
          ctx.beginPath();
          ctx.roundRect(p.x, p.y + 4, 58, 22, [6, 14, 6, 6]);
          ctx.fill();

          // Visor glow
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(p.x + 36, p.y + 8, 14, 6);

          // Thruster back spark
          ctx.fillStyle = s.skin.accentColor;
          ctx.fillRect(p.x - 6, p.y + 10, 8, 8);
        } else {
          // STANDING / JUMPING / RUNNING POSE
          const legSwing = Math.sin(p.legAngle) * 12;

          // Head / Cyber Helmet
          ctx.fillStyle = s.skin.color;
          ctx.beginPath();
          ctx.arc(p.x + p.width / 2 + 2, p.y + 12, 12, 0, Math.PI * 2);
          ctx.fill();

          // Neon Visor
          ctx.fillStyle = '#ffffff';
          ctx.fillRect(p.x + p.width / 2 + 3, p.y + 9, 10, 5);

          // Torso Armor
          ctx.fillStyle = s.skin.accentColor;
          ctx.beginPath();
          ctx.roundRect(p.x + 6, p.y + 22, p.width - 12, 22, 5);
          ctx.fill();

          // Core reactor light
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.arc(p.x + p.width / 2 + 1, p.y + 32, 4, 0, Math.PI * 2);
          ctx.fill();

          // Arms / Upper limbs
          ctx.strokeStyle = s.skin.color;
          ctx.lineWidth = 4;
          ctx.lineCap = 'round';

          ctx.beginPath();
          if (p.isGrounded) {
            // Running arm pump
            ctx.moveTo(p.x + 12, p.y + 26);
            ctx.lineTo(p.x + 12 - legSwing * 0.7, p.y + 38);
          } else {
            // Jump arms up
            ctx.moveTo(p.x + 12, p.y + 26);
            ctx.lineTo(p.x + 4, p.y + 16);
          }
          ctx.stroke();

          // Legs
          ctx.beginPath();
          if (p.isGrounded) {
            // Left leg
            ctx.moveTo(p.x + 12, p.y + 44);
            ctx.lineTo(p.x + 12 + legSwing, p.y + 58);
            // Right leg
            ctx.moveTo(p.x + 24, p.y + 44);
            ctx.lineTo(p.x + 24 - legSwing, p.y + 58);
          } else {
            // Jump pose (tucked legs)
            ctx.moveTo(p.x + 12, p.y + 44);
            ctx.lineTo(p.x + 8, p.y + 54);
            ctx.moveTo(p.x + 24, p.y + 44);
            ctx.lineTo(p.x + 28, p.y + 50);
          }
          ctx.stroke();
        }

        ctx.restore();
      }

      // 12. Particles Rendering
      for (const pt of s.particles) {
        ctx.save();
        ctx.globalAlpha = pt.alpha;
        ctx.fillStyle = pt.color;
        ctx.strokeStyle = pt.color;
        ctx.shadowColor = pt.color;
        ctx.shadowBlur = 6;

        if (pt.shape === 'ring') {
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(pt.x, pt.y, pt.size, 0, Math.PI * 2);
          ctx.stroke();
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
      for (const ft of s.floatingTexts) {
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

      ctx.restore(); // restore shake & main state

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [stats.highScores, onSaveRun]);

  return (
    <div className="relative w-full max-w-5xl mx-auto select-none">
      {/* Game Screen Container */}
      <div
        className="relative w-full aspect-[16/9] bg-slate-950 rounded-2xl overflow-hidden border border-slate-800 shadow-2xl shadow-cyan-950/20"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <canvas
          ref={canvasRef}
          width={V_WIDTH}
          height={V_HEIGHT}
          className="w-full h-full block cursor-pointer"
          onClick={() => {
            if (gameState === 'MENU' || gameState === 'GAME_OVER') {
              startGame();
            } else if (gameState === 'PLAYING') {
              handleJump();
            }
          }}
        />

        {/* TOP HUD (During Playing / Paused) */}
        {gameState !== 'MENU' && (
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between pointer-events-none">
            {/* Left Score & Meters */}
            <div className="flex items-center gap-6 bg-slate-900/80 backdrop-blur-md px-4 py-2 rounded-xl border border-slate-800/80 text-xs">
              <div className="flex flex-col">
                <span className="text-slate-400 font-medium">점수</span>
                <span className="text-lg font-bold font-mono tabular-nums text-white">
                  {currentScore.toLocaleString()}
                </span>
              </div>
              <div className="w-px h-6 bg-slate-800" />
              <div className="flex flex-col">
                <span className="text-slate-400 font-medium">거리</span>
                <span className="text-lg font-bold font-mono tabular-nums text-cyan-400">
                  {currentDistance}m
                </span>
              </div>
              <div className="w-px h-6 bg-slate-800" />
              <div className="flex flex-col">
                <span className="text-slate-400 font-medium">코인</span>
                <span className="text-lg font-bold font-mono tabular-nums text-amber-400 flex items-center gap-1">
                  <span>🪙</span>
                  <span>{runCoins}</span>
                </span>
              </div>
            </div>

            {/* Active Powerups List */}
            <div className="flex items-center gap-2">
              {activePowerUpsUI.map((p, idx) => (
                <div
                  key={idx}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-900/90 backdrop-blur-md rounded-lg border border-slate-700/80 text-xs"
                >
                  {p.type === 'shield' && <Shield className="w-4 h-4 text-sky-400" />}
                  {p.type === 'magnet' && <Magnet className="w-4 h-4 text-purple-400" />}
                  {p.type === 'boost' && <Zap className="w-4 h-4 text-orange-400" />}
                  {p.type === 'multiplier' && <Sparkles className="w-4 h-4 text-emerald-400" />}
                  <span className="font-mono tabular-nums text-white font-semibold">
                    {p.type === 'shield' ? 'ON' : `${Math.ceil(p.timeLeft)}s`}
                  </span>
                </div>
              ))}
            </div>

            {/* Right Controls (Sound & Pause) */}
            <div className="flex items-center gap-2 pointer-events-auto">
              <button
                onClick={handleToggleMute}
                className="p-2.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 transition-colors"
                title={isMuted ? '음소거 해제' : '음소거'}
              >
                {isMuted ? <VolumeX className="w-4 h-4 text-red-400" /> : <Volume2 className="w-4 h-4" />}
              </button>
              <button
                onClick={togglePause}
                className="p-2.5 bg-slate-900/80 hover:bg-slate-800 text-slate-300 hover:text-white rounded-xl border border-slate-800 transition-colors"
                title="일시 정지"
              >
                {gameState === 'PAUSED' ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
              </button>
            </div>
          </div>
        )}

        {/* OVERLAY: TITLE MENU */}
        {gameState === 'MENU' && (
          <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-950/50 border border-cyan-800/50 rounded-full text-cyan-400 text-xs font-medium mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>네온 러너 2D 어드벤처</span>
            </div>

            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-white mb-2">
              NEON RUNNER
            </h1>
            <p className="text-slate-300 text-sm max-w-md mb-6">
              점프와 슬라이딩으로 다가오는 장애물을 피하고 코인을 모으세요!
            </p>

            <div className="flex flex-col sm:flex-row items-center gap-3 mb-8">
              <button
                onClick={startGame}
                className="px-8 py-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-500/25 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <Play className="w-5 h-5 fill-current" />
                <span>게임 시작</span>
              </button>

              <button
                onClick={onOpenShop}
                className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl border border-slate-700 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span>🛒</span>
                <span>업그레이드 & 캐릭터</span>
              </button>
            </div>

            {/* Quick Controls Guide */}
            <div className="grid grid-cols-2 gap-4 max-w-sm text-left bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 text-xs text-slate-300">
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-cyan-400 font-bold">
                  ↑
                </div>
                <div>
                  <div className="font-semibold text-white">점프 / 2단 점프</div>
                  <div className="text-slate-400 text-[11px]">Space 또는 W 키</div>
                </div>
              </div>
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-amber-400 font-bold">
                  ↓
                </div>
                <div>
                  <div className="font-semibold text-white">슬라이딩</div>
                  <div className="text-slate-400 text-[11px]">S 키 (공중 장애물 통과)</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* OVERLAY: PAUSED */}
        {gameState === 'PAUSED' && (
          <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center">
            <h2 className="text-3xl font-extrabold text-white mb-2">일시 정지</h2>
            <p className="text-slate-400 text-sm mb-6">게임을 계속 진행하려면 버튼을 누르세요.</p>
            <div className="flex items-center gap-3">
              <button
                onClick={togglePause}
                className="px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl transition-colors cursor-pointer flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>계속하기</span>
              </button>
              <button
                onClick={startGame}
                className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl border border-slate-700 transition-colors cursor-pointer flex items-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                <span>다시 시작</span>
              </button>
            </div>
          </div>
        )}

        {/* OVERLAY: GAME OVER */}
        {gameState === 'GAME_OVER' && (
          <div className="absolute inset-0 bg-slate-950/85 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center animate-fade-in">
            {hasNewHighScore && (
              <div className="px-4 py-1.5 bg-amber-500/20 border border-amber-500/40 text-amber-300 font-bold text-xs rounded-full mb-3 animate-bounce">
                🎉 신기록 달성! NEW HIGH SCORE!
              </div>
            )}

            <h2 className="text-3xl md:text-4xl font-extrabold text-red-400 mb-1">
              GAME OVER
            </h2>
            <p className="text-slate-400 text-xs mb-6">장애물에 충돌했습니다!</p>

            {/* Run Summary Board */}
            <div className="grid grid-cols-3 gap-3 w-full max-w-md bg-slate-900/90 border border-slate-800 rounded-xl p-4 mb-6">
              <div className="flex flex-col items-center">
                <span className="text-slate-400 text-xs">최종 점수</span>
                <span className="text-2xl font-bold font-mono text-white tabular-nums">
                  {currentScore.toLocaleString()}
                </span>
              </div>
              <div className="flex flex-col items-center border-x border-slate-800">
                <span className="text-slate-400 text-xs">달린 거리</span>
                <span className="text-2xl font-bold font-mono text-cyan-400 tabular-nums">
                  {currentDistance}m
                </span>
              </div>
              <div className="flex flex-col items-center">
                <span className="text-slate-400 text-xs">획득 코인</span>
                <span className="text-2xl font-bold font-mono text-amber-400 tabular-nums flex items-center gap-1">
                  <span>🪙</span>
                  <span>+{runCoins}</span>
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={startGame}
                className="px-8 py-3.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold rounded-xl shadow-lg shadow-cyan-500/20 transition-all transform hover:scale-105 active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <RotateCcw className="w-5 h-5" />
                <span>다시하기 (Space)</span>
              </button>

              <button
                onClick={onOpenShop}
                className="px-6 py-3.5 bg-slate-800 hover:bg-slate-700 text-white font-medium rounded-xl border border-slate-700 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <span>🛒 상점 & 강화</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* MOBILE / ON-SCREEN TOUCH ACTION BUTTONS */}
      <div className="mt-4 flex items-center justify-between gap-4">
        <button
          onClick={handleSlide}
          className="flex-1 py-3.5 px-4 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 active:border-amber-500 rounded-xl flex items-center justify-center gap-2 text-slate-200 active:bg-slate-850 active:scale-[0.98] transition-all cursor-pointer"
        >
          <ArrowDown className="w-5 h-5 text-amber-400" />
          <span className="font-semibold text-sm">슬라이딩 (S / ↓)</span>
        </button>

        <button
          onClick={handleJump}
          className="flex-1 py-3.5 px-4 bg-slate-900/90 hover:bg-slate-800 border border-slate-800 active:border-cyan-500 rounded-xl flex items-center justify-center gap-2 text-slate-200 active:bg-slate-850 active:scale-[0.98] transition-all cursor-pointer"
        >
          <ArrowUp className="w-5 h-5 text-cyan-400" />
          <span className="font-semibold text-sm">점프 / 2단 점프 (Space / ↑)</span>
        </button>
      </div>
    </div>
  );
};
