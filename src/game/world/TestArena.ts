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
    // Zone 1: Village area
    { id: 'plat_1', x: 1800, y: 350, w: 300, h: 30 },
    { id: 'plat_2', x: 2200, y: 420, w: 400, h: 30 },
    { id: 'plat_3', x: 2700, y: 280, w: 400, h: 30 },
    // Zone 2: Forest canopy
    { id: 'plat_4', x: 3400, y: 350, w: 200, h: 24 },
    { id: 'plat_5', x: 3700, y: 300, w: 180, h: 24 },
    { id: 'plat_6', x: 4000, y: 250, w: 220, h: 24 },
    { id: 'plat_7', x: 3850, y: 400, w: 250, h: 24 },
    // Zone 3: Fortress
    { id: 'plat_8', x: 4600, y: 380, w: 350, h: 35 },
    { id: 'plat_9', x: 5000, y: 300, w: 300, h: 35 },
    { id: 'plat_10', x: 5400, y: 220, w: 250, h: 35 },
    { id: 'plat_11', x: 5200, y: 420, w: 400, h: 35 },
    // Zone 4: Ruins — broken staircase
    { id: 'plat_12', x: 5800, y: 440, w: 150, h: 20 },
    { id: 'plat_13', x: 5950, y: 380, w: 120, h: 20 },
    { id: 'plat_14', x: 6100, y: 320, w: 140, h: 20 },
    { id: 'plat_15', x: 6250, y: 260, w: 160, h: 20 }
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
      // Objects in the expanded section (Zone 1 continued)
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

      // Zone 2: Dense Forest
      { id: 'tree_3', name: 'Birch Tree', resistance: 80, maxDestructionLevel: 2, state: DestructionState.INTACT },
      { id: 'tree_4', name: 'Willow Tree', resistance: 120, maxDestructionLevel: 2, state: DestructionState.INTACT },
      { id: 'tree_5', name: 'Ancient Oak', resistance: 500, maxDestructionLevel: 3, state: DestructionState.INTACT },
      { id: 'tree_6', name: 'Dead Tree', resistance: 30, maxDestructionLevel: 1, state: DestructionState.INTACT },
      { id: 'tree_7', name: 'Pine Cluster', resistance: 100, maxDestructionLevel: 2, state: DestructionState.INTACT },
      { id: 'crate_5', name: 'Supply Crate', resistance: 10, maxDestructionLevel: 1, state: DestructionState.INTACT },
      { id: 'boulder_1', name: 'Mossy Boulder', resistance: 800, maxDestructionLevel: 3, state: DestructionState.INTACT },

      // Zone 3: Fortress
      { id: 'fort_wall_1', name: 'Fortress Wall', resistance: 2000, maxDestructionLevel: 4, state: DestructionState.INTACT },
      { id: 'fort_wall_2', name: 'Fortress Wall', resistance: 2000, maxDestructionLevel: 4, state: DestructionState.INTACT },
      { id: 'fort_gate', name: 'Iron Gate', resistance: 5000, maxDestructionLevel: 4, state: DestructionState.INTACT },
      { id: 'tower_1', name: 'Watch Tower', resistance: 3000, maxDestructionLevel: 4, state: DestructionState.INTACT },
      { id: 'barrel_1', name: 'Powder Barrel', resistance: 5, maxDestructionLevel: 1, state: DestructionState.INTACT },
      { id: 'barrel_2', name: 'Powder Barrel', resistance: 5, maxDestructionLevel: 1, state: DestructionState.INTACT },
      { id: 'crate_6', name: 'Ammo Crate', resistance: 15, maxDestructionLevel: 1, state: DestructionState.INTACT },
      { id: 'house_2', name: 'Barracks', resistance: 1500, maxDestructionLevel: 3, state: DestructionState.INTACT },

      // Zone 4: Ancient Ruins
      { id: 'pillar_1', name: 'Stone Pillar', resistance: 400, maxDestructionLevel: 2, state: DestructionState.INTACT },
      { id: 'pillar_2', name: 'Stone Pillar', resistance: 400, maxDestructionLevel: 2, state: DestructionState.INTACT },
      { id: 'pillar_3', name: 'Cracked Pillar', resistance: 150, maxDestructionLevel: 2, state: DestructionState.INTACT },
      { id: 'ruin_wall_1', name: 'Ruin Wall', resistance: 200, maxDestructionLevel: 2, state: DestructionState.INTACT },
      { id: 'ruin_wall_2', name: 'Ruin Arch', resistance: 300, maxDestructionLevel: 2, state: DestructionState.INTACT },
      { id: 'statue_1', name: 'Ancient Statue', resistance: 1000, maxDestructionLevel: 3, state: DestructionState.INTACT },
      { id: 'crate_7', name: 'Relic Chest', resistance: 20, maxDestructionLevel: 1, state: DestructionState.INTACT },

      // Destructible Ground Floor segments (16 total, covering 6400px)
      { id: 'ground_0', name: 'Ground Floor 1', resistance: 10000, maxDestructionLevel: 4, state: DestructionState.INTACT },
      { id: 'ground_1', name: 'Ground Floor 2', resistance: 10000, maxDestructionLevel: 4, state: DestructionState.INTACT },
      { id: 'ground_2', name: 'Ground Floor 3', resistance: 10000, maxDestructionLevel: 4, state: DestructionState.INTACT },
      { id: 'ground_3', name: 'Ground Floor 4', resistance: 10000, maxDestructionLevel: 4, state: DestructionState.INTACT },
      { id: 'ground_4', name: 'Ground Floor 5', resistance: 10000, maxDestructionLevel: 4, state: DestructionState.INTACT },
      { id: 'ground_5', name: 'Ground Floor 6', resistance: 10000, maxDestructionLevel: 4, state: DestructionState.INTACT },
      { id: 'ground_6', name: 'Ground Floor 7', resistance: 10000, maxDestructionLevel: 4, state: DestructionState.INTACT },
      { id: 'ground_7', name: 'Ground Floor 8', resistance: 10000, maxDestructionLevel: 4, state: DestructionState.INTACT },
      { id: 'ground_8', name: 'Forest Floor 1', resistance: 8000, maxDestructionLevel: 4, state: DestructionState.INTACT },
      { id: 'ground_9', name: 'Forest Floor 2', resistance: 8000, maxDestructionLevel: 4, state: DestructionState.INTACT },
      { id: 'ground_10', name: 'Forest Floor 3', resistance: 8000, maxDestructionLevel: 4, state: DestructionState.INTACT },
      { id: 'ground_11', name: 'Forest Floor 4', resistance: 8000, maxDestructionLevel: 4, state: DestructionState.INTACT },
      { id: 'ground_12', name: 'Fortress Floor 1', resistance: 15000, maxDestructionLevel: 4, state: DestructionState.INTACT },
      { id: 'ground_13', name: 'Fortress Floor 2', resistance: 15000, maxDestructionLevel: 4, state: DestructionState.INTACT },
      { id: 'ground_14', name: 'Ruins Floor 1', resistance: 6000, maxDestructionLevel: 4, state: DestructionState.INTACT },
      { id: 'ground_15', name: 'Ruins Floor 2', resistance: 6000, maxDestructionLevel: 4, state: DestructionState.INTACT }
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
      // Zone 1: Village
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

      // Zone 2: Dense Forest (x: 3200–4400)
      case 'tree_3':
        return { x: 3300, y: 400, w: 28, h: 200 };
      case 'tree_4':
        return { x: 3550, y: 410, w: 35, h: 180 };
      case 'tree_5':
        return { x: 3800, y: 370, w: 50, h: 260 };
      case 'tree_6':
        return { x: 4000, y: 440, w: 20, h: 120 };
      case 'tree_7':
        return { x: 4200, y: 400, w: 60, h: 200 };
      case 'crate_5':
        return { x: 3650, y: 480, w: 36, h: 36 };
      case 'boulder_1':
        return { x: 3950, y: 470, w: 70, h: 55 };

      // Zone 3: Fortress (x: 4400–5600)
      case 'fort_wall_1':
        return { x: 4500, y: 400, w: 50, h: 200 };
      case 'fort_wall_2':
        return { x: 5500, y: 400, w: 50, h: 200 };
      case 'fort_gate':
        return { x: 5000, y: 430, w: 80, h: 140 };
      case 'tower_1':
        return { x: 4750, y: 320, w: 100, h: 360 };
      case 'barrel_1':
        return { x: 4620, y: 485, w: 28, h: 30 };
      case 'barrel_2':
        return { x: 5350, y: 485, w: 28, h: 30 };
      case 'crate_6':
        return { x: 5100, y: 480, w: 40, h: 40 };
      case 'house_2':
        return { x: 5250, y: 380, w: 180, h: 240 };

      // Zone 4: Ancient Ruins (x: 5600–6400)
      case 'pillar_1':
        return { x: 5700, y: 420, w: 30, h: 160 };
      case 'pillar_2':
        return { x: 5900, y: 420, w: 30, h: 160 };
      case 'pillar_3':
        return { x: 6050, y: 430, w: 28, h: 140 };
      case 'ruin_wall_1':
        return { x: 5800, y: 440, w: 60, h: 120 };
      case 'ruin_wall_2':
        return { x: 6150, y: 410, w: 80, h: 180 };
      case 'statue_1':
        return { x: 6300, y: 400, w: 60, h: 200 };
      case 'crate_7':
        return { x: 6100, y: 480, w: 44, h: 40 };

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
      
      for (let i = Math.max(0, leftIdx); i <= Math.min(15, rightIdx); i++) {
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
