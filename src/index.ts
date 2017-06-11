export * from './decorators';
import {directives, setupInterceptors} from './intercept';

let injected = false;

export {directives};

export function inject() {
    if (injected) {
        return;
    }

    setupInterceptors();
    injected = true;
}
