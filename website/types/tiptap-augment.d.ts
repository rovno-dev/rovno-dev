/**
 * Augment the Tiptap v3 `Commands` interface with the four commands our
 * editor uses that TypeScript currently cannot see.
 *
 * WHY THIS EXISTS
 * ---------------
 * Tiptap adds commands to `ChainedCommands` via `declare module
 * "@tiptap/core"` inside each extension package. That augmentation is
 * scoped to ONE installed copy of `@tiptap/core`. This project has two:
 *
 *   - `@tiptap/react@^3.32.2` (direct dependency) -> hoisted v3 core
 *   - `novel@^1.0.2` (Tiptap v2 era) -> its own nested core
 *
 * `components/editor/novel/extensions.ts` imports StarterKit etc. from
 * `"novel"`, so those extensions augment Novel's core. Meanwhile
 * `suggestion-items.tsx` types `editor` as `Editor` from
 * `"@tiptap/react"`, which resolves to the v3 core. Result: the methods
 * exist at runtime (they're on the real ProseMirror chain) but are
 * absent from the v3 `Commands` interface - hence TS2339.
 *
 * This file augments the v3 core directly. It is type-only: no runtime
 * behaviour changes, no dependency changes, and it cannot drift from
 * reality because the commands genuinely do exist.
 *
 * Group names are `*-augment` rather than reusing the extension names
 * (`paragraph`, `bulletList`, …). `interface Commands` merges by adding
 * new keys; reusing an existing key would still merge, but a distinct
 * key makes it obvious in a stack trace that this declaration is the
 * source, not a Tiptap package.
 *
 * IF TYPES STILL FAIL
 * -------------------
 * That means the two cores were deduped in the other direction and this
 * augmentation is now landing on the wrong copy. The permanent fix is
 * to remove the duplicate: add an npm `overrides` entry pinning
 * `@tiptap/core` (and `@tiptap/pm`) to one version so only one copy
 * exists. Until then this file is the correct local workaround.
 */

import "@tiptap/core";

declare module "@tiptap/core" {
  interface Commands<ReturnType> {
    paragraphAugment: {
      /** Turn the current block into a plain paragraph. */
      setParagraph: () => ReturnType;
    };
    bulletListAugment: {
      /** Toggle an unordered list on the current block(s). */
      toggleBulletList: () => ReturnType;
    };
    orderedListAugment: {
      /** Toggle an ordered list on the current block(s). */
      toggleOrderedList: () => ReturnType;
    };
    horizontalRuleAugment: {
      /** Insert a horizontal rule at the cursor and move past it. */
      setHorizontalRule: () => ReturnType;
    };
  }
}
