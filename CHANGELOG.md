# Changelog - IMMORTAL Prototype

## [v0.1.0] - Initial Prototype Build

### Added
- **Core Engine Setup**: Configured Vite, Phaser 3, TypeScript, and Arcade Physics.
- **Dynamic Power System**: Mapped force, radius, and destruction values across six power scales (1, 10, 100, 1000, 10000, and 999999).
- **State Rewind System**: Implemented a 10-second (600 ticks) ring history buffer. Holding `R` rewinds the coordinates and status of the player, enemy, NPC, and destructibles frame-by-frame.
- **Destruction Mechanics**: Multi-tier structural wear (Intact -> Damaged -> Fractured -> Destroyed) with procedural debris particle spawns.
- **Infinity Power (Cosmic Annihilation)**: Activated scale level `999999`. Punching triggers a full-screen white-out flash, massive screen shake, deep audio oscillators, and vaporizes all elements in the world instantly.
- **Kail Sprite sheet Transformation**: Sliced high-resolution pixel art sub-textures from the custom character reference sheet. Built an HTML5 Canvas keyer to dynamically remove compressed JPEG background pixels and scaled sprites proportionally.
- **Dynamic Running Speed**: Mapped movement velocities to the active power scale (100 to 1500 speed).
- **Destructible Floor segments**: Segmented the terrain into 8 independent ground segments. Breaking them creates holes that entities fall through, resetting their position if they fall off-screen.
- **Dev Environment name tags**: Added color-coded developer name tags above all active entities, platforms, and ground segments.
- **High-Speed Ramming**: Enabled ramming impact checks. Running into enemies, NPCs, or blocks at speeds `>= 300` automatically applies damage and shatters destructibles on contact.

### Verification
- **Automated Tests**: Developed 17 Vitest unit cases validating all systems.
- **Build System**: verified successful production build bundling.
