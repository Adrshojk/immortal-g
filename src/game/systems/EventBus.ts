export type GameEventType =
  | 'PLAYER_ATTACK'
  | 'ENTITY_HIT'
  | 'ENTITY_KNOCKED_BACK'
  | 'ENTITY_DESTROYED'
  | 'BUILDING_DESTROYED'
  | 'NPC_FRIGHTENED'
  | 'WORLD_OBJECT_CHANGED'
  | 'WORLD_DESTROYED';

export interface GameEvent {
  type: GameEventType;
  timestamp: number;
  payload: any;
}

type EventCallback = (event: GameEvent) => void;

class EventBusClass {
  private listeners: Map<GameEventType, Set<EventCallback>> = new Map();

  public on(type: GameEventType, callback: EventCallback): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(callback);
  }

  public off(type: GameEventType, callback: EventCallback): void {
    const list = this.listeners.get(type);
    if (list) {
      list.delete(callback);
    }
  }

  public emit(type: GameEventType, payload: any): void {
    const event: GameEvent = {
      type,
      timestamp: Date.now(),
      payload
    };
    const list = this.listeners.get(type);
    if (list) {
      list.forEach(callback => {
        try {
          callback(event);
        } catch (e) {
          console.error(`Error in event listener for ${type}:`, e);
        }
      });
    }
  }

  public clear(): void {
    this.listeners.clear();
  }
}

export const EventBus = new EventBusClass();
