# Contributing to IMMORTAL

Thank you for choosing to help make **IMMORTAL**! We want this open-source project to be welcoming, modular, and easy to build upon.

## How to Contribute

1. **Find an Issue or Propose an Idea:** Check the Github issues list or start a discussion.
2. **Fork the Repo:** Create a branch for your feature or bug fix:
   ```bash
   git checkout -b feature/amazing-gameplay
   ```
3. **Write Deterministic Logic:**
   - Keep game simulation logic separate from rendering sprites.
   - All state updates belong in entity simulation classes (`Player.ts`, `Enemy.ts`, `NPC.ts`, `TestArena.ts`).
   - Never tie state recording to Phaser sprites; keep snapshot states JSON serializable for the `TimeSystem`.
4. **Write Unit Tests:** Adding a system? Add tests in `src/game/systems/systems.test.ts`.
5. **Typecheck & Test:** Ensure everything builds and tests pass cleanly:
   ```bash
   pnpm typecheck
   pnpm test
   ```
6. **Submit a PR:** Keep changes focused, well-documented, and small.

## Code Guidelines
- Write clean, strongly typed TypeScript.
- Follow the existing folder architecture.
- Document any complex calculations or non-obvious states.
