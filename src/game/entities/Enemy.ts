import { EventBus } from '../systems/EventBus';
import { TestArena } from '../world/TestArena';

export type EnemyStateName = 'idle' | 'chase' | 'attack' | 'knocked_back' | 'defeated';

export interface EnemyState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  health: number;
  facingDir: number;
  currentStateName: EnemyStateName;
  knockbackTimer: number;
  attackCooldown: number;
}

export class Enemy {
  public id: string = 'enemy_1';
  public x: number = 800;
  public y: number = 400;
  public vx: number = 0;
  public vy: number = 0;
  public width: number = 32;
  public height: number = 64;
  public health: number = 100;
  public facingDir: number = -1;
  public currentStateName: EnemyStateName = 'chase';
  
  public knockbackTimer: number = 0;
  public attackCooldown: number = 0;
  
  private speed: number = 120;
  private gravity: number = 1200;

  public update(dt: number, playerX: number, _playerY: number, arena: TestArena): void {
    if (this.currentStateName === 'defeated') {
      // Defeated state physics (gravity only, friction)
      this.applyGravityAndGround(dt, arena);
      this.vx *= 0.95; // High friction
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      return;
    }

    if (this.currentStateName === 'knocked_back') {
      this.knockbackTimer -= dt;
      this.applyGravityAndGround(dt, arena);
      // Friction
      this.vx *= 0.98;
      this.x += this.vx * dt;
      this.y += this.vy * dt;

      if (this.knockbackTimer <= 0) {
        if (this.health <= 0) {
          this.currentStateName = 'defeated';
        } else {
          this.currentStateName = 'chase';
        }
      }
      return;
    }

    // Cooldown updates
    if (this.attackCooldown > 0) {
      this.attackCooldown -= dt;
    }

    // Chase / AI logic
    const dx = playerX - this.x;
    const distance = Math.abs(dx);
    this.facingDir = dx > 0 ? 1 : -1;

    if (distance < 50) {
      this.currentStateName = 'attack';
      this.vx = 0;
      if (this.attackCooldown <= 0) {
        this.attackCooldown = 1.5;
        // Emit enemy attack event
        EventBus.emit('ENTITY_HIT', { target: 'player', source: 'enemy', damage: 0 }); // Player takes 0 damage since they are immortal!
      }
    } else {
      this.currentStateName = 'chase';
      this.vx = this.facingDir * this.speed;
    }

    this.applyGravityAndGround(dt, arena);
    this.x += this.vx * dt;
    this.y += this.vy * dt;
    
    // Void check
    if (this.y > 650) {
      this.x = 800;
      this.y = 400;
      this.vy = 0;
      this.vx = 0;
    }

    // Bounds check
    if (this.x < 50) this.x = 50;
    if (this.x > 6350) this.x = 6350;
  }

  private applyGravityAndGround(dt: number, arena: TestArena): void {
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
  }

  public takeImpact(force: number, knockback: number, dirX: number): void {
    if (this.currentStateName === 'defeated') return;

    this.health -= force;
    this.currentStateName = 'knocked_back';
    this.knockbackTimer = Math.min(1.0, 0.1 + force / 200); // Knockback duration scales
    
    // Apply velocities
    this.vx = dirX * knockback;
    this.vy = -Math.min(300, knockback * 0.5); // Slight pop up

    EventBus.emit('ENTITY_KNOCKED_BACK', {
      entityId: this.id,
      healthRemaining: this.health,
      force,
      knockback
    });

    if (this.health <= 0) {
      EventBus.emit('ENTITY_DESTROYED', { id: this.id, name: 'enemy', isBuilding: false });
    }
  }

  public getState(): EnemyState {
    return {
      x: this.x,
      y: this.y,
      vx: this.vx,
      vy: this.vy,
      health: this.health,
      facingDir: this.facingDir,
      currentStateName: this.currentStateName,
      knockbackTimer: this.knockbackTimer,
      attackCooldown: this.attackCooldown
    };
  }

  public restoreState(state: EnemyState): void {
    this.x = state.x;
    this.y = state.y;
    this.vx = state.vx;
    this.vy = state.vy;
    this.health = state.health;
    this.facingDir = state.facingDir;
    this.currentStateName = state.currentStateName;
    this.knockbackTimer = state.knockbackTimer;
    this.attackCooldown = state.attackCooldown;
  }
}
