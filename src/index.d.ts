// Type definitions for decoNg 0.0.1
// Definitions by: Michael Rose <https://github.com/rose-m>

export as namespace decoNg;

/**
 * Call this method to inject the required processing hooks into angular. Make sure angular is loaded before calling this method.
 */
export function inject(): void;

/**
 * Annotate a class member of your directive controller with this decorator in order to have it automatically set to the controller
 * of the required `directiveName`. Use the same syntax as inside {@link IDirective#require}.
 *
 * The pre-link and post-link functions will then be called with an array containing all controllers. The *last* element of the array
 * will be your own directive controller. The required controllers will be set before any of those methods are called.
 *
 * Important: You *cannot* use the {@link IDirective#require} field - it must be left unset.
 *
 * @param directiveName Directive to require
 */
export function Require(directiveName: string): any;

export namespace directives {

}
