import {wrap} from './utils';

/**
 * Modifies the given `ngModule` to intercept the directive function.
 */
export default function directiveWrapper(ngModule: ng.IModule) {
    (ngModule as any).directive = wrap(ngModule.directive, {
        transformArguments: directiveArgumentTransformation
    });
}

function directiveArgumentTransformation(directiveArguments: any[]): any[] {
    return directiveArguments;
}
