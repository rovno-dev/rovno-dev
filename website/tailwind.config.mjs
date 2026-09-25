/* LLM context: Keeps simple font-scaling utilities while also registering
   the Radix state variants that shadcn/ui v4 components use everywhere as
   `data-checked:`, `data-unchecked:`, etc. Without these variant mappings,
   Tailwind v4 interprets the shorthand as "has attribute data-checked" —
   an attribute nothing sets — so state styling silently no-ops. */
import plugin from 'tailwindcss/plugin';

export default plugin(function ({ addUtilities, addVariant }) {
  // --- Radix state variants ---------------------------------------------
  // Each entry maps a Tailwind variant name to one or more selectors.
  // Radix historically emits `data-state`, newer versions sometimes emit
  // boolean attributes of the same name — match either.
  const radixStates = {
    'data-checked':        ['&[data-state="checked"]',        '&[data-checked]'],
    'data-unchecked':      ['&[data-state="unchecked"]',      '&[data-unchecked]'],
    'data-indeterminate':  ['&[data-state="indeterminate"]',  '&[data-indeterminate]'],
    'data-active':         ['&[data-state="active"]',         '&[data-active]'],
    'data-inactive':       ['&[data-state="inactive"]',       '&[data-inactive]'],
    'data-on':             ['&[data-state="on"]',             '&[data-on]'],
    'data-off':            ['&[data-state="off"]',            '&[data-off]'],
    'data-open':           ['&[data-state="open"]',           '&[data-open]'],
    'data-closed':         ['&[data-state="closed"]',         '&[data-closed]'],
    'data-disabled':       ['&[data-disabled]',               '&[data-state="disabled"]'],
    'data-highlighted':    ['&[data-highlighted]',            '&[data-state="highlighted"]'],
    'data-selected':       ['&[data-selected]',               '&[data-state="selected"]'],
    'data-placeholder':    ['&[data-placeholder]'],
    'data-expanded':       ['&[data-expanded]',               '&[data-state="expanded"]'],
    'data-collapsed':      ['&[data-collapsed]',              '&[data-state="collapsed"]'],
    'data-orientation-horizontal': ['&[data-orientation="horizontal"]'],
    'data-orientation-vertical':   ['&[data-orientation="vertical"]'],
    'data-side-top':       ['&[data-side="top"]'],
    'data-side-bottom':    ['&[data-side="bottom"]'],
    'data-side-left':      ['&[data-side="left"]'],
    'data-side-right':     ['&[data-side="right"]'],
  };
  for (const [name, selectors] of Object.entries(radixStates)) {
    addVariant(name, selectors);
  }

  // --- Font-scale utilities ---------------------------------------------
  const newUtilities = {
    ...Array.from({ length: 6 }, (_, i) => i + 1).reduce((acc, n) => {
      acc[`.text-display-${n}`] = {
        fontFamily: `var(--display-${n}-font-face)`,
        fontSize: `var(--display-${n}-size)`,
        fontWeight: `var(--display-${n}-weight)`,
        lineHeight: `var(--display-${n}-lh)`,
      };
      acc[`.text-heading-${n}`] = {
        fontFamily: `var(--heading-${n}-font-face)`,
        fontSize: `var(--heading-${n}-size)`,
        fontWeight: `var(--heading-${n}-weight)`,
        lineHeight: `var(--heading-${n}-lh)`,
      };
      acc[`.text-body-${n}`] = {
        fontFamily: `var(--body-${n}-font-face)`,
        fontSize: `var(--body-${n}-size)`,
        fontWeight: `var(--body-${n}-weight)`,
        lineHeight: `var(--body-${n}-lh)`,
      };
      return acc;
    }, {}),
  };

  addUtilities(newUtilities);
});
