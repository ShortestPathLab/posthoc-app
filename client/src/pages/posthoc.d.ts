declare type CSSColor = string;

declare type Theme = {
  /**
   * The system foreground (text) color.
   * This color automatically adapts to Posthoc UI's light/dark mode.
   */
  foreground: CSSColor;
  /**
   * The system background color.
   * This color automatically adapts to Posthoc UI's light/dark mode.
   */
  background: CSSColor;
  /**
   * The user-defined accent color.
   * This color automatically adapts to Posthoc UI's light/dark mode.
   */
  accent: CSSColor;
};

declare type AccentColor =
  | "amber"
  | "blue"
  | "blueGrey"
  | "brown"
  | "common"
  | "cyan"
  | "deepOrange"
  | "deepPurple"
  | "green"
  | "grey"
  | "indigo"
  | "lightBlue"
  | "lightGreen"
  | "lime"
  | "orange"
  | "pink"
  | "purple"
  | "red"
  | "teal"
  | "yellow";

declare type Shade =
  | 50
  | 100
  | 200
  | 300
  | 400
  | 500
  | 600
  | 700
  | 800
  | 900
  | "A100"
  | "A200"
  | "A400"
  | "A700";

declare type ConvenienceColor =
  | "source"
  | "destination"
  | "updating"
  | "expanding"
  | "generating"
  | "closing"
  | "end";

declare type AccentColors = Record<AccentColor, CSSColor> &
  Record<ConvenienceColor, CSSColor>;

/**
 * General-purpose colors provided by Posthoc.
 * Typically, these are CSS hex color strings.
 * These colors automatically adapt to Posthoc UI's light/dark mode.
 *
 * **Example**
 * ```yaml
 * fill: ${{ color.red }}
 * ```
 *
 * ---
 *
 * _Posthoc_
 */
declare const color: AccentColors;

/**
 * UI-aware system colors.
 * These colors automatically adapt to Posthoc UI's light/dark mode.
 *
 * ---
 *
 * _Posthoc_
 */
declare const theme: Theme;
