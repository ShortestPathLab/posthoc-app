declare type LoggedEvent = Record<string, any>;

declare type CurrentContext = Record<string, unknown>;

/**
 * The values available in the current context.
 * By default, this will be the values from the current event, however
 * they may be overridden by properties from the parent scope. If you wish to
 * access values specifically from the current event, use the `event` global instead.
 *
 * **Example**
 * ```yaml
 * views:
 *   my-view:
 *    - $: rect
 *      x: ${{ $.value }} # evaluates to 1
 *   main:
 *    - $: my-view
 *      value: 1
 * ```
 *
 * [Property expressions](https://posthoc.pathfinding.ai/docs/search-trace#property-expressions)
 *
 * ---
 *
 * _Search trace_
 */
declare const $: LoggedEvent & CurrentContext;
/**
 * The parent event.
 *
 * [Property expressions](https://posthoc.pathfinding.ai/docs/search-trace#property-expressions)
 *
 * ---
 *
 * _Search trace_
 */
declare const parent: LoggedEvent | undefined;
/**
 * A list of all events.
 *
 * [Property expressions](https://posthoc.pathfinding.ai/docs/search-trace#property-expressions)
 *
 * ---
 *
 * _Search trace_
 */
declare const events: LoggedEvent[];
/**
 * The current event.
 *
 * [Property expressions](https://posthoc.pathfinding.ai/docs/search-trace#property-expressions)
 *
 * ---
 *
 * _Search trace_
 */
declare const events: LoggedEvent[];
/**
 * The current step number.
 *
 * **Example**
 * ```yaml
 * label: ${{ step }}
 * ```
 *
 * [Property expressions](https://posthoc.pathfinding.ai/docs/search-trace#property-expressions)
 *
 * ---
 *
 * _Search trace_
 */
declare const step: number;
