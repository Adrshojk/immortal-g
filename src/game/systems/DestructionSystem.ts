import { EventBus } from './EventBus';

export enum DestructionState {
  INTACT = 'intact',
  DAMAGED = 'damaged',
  FRACTURED = 'fractured',
  DESTROYED = 'destroyed'
}

export interface DestructibleObject {
  id: string;
  name: string;
  resistance: number; // Force threshold to transition between states
  maxDestructionLevel: number; // 1: Fragile, 2: Structural, 3: Building
  state: DestructionState;
}

export class DestructionSystem {
  /**
   * Applies force to a destructible object and computes its new destruction state.
   * Returns true if the state changed.
   */
  public static applyForce(
    obj: DestructibleObject,
    force: number,
    actionDestructionLevel: number
  ): { stateChanged: boolean; previousState: DestructionState; debrisCount: number } {
    if (obj.state === DestructionState.DESTROYED) {
      return { stateChanged: false, previousState: obj.state, debrisCount: 0 };
    }

    const previousState = obj.state;
    
    // Check if the power's destructionLevel capability matches or exceeds the object's classification.
    // e.g. Action destructionLevel must be >= object's maxDestructionLevel to destroy it,
    // or the force must be significantly larger than resistance.
    let effectiveForce = force;
    if (actionDestructionLevel < obj.maxDestructionLevel) {
      // If our action destruction category is too low, we cannot fully destroy it, but might damage it if force is high enough
      effectiveForce = force * 0.1;
    }

    let newState: DestructionState = obj.state;
    let debrisCount = 0;

    // Resistance scaling for transitions
    // intact -> damaged requires force >= resistance
    // damaged -> fractured requires force >= resistance * 2
    // fractured -> destroyed requires force >= resistance * 3
    if (obj.state === DestructionState.INTACT && effectiveForce >= obj.resistance) {
      if (effectiveForce >= obj.resistance * 3 && actionDestructionLevel >= obj.maxDestructionLevel) {
        newState = DestructionState.DESTROYED;
        debrisCount = 10;
      } else if (effectiveForce >= obj.resistance * 2) {
        newState = DestructionState.FRACTURED;
        debrisCount = 5;
      } else {
        newState = DestructionState.DAMAGED;
        debrisCount = 2;
      }
    } else if (obj.state === DestructionState.DAMAGED && effectiveForce >= obj.resistance * 1.5) {
      if (effectiveForce >= obj.resistance * 2.5 && actionDestructionLevel >= obj.maxDestructionLevel) {
        newState = DestructionState.DESTROYED;
        debrisCount = 8;
      } else {
        newState = DestructionState.FRACTURED;
        debrisCount = 4;
      }
    } else if (obj.state === DestructionState.FRACTURED && effectiveForce >= obj.resistance) {
      if (actionDestructionLevel >= obj.maxDestructionLevel || effectiveForce >= obj.resistance * 2) {
        newState = DestructionState.DESTROYED;
        debrisCount = 6;
      }
    }

    if (newState !== previousState) {
      obj.state = newState;
      
      // Emit event
      EventBus.emit('WORLD_OBJECT_CHANGED', {
        id: obj.id,
        name: obj.name,
        previousState,
        newState,
        debrisCount
      });

      if (newState === DestructionState.DESTROYED) {
        EventBus.emit('ENTITY_DESTROYED', { id: obj.id, name: obj.name, isBuilding: obj.maxDestructionLevel === 3 });
        if (obj.maxDestructionLevel === 3) {
          EventBus.emit('BUILDING_DESTROYED', { id: obj.id, name: obj.name });
        }
      }

      return { stateChanged: true, previousState, debrisCount };
    }

    return { stateChanged: false, previousState, debrisCount: 0 };
  }
}
