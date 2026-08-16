# Changelog - IMMORTAL Prototype

## [v0.1.0] - Initial Prototype Build

### Added
- **Core Engine Setup**: Configured Vite, Phaser 3, TypeScript, and Arcade Physics.
- **Dynamic Power System**: Mapped force, radius, and destruction values across six power scales (1, 10, 100, 1000, 10000, and 999999).
- **Reversed Power Scale (Hold to Suppress)**: Redesigned the core control mechanic: Tapping `F` instantly releases **INFINITY** (999999) power. Holding down `F` focuses Kail's energy to **reduce** the power over time down to a precision touch (`1`).
- **Suppression Feedback Visuals**: Holding the key shrinks a massive chaotic cyan aura into a tiny focused ring, calms down violent screen shake, and drops audio hum pitch as energy is concentrated.
- **Flight Mechanics**: Enabled flight thrust controls in the air: Hold `Space`/`W` to fly upwards and `S` to descend. Extended camera and world physics bounds vertically to Y = -5000 to keep the viewport locked onto the flying player.
- **High-Force Ground Shattering**: Landing on ground segments with high velocity (`vy >= 500`) automatically applies impact forces to the terrain segments below Kail, shattering them into holes that players fall through.
- **State Rewind System**: Implemented a 10-second (600 ticks) ring history buffer. Holding `R` rewinds the coordinates and status of the player, enemy, NPC, and destructibles frame-by-frame.
- **Destruction Mechanics**: Multi-tier structural wear (Intact -> Damaged -> Fractured -> Destroyed) with procedural debris particle spawns.
- **Kail Sprite sheet Transformation**: Sliced high-resolution pixel art sub-textures from the custom character reference sheet. Built an HTML5 Canvas keyer to dynamically remove compressed JPEG background pixels and scaled sprites proportionally.
- **Dynamic Running Speed**: Mapped movement velocities to the active power scale (100 to 1500 speed) and applied exponential hold-to-run speed multipliers.
- **Destructible Floor segments**: Segmented the terrain into 8 independent ground segments. Breaking them creates holes that entities fall through, resetting their position if they fall off-screen.
- **Dev Environment name tags**: Added color-coded developer name tags above all active entities, platforms, and ground segments.
- **High-Speed Ramming**: Enabled ramming impact checks. Running into enemies, NPCs, or blocks at speeds `>= 300` automatically applies damage and shatters destructibles on contact.

### Verification
- **Automated Tests**: Developed 20 Vitest unit cases validating all systems.
- **Build System**: verified successful production build bundling.
