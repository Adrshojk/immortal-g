# IMMORTAL Developer Workflow

Welcome, collaborator! This guide explains the development workflow for contributions to the **IMMORTAL** game project. Following these guidelines ensures code quality, stability, and compatibility with the core game systems (like the time-rewind history buffer).

---

## 1. Finding & Claiming Tasks

1. Go to the [GitHub Issues](https://github.com/Adrshojk/immortal-g/issues) page.
2. Select any open issue that is not currently assigned.
3. Leave a comment expressing your intent to work on the issue (e.g., `"I'll take this one!"`) and self-assign or request assignment.

---

## 2. Local Setup

Make sure you have Node.js and `pnpm` installed.

1. Clone the repository and install dependencies:
   ```bash
   pnpm install
   ```
2. Start the local development server:
   ```bash
   pnpm dev
   ```
   Open your browser at `http://localhost:3000`.

---

## 3. Branching Strategy

We use a standard branching naming scheme to track tasks:

```text
dev/<issue-number>-<short-description>
```

**Example:**
```bash
git checkout -b dev/12-power-scale-hud
```

---

## 4. Coding & Architecture Guidelines

To keep the codebase modular, robust, and compatible with our time-rewind system, please adhere to these core rules:

* **Separate Simulation from Rendering:**
  * Keep pure game logic and simulation state in dedicated classes (like `Player.ts`, `Enemy.ts`, `NPC.ts`, `TestArena.ts`).
  * Never tie key simulation state to Phaser's physical sprite objects directly. Phaser sprites should read from the simulation state and render/animate accordingly.
* **Keep Snapshots Serializable:**
  * All simulation data captured for time rewind must be JSON-serializable (no nested circular structures, DOM nodes, or Phaser instance references in state snapshots).
* **Strong Typing:**
  * Write clean, strictly typed TypeScript. Avoid using `any` whenever possible.

---

## 5. Verification & Testing

Before submitting a Pull Request, you **must** verify your changes locally:

1. **Static Typechecking:**
   ```bash
   pnpm typecheck
   ```
2. **Run Unit Tests:**
   ```bash
   pnpm test
   ```
   Ensure all existing and new unit tests pass successfully.

---

## 6. Submitting a Pull Request

1. Push your branch to GitHub.
2. Open a Pull Request from your branch into `main`.
3. In your PR description, explain:
   - What changes were made.
   - Which issue is resolved (e.g., `Closes #12`).
   - How you verified and tested your changes.
4. Request review from project maintainers.
