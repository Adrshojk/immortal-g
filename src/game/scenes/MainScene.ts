import Phaser from 'phaser';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { NPC } from '../entities/NPC';
import { TestArena } from '../world/TestArena';
import { PowerSystem } from '../systems/PowerSystem';
import { TimeSystem } from '../systems/TimeSystem';
import { DestructionSystem, DestructionState } from '../systems/DestructionSystem';
import { EventBus } from '../systems/EventBus';

export class MainScene extends Phaser.Scene {
  // Pure Simulation state
  private player!: Player;
  private enemy!: Enemy;
  private npc!: NPC;
  private arena!: TestArena;
  private powerSystem!: PowerSystem;
  private timeSystem!: TimeSystem;

  // Phaser Display objects
  private playerSprite!: Phaser.GameObjects.Sprite;
  private enemySprite!: Phaser.GameObjects.Sprite;
  private npcSprite!: Phaser.GameObjects.Rectangle;
  private arenaSprites: Map<string, Phaser.GameObjects.Container> = new Map();
  private groundSprites: Map<string, Phaser.GameObjects.Rectangle> = new Map();
  private particlePool!: Phaser.GameObjects.Group;

  // Developer labels
  private playerLabel!: Phaser.GameObjects.Text;
  private enemyLabel!: Phaser.GameObjects.Text;
  private npcLabel!: Phaser.GameObjects.Text;
  private platformLabels: Phaser.GameObjects.Text[] = [];
  private groundLabels: Map<string, Phaser.GameObjects.Text> = new Map();

  // Parallax & 3D depth layers
  private parallaxLayers: Phaser.GameObjects.Graphics[] = [];
  private playerShadow!: Phaser.GameObjects.Ellipse;

  // Power Focus tracking
  private isFocusingPower: boolean = false;
  private powerFocusTime: number = 0;
  private focusAuraGraphics!: Phaser.GameObjects.Graphics;

  // Controls
  private keys!: {
    A: Phaser.Input.Keyboard.Key;
    D: Phaser.Input.Keyboard.Key;
    W: Phaser.Input.Keyboard.Key;
    S: Phaser.Input.Keyboard.Key;
    Q: Phaser.Input.Keyboard.Key;
    E: Phaser.Input.Keyboard.Key;
    R: Phaser.Input.Keyboard.Key;
    F: Phaser.Input.Keyboard.Key;
    SPACE: Phaser.Input.Keyboard.Key;
    TAB: Phaser.Input.Keyboard.Key;
    LEFT: Phaser.Input.Keyboard.Key;
    RIGHT: Phaser.Input.Keyboard.Key;
    UP: Phaser.Input.Keyboard.Key;
    DOWN: Phaser.Input.Keyboard.Key;
  };

  // HUD & UI Elements
  private hudContainer!: Phaser.GameObjects.Container;
  private powerText!: Phaser.GameObjects.Text;
  private rewindText!: Phaser.GameObjects.Text;
  private debugOverlay!: Phaser.GameObjects.Container;
  private debugText!: Phaser.GameObjects.Text;
  private debugVisible: boolean = false;
  private rewindOverlay!: Phaser.GameObjects.Rectangle;

  // Event Log for Debug overlay
  private eventLog: string[] = [];

  constructor() {
    super('MainScene');
  }

  public preload(): void {
    // Load Kail character sheet and other assets from public directory
    this.load.image('kail_sheet', 'kail_spritesheet.jpg');
    this.load.image('oak_tree_raw', 'oak_tree.jpg');
    this.load.image('pine_tree_raw', 'pine_tree.jpg');
    this.load.image('stone_wall_raw', 'stone_wall.jpg');
    this.load.image('house_raw', 'house.jpg');
    this.load.image('enemy_raw', 'enemy.jpg');
  }

  public create(): void {
    // Clear static event bus to prevent duplicate listeners across scene resets / hot-reloads
    EventBus.clear();

    // Initialize Systems
    this.player = new Player();
    this.enemy = new Enemy();
    this.npc = new NPC();
    this.arena = new TestArena();
    this.powerSystem = new PowerSystem();
    this.timeSystem = new TimeSystem();

    // Create transparent version of Kail and other game assets dynamically
    this.createTransparentTexture(this, 'kail_transparent', 'kail_sheet');
    this.createTransparentTexture(this, 'oak_tree', 'oak_tree_raw');
    this.createTransparentTexture(this, 'pine_tree', 'pine_tree_raw');
    this.createTransparentTexture(this, 'stone_wall', 'stone_wall_raw');
    this.createTransparentTexture(this, 'house', 'house_raw');
    this.createTransparentTexture(this, 'enemy_sprite', 'enemy_raw');

    // Define frames on the new transparent texture based on the 1024x1024 sheet
    const kailTexture = this.textures.get('kail_transparent');
    if (kailTexture) {
      // Row 1 - Idle
      kailTexture.add('kail_idle', 0, 26, 26, 70, 153);
      // Row 2 - Walk
      kailTexture.add('kail_walk', 0, 24, 203, 75, 149);
      // Row 3 - Run
      kailTexture.add('kail_run', 0, 9, 383, 109, 131);
      // Row 4 - Jump
      kailTexture.add('kail_jump', 0, 397, 566, 86, 171);
      // Row 7 - Punch
      kailTexture.add('kail_punch', 0, 17, 856, 95, 165);
      // Row 7 - Rewind
      kailTexture.add('kail_rewind', 0, 641, 856, 109, 164);
    }

    // Set world size matching simulator (allows scrolling high into the sky)
    this.cameras.main.setBounds(0, -5000, 6400, 5600);
    this.physics.world.setBounds(0, -5000, 6400, 5600);

    // Create background sky/terrain grid
    this.createBackground();

    // Create Debris Particle Group
    this.particlePool = this.add.group();

    // Create Focus Aura Graphics overlay
    this.focusAuraGraphics = this.add.graphics();
    this.focusAuraGraphics.setVisible(false);

    // Create Arena Sprites
    this.createArenaObjects();

    // Create Platform Sprites
    this.createPlatforms();

    // Player ground shadow (rendered before entities so it's behind them)
    this.playerShadow = this.add.ellipse(this.player.x, 498, 40, 10, 0x000000, 0.35).setOrigin(0.5);

    // Create Entity Sprites
    this.playerSprite = this.add.sprite(this.player.x, this.player.y, 'kail_transparent', 'kail_idle').setOrigin(0.5);
    this.playerSprite.setScale(64 / 153); // Proportional scale based on idle frame height (153px down to 64px)

    this.enemySprite = this.add.sprite(this.enemy.x, this.enemy.y, 'enemy_sprite').setOrigin(0.5);
    this.enemySprite.setDisplaySize(this.enemy.width, this.enemy.height);

    this.npcSprite = this.add.rectangle(this.npc.x, this.npc.y, this.npc.width, this.npc.height, 0xffcc00).setOrigin(0.5);

    // Camera configuration — smooth follow with gentle lerp
    this.cameras.main.startFollow(this.playerSprite, true, 0.08, 0.06);
    this.cameras.main.setFollowOffset(0, -40); // Slight upward bias so player isn't dead-center

    // Keyboard configuration
    if (this.input.keyboard) {
      this.keys = {
        A: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A),
        D: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D),
        W: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.W),
        S: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.S),
        Q: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.Q),
        E: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.E),
        R: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.R),
        F: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.F),
        SPACE: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE),
        TAB: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.TAB),
        LEFT: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT),
        RIGHT: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT),
        UP: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.UP),
        DOWN: this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.DOWN)
      };

      // Set up simple keydown events for instant toggles
      this.keys.Q.on('down', () => {
        this.powerSystem.decreasePower();
        this.soundEffect(200, 0.1);
      });
      this.keys.E.on('down', () => {
        this.powerSystem.increasePower();
        this.soundEffect(400, 0.1);
      });
      this.keys.TAB.on('down', () => {
        this.debugVisible = !this.debugVisible;
        this.debugOverlay.setVisible(this.debugVisible);
      });
    }

    // Pointer mouse click input -> punch
    this.input.on('pointerdown', () => {
      this.performPlayerPunch();
    });

    // UI overlays
    this.createHUD();
    this.createRewindOverlay();

    // Event bus hooks for debug logging
    this.setupEventLogging();

    // Dev mode labels
    this.createDevLabels();
  }

  private createBackground(): void {
    // --- Parallax layer 0: Deep sky gradient ---
    const skyGfx = this.add.graphics();
    const skyH = 5600;
    const stripes = 40;
    for (let i = 0; i < stripes; i++) {
      const t = i / stripes;
      const r = Math.round(10 + t * 20);
      const g = Math.round(10 + t * 25);
      const b = Math.round(30 + t * 30);
      const color = (r << 16) | (g << 8) | b;
      skyGfx.fillStyle(color, 1);
      skyGfx.fillRect(0, -5000 + (skyH / stripes) * i, 6400, skyH / stripes + 1);
    }
    skyGfx.setScrollFactor(1, 1);

    // --- Parallax layer 1: Distant stars (moves slowest) ---
    const starLayer = this.add.graphics();
    starLayer.setScrollFactor(0.15, 0.15);
    for (let i = 0; i < 200; i++) {
      const sx = Math.random() * 7200 - 400;
      const sy = Math.random() * 3000 - 2000;
      const size = 0.5 + Math.random() * 1.5;
      const brightness = 0.3 + Math.random() * 0.7;
      starLayer.fillStyle(0xffffff, brightness);
      starLayer.fillCircle(sx, sy, size);
    }
    this.parallaxLayers.push(starLayer);

    // --- Parallax layer 2: Distant mountains (moves slowly) ---
    const mtGfx = this.add.graphics();
    mtGfx.setScrollFactor(0.3, 0.6);
    mtGfx.fillStyle(0x1a2840, 0.8);
    // Draw mountain silhouette
    const mtPoints = [
      { x: -200, y: 550 }, { x: 100, y: 300 }, { x: 350, y: 380 },
      { x: 600, y: 220 }, { x: 900, y: 340 }, { x: 1200, y: 260 },
      { x: 1500, y: 350 }, { x: 1800, y: 200 }, { x: 2100, y: 320 },
      { x: 2400, y: 250 }, { x: 2700, y: 310 }, { x: 3000, y: 280 },
      { x: 3300, y: 350 }, { x: 3600, y: 230 }, { x: 3900, y: 310 },
      { x: 4200, y: 190 }, { x: 4500, y: 290 }, { x: 4800, y: 240 },
      { x: 5100, y: 330 }, { x: 5400, y: 210 }, { x: 5700, y: 300 },
      { x: 6000, y: 260 }, { x: 6300, y: 340 }, { x: 6600, y: 550 }
    ];
    mtGfx.beginPath();
    mtGfx.moveTo(mtPoints[0].x, mtPoints[0].y);
    for (let i = 1; i < mtPoints.length; i++) {
      mtGfx.lineTo(mtPoints[i].x, mtPoints[i].y);
    }
    mtGfx.closePath();
    mtGfx.fillPath();
    this.parallaxLayers.push(mtGfx);

    // --- Parallax layer 3: Mid-ground hills ---
    const hillGfx = this.add.graphics();
    hillGfx.setScrollFactor(0.55, 0.75);
    hillGfx.fillStyle(0x1e3050, 0.7);
    hillGfx.beginPath();
    hillGfx.moveTo(-200, 550);
    for (let x = -200; x <= 6800; x += 80) {
      const h = 420 + Math.sin(x * 0.004) * 50 + Math.sin(x * 0.011) * 25;
      hillGfx.lineTo(x, h);
    }
    hillGfx.lineTo(6800, 550);
    hillGfx.closePath();
    hillGfx.fillPath();
    this.parallaxLayers.push(hillGfx);

    // --- Ground segments with 3D top-surface highlight ---
    for (let i = 0; i < 16; i++) {
      const id = `ground_${i}`;
      const layout = TestArena.getObjectLayout(id);
      // Main ground body
      const rect = this.add.rectangle(layout.x, layout.y, layout.w, layout.h, 0x2e3b4e).setOrigin(0.5);
      rect.setStrokeStyle(1, 0x3e4d60);
      this.groundSprites.set(id, rect);

      // 3D top surface highlight
      const topHighlight = this.add.rectangle(
        layout.x, layout.y - layout.h / 2 + 3, layout.w, 6, 0x4a6580
      ).setOrigin(0.5).setAlpha(0.7);
      topHighlight.setData('groundId', id);
    }
  }

  private createPlatforms(): void {
    TestArena.PLATFORMS.forEach(plat => {
      // Bottom shadow for 3D depth
      this.add.rectangle(plat.x + 3, plat.y + 4, plat.w, plat.h, 0x000000, 0.3).setOrigin(0.5);
      // Main body
      const rect = this.add.rectangle(plat.x, plat.y, plat.w, plat.h, 0x475569).setOrigin(0.5);
      rect.setStrokeStyle(2, 0x64748b);
      // Top surface highlight
      this.add.rectangle(plat.x, plat.y - plat.h / 2 + 3, plat.w - 4, 5, 0x6b8aad, 0.6).setOrigin(0.5);
    });
  }

  private createArenaObjects(): void {
    this.arena.objects.forEach(obj => {
      if (obj.id.startsWith('ground_')) return; // Skipped, ground is rendered by createBackground

      const layout = TestArena.getObjectLayout(obj.id);

      const container = this.add.container(layout.x, layout.y);
      // Determine if this object has a custom sprite texture
      let textureKey = '';
      if (obj.id.startsWith('house')) textureKey = 'house';
      else if (obj.id.startsWith('wall')) textureKey = 'stone_wall';
      else if (obj.id === 'tree_1') textureKey = 'oak_tree';
      else if (obj.id === 'tree_2') textureKey = 'pine_tree';
      
      if (textureKey !== '') {
        const sprite = this.add.sprite(0, 0, textureKey).setOrigin(0.5);
        sprite.setDisplaySize(layout.w, layout.h);
        sprite.setName('sprite');
        
        const text = this.add.text(0, -layout.h / 2 - 10, obj.name, { fontSize: '12px', color: '#ffffff' }).setOrigin(0.5);
        container.add([sprite, text]);
      } else {
        // Drop shadow for 3D depth
        const shadow = this.add.rectangle(3, 4, layout.w, layout.h, 0x000000, 0.25).setOrigin(0.5);
        shadow.setName('shadow');
        // Main body
        const rect = this.add.rectangle(0, 0, layout.w, layout.h, this.getObjectColor(obj.id, obj.state)).setOrigin(0.5);
        rect.setName('rect');
        // Top edge highlight
        const highlight = this.add.rectangle(0, -layout.h / 2 + 2, layout.w - 4, 4, 0xffffff, 0.12).setOrigin(0.5);
        highlight.setName('highlight');
        const text = this.add.text(0, -layout.h / 2 - 10, obj.name, { fontSize: '12px', color: '#ffffff' }).setOrigin(0.5);

        container.add([shadow, rect, highlight, text]);
      }
      this.arenaSprites.set(obj.id, container);
    });
  }

  private getObjectColor(id: string, state: DestructionState): number {
    if (state === DestructionState.DESTROYED) return 0x000000;
    
    // Base colors
    let baseColor = 0x8b5a2b; // Brown / Wood
    if (id.startsWith('house')) baseColor = 0x4682b4; // Steel Blue
    if (id.startsWith('wall')) baseColor = 0x808080; // Gray
    if (id.startsWith('tree')) baseColor = 0x228b22; // Forest Green
    if (id.startsWith('boulder')) baseColor = 0x6b7b8d; // Slate
    if (id.startsWith('fort_wall') || id.startsWith('fort_gate')) baseColor = 0x5a5a6e; // Dark Stone
    if (id.startsWith('tower')) baseColor = 0x4a4a5e; // Dark Fortress
    if (id.startsWith('barrel')) baseColor = 0x8b6914; // Dark Gold
    if (id.startsWith('pillar')) baseColor = 0x9ca3af; // Light Stone
    if (id.startsWith('ruin_wall') || id.startsWith('ruin')) baseColor = 0x7a8070; // Mossy Stone
    if (id.startsWith('statue')) baseColor = 0xb0b8c8; // Pale Marble

    // Decay colors depending on state
    switch (state) {
      case DestructionState.DAMAGED:
        return Phaser.Display.Color.Interpolate.ColorWithColor(
          Phaser.Display.Color.ValueToColor(baseColor),
          Phaser.Display.Color.ValueToColor(0xffa500), // Orange
          100, 50
        ).color;
      case DestructionState.FRACTURED:
        return 0xd2691e; // Chocolate/Rust
      default:
        return baseColor;
    }
  }

  private createHUD(): void {
    this.hudContainer = this.add.container(0, 0).setScrollFactor(0);

    // Black semi-transparent banner at the top
    const banner = this.add.rectangle(400, 40, 800, 80, 0x000000, 0.6);
    
    this.powerText = this.add.text(20, 20, 'POWER: 100', {
      fontSize: '24px',
      color: '#00ffcc',
      fontStyle: 'bold'
    });

    this.rewindText = this.add.text(780, 20, 'REWIND: READY', {
      fontSize: '24px',
      color: '#ffcc00',
      fontStyle: 'bold'
    }).setOrigin(1, 0);

    const helpText = this.add.text(400, 60, 'A/D: Move | SPACE: Jump | Q/E: Power | F/Click: Punch | Hold R: Rewind | TAB: Debug', {
      fontSize: '12px',
      color: '#aaaaaa'
    }).setOrigin(0.5);

    this.hudContainer.add([banner, this.powerText, this.rewindText, helpText]);

    // Debug Overlay
    this.debugOverlay = this.add.container(0, 0).setScrollFactor(0).setVisible(false);
    const debugBg = this.add.rectangle(150, 300, 300, 400, 0x000000, 0.85);
    this.debugText = this.add.text(15, 110, '', {
      fontSize: '11px',
      color: '#00ff00',
      fontFamily: 'monospace',
      lineSpacing: 4
    });
    this.debugOverlay.add([debugBg, this.debugText]);
  }

  private createRewindOverlay(): void {
    // Flashy full-screen blue tint when rewinding
    this.rewindOverlay = this.add.rectangle(400, 300, 800, 600, 0x0066ff, 0.15)
      .setScrollFactor(0)
      .setVisible(false);
  }

  private setupEventLogging(): void {
    const logEvent = (name: string, data: any) => {
      this.eventLog.push(`[${new Date().toLocaleTimeString()}] ${name}: ${JSON.stringify(data)}`);
      if (this.eventLog.length > 8) this.eventLog.shift();
    };

    EventBus.on('PLAYER_ATTACK', (e) => logEvent('PLAYER_ATTACK', e.payload));
    EventBus.on('ENTITY_HIT', (e) => logEvent('ENTITY_HIT', e.payload));
    EventBus.on('ENTITY_KNOCKED_BACK', (e) => logEvent('ENTITY_KNOCKBACK', e.payload));
    EventBus.on('ENTITY_DESTROYED', (e) => logEvent('ENTITY_DESTROYED', e.payload));
    EventBus.on('NPC_FRIGHTENED', (e) => logEvent('NPC_FRIGHTENED', e.payload));
    EventBus.on('WORLD_OBJECT_CHANGED', (e) => logEvent('WORLD_CHANGE', e.payload));
  }

  public update(_time: number, delta: number): void {
    const dt = delta / 1000;

    // Read Key States
    const left = this.keys && (this.keys.A.isDown || this.keys.LEFT.isDown);
    const right = this.keys && (this.keys.D.isDown || this.keys.RIGHT.isDown);
    const jump = this.keys && (this.keys.SPACE.isDown || this.keys.W.isDown || this.keys.UP.isDown);
    const down = this.keys && (this.keys.S.isDown || this.keys.DOWN.isDown);
    const rewind = this.keys && this.keys.R.isDown;
    const hasHistory = this.timeSystem.getHistoryLength() > 0;

    if (rewind && hasHistory) {
      // 1. Pause normal simulation and step backward through history
      this.timeSystem.startRewind();
      this.rewindOverlay.setVisible(true);
      this.rewindText.setText('REWIND: ACTIVE');
      this.rewindText.setColor('#ff3333');

      const snapshot = this.timeSystem.stepRewind();
      if (snapshot) {
        this.restoreSimulationState(snapshot);
      } else {
        // No snapshots left
        this.timeSystem.stopRewind();
        this.rewindOverlay.setVisible(false);
        this.rewindText.setText('REWIND: READY');
        this.rewindText.setColor('#ffcc00');
      }
    } else {
      // Normal game flow
      if (this.timeSystem.isTimeRewinding()) {
        this.timeSystem.stopRewind();
        this.rewindOverlay.setVisible(false);
        this.rewindText.setText('REWIND: READY');
        this.rewindText.setColor('#ffcc00');
      }

      // Power Focus tracking
      let activePowerScale = this.powerSystem.getPowerScale();
      if (this.keys && this.keys.F.isDown) {
        if (!this.isFocusingPower) {
          this.isFocusingPower = true;
          this.powerFocusTime = 0;
          this.focusAuraGraphics.setVisible(true);
        }
        this.powerFocusTime += dt;
        activePowerScale = this.powerSystem.calculatePower(this.powerFocusTime);
        this.updateFocusFeedback();
      } else {
        if (this.isFocusingPower) {
          this.isFocusingPower = false;
          this.focusAuraGraphics.setVisible(false);
          this.focusAuraGraphics.clear();
          const finalPower = this.powerSystem.calculatePower(this.powerFocusTime);
          this.performPlayerPunch(finalPower);
          
          // Restore any offset platforms/containers
          this.arena.objects.forEach(obj => {
            const container = this.arenaSprites.get(obj.id);
            const layout = TestArena.getObjectLayout(obj.id);
            if (container) {
              container.x = layout.x;
              container.y = layout.y;
            }
          });
        }
      }

      // Record snapshot periodically (every frame in the prototype)
      const playerSnap = this.player.getState(activePowerScale);
      const entitiesSnap = [this.enemy.getState(), this.npc.getState()];
      const worldSnap = this.arena.getState();
      this.timeSystem.record(playerSnap, entitiesSnap, worldSnap);

      // Update Simulation states
      this.player.update(dt, { left, right, jump, down }, activePowerScale, this.arena);
      this.enemy.update(dt, this.player.x, this.player.y, this.arena);
      this.npc.update(dt, this.player.x, this.arena);

      // Check collision details
      this.checkSimulationCollisions();

      // Tick System clock
      this.timeSystem.tick();
    }

    // Synchronize Display sprites with simulation data
    this.syncDisplay();

    // Update HUD & Debug Info
    this.updateHUD();
  }

  private performPlayerPunch(forcedPower?: number): void {
    if (this.player.punch()) {
      const power = forcedPower !== undefined ? forcedPower : this.powerSystem.getPowerScale();
      const action = this.powerSystem.createPowerResult(power, 'punch');
      
      // Target bounds check: if infinity power, destroy the entire world instantly
      if (action.destructionLevel === 5) {
        this.cameras.main.flash(500, 255, 255, 255);
        this.cameras.main.shake(500, 0.08);
        this.soundEffect(50, 0.8);
        EventBus.emit('WORLD_DESTROYED', { timestamp: Date.now() });

        if (this.enemy.currentStateName !== 'defeated') {
          this.enemy.takeImpact(1000, 2000, this.player.facingDir);
        }
        this.npc.triggerFear(999999);
        this.arena.objects.forEach(obj => {
          if (obj.state !== DestructionState.DESTROYED) {
            const layout = TestArena.getObjectLayout(obj.id);
            const res = DestructionSystem.applyForce(obj, action.force, action.destructionLevel);
            if (res.stateChanged) {
              this.spawnDebris(layout.x, layout.y, 15);
            }
          }
        });
        return;
      }

      // Emit attack event
      EventBus.emit('PLAYER_ATTACK', {
        powerScale: action.force,
        x: this.player.x,
        y: this.player.y,
        dir: this.player.facingDir
      });

      // Target bounds check: box in front of player
      const punchRange = action.radius;
      const punchBox = {
        x: this.player.facingDir > 0 ? this.player.x : this.player.x - punchRange,
        y: this.player.y - this.player.height,
        w: punchRange,
        h: this.player.height * 2
      };

      // Shake camera depending on power scale
      const shakeIntensity = Math.min(0.05, (action.force / 10000) * 0.05);
      if (shakeIntensity > 0) {
        this.cameras.main.shake(150, shakeIntensity);
      }

      // Punch Sound / visual cues
      this.soundEffect(100 + action.force * 0.1, 0.15);

      // Check Enemy Hit
      if (this.enemy.currentStateName !== 'defeated') {
        const eBox = {
          x: this.enemy.x - this.enemy.width / 2,
          y: this.enemy.y - this.enemy.height / 2,
          w: this.enemy.width,
          h: this.enemy.height
        };

        if (this.checkOverlap(punchBox, eBox)) {
          this.enemy.takeImpact(action.force, action.knockback, this.player.facingDir);
        }
      }

      // Check NPC Hit (Can scare or push them slightly, NPCs don't have health but react)
      const nBox = {
        x: this.npc.x - this.npc.width / 2,
        y: this.npc.y - this.npc.height / 2,
        w: this.npc.width,
        h: this.npc.height
      };
      if (this.checkOverlap(punchBox, nBox)) {
        this.npc.triggerFear(action.force);
      }

      // Check Destructibles
      this.arena.objects.forEach(obj => {
        if (obj.state === DestructionState.DESTROYED) return;

        const layout = TestArena.getObjectLayout(obj.id);
        const objBox = {
          x: layout.x - layout.w / 2,
          y: layout.y - layout.h / 2,
          w: layout.w,
          h: layout.h
        };

        if (this.checkOverlap(punchBox, objBox)) {
          const res = DestructionSystem.applyForce(obj, action.force, action.destructionLevel);
          if (res.stateChanged) {
            this.spawnDebris(layout.x, layout.y, res.debrisCount);
          }
        }
      });
    }
  }

  private checkSimulationCollisions(): void {
    // Simple collision: Enemy pushing player or vice-versa
    const dist = Math.abs(this.player.x - this.enemy.x);
    if (dist < 30 && this.enemy.currentStateName === 'attack') {
      // Enemy hit player
      // Since player is immortal, no HP loss, but push them back slightly
      this.player.x += this.enemy.facingDir * 5;
    }

    // High speed ramming check (damage on impact when moving fast)
    const speed = Math.abs(this.player.vx);
    if (speed >= 300) {
      const pBox = {
        x: this.player.x - this.player.width / 2,
        y: this.player.y - this.player.height / 2,
        w: this.player.width,
        h: this.player.height
      };

      // 1. Check enemy collision
      if (this.enemy.currentStateName !== 'defeated') {
        const eBox = {
          x: this.enemy.x - this.enemy.width / 2,
          y: this.enemy.y - this.enemy.height / 2,
          w: this.enemy.width,
          h: this.enemy.height
        };
        if (this.checkOverlap(pBox, eBox)) {
          const power = this.powerSystem.getPowerScale();
          const force = power * 2;
          this.enemy.takeImpact(force, 300, this.player.vx > 0 ? 1 : -1);
          this.soundEffect(350, 0.2);
          this.cameras.main.shake(120, 0.02);
          this.eventLog.push(`Kail rammed Enemy at speed ${Math.round(this.player.vx)}!`);
        }
      }

      // 2. Check NPC collision
      const nBox = {
        x: this.npc.x - this.npc.width / 2,
        y: this.npc.y - this.npc.height / 2,
        w: this.npc.width,
        h: this.npc.height
      };
      if (this.checkOverlap(pBox, nBox)) {
        this.npc.triggerFear(this.powerSystem.getPowerScale());
      }

      // 3. Check Destructibles collision (Ramming structural segments & blocks)
      this.arena.objects.forEach(obj => {
        if (obj.state === DestructionState.DESTROYED) return;
        const layout = TestArena.getObjectLayout(obj.id);
        const objBox = {
          x: layout.x - layout.w / 2,
          y: layout.y - layout.h / 2,
          w: layout.w,
          h: layout.h
        };
        if (this.checkOverlap(pBox, objBox)) {
          const action = this.powerSystem.getAction('punch');
          const res = DestructionSystem.applyForce(obj, action.force, action.destructionLevel);
          if (res.stateChanged) {
            this.spawnDebris(layout.x, layout.y, res.debrisCount);
            this.soundEffect(180, 0.15);
            this.cameras.main.shake(80, 0.01);
            this.eventLog.push(`Kail shattered ${obj.name} via high-speed collision!`);
          }
        }
      });
    }
  }

  private checkOverlap(rect1: { x: number; y: number; w: number; h: number }, rect2: { x: number; y: number; w: number; h: number }): boolean {
    return (
      rect1.x < rect2.x + rect2.w &&
      rect1.x + rect1.w > rect2.x &&
      rect1.y < rect2.y + rect2.h &&
      rect1.y + rect1.h > rect2.y
    );
  }

  private spawnDebris(x: number, y: number, count: number): void {
    const colors = [0x8b5a2b, 0xa0704a, 0x6b4226, 0xd2691e];
    for (let i = 0; i < count; i++) {
      const size = 3 + Math.random() * 9;
      const color = colors[Math.floor(Math.random() * colors.length)];
      const shard = this.add.rectangle(x, y, size, size, color);
      shard.setAngle(Math.random() * 360);

      this.physics.add.existing(shard);
      const body = shard.body as Phaser.Physics.Arcade.Body;

      body.setVelocity(
        (Math.random() - 0.5) * 400,
        -Math.random() * 350 - 120
      );
      body.setGravityY(900);
      body.setAngularVelocity((Math.random() - 0.5) * 600);

      this.particlePool.add(shard);

      // Smooth fade-out over lifetime
      this.tweens.add({
        targets: shard,
        alpha: 0,
        scaleX: 0.2,
        scaleY: 0.2,
        duration: 1400 + Math.random() * 400,
        ease: 'Power2',
        onComplete: () => shard.destroy()
      });
    }
  }

  private syncDisplay(): void {
    // Entities
    this.playerSprite.setPosition(this.player.x, this.player.y);
    this.enemySprite.setPosition(this.enemy.x, this.enemy.y);
    this.npcSprite.setPosition(this.npc.x, this.npc.y);

    // Player shadow — follows x, sits on ground, scales with height
    const groundY = 498;
    const heightAboveGround = Math.max(0, groundY - this.player.y);
    const shadowScale = Math.max(0.3, 1.0 - heightAboveGround / 400);
    const shadowAlpha = Math.max(0.05, 0.35 - heightAboveGround / 600);
    this.playerShadow.setPosition(this.player.x, groundY);
    this.playerShadow.setScale(shadowScale, shadowScale * 0.5);
    this.playerShadow.setAlpha(shadowAlpha);

    // Smooth sprite scale breathing (subtle idle pulse)
    const baseScale = 64 / 153;
    const breathe = 1.0 + Math.sin(this.time.now * 0.003) * 0.008;
    this.playerSprite.setScale(baseScale * breathe);

    // Swap Player frames based on movement state
    if (this.player.isPunching) {
      this.playerSprite.setFrame('kail_punch');
    } else if (this.timeSystem.isTimeRewinding()) {
      this.playerSprite.setFrame('kail_rewind');
    } else if (this.player.vy < 0) {
      this.playerSprite.setFrame('kail_jump');
    } else if (Math.abs(this.player.vx) > 0) {
      this.playerSprite.setFrame(Math.abs(this.player.vx) > 150 ? 'kail_run' : 'kail_walk');
    } else {
      this.playerSprite.setFrame('kail_idle');
    }

    // Flip Player direction
    this.playerSprite.setFlipX(this.player.facingDir < 0);

    // Smooth lean angle when moving fast
    const leanAngle = Phaser.Math.Clamp(this.player.vx * 0.008, -8, 8);
    this.playerSprite.setAngle(leanAngle);

    // Rotate or flip other entities based on direction
    this.enemySprite.setFlipX(this.enemy.facingDir < 0);
    this.npcSprite.setScale(this.npc.facingDir, 1);

    // Apply alpha / visual states based on health/damage
    if (this.enemy.currentStateName === 'defeated') {
      this.enemySprite.setAngle(90);
      this.enemySprite.setAlpha(0.6);
    } else if (this.enemy.currentStateName === 'knocked_back') {
      this.enemySprite.setAngle(this.enemy.facingDir * -15);
      this.enemySprite.setAlpha(0.9);
    } else {
      this.enemySprite.setAngle(0);
      this.enemySprite.setAlpha(1.0);
    }

    if (this.npc.currentStateName === 'fleeing') {
      this.npcSprite.setAlpha(0.9);
      this.npcSprite.setFillStyle(0xff33cc); // Pink color when fleeing
    } else if (this.npc.currentStateName === 'alert') {
      this.npcSprite.setFillStyle(0xff9900); // Orange color when alert
    } else {
      this.npcSprite.setFillStyle(0xffcc00); // Yellow when patrolling
      this.npcSprite.setAlpha(1.0);
    }

    // Destructibles
    this.arena.objects.forEach(obj => {
      if (obj.id.startsWith('ground_')) return; // Skipped, handled below
      const container = this.arenaSprites.get(obj.id);
      if (container) {
        if (obj.state === DestructionState.DESTROYED) {
          container.setVisible(false);
        } else {
          container.setVisible(true);
          const sprite = container.list.find(c => c.name === 'sprite') as Phaser.GameObjects.Sprite | undefined;
          const rect = container.list.find(c => c.name === 'rect') as Phaser.GameObjects.Rectangle | undefined;
          
          if (sprite) {
            if (obj.state === DestructionState.DAMAGED) {
              sprite.setTint(0xffa500); // Orange tint
            } else if (obj.state === DestructionState.FRACTURED) {
              sprite.setTint(0xd2691e); // Rust tint
            } else {
              sprite.clearTint();
            }
          } else if (rect) {
            rect.setFillStyle(this.getObjectColor(obj.id, obj.state));
          }
        }
      }
    });

    // Ground Floor Segments Sync
    for (let i = 0; i < 16; i++) {
      const id = `ground_${i}`;
      const rect = this.groundSprites.get(id);
      const obj = this.arena.objects.find(o => o.id === id);
      if (rect && obj) {
        if (obj.state === DestructionState.DESTROYED) {
          rect.setVisible(false);
        } else {
          rect.setVisible(true);
          if (obj.state === DestructionState.DAMAGED) {
            rect.setFillStyle(0xd2691e); // rusty orange
          } else if (obj.state === DestructionState.FRACTURED) {
            rect.setFillStyle(0x8b4513); // dark saddle brown
          } else {
            rect.setFillStyle(0x2e3b4e); // standard ground color
          }
        }
      }
    }

    // Sync Label Positions & visibility
    if (this.playerLabel) {
      this.playerLabel.setPosition(this.player.x, this.player.y - 50);
    }
    if (this.enemyLabel) {
      this.enemyLabel.setPosition(this.enemy.x, this.enemy.y - 40);
      if (this.enemy.currentStateName === 'defeated') {
        this.enemyLabel.setText('ENEMY (DEFEATED)');
      } else {
        this.enemyLabel.setText('ENEMY');
      }
    }
    if (this.npcLabel) {
      this.npcLabel.setPosition(this.npc.x, this.npc.y - 40);
    }

    // Ground Labels Visibility
    for (let i = 0; i < 8; i++) {
      const id = `ground_${i}`;
      const lbl = this.groundLabels.get(id);
      const obj = this.arena.objects.find(o => o.id === id);
      if (lbl && obj) {
        if (obj.state === DestructionState.DESTROYED) {
          lbl.setVisible(false);
        } else {
          lbl.setVisible(true);
        }
      }
    }
  }

  private restoreSimulationState(snapshot: any): void {
    this.player.restoreState(snapshot.player);
    
    // Find states by array order or target mapping
    const [enemyState, npcState] = snapshot.entities;
    if (enemyState) this.enemy.restoreState(enemyState);
    if (npcState) this.npc.restoreState(npcState);
    
    this.arena.restoreState(snapshot.world);
  }

  private updateHUD(): void {
    const scale = this.powerSystem.getPowerScale();
    let powerStr = scale === 999999 ? 'INFINITY' : scale.toString();
    
    if (this.isFocusingPower) {
      const focusPower = this.powerSystem.calculatePower(this.powerFocusTime);
      const pct = Math.min(100, Math.round((this.powerFocusTime / 2.0) * 100));
      powerStr = `FOCUSING: ${focusPower} (${pct}%)`;
    }
    this.powerText.setText(`POWER: ${powerStr}`);

    // Update debug text details
    if (this.debugVisible) {
      const playerStateStr = `Player: x=${this.player.x.toFixed(1)}, y=${this.player.y.toFixed(1)}`;
      const enemyStateStr = `Enemy: health=${this.enemy.health}, state=${this.enemy.currentStateName}`;
      const npcStateStr = `NPC: state=${this.npc.currentStateName}, fear=${this.npc.fearLevel.toFixed(0)}`;
      const simStr = `Tick: ${this.timeSystem.getCurrentTick()}`;
      const histStr = `Rewind History: ${this.timeSystem.getHistoryLength()} / 600`;
      
      const logStr = this.eventLog.join('\n');
      
      this.debugText.setText(
        `[DEVELOPER DEBUG MODE]\n\n` +
        `${simStr}\n` +
        `${histStr}\n\n` +
        `${playerStateStr}\n` +
        `${enemyStateStr}\n` +
        `${npcStateStr}\n\n` +
        `Recent Events:\n${logStr}`
      );
    }
  }

  // A very simple procedural web audio oscillator for mock sound effects
  private soundEffect(frequency: number, duration: number): void {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.frequency.setValueAtTime(frequency, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // AudioContext not allowed / supported
    }
  }

  private createTransparentTexture(scene: Phaser.Scene, key: string, originalKey: string): void {
    const originalTexture = scene.textures.get(originalKey);
    const image = originalTexture.getSourceImage() as HTMLImageElement | HTMLCanvasElement;
    
    const canvas = document.createElement('canvas');
    canvas.width = image.width;
    canvas.height = image.height;
    
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(image, 0, 0);
      
      const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imgData.data;
      
      // Sample background color (corner for generic assets, custom coord for kail_sheet)
      const sampleX = originalKey === 'kail_sheet' ? 390 : 5;
      const sampleY = originalKey === 'kail_sheet' ? 250 : 5;
      const samplePixelIdx = (sampleY * canvas.width + sampleX) * 4;
      
      const targetR = data[samplePixelIdx];
      const targetG = data[samplePixelIdx + 1];
      const targetB = data[samplePixelIdx + 2];
      
      const tolerance = 40; // Tolerate variations in compressed JPEG background
      
      for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i+1];
        const b = data[i+2];
        
        // Calculate difference
        if (
          Math.abs(r - targetR) < tolerance &&
          Math.abs(g - targetG) < tolerance &&
          Math.abs(b - targetB) < tolerance
        ) {
          data[i+3] = 0; // Make pixel transparent
        }
      }
      
      ctx.putImageData(imgData, 0, 0);
      scene.textures.addCanvas(key, canvas);
    }
  }

  private createDevLabels(): void {
    // Player Label
    this.playerLabel = this.add.text(this.player.x, this.player.y - 50, 'KAIL (PLAYER)', {
      fontSize: '11px',
      color: '#00ffff',
      backgroundColor: '#00000088',
      padding: { x: 4, y: 2 }
    }).setOrigin(0.5);

    // Enemy Label
    this.enemyLabel = this.add.text(this.enemy.x, this.enemy.y - 40, 'ENEMY', {
      fontSize: '11px',
      color: '#ff3333',
      backgroundColor: '#00000088',
      padding: { x: 4, y: 2 }
    }).setOrigin(0.5);

    // NPC Label
    this.npcLabel = this.add.text(this.npc.x, this.npc.y - 40, 'NPC', {
      fontSize: '11px',
      color: '#ffcc00',
      backgroundColor: '#00000088',
      padding: { x: 4, y: 2 }
    }).setOrigin(0.5);

    // Platform Labels
    TestArena.PLATFORMS.forEach(plat => {
      const lbl = this.add.text(plat.x, plat.y - 25, `PLAT: ${plat.id.toUpperCase()}`, {
        fontSize: '10px',
        color: '#a0aec0',
        backgroundColor: '#00000044',
        padding: { x: 3, y: 1 }
      }).setOrigin(0.5);
      this.platformLabels.push(lbl);
    });

    // Ground Segment Labels
    for (let i = 0; i < 16; i++) {
      const id = `ground_${i}`;
      const layout = TestArena.getObjectLayout(id);
      const lbl = this.add.text(layout.x, 480, `GROUND SEG ${i + 1}`, {
        fontSize: '9px',
        color: '#718096',
        backgroundColor: '#00000044',
        padding: { x: 2, y: 1 }
      }).setOrigin(0.5);
      this.groundLabels.set(id, lbl);
    }
  }

  private updateFocusFeedback(): void {
    // 1. Aura drawing (shrinks from huge/chaotic to tight/focused)
    this.focusAuraGraphics.clear();
    const radius = Math.max(15, 80 - Math.min(1.0, this.powerFocusTime / 2.0) * 65);
    
    // Draw neon cyan circle around the player
    this.focusAuraGraphics.lineStyle(2, 0x00ffff, 0.8);
    this.focusAuraGraphics.fillStyle(0x00ffff, 0.15 + Math.sin(this.time.now / 100) * 0.05);
    this.focusAuraGraphics.fillCircle(this.player.x, this.player.y, radius);
    this.focusAuraGraphics.strokeCircle(this.player.x, this.player.y, radius);
    
    // 2. Camera shake decreases as focus increases
    const shakeAmount = Math.max(0, 0.02 - (this.powerFocusTime / 2.0) * 0.02);
    if (shakeAmount > 0.001) {
      this.cameras.main.shake(16, shakeAmount);
    }
    
    // 3. Audio hum pitch falls as power is restrained
    if (this.time.now % 100 < 20) {
      this.soundEffect(Math.max(80, 600 - this.powerFocusTime * 250), 0.06);
    }

    // 4. Particle sparks reduce over focus duration
    const particleCount = Math.max(0, Math.floor(6 - this.powerFocusTime * 3));
    for (let i = 0; i < particleCount; i++) {
      const px = this.player.x + (Math.random() - 0.5) * radius * 1.5;
      const py = this.player.y + (Math.random() - 0.5) * radius * 1.5;
      const size = 2 + Math.random() * 4;
      const spark = this.add.rectangle(px, py, size, size, 0x00ffff);
      this.time.delayedCall(100 + Math.random() * 150, () => spark.destroy());
    }

    // 5. Shaking of nearby objects calms down as force becomes concentrated
    this.arena.objects.forEach(obj => {
      if (obj.state === DestructionState.DESTROYED) return;
      const layout = TestArena.getObjectLayout(obj.id);
      const container = this.arenaSprites.get(obj.id);
      if (container) {
        const dist = Phaser.Math.Distance.Between(this.player.x, this.player.y, layout.x, layout.y);
        if (dist < radius * 1.8) {
          const shakeVal = Math.max(0, 6 - this.powerFocusTime * 3) * (1 - dist / (radius * 1.8));
          container.x = layout.x + (Math.random() - 0.5) * shakeVal;
          container.y = layout.y + (Math.random() - 0.5) * shakeVal;
        } else {
          container.x = layout.x;
          container.y = layout.y;
        }
      }
    });
  }
}
