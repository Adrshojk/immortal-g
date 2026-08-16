export interface WorldSnapshot {
  tick: number;
  player: any;
  entities: any[];
  world: any;
}

export class TimeSystem {
  private history: WorldSnapshot[] = [];
  private maxHistorySize: number = 600; // 10 seconds at 60Hz
  private currentTick: number = 0;
  private isRewinding: boolean = false;
  private rewindSpeed: number = 1; // Snapshot frames to rewind per update tick

  public tick(): void {
    if (this.isRewinding) return;
    this.currentTick++;
  }

  public getCurrentTick(): number {
    return this.currentTick;
  }

  public isTimeRewinding(): boolean {
    return this.isRewinding;
  }

  public startRewind(): void {
    this.isRewinding = true;
  }

  public stopRewind(): void {
    this.isRewinding = false;
  }

  public getHistoryLength(): number {
    return this.history.length;
  }

  public record(playerState: any, entitiesState: any[], worldState: any): void {
    if (this.isRewinding) return;

    const snapshot: WorldSnapshot = {
      tick: this.currentTick,
      player: JSON.parse(JSON.stringify(playerState)),
      entities: JSON.parse(JSON.stringify(entitiesState)),
      world: JSON.parse(JSON.stringify(worldState))
    };

    this.history.push(snapshot);

    if (this.history.length > this.maxHistorySize) {
      this.history.shift();
    }
  }

  /**
   * Rewinds by one step and returns the historical snapshot to restore, or null if history is empty.
   */
  public stepRewind(): WorldSnapshot | null {
    if (this.history.length === 0) {
      return null;
    }

    // Rewind slightly faster or step-by-step
    let snapshot: WorldSnapshot | null = null;
    const steps = Math.min(this.rewindSpeed, this.history.length);
    
    for (let i = 0; i < steps; i++) {
      snapshot = this.history.pop() || null;
    }

    if (snapshot) {
      this.currentTick = snapshot.tick;
    }

    return snapshot;
  }

  public clear(): void {
    this.history = [];
    this.currentTick = 0;
    this.isRewinding = false;
  }
}
