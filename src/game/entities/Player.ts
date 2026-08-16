import { TestArena } from '../world/TestArena';

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

  public update(dt: number, keys: { left: boolean; right: boolean; jump: boolean }, powerScale: number, arena: TestArena): void {
    if (this.punchCooldown > 0) {
      this.punchCooldown -= dt;
    } else {
      this.isPunching = false;
    }

    // Scale horizontal speed with power scale
    let currentSpeed = this.speed;
    if (powerScale === 1) currentSpeed = 100;
    else if (powerScale === 10) currentSpeed = 180;
    else if (powerScale === 100) currentSpeed = 250;
    else if (powerScale === 1000) currentSpeed = 450;
    else if (powerScale === 10000) currentSpeed = 800;
    else if (powerScale === 999999) currentSpeed = 1500;

    // Horizontal Movement
    if (keys.left) {
      this.vx = -currentSpeed;
      this.facingDir = -1;
    } else if (keys.right) {
      this.vx = currentSpeed;
      this.facingDir = 1;
    } else {
      this.vx = 0;
    }

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
      this.vy += this.gravity * dt;
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
    if (this.x > 3150) this.x = 3150;
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
