import { describe, it, expect, beforeEach } from 'vitest';
import { PowerSystem } from '../systems/PowerSystem';
import { DestructionSystem, DestructionState, DestructibleObject } from '../systems/DestructionSystem';
import { TimeSystem } from '../systems/TimeSystem';
import { Player } from '../entities/Player';
import { Enemy } from '../entities/Enemy';
import { TestArena } from '../world/TestArena';

describe('IMMORTAL Core Systems', () => {
  
  describe('PowerSystem', () => {
    let powerSystem: PowerSystem;

    beforeEach(() => {
      powerSystem = new PowerSystem();
    });

    it('should initialize with default scale (100)', () => {
      expect(powerSystem.getPowerScale()).toBe(100);
    });

    it('should increase and decrease power scale correctly within bounds', () => {
      // Current index: 2 (100)
      // Increase -> 3 (1000)
      expect(powerSystem.increasePower()).toBe(1000);
      // Increase -> 4 (10000)
      expect(powerSystem.increasePower()).toBe(10000);
      // Increase -> 5 (999999)
      expect(powerSystem.increasePower()).toBe(999999);
      // Increase (already at max) -> 5 (999999)
      expect(powerSystem.increasePower()).toBe(999999);

      // Decrease -> 4 (10000)
      expect(powerSystem.decreasePower()).toBe(10000);
    });

    it('should calculate different destruction capabilities for different scales', () => {
      // 100 power scale action
      const actionLow = powerSystem.getAction('punch');
      expect(actionLow.destructionLevel).toBe(2); // Structural

      // Decrease to 10 scale
      powerSystem.decreasePower(); // 10
      const actionFragile = powerSystem.getAction('punch');
      expect(actionFragile.destructionLevel).toBe(1); // Fragile
    });
  });

  describe('DestructionSystem', () => {
    let wall: DestructibleObject;

    beforeEach(() => {
      wall = {
        id: 'wall_test',
        name: 'Wall Test',
        resistance: 100,
        maxDestructionLevel: 2, // Structural
        state: DestructionState.INTACT
      };
    });

    it('Low power: object remains intact', () => {
      // Force of 5 is less than resistance 100
      const result = DestructionSystem.applyForce(wall, 5, 0);
      expect(result.stateChanged).toBe(false);
      expect(wall.state).toBe(DestructionState.INTACT);
    });

    it('Medium power: object becomes damaged', () => {
      // Force of 100 equals resistance, but destructionLevel capabilities is 2 (Structural)
      const result = DestructionSystem.applyForce(wall, 100, 2);
      expect(result.stateChanged).toBe(true);
      expect(wall.state).toBe(DestructionState.DAMAGED);
    });

    it('High power: object becomes fractured', () => {
      // Force of 200 is 2x resistance
      const result = DestructionSystem.applyForce(wall, 200, 2);
      expect(result.stateChanged).toBe(true);
      expect(wall.state).toBe(DestructionState.FRACTURED);
    });

    it('Extreme power: object destroyed', () => {
      // Force of 350 is 3.5x resistance
      const result = DestructionSystem.applyForce(wall, 350, 2);
      expect(result.stateChanged).toBe(true);
      expect(wall.state).toBe(DestructionState.DESTROYED);
    });
  });

  describe('TimeSystem & State Restoration', () => {
    let timeSystem: TimeSystem;
    let player: Player;
    let enemy: Enemy;

    beforeEach(() => {
      timeSystem = new TimeSystem();
      player = new Player();
      enemy = new Enemy();
    });

    it('should record history and restore states correctly on rewind', () => {
      // Save initial state
      const initialPlayerState = player.getState(100);
      const initialEnemyState = enemy.getState();
      timeSystem.record(initialPlayerState, [initialEnemyState], {});

      // Move player and modify enemy
      player.x = 500;
      player.y = 200;
      enemy.health = 50;
      enemy.x = 750;

      // Record a second tick
      timeSystem.record(player.getState(100), [enemy.getState()], {});

      // Verify stats changed
      expect(player.x).toBe(500);
      expect(enemy.health).toBe(50);

      // Now rewind one frame
      let snapshot = timeSystem.stepRewind();
      expect(snapshot).not.toBeNull();
      
      // Rewind second frame (which restores to initial state)
      snapshot = timeSystem.stepRewind();
      expect(snapshot).not.toBeNull();
      
      player.restoreState(snapshot!.player);
      enemy.restoreState(snapshot!.entities[0]);

      // Expect to be back to start values
      expect(player.x).toBe(200);
      expect(enemy.health).toBe(100);
    });
  });

  describe('TestArena Platform Collision', () => {
    it('should detect when an entity lands on a platform', () => {
      // plat_1: x: 1800, y: 350, w: 300, h: 30
      // platform top is 350 - 15 = 335
      // Entity bottom is y + height / 2.
      // If player is at x = 1800, height = 64.
      // y = 335 - 32 = 303 -> bottom is 335.
      const landedY = TestArena.checkPlatformLanding(1800, 303, 32, 64, 10);
      expect(landedY).toBe(335);
    });

    it('should not detect landing if entity is moving upward', () => {
      const landedY = TestArena.checkPlatformLanding(1800, 303, 32, 64, -10);
      expect(landedY).toBeNull();
    });

    it('should not detect landing if entity is outside platform bounds', () => {
      const landedY = TestArena.checkPlatformLanding(1500, 303, 32, 64, 10);
      expect(landedY).toBeNull();
    });
  });

  describe('Player Jump Scaling', () => {
    it('should scale jump force based on the current power scale', () => {
      const player = new Player();
      const arena = new TestArena();
      
      // Jump at power 100 (standard jump)
      player.y = 468; // Ground level
      player.update(0.016, { left: false, right: false, jump: true }, 100, arena);
      expect(player.vy).toBe(-600);

      // Jump at power 10 (small hop)
      player.y = 468;
      player.vy = 0; // Reset velocity
      player.update(0.016, { left: false, right: false, jump: true }, 10, arena);
      expect(player.vy).toBe(-400);

      // Jump at power 10000 (cosmic leap)
      player.y = 468;
      player.vy = 0; // Reset velocity
      player.update(0.016, { left: false, right: false, jump: true }, 10000, arena);
      expect(player.vy).toBe(-2400);
    });
  });

  describe('Infinity Power & World Destruction', () => {
    it('should configure 999999 scale with destructionLevel = 5', () => {
      const powerSystem = new PowerSystem();
      powerSystem.increasePower(); // 1000
      powerSystem.increasePower(); // 10000
      powerSystem.increasePower(); // 999999 (Infinity)
      
      expect(powerSystem.getPowerScale()).toBe(999999);
      const action = powerSystem.getAction('punch');
      expect(action.destructionLevel).toBe(5);
    });

    it('should vaporize structural object instantly at destructionLevel = 5', () => {
      const house: DestructibleObject = {
        id: 'house_test',
        name: 'House Test',
        resistance: 1000,
        maxDestructionLevel: 3, // Building
        state: DestructionState.INTACT
      };
      
      const result = DestructionSystem.applyForce(house, 999999, 5);
      expect(result.stateChanged).toBe(true);
      expect(house.state).toBe(DestructionState.DESTROYED);
    });

    it('should jump with cosmic force at 999999 power scale', () => {
      const player = new Player();
      const arena = new TestArena();
      player.y = 468;
      player.update(0.016, { left: false, right: false, jump: true }, 999999, arena);
      expect(player.vy).toBe(-5000);
    });

    it('should scale horizontal velocity based on current power scale', () => {
      const player = new Player();
      const arena = new TestArena();
      
      // Move right at power 100
      player.update(0, { left: false, right: true, jump: false }, 100, arena);
      expect(player.vx).toBe(250);

      // Move left at power 10
      player.update(0, { left: true, right: false, jump: false }, 10, arena);
      expect(player.vx).toBe(-180);

      // Move right at power 999999 (Infinity)
      player.update(0, { left: false, right: true, jump: false }, 999999, arena);
      expect(player.vx).toBe(1500);
    });

    it('should accelerate player movement velocity when holding direction keys over time', () => {
      const player = new Player();
      const arena = new TestArena();
      player.y = 468;
      
      // Initially, holding right for 0s yields base speed 250
      player.update(0, { left: false, right: true, jump: false }, 100, arena);
      expect(player.vx).toBe(250);

      // Holding right for 1s accelerates player speed
      player.update(1.0, { left: false, right: true, jump: false }, 100, arena);
      expect(Math.abs(player.vx)).toBeGreaterThan(500); // Accelerated speed

      // Releasing direction keys resets acceleration
      player.update(0, { left: false, right: false, jump: false }, 100, arena);
      player.update(0, { left: false, right: true, jump: false }, 100, arena);
      expect(player.vx).toBe(250); // back to base speed
    });

    it('should break ground segment under high force and cause player to fall through', () => {
      const arena = new TestArena();
      const player = new Player();
      player.y = 468; // Set to ground level so bottom is 500
      
      // Ground segment 0 starts at x=0 to x=400. Player is at x=200.
      const ground0 = arena.objects.find(obj => obj.id === 'ground_0')!;
      expect(ground0.state).toBe(DestructionState.INTACT);

      // Verify player lands on intact ground
      const landBefore = arena.checkGroundLanding(player.x, player.y, player.width, player.height, player.vy);
      expect(landBefore).toBe(500);

      // Hit ground with Infinity Power -> destroys ground_0
      DestructionSystem.applyForce(ground0, 999999, 5);
      expect(ground0.state).toBe(DestructionState.DESTROYED);

      // Verify player falls through destroyed ground segment
      const landAfter = arena.checkGroundLanding(player.x, player.y, player.width, player.height, player.vy);
      expect(landAfter).toBeNull();
    });

    it('should calculate dynamic power based on F hold duration correctly', () => {
      const powerSystem = new PowerSystem();
      
      // Tap (0.1s hold) -> 100 power
      expect(powerSystem.calculatePower(0.1)).toBe(100);

      // 0.25s hold -> 500 power
      expect(powerSystem.calculatePower(0.25)).toBe(500);

      // 0.5s hold -> 1000 power
      expect(powerSystem.calculatePower(0.5)).toBe(1000);

      // 1.0s hold -> 10000 power
      expect(powerSystem.calculatePower(1.0)).toBe(10000);

      // 2.0s+ hold -> 999999 power (Infinity)
      expect(powerSystem.calculatePower(2.5)).toBe(999999);
    });

    it('should damage/destroy ground segment when player lands with high velocity', () => {
      const arena = new TestArena();
      const player = new Player();
      
      // Position player just above ground, falling fast
      player.y = 460;
      player.vy = 800; // Fast fall velocity
      
      const ground0 = arena.objects.find(obj => obj.id === 'ground_0')!;
      expect(ground0.state).toBe(DestructionState.INTACT);

      // Perform update with Infinity power to ensure breaking ground
      player.update(0.016, { left: false, right: false, jump: false }, 999999, arena);
      expect(ground0.state).toBe(DestructionState.DESTROYED);
      expect(player.y).toBeGreaterThan(468); // should have fallen through
    });
  });
});
