export interface PowerAction {
  id: string;
  force: number;
  radius: number;
  knockback: number;
  penetration: number;
  destructionLevel: number; // 0: None, 1: Fragile, 2: Structural, 3: Building, 4: Cosmic, 5: World
}

export class PowerSystem {
  // Available power scales (retains exact backwards compatibility)
  public static readonly SCALES = [1, 10, 100, 1000, 10000, 999999];
  private currentScaleIndex: number = 2; // Default to 100 (Index 2)

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
    return this.createPowerResult(this.getPowerScale(), actionId);
  }

  /**
   * Calculates dynamic power scale based on hold duration of the attack key.
   * A single tap releases INFINITY. Holding the key focuses to REDUCE the power.
   */
  public calculatePower(holdDuration: number): number {
    if (holdDuration <= 0.15) {
      return 999999; // Tap releases INFINITY
    }
    if (holdDuration >= 2.0) {
      return 1; // 2s+ focus reduces power to 1 (precision touch)
    }

    // Reversed nonlinear curve interpolation
    if (holdDuration < 0.25) {
      // Interpolate between 999999 and 10000
      const pct = (holdDuration - 0.15) / (0.25 - 0.15);
      return Math.round(999999 - pct * 989999);
    } else if (holdDuration < 0.5) {
      // Interpolate between 10000 and 1000
      const pct = (holdDuration - 0.25) / (0.5 - 0.25);
      return Math.round(10000 - pct * 9000);
    } else if (holdDuration < 1.0) {
      // Interpolate between 1000 and 100
      const pct = (holdDuration - 0.5) / (1.0 - 0.5);
      return Math.round(1000 - pct * 900);
    } else {
      // Interpolate between 100 and 1
      const pct = (holdDuration - 1.0) / (2.0 - 1.0);
      return Math.round(100 - pct * 99);
    }
  }

  /**
   * Mapped tier level for destruction threshold matching (0: None, 1: Fragile, 2: Structural, 3: Building, 4: Cosmic, 5: World)
   */
  public getPowerTier(power: number): number {
    if (power >= 999999) {
      return 5; // World / Cosmic Annihilation
    }
    if (power >= 10000) {
      return 4; // Cosmic / complete annihilation
    }
    if (power >= 1000) {
      return 3; // Building destruction
    }
    if (power >= 100) {
      return 2; // Structural destruction
    }
    if (power >= 10) {
      return 1; // Fragile destruction
    }
    return 0; // None (push only)
  }

  /**
   * Generates a reusable action result based on power scale value
   */
  public createPowerResult(power: number, actionId: string = 'punch'): PowerAction {
    const force = power;
    const radius = 40 + Math.log10(Math.max(1, power)) * 15;
    const knockback = power * 1.5;
    const penetration = power * 0.1;
    const destructionLevel = this.getPowerTier(power);

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
