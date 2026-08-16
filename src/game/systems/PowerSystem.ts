export interface PowerAction {
  id: string;
  force: number;
  radius: number;
  knockback: number;
  penetration: number;
  destructionLevel: number; // 0: None, 1: Fragile, 2: Structural, 3: Building, 4: Cosmic
}

export class PowerSystem {
  // Available power scales
  public static readonly SCALES = [1, 10, 100, 1000, 10000, 999999];
  
  private currentScaleIndex: number = 2; // Default to 100

  public getPowerScale(): number {
    return PowerSystem.SCALES[this.currentScaleIndex];
  }

  public increasePower(): number {
    if (this.currentScaleIndex < PowerSystem.SCALES.length - 1) {
      this.currentScaleIndex++;
    }
    return this.getPowerScale();
  }

  public decreasePower(): number {
    if (this.currentScaleIndex > 0) {
      this.currentScaleIndex--;
    }
    return this.getPowerScale();
  }

  public getAction(actionId: string): PowerAction {
    const scale = this.getPowerScale();
    
    // Compute action attributes dynamically based on current power scale
    // Power level 1: Weak, no structural damage, small push
    // Power level 10: Knockback enemies
    // Power level 100: Wall damaged
    // Power level 1000: Structure destroyed
    // Power level 10000: Extreme destruction
    
    let force = scale;
    let radius = 40 + Math.log10(scale) * 15; // Radius grows with power
    let knockback = scale * 1.5;
    let penetration = scale * 0.1;
    
    let destructionLevel = 0;
    if (scale >= 999999) {
      destructionLevel = 5; // World / Cosmic Annihilation
    } else if (scale >= 10000) {
      destructionLevel = 4; // Cosmic / complete annihilation
    } else if (scale >= 1000) {
      destructionLevel = 3; // Building destruction
    } else if (scale >= 100) {
      destructionLevel = 2; // Structural destruction
    } else if (scale >= 10) {
      destructionLevel = 1; // Fragile destruction
    } else {
      destructionLevel = 0; // None (just push/touch)
    }

    return {
      id: actionId,
      force,
      radius,
      knockback,
      penetration,
      destructionLevel
    };
  }
}
