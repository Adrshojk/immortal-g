import { EventBus } from '../systems/EventBus';
import { TestArena } from '../world/TestArena';

export type NPCStateName = 'idle' | 'patrol' | 'alert' | 'fleeing';

export interface NPCState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  facingDir: number;
  currentStateName: NPCStateName;
  fearLevel: number;
  targetX: number;
  calmTimer: number;
  patrolTimer: number;
}

export class NPC {
  public id: string = 'npc_1';
  public x: number = 600;
  public y: number = 400;
  public vx: number = 0;
  public vy: number = 0;
  public width: number = 32;
  public height: number = 64;
  public facingDir: number = 1;
  public currentStateName: NPCStateName = 'patrol';
  
  public fearLevel: number = 0; // 0 to 100
  public targetX: number = 600;
  public calmTimer: number = 0;
  public patrolTimer: number = 0;
  
  private patrolSpeed: number = 60;
  private fleeSpeed: number = 180;
  private gravity: number = 1200;

  constructor() {
    this.setupListeners();
  }

  private setupListeners(): void {
    // React to global game events
    EventBus.on('PLAYER_ATTACK', (event) => {
      const { powerScale, x: px } = event.payload;
      const dist = Math.abs(px - this.x);
      if (dist < 400) {
        if (powerScale >= 1000) {
          this.triggerFear(100);
        } else if (powerScale >= 100) {
          this.triggerFear(60);
        } else if (powerScale >= 10) {
          this.triggerFear(30);
        }
      }
    });

    EventBus.on('WORLD_OBJECT_CHANGED', (event) => {
      const { debrisCount } = event.payload;
      if (debrisCount > 0) {
        // Impact occurred nearby!
        this.triggerFear(debrisCount * 10);
      }
    });
  }

  public triggerFear(amount: number): void {
    this.fearLevel = Math.min(100, this.fearLevel + amount);
    if (this.fearLevel >= 50) {
      this.currentStateName = 'fleeing';
      this.calmTimer = 4.0; // Flee for 4 seconds
      // Flee away from Player
      EventBus.emit('NPC_FRIGHTENED', { entityId: this.id, fearLevel: this.fearLevel });
    } else if (this.fearLevel >= 20 && this.currentStateName !== 'fleeing') {
      this.currentStateName = 'alert';
      this.calmTimer = 2.0; // Stay alert for 2 seconds
    }
  }

  public update(dt: number, playerX: number, arena: TestArena): void {
    // Decaying fear/timers
    if (this.calmTimer > 0) {
      this.calmTimer -= dt;
      if (this.calmTimer <= 0) {
        this.fearLevel = 0;
        this.currentStateName = 'patrol';
        this.chooseNewPatrolTarget();
      }
    }

    if (this.currentStateName === 'fleeing') {
      // Flee in direction opposite of player
      const fleeDir = this.x > playerX ? 1 : -1;
      this.facingDir = fleeDir;
      this.vx = fleeDir * this.fleeSpeed;
    } else if (this.currentStateName === 'alert') {
      // Face the player, remain stationary
      this.facingDir = this.x < playerX ? 1 : -1;
      this.vx = 0;
    } else {
      // Patrol behavior
      this.patrolTimer -= dt;
      if (this.patrolTimer <= 0 || Math.abs(this.x - this.targetX) < 10) {
        this.chooseNewPatrolTarget();
      }

      const dx = this.targetX - this.x;
      this.facingDir = dx > 0 ? 1 : -1;
      this.vx = this.facingDir * this.patrolSpeed;
    }

    // Apply physics
    const landedY = TestArena.checkPlatformLanding(this.x, this.y, this.width, this.height, this.vy);
    const groundLandedY = arena.checkGroundLanding(this.x, this.y, this.width, this.height, this.vy);
    
    if (landedY !== null) {
      this.vy = 0;
      this.y = landedY - this.height / 2;
    } else if (groundLandedY !== null) {
      this.vy = 0;
      this.y = groundLandedY - this.height / 2;
    } else {
      this.vy += this.gravity * dt;
    }

    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Void check
    if (this.y > 650) {
      this.x = 600;
      this.y = 400;
      this.vy = 0;
      this.vx = 0;
      this.currentStateName = 'patrol';
      this.fearLevel = 0;
    }

    // Bounds check
    if (this.x < 50) {
      this.x = 50;
      if (this.currentStateName === 'fleeing') {
        // Try fleeing the other way if blocked
        this.targetX = 3100;
        this.vx = this.fleeSpeed;
      }
    }
    if (this.x > 6350) {
      this.x = 6350;
      if (this.currentStateName === 'fleeing') {
        this.targetX = 50;
        this.vx = -this.fleeSpeed;
      }
    }
  }

  private chooseNewPatrolTarget(): void {
    // Patrol around spawn area (500 to 900)
    this.targetX = 500 + Math.random() * 400;
    this.patrolTimer = 2.0 + Math.random() * 3.0;
  }

  public getState(): NPCState {
    return {
      x: this.x,
      y: this.y,
      vx: this.vx,
      vy: this.vy,
      facingDir: this.facingDir,
      currentStateName: this.currentStateName,
      fearLevel: this.fearLevel,
      targetX: this.targetX,
      calmTimer: this.calmTimer,
      patrolTimer: this.patrolTimer
    };
  }

  public restoreState(state: NPCState): void {
    this.x = state.x;
    this.y = state.y;
    this.vx = state.vx;
    this.vy = state.vy;
    this.facingDir = state.facingDir;
    this.currentStateName = state.currentStateName;
    this.fearLevel = state.fearLevel;
    this.targetX = state.targetX;
    this.calmTimer = state.calmTimer;
    this.patrolTimer = state.patrolTimer;
  }
}
