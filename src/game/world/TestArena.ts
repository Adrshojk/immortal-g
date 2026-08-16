import { DestructibleObject, DestructionState } from '../systems/DestructionSystem';

export interface TestArenaState {
  objects: DestructibleObject[];
}

export interface Platform {
  id: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export class TestArena {
  public objects: DestructibleObject[] = [];

  public static readonly PLATFORMS: Platform[] = [
    { id: 'plat_1', x: 1800, y: 350, w: 300, h: 30 },
    { id: 'plat_2', x: 2200, y: 420, w: 400, h: 30 },
    { id: 'plat_3', x: 2700, y: 280, w: 400, h: 30 }
  ];

  constructor() {
    this.reset();
  }

  public reset(): void {
    this.objects = [
      {
        id: 'house_1',
        name: 'House',
        resistance: 1000,
        maxDestructionLevel: 3, // Building
        state: DestructionState.INTACT
      },
      {
        id: 'wall_1',
        name: 'Stone Wall',
        resistance: 100,
        maxDestructionLevel: 2, // Structural
        state: DestructionState.INTACT
      },
      {
        id: 'tree_1',
        name: 'Oak Tree',
        resistance: 100,
        maxDestructionLevel: 2, // Structural
        state: DestructionState.INTACT
      },
      {
        id: 'tree_2',
        name: 'Pine Tree',
        resistance: 100,
        maxDestructionLevel: 2, // Structural
        state: DestructionState.INTACT
      },
      {
        id: 'crate_1',
        name: 'Wooden Box',
        resistance: 10,
        maxDestructionLevel: 1, // Fragile
        state: DestructionState.INTACT
      },
      {
        id: 'crate_2',
        name: 'Wooden Box',
        resistance: 10,
        maxDestructionLevel: 1, // Fragile
        state: DestructionState.INTACT
      },
      {
        id: 'crate_3',
        name: 'Wooden Box',
        resistance: 10,
        maxDestructionLevel: 1, // Fragile
        state: DestructionState.INTACT
      },
      // Objects in the expanded section
      {
        id: 'crate_4',
        name: 'High Box',
        resistance: 10,
        maxDestructionLevel: 1,
        state: DestructionState.INTACT
      },
      {
        id: 'wall_2',
        name: 'High Wall',
        resistance: 100,
        maxDestructionLevel: 2,
        state: DestructionState.INTACT
      },
      // Destructible Ground Floor segments
      { id: 'ground_0', name: 'Ground Floor 1', resistance: 10000, maxDestructionLevel: 4, state: DestructionState.INTACT },
      { id: 'ground_1', name: 'Ground Floor 2', resistance: 10000, maxDestructionLevel: 4, state: DestructionState.INTACT },
      { id: 'ground_2', name: 'Ground Floor 3', resistance: 10000, maxDestructionLevel: 4, state: DestructionState.INTACT },
      { id: 'ground_3', name: 'Ground Floor 4', resistance: 10000, maxDestructionLevel: 4, state: DestructionState.INTACT },
      { id: 'ground_4', name: 'Ground Floor 5', resistance: 10000, maxDestructionLevel: 4, state: DestructionState.INTACT },
      { id: 'ground_5', name: 'Ground Floor 6', resistance: 10000, maxDestructionLevel: 4, state: DestructionState.INTACT },
      { id: 'ground_6', name: 'Ground Floor 7', resistance: 10000, maxDestructionLevel: 4, state: DestructionState.INTACT },
      { id: 'ground_7', name: 'Ground Floor 8', resistance: 10000, maxDestructionLevel: 4, state: DestructionState.INTACT }
    ];
  }

  /**
   * Returns positions and dimensions for rendering these objects.
   * Pure simulation does not have Phaser dependencies.
   */
  public static getObjectLayout(id: string): { x: number; y: number; w: number; h: number } {
    if (id.startsWith('ground_')) {
      const idx = parseInt(id.split('_')[1]);
      return { x: idx * 400 + 200, y: 550, w: 400, h: 100 };
    }

    switch (id) {
      case 'house_1':
        return { x: 1200, y: 350, w: 200, h: 300 };
      case 'wall_1':
        return { x: 450, y: 440, w: 40, h: 120 };
      case 'tree_1':
        return { x: 300, y: 420, w: 30, h: 160 };
      case 'tree_2':
        return { x: 1450, y: 420, w: 30, h: 160 };
      case 'crate_1':
        return { x: 410, y: 480, w: 40, h: 40 };
      case 'crate_2':
        return { x: 950, y: 480, w: 40, h: 40 };
      case 'crate_3':
        return { x: 990, y: 480, w: 40, h: 40 };
      case 'crate_4':
        return { x: 1800, y: 315, w: 40, h: 40 };
      case 'wall_2':
        return { x: 2200, y: 345, w: 40, h: 120 };
      default:
        return { x: 0, y: 0, w: 0, h: 0 };
    }
  }

  /**
   * Checks if an entity is landing on any platform.
   * Returns the top Y position of the landed platform, or null.
   */
  public static checkPlatformLanding(x: number, y: number, w: number, h: number, vy: number): number | null {
    const bottomY = y + h / 2;
    
    if (vy >= 0) {
      for (const plat of TestArena.PLATFORMS) {
        const platTop = plat.y - plat.h / 2;
        const platBottom = plat.y + plat.h / 2;
        const platLeft = plat.x - plat.w / 2;
        const platRight = plat.x + plat.w / 2;
        
        if (
          x + w / 2 > platLeft &&
          x - w / 2 < platRight &&
          bottomY >= platTop - 8 &&
          bottomY <= platBottom + 2
        ) {
          return platTop;
        }
      }
    }
    return null;
  }

  /**
   * Checks if an entity is landing on the ground.
   * Returns the top Y position of the ground (500) if landed, or null.
   */
  public checkGroundLanding(x: number, y: number, w: number, h: number, vy: number): number | null {
    const bottomY = y + h / 2;
    const groundYTop = 500;
    
    // Only land when falling or stationary
    if (vy >= 0 && bottomY >= groundYTop - 8 && bottomY <= groundYTop + 15) {
      const leftX = x - w / 2;
      const rightX = x + w / 2;
      
      const leftIdx = Math.floor(leftX / 400);
      const rightIdx = Math.floor(rightX / 400);
      
      for (let i = Math.max(0, leftIdx); i <= Math.min(7, rightIdx); i++) {
        const seg = this.objects.find(obj => obj.id === `ground_${i}`);
        if (seg && seg.state === DestructionState.DESTROYED) {
          // Floor segment is broken, fall through
          return null;
        }
      }
      return groundYTop;
    }
    return null;
  }

  public getState(): TestArenaState {
    return {
      objects: this.objects.map(obj => ({ ...obj }))
    };
  }

  public restoreState(state: TestArenaState): void {
    this.objects = state.objects.map(obj => ({ ...obj }));
  }
}
