import {directives, setupInterceptors} from './intercept';

let injected = false;

export * from './decorators';
export {directives};

/**
 * Call this method to inject the required processing hooks into angular. Make sure angular is loaded before calling this method.
 */
export function inject(): void {
    if (!(window as any).angular) {
        throw new Error('angular needs be available on the window object');
    }

    if (injected) {
        return;
    }

    setupInterceptors();
    injected = true;
}
