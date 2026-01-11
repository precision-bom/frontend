/**
 * ASCII Art Utility Module
 * Hand-crafted ASCII art strings and helper functions for PCB-themed decorations
 */

// =============================================================================
// Box Drawing Characters Reference
// =============================================================================
// Light:  ─ │ ┌ ┐ └ ┘ ├ ┤ ┬ ┴ ┼
// Heavy:  ━ ┃ ┏ ┓ ┗ ┛ ┣ ┫ ┳ ┻ ╋
// Double: ═ ║ ╔ ╗ ╚ ╝ ╠ ╣ ╦ ╩ ╬
// Special: ● ○ ◉ ◎ ▪ ▫ ◆ ◇

// =============================================================================
// Corner Connectors
// =============================================================================
export const corners = {
  // Light corners
  topLeft: '┌',
  topRight: '┐',
  bottomLeft: '└',
  bottomRight: '┘',

  // Heavy corners
  heavyTopLeft: '┏',
  heavyTopRight: '┓',
  heavyBottomLeft: '┗',
  heavyBottomRight: '┛',

  // Double corners
  doubleTopLeft: '╔',
  doubleTopRight: '╗',
  doubleBottomLeft: '╚',
  doubleBottomRight: '╝',

  // Rounded corners
  roundTopLeft: '╭',
  roundTopRight: '╮',
  roundBottomLeft: '╰',
  roundBottomRight: '╯',
} as const;

// =============================================================================
// Line Characters
// =============================================================================
export const lines = {
  horizontal: '─',
  vertical: '│',
  heavyHorizontal: '━',
  heavyVertical: '┃',
  doubleHorizontal: '═',
  doubleVertical: '║',
} as const;

// =============================================================================
// Junction Characters
// =============================================================================
export const junctions = {
  // Light junctions
  tDown: '┬',
  tUp: '┴',
  tRight: '├',
  tLeft: '┤',
  cross: '┼',

  // Heavy junctions
  heavyTDown: '┳',
  heavyTUp: '┻',
  heavyTRight: '┣',
  heavyTLeft: '┫',
  heavyCross: '╋',

  // Double junctions
  doubleTDown: '╦',
  doubleTUp: '╩',
  doubleTRight: '╠',
  doubleTLeft: '╣',
  doubleCross: '╬',
} as const;

// =============================================================================
// Via / Point Characters
// =============================================================================
export const vias = {
  filled: '●',
  empty: '○',
  doubleFilled: '◉',
  doubleEmpty: '◎',
  square: '▪',
  emptySquare: '▫',
  diamond: '◆',
  emptyDiamond: '◇',
} as const;

// =============================================================================
// Helper Functions
// =============================================================================

/**
 * Generate a horizontal ASCII trace line
 * @param width - Total width of the line
 * @param style - 'light' | 'heavy' | 'double'
 * @param centerChar - Optional character to place in the center
 */
export function generateHorizontalTrace(
  width: number,
  style: 'light' | 'heavy' | 'double' = 'light',
  centerChar?: string
): string {
  const lineChar = style === 'light' ? '─' : style === 'heavy' ? '━' : '═';

  if (!centerChar) {
    return lineChar.repeat(width);
  }

  const sideWidth = Math.floor((width - 1) / 2);
  return lineChar.repeat(sideWidth) + centerChar + lineChar.repeat(width - sideWidth - 1);
}

/**
 * Generate a trace with vias at regular intervals
 * @param width - Total width
 * @param viaSpacing - Characters between each via
 * @param viaChar - Character to use for vias (default: ●)
 */
export function generateTraceWithVias(
  width: number,
  viaSpacing: number = 8,
  viaChar: string = '●'
): string {
  let result = '';
  for (let i = 0; i < width; i++) {
    if (i % viaSpacing === 0) {
      result += viaChar;
    } else {
      result += '─';
    }
  }
  return result;
}

/**
 * Generate a simple box frame
 * @param width - Inner width of the box
 * @param height - Inner height of the box
 * @param style - 'light' | 'heavy' | 'double' | 'round'
 */
export function generateBoxFrame(
  width: number,
  height: number,
  style: 'light' | 'heavy' | 'double' | 'round' = 'light'
): string[] {
  const chars = {
    light: { tl: '┌', tr: '┐', bl: '└', br: '┘', h: '─', v: '│' },
    heavy: { tl: '┏', tr: '┓', bl: '┗', br: '┛', h: '━', v: '┃' },
    double: { tl: '╔', tr: '╗', bl: '╚', br: '╝', h: '═', v: '║' },
    round: { tl: '╭', tr: '╮', bl: '╰', br: '╯', h: '─', v: '│' },
  }[style];

  const lines: string[] = [];

  // Top line
  lines.push(chars.tl + chars.h.repeat(width) + chars.tr);

  // Middle lines
  for (let i = 0; i < height; i++) {
    lines.push(chars.v + ' '.repeat(width) + chars.v);
  }

  // Bottom line
  lines.push(chars.bl + chars.h.repeat(width) + chars.br);

  return lines;
}

/**
 * Generate circuit-style T-connectors
 * @param count - Number of T-junctions
 * @param spacing - Characters between each junction
 * @param direction - 'down' | 'up'
 */
export function generateTConnectors(
  count: number,
  spacing: number = 5,
  direction: 'down' | 'up' = 'down'
): string[] {
  const junctionChar = direction === 'down' ? '┬' : '┴';

  // Generate the horizontal line with junctions
  let topLine = '';
  for (let i = 0; i < count; i++) {
    if (i > 0) {
      topLine += '─'.repeat(spacing);
    }
    topLine += junctionChar;
  }

  // Generate the vertical drops
  let bottomLine = '';
  for (let i = 0; i < count; i++) {
    if (i > 0) {
      bottomLine += ' '.repeat(spacing);
    }
    bottomLine += '│';
  }

  return direction === 'down' ? [topLine, bottomLine] : [bottomLine, topLine];
}

/**
 * Generate a cross connector pattern
 * @param width - Width of horizontal line
 * @param height - Height above and below the cross
 */
export function generateCrossConnector(width: number, height: number = 1): string[] {
  const lines: string[] = [];
  const center = Math.floor(width / 2);

  // Vertical lines above
  for (let i = 0; i < height; i++) {
    lines.push(' '.repeat(center) + '│');
  }

  // Horizontal line with cross
  lines.push('─'.repeat(center) + '┼' + '─'.repeat(width - center - 1));

  // Vertical lines below
  for (let i = 0; i < height; i++) {
    lines.push(' '.repeat(center) + '│');
  }

  return lines;
}

// =============================================================================
// Pre-made ASCII Art Strings
// =============================================================================

/**
 * PCB Corner Decoration - can be placed at corners of sections
 */
export const pcbCornerDecoration = `┌──●──┐
│     │
●     ●
│     │
└──●──┘`;

/**
 * Horizontal divider with vias - for section separation
 */
export const horizontalDividerWithVias = `●────────●────────●────────●────────●`;

/**
 * Alternative divider styles
 */
export const dividers = {
  simple: '────────────────────────────────',
  withVias: '●────────●────────●────────●────────●',
  withCenterVia: '────────────────●────────────────',
  double: '════════════════════════════════',
  doubleCross: '═══════════════╬═══════════════',
  heavy: '━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━',
  dashed: '─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─ ─',
} as const;

/**
 * Chip/IC outline - represents an integrated circuit
 */
export const chipOutline = `    ┌─────────────────┐
────┤                 ├────
────┤                 ├────
────┤      IC         ├────
────┤                 ├────
────┤                 ├────
    └─────────────────┘`;

/**
 * Smaller chip variant
 */
export const chipOutlineSmall = `  ┌───────┐
──┤       ├──
──┤  IC   ├──
──┤       ├──
  └───────┘`;

/**
 * Circuit trace patterns
 */
export const tracePatterns = {
  straight: '──────────────────────',
  withJunction: '──────┬──────┬──────',
  withVia: '──────●──────●──────',
  branch: `──────┬──────
      │
      └──────`,
  corner: `──────┐
      │
      └──────`,
} as const;

/**
 * Connection patterns for data flow visualization
 */
export const connectionPatterns = {
  input: '────▶',
  output: '◀────',
  bidirectional: '◀────▶',
  busLine: '════▶',
} as const;

/**
 * Grid/matrix pattern for PCB backgrounds
 */
export const gridPattern = `┼─────┼─────┼─────┼
│     │     │     │
┼─────┼─────┼─────┼
│     │     │     │
┼─────┼─────┼─────┼`;

/**
 * Via array pattern
 */
export const viaArray = `● ● ● ● ●
● ● ● ● ●
● ● ● ● ●`;

/**
 * PCB header decoration with title placeholder
 */
export function generatePCBHeader(title: string, width: number = 40): string[] {
  const innerWidth = Math.max(width - 2, title.length + 4);
  const padding = Math.floor((innerWidth - title.length) / 2);

  return [
    '╔' + '═'.repeat(innerWidth) + '╗',
    '║' + ' '.repeat(padding) + title + ' '.repeat(innerWidth - padding - title.length) + '║',
    '╚' + '═'.repeat(innerWidth) + '╝',
  ];
}

/**
 * Generate a labeled box (like a component on a PCB)
 */
export function generateLabeledBox(
  label: string,
  width?: number,
  style: 'light' | 'heavy' | 'double' = 'light'
): string[] {
  const boxWidth = width || Math.max(label.length + 4, 10);
  const frame = generateBoxFrame(boxWidth, 1, style);
  const padding = Math.floor((boxWidth - label.length) / 2);

  // Replace middle line with label
  frame[1] = frame[1][0] + ' '.repeat(padding) + label + ' '.repeat(boxWidth - padding - label.length) + frame[1][frame[1].length - 1];

  return frame;
}

// =============================================================================
// Export Type Definitions
// =============================================================================
export type BoxStyle = 'light' | 'heavy' | 'double' | 'round';
export type LineStyle = 'light' | 'heavy' | 'double';
export type Direction = 'up' | 'down' | 'left' | 'right';
