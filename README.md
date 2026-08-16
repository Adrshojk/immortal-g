# IMMORTAL

**IMMORTAL** is an open-source browser-based 2D game where you play as an omnipotent protagonist who cannot die. The gameplay challenge is not survival, but **control**—learning to apply the minimum force needed in a fragile world.

---

## Core Concept
In **IMMORTAL**, you have unlimited power, physical strength, and invincibility.
* **No Health or Stamina Bars:** You cannot be defeated.
* **The Challenge of Control:** Weak entities and fragile environments will disintegrate if you use too much force. You must choose your power level dynamically before every interaction.
* **Time Rewind:** If you destroy too much, you can rewind time up to 10 seconds to restore the world and try a different approach.

---

## Tech Stack
* **Language:** TypeScript (Strictly typed)
* **Framework:** Phaser 3
* **Build System:** Vite
* **Package Manager:** pnpm
* **Unit Testing:** Vitest

---

## Project Structure
```text
immortal-game/
├── src/
│   ├── main.ts               # Entry point
│   └── game/
│       ├── config.ts         # Phaser configuration
│       ├── scenes/
│       │   └── MainScene.ts  # Game loop, input handling, and rendering
│       ├── entities/
│       │   ├── Player.ts     # Player simulation state & behavior
│       │   ├── Enemy.ts      # Enemy behavior & combat simulation
│       │   └── NPC.ts        # Frightened/patrolling NPC simulation
│       ├── systems/
│       │   ├── PowerSystem.ts       # Scales force, radius, and destruction tier
│       │   ├── DestructionSystem.ts # Manages fragile, structural, and building states
│       │   ├── TimeSystem.ts        # Bounded history buffer & rewind
│       │   └── EventBus.ts          # Global event bus
│       └── world/
│           └── TestArena.ts  # Simulation state of environment structures
├── public/                   # Static assets (icons, sprites)
├── docs/                     # Guides and architecture notes
└── package.json              # Script definitions and dependency trees
```

---

## Setup Instructions

### Prerequisites
Make sure you have [Node.js](https://nodejs.org/) and [pnpm](https://pnpm.io/) installed.

### Installation
Clone this repository and install dependencies:
```bash
pnpm install
```

### Running the Game Locally
Start the development server:
```bash
pnpm dev
```
Open your browser at `http://localhost:3000`.

### Running Unit Tests
Execute the Vitest test suite:
```bash
pnpm test
```

### Typecheck & Verify
```bash
pnpm typecheck
```

---

## Gameplay Controls
* **Run / Accelerate:** `A` / `D` or `Left` / `Right` Arrow keys. Holding down movement keys triggers **uncontrollable acceleration** momentum over time.
* **Jump / Fly Up:** `Space` or `W` or `Up` Arrow key. Acts as a jump from the ground or upward flight thrust when in the air.
* **Fly Down:** `S` or `Down` Arrow key (descend during flight).
* **Focus Attack:** Hold `F` to focus and restrain Kail's infinite power:
  * **Single Tap `F`**: Releases **INFINITY** power, vaporizing the environment.
  * **Hold `F`**: suppresses the release power down to a precision touch (`1`).
* **Time Rewind:** Hold `R` to pause simulation and step backward frame-by-frame.
* **Developer Debug Overlay:** Press `TAB` to toggle coordinate, tick, state, and event logs.

---

## Roadmap & Next Steps
1. **Longer Rewinds & Timelines:** Support branching timeline visuals and logs.
2. **Cosmic Scaling:** Extend the power selector to orbital, planetary, and cosmic levels.
3. **Audio & Asset Polishing:** Add high-quality audio oscillators and lightweight, modern vector/pixel art.
4. **Levels & Scenarios:** Puzzle environments where players must resolve hostages, repair infrastructure, or defeat targets with zero collateral casualties.

---

## Contributing
Please see [CONTRIBUTING.md](file:///Users/jk/projects/immortal/CONTRIBUTING.md) to learn how to help build **IMMORTAL**. All contributors must adhere to our [Code of Conduct](file:///Users/jk/projects/immortal/CODE_OF_CONDUCT.md).

---

## License
Licensed under the [MIT License](file:///Users/jk/projects/immortal/LICENSE).
