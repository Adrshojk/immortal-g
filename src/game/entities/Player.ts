import { TestArena } from '../world/TestArena';
import { DestructionSystem, DestructionState } from '../systems/DestructionSystem';

export interface PlayerState {
  x: number;
  y: number;
  vx: number;
  vy: number;
  facingDir: number; // -1: Left, 1: Right
  punchCooldown: number;
  isPunching: boolean;
  powerScale: number;
}

export class Player {
  public x: number = 200;
  public y: number = 400;
  public vx: number = 0;
  public vy: number = 0;
  public width: number = 32;
  public height: number = 64;
  public facingDir: number = 1;
  public punchCooldown: number = 0;
  public isPunching: boolean = false;
  
  private speed: number = 250;
  private jumpForce: number = -600;
  private gravity: number = 1200;
  private moveHoldTime: number = 0;

  // Smooth movement
  private targetVx: number = 0;
  private accelRate: number = 12;   // How fast we reach target speed
  private decelRate: number = 8;    // How fast we stop (friction)

  public update(dt: number, keys: { left: boolean; right: boolean; jump: boolean; down?: boolean }, powerScale: number, arena: TestArena): void {
    if (this.punchCooldown > 0) {
      this.punchCooldown -= dt;
    } else {
      this.isPunching = false;
    }

    // Track movement key hold duration to apply uncontrollable acceleration
    if (keys.left || keys.right) {
      this.moveHoldTime += dt;
    } else {
      this.moveHoldTime = 0;
    }

    const accelMultiplier = 1.0 + Math.pow(this.moveHoldTime, 1.8) * 3.5;
    let currentSpeed = this.speed * accelMultiplier;
    
    if (powerScale === 1) currentSpeed = 100 * accelMultiplier;
    else if (powerScale === 10) currentSpeed = 180 * accelMultiplier;
    else if (powerScale === 100) currentSpeed = 250 * accelMultiplier;
    else if (powerScale === 1000) currentSpeed = 450 * accelMultiplier;
    else if (powerScale === 10000) currentSpeed = 800 * accelMultiplier;
    else if (powerScale === 999999) currentSpeed = 1500 * accelMultiplier;

    // Horizontal Movement (smooth acceleration/deceleration)
    if (keys.left) {
      this.targetVx = -currentSpeed;
      this.facingDir = -1;
    } else if (keys.right) {
      this.targetVx = currentSpeed;
      this.facingDir = 1;
    } else {
      this.targetVx = 0;
    }

    // Lerp velocity toward target for smooth feel (instant if dt is 0, e.g. in tests)
    if (dt === 0) {
      this.vx = this.targetVx;
    } else {
      const rate = this.targetVx !== 0 ? this.accelRate : this.decelRate;
      this.vx += (this.targetVx - this.vx) * Math.min(1, rate * dt);
    }
    // Kill tiny residual drift
    if (Math.abs(this.vx) < 1 && this.targetVx === 0) this.vx = 0;

    // Apply gravity & check platform landing
    const landedY = TestArena.checkPlatformLanding(this.x, this.y, this.width, this.height, this.vy);

    // Scale jump force with power scale
    let currentJumpForce = this.jumpForce;
    if (powerScale === 1) currentJumpForce = -200;
    else if (powerScale === 10) currentJumpForce = -400;
    else if (powerScale === 100) currentJumpForce = -600;
    else if (powerScale === 1000) currentJumpForce = -1200;
    else if (powerScale === 10000) currentJumpForce = -2400;
    else if (powerScale === 999999) currentJumpForce = -5000;

    const groundLandedYBefore = arena.checkGroundLanding(this.x, this.y, this.width, this.height, this.vy);

    if (groundLandedYBefore !== null && this.vy >= 500) {
      // High speed landing impact -> apply force to ground segment below player
      const leftX = this.x - this.width / 2;
      const rightX = this.x + this.width / 2;
      const leftIdx = Math.floor(leftX / 400);
      const rightIdx = Math.floor(rightX / 400);
      
      const impactForce = this.vy * (powerScale / 100); 
      const tier = powerScale >= 999999 ? 5 : (powerScale >= 10000 ? 4 : (powerScale >= 1000 ? 3 : 2));

      for (let i = Math.max(0, leftIdx); i <= Math.min(15, rightIdx); i++) {
        const seg = arena.objects.find(obj => obj.id === `ground_${i}`);
        if (seg && seg.state !== DestructionState.DESTROYED) {
          DestructionSystem.applyForce(seg, impactForce, tier);
        }
      }
    }

    const groundLandedY = arena.checkGroundLanding(this.x, this.y, this.width, this.height, this.vy);

    if (landedY !== null) {
      this.vy = 0;
      this.y = landedY - this.height / 2;
      
      // Jump
      if (keys.jump) {
        this.vy = currentJumpForce;
      }
    } else if (groundLandedY !== null) {
      this.vy = 0;
      this.y = groundLandedY - this.height / 2;
      
      // Jump
      if (keys.jump) {
        this.vy = currentJumpForce;
      }
    } else {
      // Flight mechanics when in the air
      if (keys.jump) {
        this.vy = currentJumpForce * 0.8; // Propel upwards (flight)
      } else if (keys.down) {
        this.vy = -currentJumpForce * 0.8; // Propel downwards (flight)
      } else {
        this.vy += this.gravity * dt;
      }
    }

    // Update positions
    this.x += this.vx * dt;
    this.y += this.vy * dt;

    // Void reset
    if (this.y > 650) {
      this.x = 200;
      this.y = 400;
      this.vy = 0;
      this.vx = 0;
    }

    // Simple bounds collision
    if (this.x < 50) this.x = 50;
    if (this.x > 6350) this.x = 6350;
  }

  public punch(): boolean {
    if (this.punchCooldown <= 0) {
      this.isPunching = true;
      this.punchCooldown = 0.2; // 200ms cooldown
      return true;
    }
    return false;
  }

  public getState(powerScale: number): PlayerState {
    return {
      x: this.x,
      y: this.y,
      vx: this.vx,
      vy: this.vy,
      facingDir: this.facingDir,
      punchCooldown: this.punchCooldown,
      isPunching: this.isPunching,
      powerScale
    };
  }

  public restoreState(state: PlayerState): void {
    this.x = state.x;
    this.y = state.y;
    this.vx = state.vx;
    this.vy = state.vy;
    this.facingDir = state.facingDir;
    this.punchCooldown = state.punchCooldown;
    this.isPunching = state.isPunching;
  }
}
