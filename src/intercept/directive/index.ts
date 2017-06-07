import * as angular from 'angular';
import {wrap} from '../utils';

/**
 * Modifies the given `ngModule` to intercept the directive function.
 */
export default function directiveWrapper(ngModule: ng.IModule) {
    (ngModule as any).directive = wrap(ngModule.directive, {
        transformArguments: directiveArgumentTransformation
    });
    return ngModule;
}

/**
 * Transform the arguments of the directive function in order to wrap the directive factory function.
 * @param directiveArguments The first element always is the name of the directive, the second element either is the factory / linkFn directly or
 * an array with minification safe injectables.
 * @return {any[]}
 *
 * @see angular.IDirectiveFactory
 */
function directiveArgumentTransformation(directiveArguments: any[]): any[] {
    const fnOrInjectables = directiveArguments[1] as ng.Injectable<ng.IDirectiveFactory>;

    let factoryFn: ng.IDirectiveFactory;
    if (typeof fnOrInjectables === 'function') {
        factoryFn = fnOrInjectables;
    } else {
        factoryFn = fnOrInjectables[fnOrInjectables.length - 1] as ng.IDirectiveFactory;
    }

    const newFactoryFn = wrap(factoryFn, {
        transformResult: directiveFactoryResultTransformation
    });

    if (typeof fnOrInjectables === 'function') {
        angular.injector().annotate(factoryFn);
        const injectables = factoryFn.$inject as Array<string | ng.IDirectiveFactory>;
        injectables.push(newFactoryFn);
        directiveArguments[1] = injectables;
    } else {
        fnOrInjectables[fnOrInjectables.length - 1] = newFactoryFn;
    }

    return directiveArguments;
}

function directiveFactoryResultTransformation(result: ng.IDirective | ng.IDirectiveLinkFn): ng.IDirective | ng.IDirectiveLinkFn {
    return result;
}

